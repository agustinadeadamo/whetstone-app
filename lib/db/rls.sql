-- Whetstone — Row-Level Security, auth trigger, and FK cascade policy.
--
-- This file owns tenant isolation: the auth trigger, RLS enablement, and the
-- per-table policies. It is idempotent: safe to re-run. Apply it with
-- `npm run db:push` (Drizzle schema + migrations) FIRST, then this file.
--
-- Foreign keys and ON DELETE CASCADE behavior are NOT defined here: they live
-- in the Drizzle schema (lib/db/schema.ts) so the TypeScript schema stays the
-- single source of truth (ADR 0002). See also ADR 0003 (RLS for tenant
-- isolation), ADR 0009 (join-in-policy), ADR 0010 (ON DELETE CASCADE).
--
-- Roles: policies are scoped `to authenticated`. The Supabase `service_role`
-- key bypasses RLS (BYPASSRLS) and is used server-side only, never on the
-- client. `auth.uid()` returns the id of the currently authenticated user.

-- ===========================================================================
-- Section A — Trigger: sync auth.users -> public.users on signup
-- ===========================================================================
-- SECURITY DEFINER is required: the trigger runs as the function owner and
-- bypasses RLS, so the insert into public.users succeeds before the new user
-- has any session. It inserts ONLY into public.users.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===========================================================================
-- Section B — Enable RLS on all seven tables
-- ===========================================================================

alter table public.users enable row level security;
alter table public.decks enable row level security;
alter table public.modules enable row level security;
alter table public.questions enable row level security;
alter table public.progress enable row level security;
alter table public.evaluations enable row level security;
alter table public.usage_counters enable row level security;

-- ===========================================================================
-- Section C — Policies (one per verb, per table, scoped to authenticated)
-- ===========================================================================

-- --- users: the owner is the row itself (id = auth.uid()) -------------------
drop policy if exists "users can select their own row" on public.users;
create policy "users can select their own row"
  on public.users for select to authenticated
  using (id = auth.uid());

-- INSERT guarded even though the trigger (SECURITY DEFINER) bypasses RLS:
-- a manual insert by an authenticated user is only allowed for their own id.
drop policy if exists "users can insert their own row" on public.users;
create policy "users can insert their own row"
  on public.users for insert to authenticated
  with check (id = auth.uid());

drop policy if exists "users can update their own row" on public.users;
create policy "users can update their own row"
  on public.users for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "users can delete their own row" on public.users;
create policy "users can delete their own row"
  on public.users for delete to authenticated
  using (id = auth.uid());

-- --- decks: direct owner (user_id = auth.uid()) -----------------------------
drop policy if exists "users can select their own decks" on public.decks;
create policy "users can select their own decks"
  on public.decks for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can insert decks they own" on public.decks;
create policy "users can insert decks they own"
  on public.decks for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "users can update their own decks" on public.decks;
create policy "users can update their own decks"
  on public.decks for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "users can delete their own decks" on public.decks;
create policy "users can delete their own decks"
  on public.decks for delete to authenticated
  using (user_id = auth.uid());

-- --- modules: owner via join to decks (EXISTS) ------------------------------
drop policy if exists "users can select modules in their decks" on public.modules;
create policy "users can select modules in their decks"
  on public.modules for select to authenticated
  using (exists (
    select 1 from public.decks d
    where d.id = modules.deck_id and d.user_id = auth.uid()
  ));

drop policy if exists "users can insert modules in their decks" on public.modules;
create policy "users can insert modules in their decks"
  on public.modules for insert to authenticated
  with check (exists (
    select 1 from public.decks d
    where d.id = modules.deck_id and d.user_id = auth.uid()
  ));

drop policy if exists "users can update modules in their decks" on public.modules;
create policy "users can update modules in their decks"
  on public.modules for update to authenticated
  using (exists (
    select 1 from public.decks d
    where d.id = modules.deck_id and d.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.decks d
    where d.id = modules.deck_id and d.user_id = auth.uid()
  ));

drop policy if exists "users can delete modules in their decks" on public.modules;
create policy "users can delete modules in their decks"
  on public.modules for delete to authenticated
  using (exists (
    select 1 from public.decks d
    where d.id = modules.deck_id and d.user_id = auth.uid()
  ));

