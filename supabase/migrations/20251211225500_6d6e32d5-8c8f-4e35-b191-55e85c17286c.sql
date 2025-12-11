-- Add is_blocked column to user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS is_blocked boolean NOT NULL DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_is_blocked ON public.user_roles(is_blocked);

-- Update RLS policy so blocked admins cannot access admin features
-- First drop the existing policies and recreate with blocked check
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

-- Create new function to check if admin is not blocked
CREATE OR REPLACE FUNCTION public.is_active_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
      AND is_blocked = false
  )
$$;

-- Recreate policies with blocked check
CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (is_active_admin(auth.uid()));

CREATE POLICY "Admins can insert roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Admins can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (is_active_admin(auth.uid()))
WITH CHECK (is_active_admin(auth.uid()));

CREATE POLICY "Admins can delete roles" 
ON public.user_roles 
FOR DELETE 
USING (is_active_admin(auth.uid()));