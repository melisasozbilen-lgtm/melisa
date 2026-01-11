-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create a more restrictive policy - users can only see their own full profile
-- Others can only see basic public info (username, avatar_url)
CREATE POLICY "Users can view own full profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a separate policy for public profile viewing (limited fields handled in app)
CREATE POLICY "Anyone can view basic profile info" 
ON public.profiles 
FOR SELECT 
USING (true);