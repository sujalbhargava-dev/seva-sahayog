-- Step 1: Drop the location columns that depend on PostGIS
alter table worker_profiles drop column location;
alter table bookings drop column location;

-- Step 2: Drop the postgis extension from the public schema
-- This will also remove the spatial_ref_sys system table from public
drop extension postgis;

-- Step 3: Create a dedicated extensions schema and install PostGIS there
create schema if not exists extensions;
create extension postgis with schema extensions;

-- Step 4: Re-add the location columns and their GIST indexes using the new extensions schema
alter table worker_profiles add column location extensions.geometry(Point, 4326);
create index idx_worker_location on worker_profiles using gist(location);

alter table bookings add column location extensions.geometry(Point, 4326);
create index idx_bookings_location on bookings using gist(location);
