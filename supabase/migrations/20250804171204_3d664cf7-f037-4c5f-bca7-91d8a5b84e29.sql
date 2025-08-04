-- Create set_config function for setting session variables
CREATE OR REPLACE FUNCTION public.set_config(
  setting_name text,
  setting_value text,
  is_local boolean DEFAULT false
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set the configuration parameter
  PERFORM set_config(setting_name, setting_value, is_local);
  
  -- Return the value that was set
  RETURN setting_value;
END;
$$;