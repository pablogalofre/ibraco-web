begin;
-- Requiere el gestor de publicidad instalado el 3 de noviembre de 2026.
create table if not exists public.site_interactions (
 event_id uuid primary key,
 kind text not null check(kind in ('popup_view','popup_click','whatsapp_click')),
 surface text not null check(surface in ('modal','image','button','floating')),
 page text not null check(length(page) between 1 and 300),
 campaign_id uuid references public.site_promotions(id),
 impression_id uuid,
 created_at timestamptz not null default now(),
 check((kind='whatsapp_click' and surface='floating' and campaign_id is null and impression_id is null)
 or (kind='popup_view' and surface='modal' and campaign_id is not null and impression_id is not null)
 or (kind='popup_click' and surface in ('image','button') and campaign_id is not null and impression_id is not null))
);
create index if not exists site_interactions_date on public.site_interactions(created_at);
create unique index if not exists site_interactions_impression on public.site_interactions(kind,impression_id)
 where impression_id is not null;
alter table public.site_interactions enable row level security;
revoke all on public.site_interactions from public,anon,authenticated;

create or replace function public.record_site_interaction(p_event_id uuid,p_kind text,p_surface text,p_page text,p_campaign_id uuid default null,p_impression_id uuid default null)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
 if p_event_id is null or p_page is null or length(p_page)>300
  or p_page !~ '^/($|(cursos|sedes|cultura|agenda-cultural|empresas|alumni|blog|eventos|nivelacion)(/[A-Za-z0-9_-]+)*/?$)'
  or p_page ~ '^/eventos/pago(/|$)' then return false; end if;
 if p_kind='whatsapp_click' then
  if p_surface is distinct from 'floating' or p_campaign_id is not null or p_impression_id is not null then return false; end if;
 elsif p_kind in ('popup_view','popup_click') then
  if p_campaign_id is null or p_impression_id is null then return false; end if;
  if (p_kind='popup_view' and p_surface is distinct from 'modal')
   or (p_kind='popup_click' and (p_surface is null or p_surface not in ('image','button'))) then return false; end if;
  if not exists(select 1 from public.site_promotions p where p.id=p_campaign_id and p_page=any(p.pages)
    and ((p.enabled and p.starts_at<=now() and p.ends_at>now()-interval '1 minute')
      or (p_kind='popup_click' and exists(select 1 from public.site_interactions v where v.kind='popup_view'
       and v.impression_id=p_impression_id and v.campaign_id=p_campaign_id and v.page=p_page and v.created_at>now()-interval '1 hour')))) then return false; end if;
 else return false; end if;
 -- Tope compartido contra ráfagas; estos son contadores orientativos, no auditoría de ventas.
 perform pg_catalog.pg_advisory_xact_lock(20261105);
 if (select count(*) from public.site_interactions where created_at>now()-interval '1 minute')>=1200 then return false; end if;
 insert into public.site_interactions(event_id,kind,surface,page,campaign_id,impression_id)
 values(p_event_id,p_kind,p_surface,p_page,p_campaign_id,p_impression_id) on conflict do nothing;
 return true;
end;
$$;
revoke all on function public.record_site_interaction(uuid,text,text,text,uuid,uuid) from public,authenticated;
grant execute on function public.record_site_interaction(uuid,text,text,text,uuid,uuid) to anon;

