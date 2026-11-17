-- Ejecutar únicamente en IBRACO (znbxirqmifjpxhsivlfe).
-- Sin importación de pedidos anteriores ni cambios de contactos/workflows de HubSpot.
begin;
alter table public.orders add column if not exists hubspot_contact_requested boolean not null default false;
create table if not exists public.hubspot_deliveries (
 id uuid primary key default gen_random_uuid(),
 order_number text unique,
 request_id uuid unique,
 payload jsonb,
 email text not null,
 ip_hash text,
 consent_version text not null default 'asesoria-bienvenida-v1',
 status text not null default 'pending' check(status in ('pending','processing','created','existing','error','review')),
 attempts integer not null default 0,
 contact_id text,
 message text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 locked_at timestamptz,
 lock_token uuid,
 next_attempt_at timestamptz not null default now(),
 check ((order_number is not null) <> (request_id is not null))
);
alter table public.hubspot_deliveries enable row level security;
revoke all on public.hubspot_deliveries from public,anon,authenticated;
grant all on public.hubspot_deliveries to service_role;
create index if not exists hubspot_delivery_pending on public.hubspot_deliveries(status,next_attempt_at,created_at);
create index if not exists hubspot_delivery_email on public.hubspot_deliveries(email,created_at);
create index if not exists hubspot_delivery_ip on public.hubspot_deliveries(ip_hash,created_at);

create or replace function public.queue_ibraco_order_contact() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
 if new.hubspot_contact_requested and new.accepted_privacy and new.product_type in ('course','package') then
  insert into public.hubspot_deliveries(order_number,email)
  values(new.order_number,lower(trim(new.email))) on conflict(order_number) do nothing;
 end if;
 return new;
end $$;
revoke all on function public.queue_ibraco_order_contact() from public,anon,authenticated;
grant execute on function public.queue_ibraco_order_contact() to service_role;
drop trigger if exists ibraco_queue_order_contact on public.orders;
create trigger ibraco_queue_order_contact after insert on public.orders
for each row execute function public.queue_ibraco_order_contact();

-- Los paquetes se reservan mediante una función existente: registrar el consentimiento
-- sólo una vez, después de comprobar en servidor el token de la reserva.
create or replace function public.queue_ibraco_package_contact(p_order text,p_hash text) returns void
language plpgsql security invoker set search_path='' as $$
begin
 insert into public.hubspot_deliveries(order_number,email)
 select o.order_number,lower(trim(o.email)) from public.orders o
 join public.package_sales s on s.order_id=o.id
 where o.order_number=p_order and s.token_hash=p_hash and o.product_type='package' and o.accepted_privacy
 on conflict(order_number) do nothing;
end $$;
revoke all on function public.queue_ibraco_package_contact(text,text) from public,anon,authenticated;
grant execute on function public.queue_ibraco_package_contact(text,text) to service_role;

-- Envolver la reserva existente conserva su validación y vuelve atómica la cola.
create or replace function public.reserve_ibraco_package_with_contact(p_offer uuid,p_frequency text,p_student jsonb,p_hash text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare result jsonb;
begin
 result:=public.reserve_package(p_offer,p_frequency,p_student,p_hash);
 if p_student->>'hubspot_contact_requested'='true' then
  perform public.queue_ibraco_package_contact(result->>'orderNumber',p_hash);
 end if;
 return result;
end $$;
revoke all on function public.reserve_ibraco_package_with_contact(uuid,text,jsonb,text) from public,anon,authenticated;
grant execute on function public.reserve_ibraco_package_with_contact(uuid,text,jsonb,text) to service_role;

create or replace function public.submit_ibraco_course_lead(p_request uuid,p_payload jsonb,p_ip text) returns uuid
language plpgsql security invoker set search_path='' as $$
declare found_id uuid; target_email text;
begin
 target_email:=lower(trim(p_payload->>'email'));
 -- La exclusión por correo e IP evita superar los límites con envíos concurrentes.
 perform pg_advisory_xact_lock(hashtextextended('ibraco-ip:'||p_ip,0));
 perform pg_advisory_xact_lock(hashtextextended('ibraco-email:'||target_email,0));
 select id into found_id from public.hubspot_deliveries where request_id=p_request;
 if found then return found_id; end if;
 if (select count(*) from public.hubspot_deliveries where request_id is not null and ip_hash=p_ip and created_at>now()-interval '1 hour')>=5
 or (select count(*) from public.hubspot_deliveries where request_id is not null and email=target_email and created_at>now()-interval '1 hour')>=3 then
  raise exception 'LEAD_RATE_LIMIT';
 end if;
 insert into public.hubspot_deliveries(request_id,email,payload,ip_hash)
 values(p_request,target_email,p_payload,p_ip) returning id into found_id;
 return found_id;
end $$;
revoke all on function public.submit_ibraco_course_lead(uuid,jsonb,text) from public,anon,authenticated;
grant execute on function public.submit_ibraco_course_lead(uuid,jsonb,text) to service_role;

create or replace function public.claim_ibraco_hubspot(p_order text default null,p_id uuid default null)
returns setof public.hubspot_deliveries language sql security invoker set search_path='' as $$
 with chosen as (
  select id from public.hubspot_deliveries
  where (status in ('pending','error') or (status='processing' and locked_at<now()-interval '5 minutes'))
  and next_attempt_at<=now() and attempts<8
  and (p_order is null or order_number=p_order) and (p_id is null or id=p_id)
  order by created_at limit 1 for update skip locked
 )
 update public.hubspot_deliveries d set status='processing',locked_at=now(),lock_token=gen_random_uuid(),
 attempts=d.attempts+1,updated_at=now() from chosen where d.id=chosen.id returning d.*;
$$;
revoke all on function public.claim_ibraco_hubspot(text,uuid) from public,anon,authenticated;
grant execute on function public.claim_ibraco_hubspot(text,uuid) to service_role;
commit;
-- Verificación: una fila, RLS = true. Ningún pedido anterior se añade a la cola.
select relname,relrowsecurity from pg_class where oid='public.hubspot_deliveries'::regclass;
