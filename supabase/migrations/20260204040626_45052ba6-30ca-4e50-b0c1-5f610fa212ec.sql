-- Adicionar coluna disponivel na tabela cardapio (pizzas)
ALTER TABLE public.cardapio 
ADD COLUMN disponivel boolean NOT NULL DEFAULT true;

-- Adicionar coluna disponivel na tabela bebidas
ALTER TABLE public.bebidas 
ADD COLUMN disponivel boolean NOT NULL DEFAULT true;