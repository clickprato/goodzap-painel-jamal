ALTER TABLE public.recuperacao_clientes
  ADD COLUMN IF NOT EXISTS mensagem_ativa boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS legenda_ativa boolean NOT NULL DEFAULT true;

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
        'regras', t.regras,
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
      jsonb_build_object(
        'id', t.id,
        'created_at', t.created_at,
        'tipo', 'recuperacao',
        'data_inicio', t.data_inicio,
        'data_final', t.data_final,
        'status', t.status,
        'mensagem', t.mensagem,
        'mensagem_ativa', case when t.mensagem_ativa then 'ativa' else 'desativada' end,
        'promocao', t.promocao,
        'ativa_promocao', t.ativa_promocao,
        'regras', t.regras,
        'imagem_recuperacao_clientes', case when t.imagem_ativa then 'ativa' else 'desativada' end,
        'imagem_recuperacao_clientes_url', t.imagem_url,
        'legenda', t.legenda,
        'legenda_ativa', case when t.legenda_ativa then 'ativa' else 'desativada' end,
        'agendamento_ativo', t.agendamento_ativo,
        'agendamento_tipo', t.agendamento_tipo,
        'agendamento_data_inicio', t.agendamento_data_inicio,
        'agendamento_data_final', t.agendamento_data_final,
        'agendamento_dias_semana', t.agendamento_dias_semana,
        'agendamento_horarios', t.agendamento_horarios,
        'agendamento_timezone', t.agendamento_timezone
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