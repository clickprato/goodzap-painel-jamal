-- Função para atualizar métricas de clientes baseado nos pedidos
CREATE OR REPLACE FUNCTION public.atualizar_metricas_clientes()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Atualiza total_gasto e compras para cada cliente baseado nos pedidos
  UPDATE clientes c
  SET 
    compras = metrics.quantidade_pedidos,
    total_gasto = metrics.valor_total,
    ultima_atualizacao = NOW()
  FROM (
    SELECT 
      whatsapp,
      COUNT(*) as quantidade_pedidos,
      SUM(
        COALESCE(
          NULLIF(
            REGEXP_REPLACE(
              REGEXP_REPLACE(total, '[^0-9,.]', '', 'g'),
              ',', '.', 'g'
            ),
            ''
          )::numeric,
          0
        )
      ) as valor_total
    FROM pedidos_goodzap
    GROUP BY whatsapp
  ) metrics
  WHERE c.whatsapp = metrics.whatsapp;
END;
$$;

-- Executa a função para atualizar os dados existentes
SELECT public.atualizar_metricas_clientes();