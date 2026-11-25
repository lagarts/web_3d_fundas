-- Esquema ya aplicado en el proyecto Supabase "Web_celulares". Se guarda acá como respaldo/versionado.
create table public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text unique not null, name text not null, logo_text text, logo_url text,
  theme jsonb not null default '{}'::jsonb, whatsapp text,
  created_at timestamptz not null default now()
);
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null, try_on boolean not null default false, sort int not null default 0
);
create table public.phone_models (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null, sort int not null default 0
);
create table public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null, code text, price numeric(12,2) not null check (price >= 0),
  look text not null default 'custom', color text, image_key text, image_url text,
  compat_model_ids uuid[] not null default '{}', active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  buyer_name text, phone text, address text, shipping text, total numeric(12,2),
  status text not null default 'nuevo', items jsonb not null,
  created_at timestamptz not null default now()
);
create index on public.stores (owner_id);
create index on public.categories (store_id);
create index on public.phone_models (store_id);
create index on public.products (store_id);
create index on public.products (category_id);
create index on public.orders (store_id);

alter table public.stores enable row level security;
alter table public.categories enable row level security;
alter table public.phone_models enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

create function public.is_owner(sid uuid) returns boolean
language sql stable set search_path = '' as
$$ select exists(select 1 from public.stores where id = sid and owner_id = (select auth.uid())) $$;

create policy "tienda visible" on public.stores for select using (true);
create policy "dueño crea tienda" on public.stores for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "dueño edita tienda" on public.stores for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "dueño borra tienda" on public.stores for delete to authenticated using (owner_id = (select auth.uid()));

create policy "catalogo publico" on public.categories for select using (true);
create policy "catalogo publico" on public.phone_models for select using (true);
create policy "catalogo publico" on public.products for select using (active or public.is_owner(store_id));
create policy "dueño inserta" on public.categories for insert to authenticated with check (public.is_owner(store_id));
create policy "dueño edita" on public.categories for update to authenticated using (public.is_owner(store_id)) with check (public.is_owner(store_id));
create policy "dueño borra" on public.categories for delete to authenticated using (public.is_owner(store_id));
create policy "dueño inserta" on public.phone_models for insert to authenticated with check (public.is_owner(store_id));
create policy "dueño edita" on public.phone_models for update to authenticated using (public.is_owner(store_id)) with check (public.is_owner(store_id));
create policy "dueño borra" on public.phone_models for delete to authenticated using (public.is_owner(store_id));
create policy "dueño inserta" on public.products for insert to authenticated with check (public.is_owner(store_id));
create policy "dueño edita" on public.products for update to authenticated using (public.is_owner(store_id)) with check (public.is_owner(store_id));
create policy "dueño borra" on public.products for delete to authenticated using (public.is_owner(store_id));
-- Pedidos: solo el dueño los ve; se crean desde el servidor (service role) recalculando precios.
create policy "dueño ve pedidos" on public.orders for select to authenticated using (public.is_owner(store_id));
create policy "dueño actualiza pedidos" on public.orders for update to authenticated using (public.is_owner(store_id)) with check (public.is_owner(store_id));

create function public.create_store(p_name text, p_slug text, p_logo text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare sid uuid; cat uuid; mids uuid[];
begin
  if auth.uid() is null then raise exception 'Necesitás iniciar sesión'; end if;
  insert into public.stores(owner_id, slug, name, logo_text)
    values (auth.uid(), p_slug, p_name, coalesce(p_logo, p_name)) returning id into sid;
  insert into public.categories(store_id, name, try_on, sort) values (sid, 'Fundas', true, 0) returning id into cat;
  insert into public.phone_models(store_id, name, sort)
    select sid, n, o from unnest(array['iPhone 13','iPhone 13 Pro','iPhone 14','iPhone 14 Pro','iPhone 15','iPhone 15 Pro','iPhone 16','iPhone 16 Pro']) with ordinality as t(n, o);
  select array_agg(id order by sort) into mids from public.phone_models where store_id = sid;
  insert into public.products(store_id, category_id, name, code, price, look, image_key, compat_model_ids) values
    (sid, cat, 'Rosa Chicle', 'FC-001', 13500, 'photo', 'rosa', mids),
    (sid, cat, 'Cian', 'FC-002', 12900, 'photo', 'cian', mids),
    (sid, cat, 'Naranja Flúor', 'FC-003', 12900, 'photo', 'naranja', mids),
    (sid, cat, 'Verde Agua', 'FC-004', 12900, 'photo', 'verdeagua', mids),
    (sid, cat, 'Verde Inglés', 'FC-005', 12900, 'photo', 'verdeingles', mids),
    (sid, cat, 'Animal Print', 'FC-006', 14900, 'photo', 'animal', mids),
    (sid, cat, 'Rayas Blanco y Negro', 'FC-007', 14500, 'photo', 'rayas', mids),
    (sid, cat, 'Cristal', 'FC-008', 9900, 'transp', null, mids);
  return sid;
end $$;
revoke execute on function public.create_store(text, text, text) from public, anon;
grant execute on function public.create_store(text, text, text) to authenticated;

-- Bucket de fotos (ruta: <store_id>/<archivo>)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 2097152, array['image/webp','image/png','image/jpeg'])
on conflict (id) do nothing;
create policy "dueño sube imagenes" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_owner(((storage.foldername(name))[1])::uuid));
create policy "dueño reemplaza imagenes" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_owner(((storage.foldername(name))[1])::uuid))
  with check (bucket_id = 'product-images' and public.is_owner(((storage.foldername(name))[1])::uuid));
create policy "dueño borra imagenes" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_owner(((storage.foldername(name))[1])::uuid));
