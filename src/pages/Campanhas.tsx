import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Megaphone, Gift, Users, Plus, Sparkles, Save, Calendar, Pencil, Trash2, Send, ChevronDown } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { AgendamentoCard, AgendamentoState, emptyAgendamento } from "@/components/AgendamentoCard";
import { CampaignImageUpload } from "@/components/CampaignImageUpload";
import { EmojiTextarea } from "@/components/EmojiTextarea";

// Helpers para mapear linha do banco -> AgendamentoState
const fromRow = (row: any): AgendamentoState => ({
  agendamento_ativo: !!row?.agendamento_ativo,
  agendamento_tipo: (row?.agendamento_tipo as any) || "dias_semana",
  agendamento_data_inicio: row?.agendamento_data_inicio ?? null,
  agendamento_data_final: row?.agendamento_data_final ?? null,
  agendamento_dias_semana: Array.isArray(row?.agendamento_dias_semana)
    ? row.agendamento_dias_semana
    : [],
  agendamento_horarios: Array.isArray(row?.agendamento_horarios)
    ? row.agendamento_horarios
    : [],
  agendamento_timezone: row?.agendamento_timezone || "America/Sao_Paulo",
  next_run_at: row?.next_run_at ?? null,
});

const toPayload = (a: AgendamentoState) => ({
  agendamento_ativo: a.agendamento_ativo,
  agendamento_tipo: a.agendamento_tipo,
  agendamento_data_inicio: a.agendamento_data_inicio,
  agendamento_data_final: a.agendamento_data_final,
  agendamento_dias_semana: a.agendamento_dias_semana,
  agendamento_horarios: a.agendamento_horarios,
  agendamento_timezone: a.agendamento_timezone,
});

