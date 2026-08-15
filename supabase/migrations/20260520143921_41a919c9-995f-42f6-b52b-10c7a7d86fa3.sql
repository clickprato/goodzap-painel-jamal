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
        'quant_msg', t.quant_msg,
        'data_inicio', t.data_inicio,
        'data_final', t.data_final,
        'status', t.status,
        'mensagem_ativa', case when t.mensagem_ativa then 'ativa' else 'desativada' end,
        'promocao', t.promocao,
        'ativa_promocao', t.ativa_promocao,
        'regras', t.regras,
        'legenda_ativa', case when t.legenda_ativa then 'ativa' else 'desativada' end,
        'agendamento_ativo', t.agendamento_ativo,
        'agendamento_tipo', t.agendamento_tipo,
        'agendamento_data_inicio', t.agendamento_data_inicio,
        'agendamento_data_final', t.agendamento_data_final,
        'agendamento_dias_semana', t.agendamento_dias_semana,
        'agendamento_horarios', t.agendamento_horarios,
        'agendamento_timezone', t.agendamento_timezone,
        'msg_1', t.mensagem,
        'img_1', case when t.imagem_1_ativa then t.imagem_1_url else null end,
        'legenda_1', t.legenda_1,
        'regra_promocao_1', coalesce(t.mensagens->0->>'regra', t.regras),
        'msg_2', case when t.quant_msg >= 2 then t.mensagem_2 else null end,
        'img_2', case when t.quant_msg >= 2 and t.imagem_2_ativa then t.imagem_2_url else null end,
        'legenda_2', case when t.quant_msg >= 2 then t.legenda_2 else null end,
        'regra_promocao_2', case when t.quant_msg >= 2 then coalesce(t.mensagens->1->>'regra', t.regras) else null end,
        'msg_3', case when t.quant_msg >= 3 then t.mensagem_3 else null end,
        'img_3', case when t.quant_msg >= 3 and t.imagem_3_ativa then t.imagem_3_url else null end,
        'legenda_3', case when t.quant_msg >= 3 then t.legenda_3 else null end,
        'regra_promocao_3', case when t.quant_msg >= 3 then coalesce(t.mensagens->2->>'regra', t.regras) else null end
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