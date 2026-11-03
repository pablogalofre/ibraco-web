begin;
create schema if not exists ibraco_private;
revoke all on schema ibraco_private from public;
grant usage on schema ibraco_private to authenticated;

create or replace function ibraco_private.promotions_editor()
returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.admin_profiles where user_id = auth.uid()
   and (can_content or is_superadmin));
$$;
revoke all on function ibraco_private.promotions_editor() from public, anon;
grant execute on function ibraco_private.promotions_editor() to authenticated;

create table if not exists public.site_promotions (
 id uuid primary key default gen_random_uuid(),
 name text not null check(length(btrim(name)) between 1 and 100),
 image_url text not null check(length(image_url) between 1 and 2048 and
  image_url !~ '[[:space:][:cntrl:]]' and position(chr(92) in image_url)=0 and
  (image_url ~ '^https://[A-Za-z0-9][A-Za-z0-9.-]*(:[0-9]{1,5})?(/|[?]|#|$)' or
  (image_url like '/assets/%' and position('..' in image_url)=0))),
 image_alt text not null check(length(btrim(image_alt)) between 1 and 300),
 target_url text not null check(length(target_url) between 1 and 2048 and
  target_url !~ '[[:space:][:cntrl:]]' and position(chr(92) in target_url)=0 and
  target_url ~ '^https://[A-Za-z0-9][A-Za-z0-9.-]*(:[0-9]{1,5})?(/|[?]|#|$)'),
 button_label text not null check(length(btrim(button_label)) between 1 and 80),
 pages text[] not null check(cardinality(pages) between 1 and 8 and array_position(pages,null) is null and
   pages <@ array['/','/cursos','/sedes','/cultura','/agenda-cultural','/empresas','/alumni','/blog']::text[]),
 enabled boolean not null default false,
 starts_at timestamptz not null,
 ends_at timestamptz not null check(ends_at > starts_at),
 delay_seconds integer not null default 2 check(delay_seconds between 0 and 30),
 priority integer not null default 10 check(priority between 0 and 100),
 version integer not null default 1,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 created_by uuid references auth.users(id),
 updated_by uuid references auth.users(id)
);
create or replace function ibraco_private.promotion_stamp()
returns trigger language plpgsql set search_path = '' as $$
begin
 if TG_OP = 'UPDATE' then
  new.id := old.id; new.created_at := old.created_at; new.created_by := old.created_by;
  new.version := old.version + 1;
 else new.version := 1; new.created_at := now(); new.created_by := auth.uid(); end if;
 new.updated_at := now(); new.updated_by := auth.uid(); return new;
end;
$$;
revoke all on function ibraco_private.promotion_stamp() from public,anon,authenticated;
drop trigger if exists promotion_stamp on public.site_promotions;
create trigger promotion_stamp before insert or update on public.site_promotions
 for each row execute function ibraco_private.promotion_stamp();
alter table public.site_promotions enable row level security;
revoke all on public.site_promotions from anon,authenticated;
grant select(id,name,image_url,image_alt,target_url,button_label,pages,enabled,starts_at,ends_at,delay_seconds,priority,version)
 on public.site_promotions to anon;
grant select on public.site_promotions to authenticated;
grant insert(name,image_url,image_alt,target_url,button_label,pages,enabled,starts_at,ends_at,delay_seconds,priority)
 on public.site_promotions to authenticated;
grant update(name,image_url,image_alt,target_url,button_label,pages,enabled,starts_at,ends_at,delay_seconds,priority)
 on public.site_promotions to authenticated;
drop policy if exists promotions_public on public.site_promotions;
create policy promotions_public on public.site_promotions for select to anon
 using (enabled and starts_at <= now() and ends_at > now());
drop policy if exists promotions_editor_read on public.site_promotions;
create policy promotions_editor_read on public.site_promotions for select to authenticated
 using ((select ibraco_private.promotions_editor()));
drop policy if exists promotions_editor_insert on public.site_promotions;
create policy promotions_editor_insert on public.site_promotions for insert to authenticated
 with check ((select ibraco_private.promotions_editor()));
drop policy if exists promotions_editor_update on public.site_promotions;
create policy promotions_editor_update on public.site_promotions for update to authenticated
 using ((select ibraco_private.promotions_editor())) with check ((select ibraco_private.promotions_editor()));

-- Bucket exclusivo para las piezas. Rutas únicas: usuario/UUID.ext, sin sobrescritura.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('site-promotions','site-promotions',true,5242880,array['image/jpeg','image/png','image/webp','image/avif'])
 on conflict(id) do nothing;
drop policy if exists promotions_image_insert on storage.objects;
create policy promotions_image_insert on storage.objects for insert to authenticated
 with check(bucket_id='site-promotions' and (select ibraco_private.promotions_editor())
 and (storage.foldername(name))[1]=(select auth.uid())::text);

-- Conserva la promoción actual y su vencimiento; ejecutar de nuevo no la reactiva.
insert into public.site_promotions(id,name,image_url,image_alt,target_url,button_label,pages,enabled,starts_at,ends_at,delay_seconds,priority)
 values('d7a7a05a-a4d9-4162-a2a5-a56839e80301','Matrícula Centro: 3 niveles por el precio de 2',
 '/assets/promos/matricula-centro-3x2-2026-11-03.jpeg',
 'Último día de matrícula: 3 niveles por el precio de 2. Sede Centro, presencial. Inicio 4 de noviembre.',
 'https://wa.me/message/AJ3YFIXIZSIIA1','Habla con nosotros por WhatsApp',array['/cursos'],true,
 '2026-11-03T00:00:00-05:00','2026-11-04T00:00:00-05:00',2,10)
 on conflict(id) do nothing;
commit;
