
-- Remove o trigger antigo que sempre atribuía role 'user' por padrão
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_role_trigger ON auth.users;

-- Função RPC segura: valida token, marca como usado e atribui token_role ao usuário
CREATE OR REPLACE FUNCTION public.assign_role_from_token(_token text, _user_id uuid)
RETURNS app_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_token_id uuid;
  v_used boolean;
  v_role app_role;
BEGIN
  SELECT id, used, token_role INTO v_token_id, v_used, v_role
  FROM public.tokens
  WHERE token = _token
  LIMIT 1;

  IF v_token_id IS NULL THEN
    RAISE EXCEPTION 'Token inválido';
  END IF;

  IF v_used THEN
    RAISE EXCEPTION 'Token já utilizado';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, COALESCE(v_role, 'user'::app_role))
  ON CONFLICT (user_id, role) DO NOTHING;

  UPDATE public.tokens SET used = true WHERE id = v_token_id;

  RETURN COALESCE(v_role, 'user'::app_role);
END;
$$;

GRANT EXECUTE ON FUNCTION public.assign_role_from_token(text, uuid) TO anon, authenticated;
