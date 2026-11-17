-- Ejecutar sólo en IBRACO: znbxirqmifjpxhsivlfe.
-- Habilita la tarjeta Intranet, sin conceder superadministración ni otros módulos.
begin;
do $$
declare target_user uuid;
begin
 select id into target_user from auth.users
 where lower(email)='facturacion@ibraco.org.co'
 and email_confirmed_at is not null
 and (banned_until is null or banned_until<now());
 if target_user is null then
  raise exception 'La cuenta facturacion@ibraco.org.co no existe, no confirmó su correo o está bloqueada. Créala o invítala desde Supabase Authentication > Users; confirma el correo y vuelve a ejecutar este SQL.';
 end if;
 insert into public.admin_profiles(user_id,full_name,can_courses,can_events,can_accounting,can_content,is_superadmin)
 values(target_user,'Facturación IBRACO',false,false,false,false,false)
 on conflict(user_id) do nothing;
 insert into public.intranet_members(user_id,full_name,role,active)
 values(target_user,'Facturación IBRACO','administrativo',true)
 on conflict(user_id) do update set active=true;
end $$;
commit;
-- Resultado esperado: correo correcto, active=true y perfil administrativo
-- (si ya tenía otro perfil de Intranet, se conserva).
select u.email,m.full_name,m.role,m.active
from auth.users u join public.intranet_members m on m.user_id=u.id
where lower(u.email)='facturacion@ibraco.org.co';
