begin;
alter table public.package_offers add column if not exists image_path text;
alter table public.package_offers add column if not exists image_alt text;
do $$ begin
 if not exists(select 1 from pg_constraint where conname='package_offer_image_path_check' and conrelid='public.package_offers'::regclass) then
  alter table public.package_offers add constraint package_offer_image_path_check check(image_path is null or image_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|avif)$');
 end if;
 if not exists(select 1 from pg_constraint where conname='package_offer_image_alt_check' and conrelid='public.package_offers'::regclass) then
  alter table public.package_offers add constraint package_offer_image_alt_check check(image_path is null or length(trim(image_alt)) between 1 and 300 and image_alt is not null);
 end if;
end $$;
-- Las imágenes son piezas públicas de promoción. Solo el servidor autorizado puede subirlas.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('package-offers','package-offers',true,3145728,array['image/jpeg','image/png','image/webp','image/avif'])
on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
commit;
notify pgrst, 'reload schema';
