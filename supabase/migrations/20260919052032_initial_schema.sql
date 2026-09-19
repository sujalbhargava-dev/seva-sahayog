-- Enable PostGIS for geospatial queries
create extension if not exists postgis;
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ENUMS
create type user_role as enum ('CUSTOMER', 'WORKER', 'ADMIN');
create type language_type as enum ('EN', 'HI', 'MR');
create type verification_status as enum ('PENDING', 'APPROVED', 'REJECTED');
create type booking_status as enum ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
create type payment_status as enum ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
create type payout_status as enum ('PENDING', 'PROCESSING', 'PAID', 'FAILED');
create type dispute_status as enum ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
create type notification_type as enum ('GENERAL', 'BOOKING', 'PAYMENT', 'SYSTEM');
create type policy_status as enum ('ACTIVE', 'CLOSED', 'DRAFT');

-- USERS
create table if not exists users (
    id uuid primary key default uuid_generate_v4(),
    name varchar(100) not null,
    phone varchar(20) unique not null,
    email varchar(255) unique not null,
    password_hash text not null,
    role user_role not null,
    language language_type default 'EN',
    profile_image text default '',
    is_active boolean default true,
    refresh_token text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- WORKER PROFILES
create table if not exists worker_profiles (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references users(id) on delete cascade unique not null,
    skills text[] default '{}',
    experience int default 0,
    location geometry(Point, 4326),
    address text default '',
    availability boolean default true,
    rating float default 0,
    total_jobs int default 0,
    verification_status verification_status default 'PENDING',
    verification_video_url text default '',
    cooperative_member boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index idx_worker_location on worker_profiles using gist(location);
create index idx_worker_skills on worker_profiles using gin(skills);
create index idx_worker_rating on worker_profiles(rating desc);

-- SERVICES
create table if not exists services (
    id uuid primary key default uuid_generate_v4(),
    name varchar(255) not null,
    category varchar(100) not null,
    description text default '',
    base_price decimal(10,2) not null,
    is_active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index idx_services_category on services(category);

-- BOOKINGS
create table if not exists bookings (
    id uuid primary key default uuid_generate_v4(),
    customer_id uuid references users(id) not null,
    worker_id uuid references users(id) not null,
    service_id uuid references services(id) not null,
    location geometry(Point, 4326) not null,
    address text not null,
    scheduled_date date not null,
    scheduled_time time not null,
    amount decimal(10,2) not null,
    status booking_status default 'PENDING',
    payment_status payment_status default 'PENDING',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index idx_bookings_status on bookings(status);
create index idx_bookings_scheduled on bookings(scheduled_date);
create index idx_bookings_location on bookings using gist(location);

-- REVIEWS
create table if not exists reviews (
    id uuid primary key default uuid_generate_v4(),
    booking_id uuid references bookings(id) not null,
    customer_id uuid references users(id) not null,
    worker_id uuid references users(id) not null,
    rating int not null check (rating >= 1 and rating <= 5),
    comment text default '',
    created_at timestamptz default now(),
    unique(booking_id, customer_id)
);

create index idx_reviews_rating on reviews(rating desc);

-- PAYMENTS
create table if not exists payments (
    id uuid primary key default uuid_generate_v4(),
    booking_id uuid references bookings(id) not null,
    customer_id uuid references users(id) not null,
    worker_id uuid references users(id) not null,
    amount decimal(10,2) not null,
    razorpay_order_id varchar(100) default '',
    razorpay_payment_id varchar(100) unique,
    status payment_status default 'PENDING',
    payout_status payout_status default 'PENDING',
    transaction_date timestamptz default now(),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- SKILL VERIFICATIONS
create table if not exists skill_verifications (
    id uuid primary key default uuid_generate_v4(),
    worker_id uuid references users(id) not null,
    video_url text not null,
    skills text[] not null,
    verification_status verification_status default 'PENDING',
    reviewed_by uuid references users(id),
    reviewer_comments text default '',
    created_at timestamptz default now()
);

-- WORKER EARNINGS
create table if not exists worker_earnings (
    id uuid primary key default uuid_generate_v4(),
    worker_id uuid references users(id) not null,
    booking_id uuid references bookings(id) unique not null,
    gross_amount decimal(10,2) not null,
    platform_fee decimal(10,2) not null,
    welfare_contribution decimal(10,2) not null,
    net_amount decimal(10,2) not null,
    payout_status payout_status default 'PENDING',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- DISPUTES
create table if not exists disputes (
    id uuid primary key default uuid_generate_v4(),
    booking_id uuid references bookings(id) not null,
    raised_by uuid references users(id) not null,
    reason text not null,
    description text not null,
    evidence text[] default '{}',
    status dispute_status default 'OPEN',
    resolution text default '',
    resolved_by uuid references users(id),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- NOTIFICATIONS
create table if not exists notifications (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references users(id) not null,
    title text not null,
    message text not null,
    type notification_type default 'GENERAL',
    is_read boolean default false,
    created_at timestamptz default now()
);
-- Optional TTL can be handled by pg_cron or edge functions later

-- POLICY VOTES
create table if not exists policy_votes (
    id uuid primary key default uuid_generate_v4(),
    title varchar(255) not null,
    description text not null,
    options text[] not null check (array_length(options, 1) >= 2),
    start_date timestamptz not null,
    end_date timestamptz not null,
    status policy_status default 'ACTIVE',
    created_by uuid references users(id) not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- VOTES
create table if not exists votes (
    id uuid primary key default uuid_generate_v4(),
    policy_id uuid references policy_votes(id) not null,
    worker_id uuid references users(id) not null,
    selected_option text not null,
    created_at timestamptz default now(),
    unique(policy_id, worker_id)
);

-- UPDATED_AT TRIGGERS
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_users_updated_at before update on users for each row execute procedure set_updated_at();
create trigger set_worker_profiles_updated_at before update on worker_profiles for each row execute procedure set_updated_at();
create trigger set_services_updated_at before update on services for each row execute procedure set_updated_at();
create trigger set_bookings_updated_at before update on bookings for each row execute procedure set_updated_at();
create trigger set_payments_updated_at before update on payments for each row execute procedure set_updated_at();
create trigger set_worker_earnings_updated_at before update on worker_earnings for each row execute procedure set_updated_at();
create trigger set_disputes_updated_at before update on disputes for each row execute procedure set_updated_at();
create trigger set_policy_votes_updated_at before update on policy_votes for each row execute procedure set_updated_at();

-- ROW LEVEL SECURITY
-- Enable RLS on all tables
alter table users enable row level security;
alter table worker_profiles enable row level security;
alter table services enable row level security;
alter table bookings enable row level security;
alter table reviews enable row level security;
alter table payments enable row level security;
alter table skill_verifications enable row level security;
alter table worker_earnings enable row level security;
alter table disputes enable row level security;
alter table notifications enable row level security;
alter table policy_votes enable row level security;
alter table votes enable row level security;

-- Fix Supabase Security Advisor false positive for PostGIS
revoke all on table public.spatial_ref_sys from anon, authenticated;


