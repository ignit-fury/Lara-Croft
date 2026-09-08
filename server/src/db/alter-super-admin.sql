-- Adds 'super_admin' role + makes admin@lara.com the super admin
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Drop old constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- 2. Add super_admin to allowed roles
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin', 'manager', 'super_admin'));

-- 3. Make admin@lara.com the super_admin
UPDATE users SET role = 'super_admin' WHERE email = 'admin@lara.com';
