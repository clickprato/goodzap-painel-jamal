GRANT SELECT ON public.cardapio TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cardapio TO authenticated;
GRANT ALL ON public.cardapio TO service_role;