-- Add is_paid column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE;

-- Optional: Create a policy if you have RLS enabled and want to protect this field
-- but for now assuming direct service role access via backend for updates is handled, 
-- and frontend reads via authenticated user.
