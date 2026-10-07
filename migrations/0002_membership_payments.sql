create table if not exists membership_payments (
  family_id text primary key,
  paid boolean not null,
  updated_at timestamptz not null default now()
);
