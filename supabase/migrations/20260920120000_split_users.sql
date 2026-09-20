-- SPLIT USERS TABLE INTO CUSTOMERS AND WORKERS

-- 1. TRUNCATE DEPENDENT TABLES TO AVOID ORPHAN DATA
-- This is necessary because we are migrating to a completely new user structure.
TRUNCATE TABLE bookings CASCADE;
TRUNCATE TABLE policy_votes CASCADE;
TRUNCATE TABLE notifications CASCADE;

-- 2. DROP EXISTING FOREIGN KEY CONSTRAINTS
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_customer_id_fkey;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_worker_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_customer_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_worker_id_fkey;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_customer_id_fkey;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_worker_id_fkey;
ALTER TABLE skill_verifications DROP CONSTRAINT IF EXISTS skill_verifications_worker_id_fkey;
ALTER TABLE skill_verifications DROP CONSTRAINT IF EXISTS skill_verifications_reviewed_by_fkey;
ALTER TABLE worker_earnings DROP CONSTRAINT IF EXISTS worker_earnings_worker_id_fkey;
ALTER TABLE disputes DROP CONSTRAINT IF EXISTS disputes_raised_by_fkey;
ALTER TABLE disputes DROP CONSTRAINT IF EXISTS disputes_resolved_by_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE policy_votes DROP CONSTRAINT IF EXISTS policy_votes_created_by_fkey;
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_worker_id_fkey;
ALTER TABLE ai_match_logs DROP CONSTRAINT IF EXISTS ai_match_logs_customer_id_fkey;
ALTER TABLE ai_match_logs DROP CONSTRAINT IF EXISTS ai_match_logs_worker_id_fkey;

-- 3. CREATE CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
    id uuid primary key default gen_random_uuid(),
    name varchar(100) not null,
    phone varchar(20) unique not null,
    email varchar(255) unique not null,
    password_hash text not null,
    language language_type default 'EN',
    profile_image text default '',
    is_active boolean default true,
    refresh_token text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 4. CREATE WORKERS TABLE (MERGED WITH WORKER_PROFILES)
CREATE TABLE IF NOT EXISTS workers (
    id uuid primary key default gen_random_uuid(),
    name varchar(100) not null,
    phone varchar(20) unique not null,
    email varchar(255) unique not null,
    password_hash text not null,
    language language_type default 'EN',
    profile_image text default '',
    is_active boolean default true,
    refresh_token text,
    -- Worker specific fields
    skills text[] default '{}',
    experience int default 0,
    location extensions.geometry(Point, 4326),
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

-- 5. MIGRATE DATA (Optional - we will just drop the old tables as this is early dev)
DROP TABLE IF EXISTS worker_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 6. RE-ADD FOREIGN KEYS
ALTER TABLE bookings ADD CONSTRAINT bookings_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id);
ALTER TABLE bookings ADD CONSTRAINT bookings_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES workers(id);

ALTER TABLE reviews ADD CONSTRAINT reviews_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id);
ALTER TABLE reviews ADD CONSTRAINT reviews_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES workers(id);

ALTER TABLE payments ADD CONSTRAINT payments_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id);
ALTER TABLE payments ADD CONSTRAINT payments_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES workers(id);

ALTER TABLE skill_verifications ADD CONSTRAINT skill_verifications_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES workers(id);
-- Assuming admins are now just workers with a special flag, or we ignore reviewed_by for now
ALTER TABLE skill_verifications DROP COLUMN IF EXISTS reviewed_by;

ALTER TABLE worker_earnings ADD CONSTRAINT worker_earnings_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES workers(id);

-- Disputes can be raised by either customer or worker, we need to adapt the schema
ALTER TABLE disputes DROP COLUMN IF EXISTS raised_by;
ALTER TABLE disputes DROP COLUMN IF EXISTS resolved_by;
ALTER TABLE disputes ADD COLUMN raised_by_customer uuid REFERENCES customers(id);
ALTER TABLE disputes ADD COLUMN raised_by_worker uuid REFERENCES workers(id);

-- Notifications can be for customer or worker
ALTER TABLE notifications DROP COLUMN IF EXISTS user_id;
ALTER TABLE notifications ADD COLUMN customer_id uuid REFERENCES customers(id);
ALTER TABLE notifications ADD COLUMN worker_id uuid REFERENCES workers(id);

-- Policy Votes are created by workers (co-op members)
ALTER TABLE policy_votes DROP COLUMN IF EXISTS created_by;
ALTER TABLE policy_votes ADD COLUMN created_by uuid REFERENCES workers(id);

ALTER TABLE votes ADD CONSTRAINT votes_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES workers(id);

ALTER TABLE ai_match_logs ADD CONSTRAINT ai_match_logs_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id);
ALTER TABLE ai_match_logs ADD CONSTRAINT ai_match_logs_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES workers(id);

-- 7. RLS POLICIES & TRIGGERS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER set_workers_updated_at BEFORE UPDATE ON workers FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- Customers policies
CREATE POLICY "Customers can read own profile" ON customers FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Customers can update own profile" ON customers FOR UPDATE TO authenticated USING (id = auth.uid());

-- Workers policies
CREATE POLICY "Workers can read own profile" ON workers FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Workers can update own profile" ON workers FOR UPDATE TO authenticated USING (id = auth.uid());
