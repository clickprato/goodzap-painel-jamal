
-- Tabela única (singleton) para armazenar URLs dos webhooks
CREATE TABLE IF NOT EXISTS public.webhooks_campanhas (
  id bigint PRIMARY KEY DEFAULT 1,
  webhook_promocoes text,
  webhook_recuperacao text,
  webhook_aniversariantes text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT singleton_webhooks CHECK (id = 1)
);

INSERT INTO public.webhooks_campanhas (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.webhooks_campanhas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admin can view webhooks" ON public.webhooks_campanhas;
CREATE POLICY "Super admin can view webhooks"
ON public.webhooks_campanhas
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super-admin'));

DROP POLICY IF EXISTS "Super admin can insert webhooks" ON public.webhooks_campanhas;
CREATE POLICY "Super admin can insert webhooks"
ON public.webhooks_campanhas
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'super-admin'));

DROP POLICY IF EXISTS "Super admin can update webhooks" ON public.webhooks_campanhas;
CREATE POLICY "Super admin can update webhooks"
ON public.webhooks_campanhas
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'super-admin'))
WITH CHECK (public.has_role(auth.uid(), 'super-admin'));

-- Adicionar coluna ultimo_disparo_at nas 3 tabelas de campanhas
ALTER TABLE public.promocoes_goodzap
  ADD COLUMN IF NOT EXISTS ultimo_disparo_at timestamp with time zone;

ALTER TABLE public.recuperacao_clientes
  ADD COLUMN IF NOT EXISTS ultimo_disparo_at timestamp with time zone;

ALTER TABLE public.promocao_aniversario
  ADD COLUMN IF NOT EXISTS ultimo_disparo_at timestamp with time zone;

-- Habilitar pg_cron e pg_net (se ainda não estiverem)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
