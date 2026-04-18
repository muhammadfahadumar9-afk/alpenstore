-- Enable RLS on realtime.messages (safe if already enabled)
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to keep this idempotent
DROP POLICY IF EXISTS "Users can receive own user-scoped channel messages" ON realtime.messages;
DROP POLICY IF EXISTS "Admins can receive all realtime messages" ON realtime.messages;

-- Allow authenticated users to receive messages only on a channel
-- topic that ends with their own auth.uid (e.g. "user-orders:<uid>")
CREATE POLICY "Users can receive own user-scoped channel messages"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  (realtime.topic()) = ('user-orders:' || auth.uid()::text)
);

-- Allow admins to receive messages on any channel (for admin dashboards)
CREATE POLICY "Admins can receive all realtime messages"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  public.is_active_admin(auth.uid())
);