-- --- questions: owner via join modules -> decks (EXISTS) --------------------
drop policy if exists "users can select questions in their decks" on public.questions;
create policy "users can select questions in their decks"
  on public.questions for select to authenticated
  using (exists (
    select 1 from public.modules m
    join public.decks d on d.id = m.deck_id
    where m.id = questions.module_id and d.user_id = auth.uid()
  ));

drop policy if exists "users can insert questions in their decks" on public.questions;
create policy "users can insert questions in their decks"
  on public.questions for insert to authenticated
  with check (exists (
    select 1 from public.modules m
    join public.decks d on d.id = m.deck_id
    where m.id = questions.module_id and d.user_id = auth.uid()
  ));

drop policy if exists "users can update questions in their decks" on public.questions;
create policy "users can update questions in their decks"
  on public.questions for update to authenticated
  using (exists (
    select 1 from public.modules m
    join public.decks d on d.id = m.deck_id
    where m.id = questions.module_id and d.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.modules m
    join public.decks d on d.id = m.deck_id
    where m.id = questions.module_id and d.user_id = auth.uid()
  ));

drop policy if exists "users can delete questions in their decks" on public.questions;
create policy "users can delete questions in their decks"
  on public.questions for delete to authenticated
  using (exists (
    select 1 from public.modules m
    join public.decks d on d.id = m.deck_id
    where m.id = questions.module_id and d.user_id = auth.uid()
  ));

-- --- progress: direct owner (user_id = auth.uid()) --------------------------
drop policy if exists "users can select their own progress" on public.progress;
create policy "users can select their own progress"
  on public.progress for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can insert their own progress" on public.progress;
create policy "users can insert their own progress"
  on public.progress for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "users can update their own progress" on public.progress;
create policy "users can update their own progress"
  on public.progress for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "users can delete their own progress" on public.progress;
create policy "users can delete their own progress"
  on public.progress for delete to authenticated
  using (user_id = auth.uid());

-- --- evaluations: direct owner (user_id = auth.uid()) -----------------------
drop policy if exists "users can select their own evaluations" on public.evaluations;
create policy "users can select their own evaluations"
  on public.evaluations for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can insert their own evaluations" on public.evaluations;
create policy "users can insert their own evaluations"
  on public.evaluations for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "users can update their own evaluations" on public.evaluations;
create policy "users can update their own evaluations"
  on public.evaluations for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "users can delete their own evaluations" on public.evaluations;
create policy "users can delete their own evaluations"
  on public.evaluations for delete to authenticated
  using (user_id = auth.uid());

-- --- usage_counters: direct owner (user_id = auth.uid()) --------------------
drop policy if exists "users can select their own usage counters" on public.usage_counters;
create policy "users can select their own usage counters"
  on public.usage_counters for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can insert their own usage counters" on public.usage_counters;
create policy "users can insert their own usage counters"
  on public.usage_counters for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "users can update their own usage counters" on public.usage_counters;
create policy "users can update their own usage counters"
  on public.usage_counters for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "users can delete their own usage counters" on public.usage_counters;
create policy "users can delete their own usage counters"
  on public.usage_counters for delete to authenticated
  using (user_id = auth.uid());

-- ===========================================================================
-- Section D — Defense in depth: revoke broad grants from `anon`
-- ===========================================================================
-- Supabase grants the `anon` role broad table privileges by default
-- (SELECT/INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER). Today RLS already
-- denies anon every row (it has no policies and is not BYPASSRLS), so this is
-- belt-and-suspenders: if anyone ever disables RLS on a table, or adds a table
-- and forgets to enable it, anon must still fail closed rather than gain full
-- access. The app does not use the anon role for data — it uses `authenticated`
-- (gated by the policies above) and `service_role` (BYPASSRLS, server-only) —
-- so revoking these grants does not affect application behavior.
--
-- Re-running this file re-applies the REVOKE across ALL tables, so any table
-- added later is covered the next time rls.sql is applied.

revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke all on all functions in schema public from anon;
