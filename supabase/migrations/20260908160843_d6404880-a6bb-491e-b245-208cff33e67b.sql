CREATE POLICY "No direct user access to connection keys"
ON public.app_user_connections
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);