create or replace function public.site_interaction_report(p_from date,p_to date)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare report jsonb;
begin
 if not ibraco_private.promotions_editor() then raise exception 'No autorizado' using errcode='42501'; end if;
 if p_from is null or p_to is null or p_to<p_from or p_to-p_from>365 then raise exception 'Elige un rango de hasta 366 días'; end if;
 with events as (
  select * from public.site_interactions where created_at >= (p_from::timestamp at time zone 'America/Bogota')
    and created_at < ((p_to+1)::timestamp at time zone 'America/Bogota')
 ), grouped as (
  select e.campaign_id,coalesce(p.name,'WhatsApp flotante') name,e.page,
    count(*) filter(where e.kind='popup_view') views,
    count(*) filter(where e.kind='popup_click' and e.surface='image') image_clicks,
    count(*) filter(where e.kind='popup_click' and e.surface='button') button_clicks,
    count(*) filter(where e.kind='whatsapp_click') whatsapp_clicks,
    count(*) filter(where e.kind='popup_click' and exists(select 1 from events v where v.kind='popup_view'
       and v.impression_id=e.impression_id and v.campaign_id=e.campaign_id and v.page=e.page)) clicked_views
   from events e left join public.site_promotions p on p.id=e.campaign_id group by e.campaign_id,p.name,e.page
 ) select jsonb_build_object('rows',coalesce(jsonb_agg(to_jsonb(grouped) order by name,page),'[]'::jsonb),
    'generated_at',now(),'tracking_started_at',(select min(created_at) from public.site_interactions)) into report from grouped;
 return report;
end;
$$;
revoke all on function public.site_interaction_report(date,date) from public,anon;
grant execute on function public.site_interaction_report(date,date) to authenticated;
comment on table public.site_interactions is 'Conteos orientativos de publicidad. Sin IP, correo, teléfono, cookies, query string ni identificador de persona. Hora asignada por servidor.';

create table if not exists public.course_interactions (
 event_id uuid primary key,
 kind text not null check(kind in ('catalog_view','catalog_search','course_detail_click','catalog_whatsapp','program_click','availability_click')),
 course_id text, course_name text, campus text, modality text,
 filter_campus text not null default '', filter_modality text not null default '', program text not null default '',
 results integer check(results between 0 and 10000),
 surface text not null check(surface in ('catalog','hero','empty','final','footer')),
 created_at timestamptz not null default now()
);
create index if not exists course_interactions_date on public.course_interactions(created_at);
alter table public.course_interactions enable row level security;
revoke all on public.course_interactions from public,anon,authenticated;

create or replace function public.record_course_interaction(p_event_id uuid,p_kind text,p_course_id text default null,p_campus text default '',p_modality text default '',p_program text default '',p_results integer default null,p_surface text default 'catalog')
returns boolean language plpgsql security definer set search_path = '' as $$
declare cname text; ccampus text; cmodality text; safe_campus text:=''; safe_modality text:='';
begin
 if p_event_id is null or p_kind is null or p_kind not in ('catalog_view','catalog_search','course_detail_click','catalog_whatsapp','program_click','availability_click') then return false; end if;
 if p_surface is null or (p_kind='catalog_whatsapp' and p_surface not in ('hero','empty','final','footer')) or (p_kind<>'catalog_whatsapp' and p_surface<>'catalog') then return false; end if;
 if p_kind in ('program_click','availability_click') and coalesce(p_program,'')='' then return false; end if;
 if p_program is null or p_program not in ('','intensivo','semi-intensivo','semi-intensivo-sabados','expresso','celpe-bras','particulares','empresas','instituciones-educativas') then return false; end if;
 if (p_results is not null and (p_results<0 or p_results>10000)) or length(coalesce(p_campus,''))>80 or length(coalesce(p_modality,''))>80 then return false; end if;
 if p_kind='course_detail_click' then
  if p_course_id is null or p_course_id !~ '^[0-9]{1,16}$' then return false; end if;
  select left(c.name,200),left(c.campus,80),left(c.modality,80) into cname,ccampus,cmodality
    from public.courses c where c.id::text=p_course_id and c.status='published';
  if not found then return false; end if;
 elsif p_course_id is not null then return false; end if;
 if exists(select 1 from public.courses c where c.status='published' and c.campus=p_campus) then safe_campus:=p_campus; end if;
 if p_modality in ('Presencial','Virtual') or exists(select 1 from public.courses c where c.status='published' and c.modality=p_modality) then safe_modality:=p_modality; end if;
 perform pg_catalog.pg_advisory_xact_lock(20261106);
 if (select count(*) from public.course_interactions where created_at>now()-interval '1 minute')>=1200 then return false; end if;
 insert into public.course_interactions(event_id,kind,course_id,course_name,campus,modality,filter_campus,filter_modality,program,results,surface)
 values(p_event_id,p_kind,p_course_id,cname,ccampus,cmodality,safe_campus,safe_modality,p_program,p_results,p_surface) on conflict do nothing;
 return true;
