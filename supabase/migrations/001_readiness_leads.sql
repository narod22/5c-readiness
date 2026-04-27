-- Readiness leads from the 5C Grader tool
-- Run once against the franchise-intel Supabase project

create table if not exists public.readiness_leads (
  id            uuid primary key default gen_random_uuid(),
  name          text,
  email         text not null,
  business_name text,
  place_id      text,
  source        text default '5c-grader',
  created_at    timestamptz not null default now()
);

create index if not exists readiness_leads_email_idx
  on public.readiness_leads (email);

create index if not exists readiness_leads_created_at_idx
  on public.readiness_leads (created_at desc);
