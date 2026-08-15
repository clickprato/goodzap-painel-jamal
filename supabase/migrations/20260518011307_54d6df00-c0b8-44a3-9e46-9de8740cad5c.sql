
-- 1) Adicionar coluna mensagens (jsonb array) à recuperacao_clientes
ALTER TABLE public.recuperacao_clientes
  ADD COLUMN IF NOT EXISTS mensagens jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 2) Remover qualquer CHECK em quant_msg para permitir quantidades acima de 3
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.recuperacao_clientes'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%quant_msg%'
  LOOP
    EXECUTE format('ALTER TABLE public.recuperacao_clientes DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

-- 3) Backfill: para linhas existentes sem mensagens, montar a partir das colunas atuais (até quant_msg)
UPDATE public.recuperacao_clientes t
SET mensagens = sub.arr
FROM (
  SELECT id,
    (
      SELECT COALESCE(jsonb_agg(item ORDER BY ord), '[]'::jsonb)
      FROM (
        SELECT 1 AS ord, jsonb_build_object(
          'mensagem', COALESCE(mensagem, ''),
          'imagem_url', imagem_1_url,
          'imagem_ativa', COALESCE(imagem_1_ativa, false),
          'legenda', COALESCE(legenda_1, '')
        ) AS item
        WHERE COALESCE(quant_msg, 1) >= 1
        UNION ALL
        SELECT 2, jsonb_build_object(
          'mensagem', COALESCE(mensagem_2, ''),
          'imagem_url', imagem_2_url,
          'imagem_ativa', COALESCE(imagem_2_ativa, false),
          'legenda', COALESCE(legenda_2, '')
        )
        WHERE COALESCE(quant_msg, 1) >= 2
        UNION ALL
        SELECT 3, jsonb_build_object(
          'mensagem', COALESCE(mensagem_3, ''),
          'imagem_url', imagem_3_url,
          'imagem_ativa', COALESCE(imagem_3_ativa, false),
          'legenda', COALESCE(legenda_3, '')
        )
        WHERE COALESCE(quant_msg, 1) >= 3
      ) s
    ) AS arr
  FROM public.recuperacao_clientes
) sub
WHERE t.id = sub.id
  AND (t.mensagens IS NULL OR jsonb_array_length(t.mensagens) = 0);

