// Edge Function: disparar-campanhas-cron
// Lê agendamentos prontos (next_run_at <= now) das 3 tabelas de campanhas,
// dispara o webhook configurado para cada tipo e recalcula o próximo next_run_at.
// Também aceita disparo manual via body { origem, id }.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Origem =
  | "promocoes_goodzap"
  | "recuperacao_clientes"
  | "promocao_aniversario";

type Disparo = {
  origem: Origem;
  id: number;
  next_run_at: string;
  dados: Record<string, unknown>;
};

const ORIGEM_TO_WEBHOOK: Record<Origem, "webhook_promocoes" | "webhook_recuperacao" | "webhook_aniversariantes"> = {
  promocoes_goodzap: "webhook_promocoes",
  recuperacao_clientes: "webhook_recuperacao",
  promocao_aniversario: "webhook_aniversariantes",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // Parse body para checar se é disparo manual
  let manual: { origem?: Origem; id?: number } | null = null;
  if (req.method === "POST") {
    try {
      const text = await req.text();
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed && parsed.origem) manual = parsed;
      }
    } catch (_) {
      // ignore - assume cron sem body
    }
  }

  try {
    // 1) Buscar URLs dos webhooks
    const { data: webhooks, error: errWebhooks } = await supabase
      .from("webhooks_campanhas")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (errWebhooks) throw errWebhooks;

    let lista: Disparo[] = [];

    if (manual?.origem) {
      // Construir disparos manualmente usando buscar_disparos_prontos like logic
      // Mais simples: buscar a linha e montar payload genérico via select * 
      const { data: row, error: errRow } = await supabase
        .from(manual.origem)
        .select("*")
        .eq("id", manual.id!)
        .maybeSingle();
      if (errRow) throw errRow;
      if (!row) {
        return new Response(
          JSON.stringify({ error: "Registro não encontrado" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 },
        );
      }

      // Mapeamento espelhando buscar_disparos_prontos
      let dados: Record<string, unknown> = {};
      const r: any = row;
      if (manual.origem === "promocoes_goodzap") {
        dados = {
          id: r.id,
          created_at: r.created_at,
          tipo: "promocao",
          promocao: r.promocao,
          regras_promocao: r.regras,
          ativa: r.ativa,
          imagem_promocao: r.imagem_promocao,
          imagem_promocao_ativa: r.imagem_ativa ? "ativa" : "desativada",
          imagem_promocao_ativa_url: r.imagem_url,
          legenda: r.legenda,
          agendamento_ativo: r.agendamento_ativo,
          agendamento_tipo: r.agendamento_tipo,
          agendamento_data_inicio: r.agendamento_data_inicio,
          agendamento_data_final: r.agendamento_data_final,
          agendamento_dias_semana: r.agendamento_dias_semana,
          agendamento_horarios: r.agendamento_horarios,
          agendamento_timezone: r.agendamento_timezone,
        };
      } else if (manual.origem === "recuperacao_clientes") {
        let mensagens: Array<{ mensagem: string; imagem_url: string | null; imagem_ativa: boolean; legenda: string; regra: string }> = [];
        if (Array.isArray(r.mensagens) && r.mensagens.length > 0) {
          mensagens = r.mensagens.map((m: any, i: number) => {
            const n = i + 1;
            return {
              mensagem: m?.[`mensagem_${n}`] ?? m?.mensagem ?? "",
              imagem_url: m?.[`imagem_url_${n}`] ?? m?.imagem_url ?? null,
              imagem_ativa: !!(m?.[`imagem_ativa_${n}`] ?? m?.imagem_ativa),
              legenda: m?.[`legenda_${n}`] ?? m?.legenda ?? "",
              regra: m?.[`regra_promocao_${n}`] ?? m?.regra ?? "",
            };
          });
        } else {
          const q = Math.min(Math.max(Number(r.quant_msg ?? 1), 1), 3);
          const legacy = [
            { mensagem: r.mensagem ?? "", imagem_url: r.imagem_1_url ?? r.imagem_url ?? null, imagem_ativa: !!(r.imagem_1_ativa ?? r.imagem_ativa), legenda: r.legenda_1 ?? r.legenda ?? "", regra: r.regras ?? "" },
            { mensagem: r.mensagem_2 ?? "", imagem_url: r.imagem_2_url ?? null, imagem_ativa: !!r.imagem_2_ativa, legenda: r.legenda_2 ?? "", regra: "" },
            { mensagem: r.mensagem_3 ?? "", imagem_url: r.imagem_3_url ?? null, imagem_ativa: !!r.imagem_3_ativa, legenda: r.legenda_3 ?? "", regra: "" },
          ];
          mensagens = legacy.slice(0, q);
        }
        dados = {
          id: r.id,
          created_at: r.created_at,
          tipo: "recuperacao",
          quant_msg: mensagens.length,
          data_inicio: r.data_inicio,
          data_final: r.data_final,
          status: r.status,
          mensagem_ativa: r.mensagem_ativa ? "ativa" : "desativada",
          promocao: r.promocao,
          ativa_promocao: r.ativa_promocao,
          regras_promocao: r.regras,
          legenda_ativa: r.legenda_ativa ? "ativa" : "desativada",
          mensagens,
          agendamento_ativo: r.agendamento_ativo,
          agendamento_tipo: r.agendamento_tipo,
          agendamento_data_inicio: r.agendamento_data_inicio,
          agendamento_data_final: r.agendamento_data_final,
          agendamento_dias_semana: r.agendamento_dias_semana,
          agendamento_horarios: r.agendamento_horarios,
          agendamento_timezone: r.agendamento_timezone,
        };
        mensagens.forEach((m, i) => {
          const n = i + 1;
          dados[`msg_${n}`] = m.mensagem ?? null;
          dados[`img_${n}`] = m.imagem_ativa ? (m.imagem_url ?? null) : null;
          dados[`legenda_${n}`] = m.legenda ?? null;
          dados[`regra_promocao_${n}`] = m.regra ?? r.regras ?? null;
        });
      } else {
        dados = {
          id: r.id,
          created_at: r.created_at,
          tipo: "aniversario",
          status: r.status,
          quant_msg: r.quant_msg,
          mensagem_1: r.mensagem_1,
          mensagem_2: r.mensagem_2,
          mensagem_3: r.mensagem_3,
          enviado: r.enviado,
          imagem_aniversario_1: r.imagem_1_ativa ? "ativa" : "desativada",
          imagem_aniversario_1_url: r.imagem_1_url,
          legenda_1: r.legenda_1,
          imagem_aniversario_2: r.imagem_2_ativa ? "ativa" : "desativada",
          imagem_aniversario_2_url: r.imagem_2_url,
          legenda_2: r.legenda_2,
          imagem_aniversario_3: r.imagem_3_ativa ? "ativa" : "desativada",
          imagem_aniversario_3_url: r.imagem_3_url,
          legenda_3: r.legenda_3,
          agendamento_ativo: r.agendamento_ativo,
          agendamento_tipo: r.agendamento_tipo,
          agendamento_data_inicio: r.agendamento_data_inicio,
          agendamento_data_final: r.agendamento_data_final,
          agendamento_dias_semana: r.agendamento_dias_semana,
          agendamento_horarios: r.agendamento_horarios,
          agendamento_timezone: r.agendamento_timezone,
        };
      }

      lista = [{
        origem: manual.origem,
        id: r.id,
        next_run_at: r.next_run_at ?? new Date().toISOString(),
        dados,
      }];
    } else {
      // 2) Buscar disparos prontos (cron)
      const { data: disparos, error: errDisparos } = await supabase.rpc(
        "buscar_disparos_prontos",
        { p_limite: 200 },
      );
      if (errDisparos) throw errDisparos;
      lista = (disparos ?? []) as Disparo[];
    }

    const tipoDisparo = manual ? "disparo_manual" : "agendado";

    const resultados: Array<{
      origem: string;
      id: number;
      status: "ok" | "erro" | "sem_webhook";
      detalhe?: string;
    }> = [];

    for (const d of lista) {
      const webhookField = ORIGEM_TO_WEBHOOK[d.origem];
      const url = (webhooks as Record<string, string | null> | null)?.[webhookField];

      if (!url) {
        resultados.push({
          origem: d.origem,
          id: d.id,
          status: "sem_webhook",
          detalhe: `Webhook ${webhookField} não configurado`,
        });
        continue;
      }

      const payload = {
        origem: d.origem,
        id: d.id,
        tipo_disparo: tipoDisparo,
        disparado_em: new Date().toISOString(),
        agendado_para: d.next_run_at,
        instancia: (webhooks as Record<string, string | null> | null)?.comunicacao_instancia ?? null,
        apikey: (webhooks as Record<string, string | null> | null)?.comunicacao_apikey ?? null,
        campanha: d.dados,
      };

      try {
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const ok = resp.ok;
        await resp.text();

        // Atualiza ultimo_disparo_at e força recálculo de next_run_at via trigger
        const { data: row, error: errRow } = await supabase
          .from(d.origem)
          .select(
            "agendamento_ativo, agendamento_tipo, agendamento_data_inicio, agendamento_data_final, agendamento_dias_semana, agendamento_horarios, agendamento_timezone",
          )
          .eq("id", d.id)
          .maybeSingle();

        if (errRow) throw errRow;

        const updatePayload: Record<string, unknown> = {
          ultimo_disparo_at: new Date().toISOString(),
        };
        if (row) {
          Object.assign(updatePayload, row);
        }

        const { error: errUpd } = await supabase
          .from(d.origem)
          .update(updatePayload)
          .eq("id", d.id);
        if (errUpd) throw errUpd;

        resultados.push({
          origem: d.origem,
          id: d.id,
          status: ok ? "ok" : "erro",
          detalhe: `HTTP ${resp.status}`,
        });
      } catch (e) {
        resultados.push({
          origem: d.origem,
          id: d.id,
          status: "erro",
          detalhe: (e as Error).message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        total: lista.length,
        tipo_disparo: tipoDisparo,
        resultados,
        executed_at: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (e) {
    console.error("Erro disparar-campanhas-cron:", e);
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
