-- PHASE 2 & 3 FEATURES DATABASE CONFIGURATION
-- This migration adds support for Emergency Bookings, Welfare Fund, Demand Insights, and Smart Matching.

-- ============================================
-- 1. EMERGENCY BOOKINGS (Phase 2)
-- ============================================
alter table bookings add column if not exists is_emergency boolean default false;
alter table bookings add column if not exists emergency_fee decimal(10,2) default 0;

-- ============================================
-- 2. WELFARE FUND TRANSACTIONS (Phase 2)
-- ============================================
create type welfare_transaction_type as enum ('IN', 'OUT');

create table if not exists welfare_fund_transactions (
    id uuid primary key default gen_random_uuid(),
    amount decimal(10,2) not null,
    transaction_type welfare_transaction_type not null,
    description text not null,
    reference_id uuid, -- e.g. booking_id or worker_id
    created_at timestamptz default now()
);

-- ============================================
-- 3. DEMAND FORECASTS (Phase 3)
-- ============================================
create table if not exists demand_forecasts (
    id uuid primary key default gen_random_uuid(),
    region_geometry extensions.geometry(Polygon, 4326),
    region_name varchar(255) not null,
    service_category varchar(100) not null,
    forecast_date date not null,
    demand_score int not null check (demand_score >= 0 and demand_score <= 100),
    confidence_level float check (confidence_level >= 0 and confidence_level <= 1),
    created_at timestamptz default now()
);

create index idx_demand_forecasts_date on demand_forecasts(forecast_date);
create index idx_demand_forecasts_category on demand_forecasts(service_category);

-- ============================================
-- 4. AI SMART MATCHING LOGS (Phase 3)
-- ============================================
create table if not exists ai_match_logs (
    id uuid primary key default gen_random_uuid(),
    customer_id uuid references users(id) not null,
    worker_id uuid references users(id) not null,
    service_id uuid references services(id),
    match_score float not null check (match_score >= 0 and match_score <= 100),
    factors jsonb default '{}'::jsonb,
    created_at timestamptz default now()
);

create index idx_ai_match_logs_customer on ai_match_logs(customer_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
alter table welfare_fund_transactions enable row level security;
alter table demand_forecasts enable row level security;
alter table ai_match_logs enable row level security;

-- Welfare Fund Policies
-- Everyone can read the total pool size (via aggregation)
create policy "Welfare fund transactions are viewable by everyone"
on welfare_fund_transactions for select to authenticated
using (true);

-- Demand Forecasts Policies
-- Workers can view demand forecasts
create policy "Demand forecasts are viewable by workers"
on demand_forecasts for select to authenticated
using (
    exists (
        select 1 from users
        where users.id = auth.uid() and (users.role = 'WORKER' or users.role = 'ADMIN')
    )
);

-- AI Match Logs Policies
-- Customers can view their own match logs, admins can view all
create policy "Customers can view their own match logs"
on ai_match_logs for select to authenticated
using (customer_id = auth.uid() or exists (
    select 1 from users where users.id = auth.uid() and users.role = 'ADMIN'
));

-- ============================================
-- UPDATED_AT TRIGGERS (Not applicable here as these are mostly immutable logs, but adding for consistency)
-- ============================================
-- No updated_at triggers needed for append-only log/forecast tables.