-- 4) Atualizar a função buscar_disparos_prontos para usar mensagens dinamicamente
CREATE OR REPLACE FUNCTION public.buscar_disparos_prontos(p_limite integer DEFAULT 100)
 RETURNS TABLE(origem text, id bigint, next_run_at timestamp with time zone, dados jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  return query

  (
    select
      'promocoes_goodzap'::text as origem,
      t.id,
      t.next_run_at,
      jsonb_build_object(
        'id', t.id,
        'created_at', t.created_at,
        'tipo', 'promocao',
        'promocao', t.promocao,
        'regras_promocao', t.regras,
        'ativa', t.ativa,
        'imagem_promocao', t.imagem_promocao,
        'imagem_promocao_ativa', case when t.imagem_ativa then 'ativa' else 'desativada' end,
        'imagem_promocao_ativa_url', t.imagem_url,
        'legenda', t.legenda,
        'agendamento_ativo', t.agendamento_ativo,
        'agendamento_tipo', t.agendamento_tipo,
        'agendamento_data_inicio', t.agendamento_data_inicio,
        'agendamento_data_final', t.agendamento_data_final,
        'agendamento_dias_semana', t.agendamento_dias_semana,
        'agendamento_horarios', t.agendamento_horarios,
        'agendamento_timezone', t.agendamento_timezone
      ) as dados
    from public.promocoes_goodzap t
    where t.agendamento_ativo = true
      and t.next_run_at is not null
      and t.next_run_at <= now()
  )

  union all

  (
    select
      'recuperacao_clientes'::text as origem,
      t.id,
      t.next_run_at,
      (
        -- base
        jsonb_build_object(
          'id', t.id,
          'created_at', t.created_at,
          'tipo', 'recuperacao',
          'quant_msg', COALESCE(jsonb_array_length(t.mensagens), 0),
          'data_inicio', t.data_inicio,
          'data_final', t.data_final,
          'status', t.status,
          'mensagem_ativa', case when t.mensagem_ativa then 'ativa' else 'desativada' end,
          'promocao', t.promocao,
          'ativa_promocao', t.ativa_promocao,
          'regras_promocao', t.regras,
          'legenda_ativa', case when t.legenda_ativa then 'ativa' else 'desativada' end,
          'mensagens', t.mensagens,
          'agendamento_ativo', t.agendamento_ativo,
          'agendamento_tipo', t.agendamento_tipo,
          'agendamento_data_inicio', t.agendamento_data_inicio,
          'agendamento_data_final', t.agendamento_data_final,
          'agendamento_dias_semana', t.agendamento_dias_semana,
          'agendamento_horarios', t.agendamento_horarios,
          'agendamento_timezone', t.agendamento_timezone
        )
        ||
        -- expandir cada item em msg_N, img_N, legenda_N
        COALESCE((
          SELECT jsonb_object_agg(k, v)
          FROM (
            SELECT key, value
            FROM (
              SELECT ord,
                ('msg_' || ord)::text     AS k_msg,    (item->>'mensagem')                                              AS v_msg,
                ('img_' || ord)::text     AS k_img,    CASE WHEN (item->>'imagem_ativa')::boolean THEN item->>'imagem_url' ELSE NULL END AS v_img,
                ('legenda_' || ord)::text AS k_leg,    (item->>'legenda')                                               AS v_leg
              FROM jsonb_array_elements(t.mensagens) WITH ORDINALITY AS arr(item, ord)
            ) base
            CROSS JOIN LATERAL (
              VALUES (k_msg, to_jsonb(v_msg)), (k_img, to_jsonb(v_img)), (k_leg, to_jsonb(v_leg))
            ) kv(key, value)
          ) flat(k, v)
        ), '{}'::jsonb)
      ) as dados
    from public.recuperacao_clientes t
    where t.agendamento_ativo = true
      and t.next_run_at is not null
      and t.next_run_at <= now()
  )

  union all

  (
    select
      'promocao_aniversario'::text as origem,
      t.id,
      t.next_run_at,
      jsonb_build_object(
        'id', t.id,
        'created_at', t.created_at,
        'tipo', 'aniversario',
        'status', t.status,
        'quant_msg', t.quant_msg,
        'mensagem_1', t.mensagem_1,
        'mensagem_2', t.mensagem_2,
        'mensagem_3', t.mensagem_3,
        'enviado', t.enviado,
        'imagem_aniversario_1', case when t.imagem_1_ativa then 'ativa' else 'desativada' end,
        'imagem_aniversario_1_url', t.imagem_1_url,
        'legenda_1', t.legenda_1,
        'imagem_aniversario_2', case when t.imagem_2_ativa then 'ativa' else 'desativada' end,
        'imagem_aniversario_2_url', t.imagem_2_url,
        'legenda_2', t.legenda_2,
        'imagem_aniversario_3', case when t.imagem_3_ativa then 'ativa' else 'desativada' end,
        'imagem_aniversario_3_url', t.imagem_3_url,
        'legenda_3', t.legenda_3,
        'agendamento_ativo', t.agendamento_ativo,
        'agendamento_tipo', t.agendamento_tipo,
        'agendamento_data_inicio', t.agendamento_data_inicio,
        'agendamento_data_final', t.agendamento_data_final,
        'agendamento_dias_semana', t.agendamento_dias_semana,
        'agendamento_horarios', t.agendamento_horarios,
        'agendamento_timezone', t.agendamento_timezone
      ) as dados
    from public.promocao_aniversario t
    where t.agendamento_ativo = true
      and t.next_run_at is not null
      and t.next_run_at <= now()
  )

  order by next_run_at asc
  limit p_limite;

end;
$function$;