end;
$$;
revoke all on function public.record_course_interaction(uuid,text,text,text,text,text,integer,text) from public,authenticated;
grant execute on function public.record_course_interaction(uuid,text,text,text,text,text,integer,text) to anon;

create or replace function public.superadmin_metrics(p_from date,p_to date)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare start_at timestamptz; stop_at timestamptz; result jsonb; ads jsonb;
begin
 if not exists(select 1 from public.admin_profiles where user_id=auth.uid() and is_superadmin) then raise exception 'Solo superadministradores' using errcode='42501'; end if;
 if p_from is null or p_to is null or p_to<p_from or p_to-p_from>365 then raise exception 'Rango inválido: hasta 366 días'; end if;
 start_at:=p_from::timestamp at time zone 'America/Bogota'; stop_at:=(p_to+1)::timestamp at time zone 'America/Bogota';
 ads:=public.site_interaction_report(p_from,p_to);
 with events as (select * from public.course_interactions where created_at>=start_at and created_at<stop_at),
 summary as (select
   count(*) filter(where kind='catalog_view') views,
   count(*) filter(where kind='catalog_search') searches,
   count(*) filter(where kind='course_detail_click') details,
   count(*) filter(where kind='catalog_whatsapp') whatsapp,
   count(*) filter(where kind='program_click') program_clicks,
   count(*) filter(where kind='availability_click') availability_clicks,
   count(*) filter(where kind='catalog_view' and results=0) zero_results
  from events),
 daily as (select (created_at at time zone 'America/Bogota')::date as "day",
   count(*) filter(where kind='catalog_view') views,count(*) filter(where kind='course_detail_click') details,
   count(*) filter(where kind='catalog_whatsapp') whatsapp from events group by 1),
 courses as (select course_id,course_name,campus,modality,count(*) clicks from events where kind='course_detail_click'
   group by course_id,course_name,campus,modality order by clicks desc,course_name,course_id),
 programs as (select program,count(*) filter(where kind='program_click') detail_clicks,
   count(*) filter(where kind='availability_click') availability_clicks from events where kind in ('program_click','availability_click') group by program),
 filters as (select filter_campus campus,filter_modality modality,program,count(*) views,
   count(*) filter(where results=0) zero_results from events where kind='catalog_view' group by 1,2,3)
 select jsonb_build_object('summary',(select to_jsonb(summary) from summary),
   'daily',coalesce((select jsonb_agg(to_jsonb(daily) order by daily."day") from daily),'[]'::jsonb),
   'courses',coalesce((select jsonb_agg(to_jsonb(courses) order by clicks desc,course_name,course_id) from courses),'[]'::jsonb),
   'programs',coalesce((select jsonb_agg(to_jsonb(programs) order by program) from programs),'[]'::jsonb),
   'filters',coalesce((select jsonb_agg(to_jsonb(filters) order by views desc,campus,modality,program) from filters),'[]'::jsonb),
   'advertising',ads,'generated_at',now(),
   'course_tracking_started_at',(select min(created_at) from public.course_interactions)) into result;
 return result;
end;
$$;
revoke all on function public.superadmin_metrics(date,date) from public,anon;
grant execute on function public.superadmin_metrics(date,date) to authenticated;
comment on table public.course_interactions is 'Interés en catálogo. Sin identificadores de personas ni parámetros de URL. Atributos del curso consultados por servidor, no por el navegador.';

commit;