const Campanhas = () => {
  const queryClient = useQueryClient();

  // States for Aniversariantes
  const [aniversarioForm, setAniversarioForm] = useState({
    mensagem_1: "",
    mensagem_2: "",
    mensagem_3: "",
    quant_msg: 1,
    status: "inativo",
    imagem_1_url: null as string | null,
    imagem_1_ativa: false,
    legenda_1: "",
    imagem_2_url: null as string | null,
    imagem_2_ativa: false,
    legenda_2: "",
    imagem_3_url: null as string | null,
    imagem_3_ativa: false,
    legenda_3: "",
  });
  const [aniversarioAgenda, setAniversarioAgenda] = useState<AgendamentoState>(emptyAgendamento);

  // States for Recuperação de Clientes
  type RecuperacaoMensagem = {
    mensagem: string;
    imagem_url: string | null;
    imagem_ativa: boolean;
    legenda: string;
    regra: string;
  };
  const emptyRecuperacaoMensagem = (): RecuperacaoMensagem => ({
    mensagem: "",
    imagem_url: null,
    imagem_ativa: false,
    legenda: "",
    regra: "",
  });
  const [recuperacaoForm, setRecuperacaoForm] = useState({
    mensagem_ativa: true,
    promocao: "",
    regras: "",
    data_inicio: "",
    data_final: "",
    status: "inativo",
    ativa_promocao: "nao",
    legenda_ativa: true,
    mensagens: [emptyRecuperacaoMensagem()] as RecuperacaoMensagem[],
  });
  const [recuperacaoCarouselIdx, setRecuperacaoCarouselIdx] = useState(0);
  const [recuperacaoAgenda, setRecuperacaoAgenda] = useState<AgendamentoState>(emptyAgendamento);

  // Promocoes Ativas - CRUD state
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<
    | {
        id?: number;
        promocao: string;
        regras: string;
        agenda: AgendamentoState;
        imagem_url: string | null;
        imagem_ativa: boolean;
        legenda: string;
      }
    | null
  >(null);
  const [promoToDelete, setPromoToDelete] = useState<number | null>(null);

  // Disparo manual
  const [disparoManual, setDisparoManual] = useState<
    | { origem: "promocoes_goodzap" | "recuperacao_clientes" | "promocao_aniversario"; id: number; nome: string }
    | null
  >(null);
  const [promoOpen, setPromoOpen] = useState(false);
  const [recuperacaoOpen, setRecuperacaoOpen] = useState(false);
  const [aniversarioOpen, setAniversarioOpen] = useState(false);

  const dispararManualMutation = useMutation({
    mutationFn: async (params: { origem: string; id: number }) => {
      const { data, error } = await supabase.functions.invoke("disparar-campanhas-cron", {
        body: { origem: params.origem, id: params.id },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setDisparoManual(null);
      toast({ title: "Disparo enviado!", description: "Campanha disparada manualmente." });
    },
    onError: (e: any) => {
      toast({
        title: "Erro",
        description: e?.message || "Falha ao disparar campanha.",
        variant: "destructive",
      });
    },
  });

  const { data: promocoes, isLoading: loadingPromocoes } = useQuery({
    queryKey: ["promocoes_goodzap"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promocoes_goodzap")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: aniversario, isLoading: loadingAniversario } = useQuery({
    queryKey: ["promocao_aniversario"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promocao_aniversario")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: recuperacao, isLoading: loadingRecuperacao } = useQuery({
    queryKey: ["recuperacao_clientes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recuperacao_clientes")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Populate forms with data
  useEffect(() => {
    if (aniversario) {
      setAniversarioForm({
        mensagem_1: aniversario.mensagem_1 || "",
        mensagem_2: aniversario.mensagem_2 || "",
        mensagem_3: aniversario.mensagem_3 || "",
        quant_msg: aniversario.quant_msg || 1,
        status: aniversario.status || "inativo",
        imagem_1_url: (aniversario as any).imagem_1_url ?? null,
        imagem_1_ativa: !!(aniversario as any).imagem_1_ativa,
        legenda_1: (aniversario as any).legenda_1 ?? "",
        imagem_2_url: (aniversario as any).imagem_2_url ?? null,
        imagem_2_ativa: !!(aniversario as any).imagem_2_ativa,
        legenda_2: (aniversario as any).legenda_2 ?? "",
        imagem_3_url: (aniversario as any).imagem_3_url ?? null,
        imagem_3_ativa: !!(aniversario as any).imagem_3_ativa,
        legenda_3: (aniversario as any).legenda_3 ?? "",
      });
      setAniversarioAgenda(fromRow(aniversario));
    }
  }, [aniversario]);

  useEffect(() => {
    if (recuperacao) {
      const r = recuperacao as any;
      let mensagens: RecuperacaoMensagem[] = [];
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
        // Fallback para dados antigos (msg_1..msg_3)
        const q = Math.min(Math.max(Number(r.quant_msg ?? 1), 1), 3);
        const legacy: RecuperacaoMensagem[] = [
          { mensagem: r.mensagem ?? "", imagem_url: r.imagem_1_url ?? r.imagem_url ?? null, imagem_ativa: !!(r.imagem_1_ativa ?? r.imagem_ativa), legenda: r.legenda_1 ?? r.legenda ?? "", regra: r.regras ?? "" },
          { mensagem: r.mensagem_2 ?? "", imagem_url: r.imagem_2_url ?? null, imagem_ativa: !!r.imagem_2_ativa, legenda: r.legenda_2 ?? "", regra: "" },
          { mensagem: r.mensagem_3 ?? "", imagem_url: r.imagem_3_url ?? null, imagem_ativa: !!r.imagem_3_ativa, legenda: r.legenda_3 ?? "", regra: "" },
        ];
        mensagens = legacy.slice(0, q);
      }
      if (mensagens.length === 0) mensagens = [emptyRecuperacaoMensagem()];
      setRecuperacaoForm({
        mensagem_ativa: r.mensagem_ativa ?? true,
        promocao: r.promocao || "",
        regras: r.regras || "",
        data_inicio: r.data_inicio ? new Date(r.data_inicio).toISOString().split("T")[0] : "",
        data_final: r.data_final ? new Date(r.data_final).toISOString().split("T")[0] : "",
        status: r.status || "inativo",
        ativa_promocao: r.ativa_promocao || "nao",
        legenda_ativa: r.legenda_ativa ?? true,
        mensagens,
      });
      setRecuperacaoCarouselIdx((idx) => Math.min(idx, mensagens.length - 1));
      setRecuperacaoAgenda(fromRow(recuperacao));
    }
  }, [recuperacao]);

  const togglePromoMutation = useMutation({
    mutationFn: async ({ id, ativa }: { id: number; ativa: boolean }) => {
      const { error } = await supabase
        .from("promocoes_goodzap")
        .update({ ativa })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promocoes_goodzap"] });
      toast({ title: "Sucesso!", description: "Promoção atualizada." });
    },
  });

  const savePromoMutation = useMutation({
    mutationFn: async (data: {
      id?: number;
      promocao: string;
      regras: string;
      agenda: AgendamentoState;
      imagem_url: string | null;
      imagem_ativa: boolean;
      legenda: string;
    }) => {
      const payload = {
        promocao: data.promocao,
        regras: data.regras,
        imagem_url: data.imagem_url,
        imagem_ativa: data.imagem_ativa,
        legenda: data.legenda,
        ...toPayload(data.agenda),
      };
      if (data.id) {
        const { error } = await supabase
          .from("promocoes_goodzap")
          .update(payload as any)
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("promocoes_goodzap")
          .insert([{ ...payload, ativa: false } as any]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promocoes_goodzap"] });
      setPromoDialogOpen(false);
      setEditingPromo(null);
      toast({ title: "Sucesso!", description: "Promoção salva." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao salvar promoção.", variant: "destructive" });
    },
  });

  const deletePromoMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("promocoes_goodzap").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promocoes_goodzap"] });
      setPromoToDelete(null);
      toast({ title: "Sucesso!", description: "Promoção excluída." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao excluir.", variant: "destructive" });
    },
  });

  const saveAniversarioMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...aniversarioForm, ...toPayload(aniversarioAgenda) };
      if (aniversario?.id) {
        const { error } = await supabase
          .from("promocao_aniversario")
          .update(payload as any)
          .eq("id", aniversario.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("promocao_aniversario")
          .insert([payload as any]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promocao_aniversario"] });
      toast({ title: "Sucesso!", description: "Campanha de aniversário salva." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao salvar.", variant: "destructive" });
    },
  });

  const saveRecuperacaoMutation = useMutation({
    mutationFn: async () => {
      const mensagensForm = recuperacaoForm.mensagens.length > 0
        ? recuperacaoForm.mensagens
        : [emptyRecuperacaoMensagem()];
      const primeira = mensagensForm[0];
      const mensagens = mensagensForm.map((m, i) => {
        const n = i + 1;
        return {
          [`mensagem_${n}`]: m.mensagem ?? "",
          [`imagem_url_${n}`]: m.imagem_url ?? null,
          [`imagem_ativa_${n}`]: !!m.imagem_ativa,
          [`legenda_${n}`]: m.legenda ?? "",
          [`regra_promocao_${n}`]: m.regra ?? "",
          [`promocao_${n}`]: recuperacaoForm.promocao ?? "",
        };
      });
      const dataToSave: Record<string, unknown> = {
        mensagem_ativa: recuperacaoForm.mensagem_ativa,
        promocao: recuperacaoForm.promocao,
        regras: primeira?.regra ?? "",
        status: recuperacaoForm.status,
        ativa_promocao: recuperacaoForm.ativa_promocao,
        legenda_ativa: recuperacaoForm.legenda_ativa,
        mensagens,
        quant_msg: mensagens.length,
        // Compatibilidade com colunas existentes (msg 1..3)
        mensagem: primeira?.mensagem ?? "",
        imagem_1_url: primeira?.imagem_url ?? null,
        imagem_1_ativa: !!primeira?.imagem_ativa,
        legenda_1: primeira?.legenda ?? "",
        mensagem_2: mensagensForm[1]?.mensagem ?? null,
        imagem_2_url: mensagensForm[1]?.imagem_url ?? null,
        imagem_2_ativa: !!mensagensForm[1]?.imagem_ativa,
        legenda_2: mensagensForm[1]?.legenda ?? null,
        mensagem_3: mensagensForm[2]?.mensagem ?? null,
        imagem_3_url: mensagensForm[2]?.imagem_url ?? null,
        imagem_3_ativa: !!mensagensForm[2]?.imagem_ativa,
        legenda_3: mensagensForm[2]?.legenda ?? null,
        data_inicio: recuperacaoForm.data_inicio
          ? new Date(recuperacaoForm.data_inicio).toISOString()
          : null,
        data_final: recuperacaoForm.data_final
          ? new Date(recuperacaoForm.data_final).toISOString()
          : null,
        ...toPayload(recuperacaoAgenda),
      };

      if (recuperacao?.id) {
        const { error } = await supabase
          .from("recuperacao_clientes")
          .update(dataToSave as any)
          .eq("id", recuperacao.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("recuperacao_clientes")
          .insert([dataToSave] as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recuperacao_clientes"] });
      toast({ title: "Sucesso!", description: "Campanha de recuperação salva." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao salvar.", variant: "destructive" });
    },
  });

  const isLoading = loadingPromocoes || loadingAniversario || loadingRecuperacao;
  const updateRecuperacaoMensagemAt = (idx: number, patch: Partial<RecuperacaoMensagem>) => {
    setRecuperacaoForm((prev) => ({
      ...prev,
      mensagens: prev.mensagens.map((m, i) => (i === idx ? { ...m, ...patch } : m)),
    }));
  };
  const addRecuperacaoMensagem = () => {
    setRecuperacaoForm((prev) => {
      const novas = [...prev.mensagens, emptyRecuperacaoMensagem()];
      setRecuperacaoCarouselIdx(novas.length - 1);
      return { ...prev, mensagens: novas };
    });
  };
  const removeRecuperacaoMensagem = (idx: number) => {
    setRecuperacaoForm((prev) => {
      if (prev.mensagens.length <= 1) return prev;
      const novas = prev.mensagens.filter((_, i) => i !== idx);
      setRecuperacaoCarouselIdx((curr) => Math.max(0, Math.min(curr, novas.length - 1)));
      return { ...prev, mensagens: novas };
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="min-w-0">
          <h2 className="text-3xl font-bold mb-2">
            <span className="neon-text-green">Campanhas</span> e Promoções
          </h2>
          <p className="text-muted-foreground">Gerencie suas campanhas de marketing</p>
        </div>
        <Button
          className="neon-glow-green shrink-0"
          onClick={() => {
            setEditingPromo({ promocao: "", regras: "", agenda: emptyAgendamento, imagem_url: null, imagem_ativa: false, legenda: "" });
            setPromoDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Promoção
        </Button>
      </div>

      {/* Promotions List */}
      <Collapsible open={promoOpen} onOpenChange={setPromoOpen}>
        <Card className="glass-card neon-border">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent shrink-0" />
                  Promoções Ativas
                </CardTitle>
                <CardDescription>Lista de promoções do sistema</CardDescription>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => {
                    setEditingPromo({ promocao: "", regras: "", agenda: emptyAgendamento, imagem_url: null, imagem_ativa: false, legenda: "" });
                    setPromoDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova
                </Button>
                <CollapsibleTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${promoOpen ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
          </CardHeader>
          <CollapsibleContent className="overflow-hidden transition-all data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
            <CardContent>
          {promocoes && promocoes.length > 0 ? (
            <div className="space-y-4">
              {promocoes.map((promo: any) => (
                <div
                  key={promo.id}
                  className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-3"
                >
                  {/* Container Principal Ajustado para Mobile */}
                  <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Título da Promoção - Ocupa largura total no mobile */}
                    <h4 className="font-medium flex-1 min-w-0 break-words text-base">
                      {promo.promocao}
                    </h4>

                    {/* Botões e Switch - Ficam no topo no mobile */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pb-2 sm:pb-0 border-b border-border/30 sm:border-0">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={promo.ativa || false}
                          onCheckedChange={(checked) =>
                            togglePromoMutation.mutate({ id: promo.id, ativa: checked })
                          }
                        />
                        <span className="text-xs text-muted-foreground sm:hidden">
                          {promo.ativa ? "Ativa" : "Inativa"}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditingPromo({
                              id: promo.id,
                              promocao: promo.promocao || "",
                              regras: promo.regras || "",
                              agenda: fromRow(promo),
                              imagem_url: promo.imagem_url ?? null,
                              imagem_ativa: !!promo.imagem_ativa,
                              legenda: promo.legenda ?? "",
                            });
                            setPromoDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Disparar agora"
                          onClick={() =>
                            setDisparoManual({
                              origem: "promocoes_goodzap",
                              id: promo.id,
                              nome: promo.promocao || "Promoção",
                            })
                          }
                        >
                          <Send className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setPromoToDelete(promo.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {promo.regras && (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words border-t border-border/10 pt-2 sm:border-0 sm:pt-0">
                      {promo.regras}
                    </p>
                  )}
                  {promo.agendamento_ativo && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="secondary"
                        className="bg-primary/15 border-primary/40 text-xs"
                      >
                        📅 Agendada
                      </Badge>
                      {promo.next_run_at && (
                        <span className="text-xs text-muted-foreground">
                          próx:{" "}
                          {new Date(promo.next_run_at).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma promoção cadastrada</p>
            </div>
          )}
        </CardContent>
      </CollapsibleContent>
    </Card>
  </Collapsible>

      {/* Recuperação de Clientes */}
      <Collapsible open={recuperacaoOpen} onOpenChange={setRecuperacaoOpen}>
        <Card className="glass-card neon-border">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary shrink-0" />
                  Recuperação de Clientes
                </CardTitle>
                <CardDescription>
                  Reative clientes inativos com ofertas especiais baseadas no período sem compras
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant={recuperacaoForm.status === "ativo" ? "default" : "secondary"}
                  className={
                    recuperacaoForm.status === "ativo"
                      ? "bg-green-500/20 text-green-400 border-green-500/50"
                      : ""
                  }
                >
                  {recuperacaoForm.status === "ativo" ? "Ativo" : "Inativo"}
                </Badge>
                <Switch
                  checked={recuperacaoForm.status === "ativo"}
                  onCheckedChange={(checked) =>
                    setRecuperacaoForm((prev) => ({
                      ...prev,
                      status: checked ? "ativo" : "inativo",
                    }))
                  }
                />
                <CollapsibleTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${recuperacaoOpen ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
          </CardHeader>
          <CollapsibleContent className="overflow-hidden transition-all data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
            <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Clientes sem compra desde
              </Label>
              <Input
                type="date"
                value={recuperacaoForm.data_inicio}
                onChange={(e) =>
                  setRecuperacaoForm((prev) => ({ ...prev, data_inicio: e.target.value }))
                }
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Até a data
              </Label>
              <Input
                type="date"
                value={recuperacaoForm.data_final}
                onChange={(e) =>
                  setRecuperacaoForm((prev) => ({ ...prev, data_final: e.target.value }))
                }
                className="bg-muted/50"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <Label>Mensagem de recuperação</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {recuperacaoForm.mensagem_ativa ? "Enviar" : "Não enviar"}
                </span>
                <Switch
                  checked={recuperacaoForm.mensagem_ativa}
                  onCheckedChange={(checked) =>
                    setRecuperacaoForm((prev) => ({ ...prev, mensagem_ativa: checked }))
                  }
                />
              </div>
            </div>

            {(() => {
              const total = recuperacaoForm.mensagens.length;
              const idx = Math.min(recuperacaoCarouselIdx, Math.max(0, total - 1));
              const msg = recuperacaoForm.mensagens[idx] ?? emptyRecuperacaoMensagem();
              const numero = idx + 1;
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Label>Mensagens da campanha</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addRecuperacaoMensagem}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Nova mensagem
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 rounded-md border border-border/50 bg-muted/10 px-3 py-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => setRecuperacaoCarouselIdx((i) => Math.max(0, i - 1))}
                      disabled={idx === 0}
                      aria-label="Mensagem anterior"
                    >
                      <ChevronDown className="h-4 w-4 rotate-90" />
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      Mensagem <span className="text-foreground font-medium">{numero}</span> de {total}
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => setRecuperacaoCarouselIdx((i) => Math.min(total - 1, i + 1))}
                      disabled={idx >= total - 1}
                      aria-label="Próxima mensagem"
                    >
                      <ChevronDown className="h-4 w-4 -rotate-90" />
                    </Button>
                  </div>

                  <div className="space-y-3 rounded-lg border border-border/50 bg-muted/10 p-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <Label>Mensagem {numero}</Label>
                      {total > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeRecuperacaoMensagem(idx)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remover
                        </Button>
                      )}
                    </div>
                    <EmojiTextarea
                      value={msg.mensagem}
                      onValueChange={(v) => updateRecuperacaoMensagemAt(idx, { mensagem: v })}
                      placeholder={`Mensagem ${numero} - Ex: Oi {nome}! Sentimos sua falta!...`}
                      className="bg-muted/50 min-h-[100px]"
                    />
                    <CampaignImageUpload
                      label={`Imagem da Mensagem ${numero}`}
                      fileName={`imagem_recuperacao_clientes_${numero}`}
                      url={msg.imagem_url}
                      ativa={msg.imagem_ativa}
                      onChange={(next) =>
                        updateRecuperacaoMensagemAt(idx, { imagem_url: next.url, imagem_ativa: next.ativa })
                      }
                    />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <Label>Legenda {numero}</Label>
                        {idx === 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {recuperacaoForm.legenda_ativa ? "Enviar" : "Não enviar"}
                            </span>
                            <Switch
                              checked={recuperacaoForm.legenda_ativa}
                              onCheckedChange={(checked) =>
                                setRecuperacaoForm((prev) => ({ ...prev, legenda_ativa: checked }))
                              }
                            />
                          </div>
                        )}
                      </div>
                      <EmojiTextarea
                        value={msg.legenda}
                        onValueChange={(v) => updateRecuperacaoMensagemAt(idx, { legenda: v })}
                        placeholder="Texto que acompanha a imagem"
                        className="bg-muted/50 min-h-[60px]"
                      />
                    </div>
                    {recuperacaoForm.ativa_promocao === "sim" && (
                      <div className="space-y-2">
                        <Label>Regras da Promoção {numero}</Label>
                        <EmojiTextarea
                          value={msg.regra}
                          onValueChange={(v) => updateRecuperacaoMensagemAt(idx, { regra: v })}
                          placeholder={`Regras específicas da promoção enviada na mensagem ${numero}`}
                          className="bg-muted/50 min-h-[80px]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Incluir promoção especial?</Label>
              <Switch
                checked={recuperacaoForm.ativa_promocao === "sim"}
                onCheckedChange={(checked) =>
                  setRecuperacaoForm((prev) => ({
                    ...prev,
                    ativa_promocao: checked ? "sim" : "nao",
                  }))
                }
              />
            </div>

            {recuperacaoForm.ativa_promocao === "sim" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Descrição da promoção</Label>
                  <EmojiTextarea
                    value={recuperacaoForm.promocao}
                    onValueChange={(v) =>
                      setRecuperacaoForm((prev) => ({ ...prev, promocao: v }))
                    }
                    placeholder="Ex: 15% de desconto na próxima compra usando o código VOLTEI15"
                    className="bg-muted/50 min-h-[80px]"
                  />
                </div>
              </div>
            )}
          </div>


          <AgendamentoCard
            value={recuperacaoAgenda}
            onChange={setRecuperacaoAgenda}
            accentClass="neon-glow-cyan"
          />

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => saveRecuperacaoMutation.mutate()}
              disabled={saveRecuperacaoMutation.isPending}
              className="neon-glow-cyan"
            >
              <Save className="h-4 w-4 mr-2" />
              {saveRecuperacaoMutation.isPending
                ? "Salvando..."
                : "Salvar Campanha de Recuperação"}
            </Button>
            {recuperacao?.id && (
              <Button
                variant="outline"
                onClick={() =>
                  setDisparoManual({
                    origem: "recuperacao_clientes",
                    id: recuperacao.id,
                    nome: "Recuperação de Clientes",
                  })
                }
              >
                <Send className="h-4 w-4 mr-2" />
                Disparar Agora
              </Button>
            )}
          </div>
        </CardContent>
      </CollapsibleContent>
    </Card>
  </Collapsible>

      {/* Aniversariantes */}
      <Collapsible open={aniversarioOpen} onOpenChange={setAniversarioOpen}>
        <Card className="glass-card neon-border">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-secondary shrink-0" />
                  Aniversariantes
                </CardTitle>
                <CardDescription>
                  Envie até 3 mensagens automáticas para clientes aniversariantes
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant={aniversarioForm.status === "ativo" ? "default" : "secondary"}
                  className={
                    aniversarioForm.status === "ativo"
                      ? "bg-green-500/20 text-green-400 border-green-500/50"
                      : ""
                  }
                >
                  {aniversarioForm.status === "ativo" ? "Ativo" : "Inativo"}
                </Badge>
                <Switch
                  checked={aniversarioForm.status === "ativo"}
                  onCheckedChange={(checked) =>
                    setAniversarioForm((prev) => ({
                      ...prev,
                      status: checked ? "ativo" : "inativo",
                    }))
                  }
                />
                <CollapsibleTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${aniversarioOpen ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
          </CardHeader>
          <CollapsibleContent className="overflow-hidden transition-all data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
            <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Quantidade de mensagens a enviar</Label>
            <div className="flex gap-2">
              {[1, 2, 3].map((num) => (
                <Button
                  key={num}
                  variant={aniversarioForm.quant_msg === num ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAniversarioForm((prev) => ({ ...prev, quant_msg: num }))}
                  className={aniversarioForm.quant_msg === num ? "neon-glow-magenta" : ""}
                >
                  {num} {num === 1 ? "mensagem" : "mensagens"}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Mensagem 1
                <span className="text-xs text-muted-foreground">
                  (7 dias antes do aniversário)
                </span>
              </Label>
              <EmojiTextarea
                value={aniversarioForm.mensagem_1}
                onValueChange={(v) =>
                  setAniversarioForm((prev) => ({ ...prev, mensagem_1: v }))
                }
                placeholder="Ex: Feliz aniversário, {nome}! 🎂 Temos um presente especial para você..."
                className="bg-muted/50 min-h-[80px]"
              />
              <CampaignImageUpload
                label="Imagem da Mensagem 1"
                fileName="imagem_aniversario_1"
                url={aniversarioForm.imagem_1_url}
                ativa={aniversarioForm.imagem_1_ativa}
                onChange={({ url, ativa }) =>
                  setAniversarioForm((prev) => ({
                    ...prev,
                    imagem_1_url: url,
                    imagem_1_ativa: ativa,
                  }))
                }
              />
              <div className="space-y-2">
                <Label>Legenda</Label>
                <EmojiTextarea
                  value={aniversarioForm.legenda_1}
                  onValueChange={(v) =>
                    setAniversarioForm((prev) => ({ ...prev, legenda_1: v }))
                  }
                  placeholder="Texto que acompanha a imagem"
                  className="bg-muted/50 min-h-[60px]"
                />
              </div>
            </div>

            {aniversarioForm.quant_msg >= 2 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Mensagem 2
                  <span className="text-xs text-muted-foreground">
                    (enviada 3 dias antes do aniversário)
                  </span>
                </Label>
                <EmojiTextarea
                  value={aniversarioForm.mensagem_2}
                  onValueChange={(v) =>
                    setAniversarioForm((prev) => ({ ...prev, mensagem_2: v }))
                  }
                  placeholder="Ex: Oi {nome}! Não deixe seu presente de aniversário passar..."
                  className="bg-muted/50 min-h-[80px]"
                />
                <CampaignImageUpload
                  label="Imagem da Mensagem 2"
                  fileName="imagem_aniversario_2"
                  url={aniversarioForm.imagem_2_url}
                  ativa={aniversarioForm.imagem_2_ativa}
                  onChange={({ url, ativa }) =>
                    setAniversarioForm((prev) => ({
                      ...prev,
                      imagem_2_url: url,
                      imagem_2_ativa: ativa,
                    }))
                  }
                />
                <div className="space-y-2">
                  <Label>Legenda</Label>
                  <EmojiTextarea
                    value={aniversarioForm.legenda_2}
                    onValueChange={(v) =>
                      setAniversarioForm((prev) => ({ ...prev, legenda_2: v }))
                    }
                    placeholder="Texto que acompanha a imagem"
                    className="bg-muted/50 min-h-[60px]"
                  />
                </div>
              </div>
            )}

            {aniversarioForm.quant_msg >= 3 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Mensagem 3
                  <span className="text-xs text-muted-foreground">
                    (enviada no dia do aniversário)
                  </span>
                </Label>
                <EmojiTextarea
                  value={aniversarioForm.mensagem_3}
                  onValueChange={(v) =>
                    setAniversarioForm((prev) => ({ ...prev, mensagem_3: v }))
                  }
                  placeholder="Ex: Última chance, {nome}! Seu desconto de aniversário expira hoje..."
                  className="bg-muted/50 min-h-[80px]"
                />
                <CampaignImageUpload
                  label="Imagem da Mensagem 3"
                  fileName="imagem_aniversario_3"
                  url={aniversarioForm.imagem_3_url}
                  ativa={aniversarioForm.imagem_3_ativa}
                  onChange={({ url, ativa }) =>
                    setAniversarioForm((prev) => ({
                      ...prev,
                      imagem_3_url: url,
                      imagem_3_ativa: ativa,
                    }))
                  }
                />
                <div className="space-y-2">
                  <Label>Legenda</Label>
                  <EmojiTextarea
                    value={aniversarioForm.legenda_3}
                    onValueChange={(v) =>
                      setAniversarioForm((prev) => ({ ...prev, legenda_3: v }))
                    }
                    placeholder="Texto que acompanha a imagem"
                    className="bg-muted/50 min-h-[60px]"
                  />
                </div>
              </div>
            )}
          </div>

          <AgendamentoCard
            value={aniversarioAgenda}
            onChange={setAniversarioAgenda}
            accentClass="neon-glow-magenta"
          />

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => saveAniversarioMutation.mutate()}
              disabled={saveAniversarioMutation.isPending}
              className="neon-glow-magenta"
            >
              <Save className="h-4 w-4 mr-2" />
              {saveAniversarioMutation.isPending
                ? "Salvando..."
                : "Salvar Campanha de Aniversário"}
            </Button>
            {aniversario?.id && (
              <Button
                variant="outline"
                onClick={() =>
                  setDisparoManual({
                    origem: "promocao_aniversario",
                    id: aniversario.id,
                    nome: "Aniversariantes",
                  })
                }
              >
                <Send className="h-4 w-4 mr-2" />
                Disparar Agora
              </Button>
            )}
          </div>
        </CardContent>
      </CollapsibleContent>
    </Card>
  </Collapsible>

  {/* Promo Edit/Create Dialog */}
      <Dialog
        open={promoDialogOpen}
        onOpenChange={(open) => {
          setPromoDialogOpen(open);
          if (!open) setEditingPromo(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPromo?.id ? "Editar Promoção" : "Nova Promoção"}</DialogTitle>
            <DialogDescription>
              Preencha o nome, as regras e configure o agendamento da promoção.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nome da promoção</Label>
              <Input
                value={editingPromo?.promocao || ""}
                onChange={(e) =>
                  setEditingPromo((prev) => (prev ? { ...prev, promocao: e.target.value } : prev))
                }
                placeholder="Ex: Promoção Dia dos Namorados"
              />
            </div>
            <div className="space-y-2">
              <Label>Regras da Promoção</Label>
              <EmojiTextarea
                value={editingPromo?.regras || ""}
                onValueChange={(v) =>
                  setEditingPromo((prev) => (prev ? { ...prev, regras: v } : prev))
                }
                placeholder="Ex: 20% de desconto em pizzas grandes às quartas-feiras. Não cumulativo."
                className="min-h-[100px]"
              />
            </div>

            {editingPromo && (
              <>
                <CampaignImageUpload
                  label="Imagem da Promoção"
                  fileName="imagem_promocao_ativa"
                  url={editingPromo.imagem_url}
                  ativa={editingPromo.imagem_ativa}
                  onChange={({ url, ativa }) =>
                    setEditingPromo((prev) =>
                      prev ? { ...prev, imagem_url: url, imagem_ativa: ativa } : prev,
                    )
                  }
                />
                <div className="space-y-2">
                  <Label>Legenda</Label>
                  <EmojiTextarea
                    value={editingPromo.legenda}
                    onValueChange={(v) =>
                      setEditingPromo((prev) =>
                        prev ? { ...prev, legenda: v } : prev,
                      )
                    }
                    placeholder="Texto que acompanha a imagem"
                    className="min-h-[60px]"
                  />
                </div>
              </>
            )}

            {editingPromo && (
              <AgendamentoCard
                value={editingPromo.agenda}
                onChange={(next) =>
                  setEditingPromo((prev) => (prev ? { ...prev, agenda: next } : prev))
                }
                accentClass="neon-glow-green"
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPromoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (!editingPromo?.promocao?.trim()) {
                  toast({
                    title: "Atenção",
                    description: "Informe o nome da promoção.",
                    variant: "destructive",
                  });
                  return;
                }
                savePromoMutation.mutate(editingPromo);
              }}
              disabled={savePromoMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {savePromoMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={promoToDelete !== null}
        onOpenChange={(open) => !open && setPromoToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir promoção?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A promoção será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => promoToDelete && deletePromoMutation.mutate(promoToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Disparo manual confirmation */}
      <AlertDialog
        open={disparoManual !== null}
        onOpenChange={(open) => !open && setDisparoManual(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disparar Campanha Agora?</AlertDialogTitle>
            <AlertDialogDescription>
              {disparoManual
                ? `A campanha "${disparoManual.nome}" será disparada manualmente agora para os destinatários configurados.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={dispararManualMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={dispararManualMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (disparoManual) {
                  dispararManualMutation.mutate({
                    origem: disparoManual.origem,
                    id: disparoManual.id,
                  });
                }
              }}
            >
              <Send className="h-4 w-4 mr-2" />
              {dispararManualMutation.isPending ? "Disparando..." : "Disparar Agora"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Campanhas;
