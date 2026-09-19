-- Add address and pincode to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS address text DEFAULT '',
ADD COLUMN IF NOT EXISTS pincode varchar(10) DEFAULT '';
