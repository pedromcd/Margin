-- Run once in the Supabase SQL editor. No service-role key is needed by the app.
create table if not exists public.notebooks (
 user_id uuid primary key references auth.users(id) on delete cascade,
 data jsonb not null default '{"sources":[],"cards":[],"sessions":[]}'::jsonb,
 updated_at timestamptz not null default now(),
 constraint notebook_size check (octet_length(data::text) <= 5000000)
);
alter table public.notebooks enable row level security;
create policy "Read own notebook" on public.notebooks for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own notebook" on public.notebooks for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own notebook" on public.notebooks for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own notebook" on public.notebooks for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.notebooks from anon;
grant select,insert,update,delete on public.notebooks to authenticated;
-- Atomic per-account hourly budget. Users cannot reset their counter directly.
create table if not exists public.generation_usage(user_id uuid primary key references auth.users(id) on delete cascade, window_start timestamptz not null, calls integer not null);
alter table public.generation_usage enable row level security;
revoke all on public.generation_usage from anon, authenticated;
create or replace function public.consume_generation() returns boolean language plpgsql security definer set search_path = '' as $$
declare allowed boolean;
begin
 if auth.uid() is null then return false; end if;
 insert into public.generation_usage(user_id,window_start,calls) values(auth.uid(),now(),1)
 on conflict(user_id) do update set calls=case when public.generation_usage.window_start < now()-interval '1 hour' then 1 else public.generation_usage.calls+1 end,
 window_start=case when public.generation_usage.window_start < now()-interval '1 hour' then now() else public.generation_usage.window_start end
 returning calls<=10 into allowed;
 return allowed;
end; $$;
revoke all on function public.consume_generation() from public, anon;
grant execute on function public.consume_generation() to authenticated;
