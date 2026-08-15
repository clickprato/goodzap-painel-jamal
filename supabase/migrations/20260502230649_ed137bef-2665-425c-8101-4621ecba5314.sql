ALTER TABLE public.webhooks_campanhas
ADD COLUMN IF NOT EXISTS comunicacao_instancia text,
ADD COLUMN IF NOT EXISTS comunicacao_apikey text;