DROP POLICY IF EXISTS "Cardapio admin write" ON public.cardapio;
DROP POLICY IF EXISTS "Bebidas admin write" ON public.bebidas;
DROP POLICY IF EXISTS "Borda recheada admin write" ON public.borda_recheada;
DROP POLICY IF EXISTS "Outros produtos admin write" ON public.outros_produtos;
DROP POLICY IF EXISTS "Admins controlam todas as roles" ON public.user_roles;
DROP POLICY IF EXISTS "Usuarios veem suas proprias roles" ON public.user_roles;

CREATE POLICY "Cardapio admin write"
ON public.cardapio
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'super-admin'::public.app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'super-admin'::public.app_role)
);

CREATE POLICY "Bebidas admin write"
ON public.bebidas
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'super-admin'::public.app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'super-admin'::public.app_role)
);

CREATE POLICY "Borda recheada admin write"
ON public.borda_recheada
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'super-admin'::public.app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'super-admin'::public.app_role)
);

CREATE POLICY "Outros produtos admin write"
ON public.outros_produtos
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'super-admin'::public.app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'super-admin'::public.app_role)
);

CREATE POLICY "Usuarios veem suas proprias roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'super-admin'::public.app_role)
);

CREATE POLICY "Admins controlam todas as roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'super-admin'::public.app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'super-admin'::public.app_role)
);