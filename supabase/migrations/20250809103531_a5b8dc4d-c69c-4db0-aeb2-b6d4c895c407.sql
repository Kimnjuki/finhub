-- Create functions for role management

-- Function to get users with their roles
CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE (
  user_id uuid,
  email character varying,
  created_at timestamp without time zone,
  is_verified boolean,
  subscription_tier_id uuid,
  roles text[]
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    u.user_id,
    u.email,
    u.created_at,
    u.is_verified,
    u.subscription_tier_id,
    COALESCE(
      ARRAY_AGG(ur.role_name) FILTER (WHERE ur.role_name IS NOT NULL),
      ARRAY[]::text[]
    ) as roles
  FROM public.users u
  LEFT JOIN public.user_roles ur ON u.user_id = ur.user_id
  GROUP BY u.user_id, u.email, u.created_at, u.is_verified, u.subscription_tier_id;
$$;

-- Function to assign role to user
CREATE OR REPLACE FUNCTION public.assign_user_role(user_id uuid, role_name text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  INSERT INTO public.user_roles (user_id, role_name)
  VALUES (user_id, role_name)
  ON CONFLICT (user_id, role_name) DO NOTHING;
$$;

-- Function to remove role from user
CREATE OR REPLACE FUNCTION public.remove_user_role(user_id uuid, role_name text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM public.user_roles 
  WHERE user_roles.user_id = remove_user_role.user_id 
    AND user_roles.role_name = remove_user_role.role_name;
$$;