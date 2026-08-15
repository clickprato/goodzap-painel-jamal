import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, CalendarDays, Printer } from "lucide-react";

type Reserva = {
  id: number;
  nome: string | null;
  whatsapp: string;
  data_reserva: string | null;
  horario_reserva: string | null;
  qtde_pessoas: number | null;
  observacoes: string | null;
  created_at: string;
};

const emptyForm = {
  nome: "",
  whatsapp: "",
  data_reserva: "",
  horario_reserva: "",
  qtde_pessoas: "",
  observacoes: "",
};

export default function Reservas() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Reserva | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: reservas = [], isLoading } = useQuery({
    queryKey: ["reservas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservas")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Reserva[];
    },
  });

  const dispararWebhookReserva = async (reserva: Record<string, unknown>) => {
    try {
      const { data: webhooks } = await supabase
        .from("webhooks_campanhas")
        .select("webhook_reservas, comunicacao_instancia, comunicacao_apikey")
        .eq("id", 1)
        .maybeSingle();

      const w = webhooks as {
        webhook_reservas?: string;
        comunicacao_instancia?: string;
        comunicacao_apikey?: string;
      } | null;
      const url = w?.webhook_reservas;
      if (!url) return;

      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "reserva",
          instancia: w?.comunicacao_instancia ?? null,
          apikey: w?.comunicacao_apikey ?? null,
          ...reserva,
        }),
      });
    } catch (err) {
      console.error("Erro ao disparar webhook de reserva:", err);
    }
  };

  const upsert = useMutation({
    mutationFn: async () => {
      const payload = {
        nome: form.nome || null,
        whatsapp: form.whatsapp,
        data_reserva: form.data_reserva || null,
        horario_reserva: form.horario_reserva || null,
        qtde_pessoas: form.qtde_pessoas ? Number(form.qtde_pessoas) : null,
        observacoes: form.observacoes || null,
      };

      if (editing) {
        const { error } = await supabase
          .from("reservas")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
        return { isNew: false, data: { id: editing.id, ...payload } };
      } else {
        const { data, error } = await supabase
          .from("reservas")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        return { isNew: true, data };
      }
    },
    onSuccess: async (result) => {
      queryClient.invalidateQueries({ queryKey: ["reservas"] });
      toast.success(editing ? "Reserva atualizada!" : "Reserva criada!");
      if (result.isNew && result.data) {
        await dispararWebhookReserva(result.data as Record<string, unknown>);
      }
      closeDialog();
    },
    onError: () => toast.error("Erro ao salvar reserva"),
  });

  const remove = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("reservas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservas"] });
      toast.success("Reserva excluída!");
    },
    onError: () => toast.error("Erro ao excluir reserva"),
  });

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (r: Reserva) => {
    setEditing(r);
    setForm({
      nome: r.nome ?? "",
      whatsapp: r.whatsapp,
      data_reserva: r.data_reserva ?? "",
      horario_reserva: r.horario_reserva ?? "",
      qtde_pessoas: r.qtde_pessoas?.toString() ?? "",
      observacoes: r.observacoes ?? "",
    });
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const imprimirReserva = (r: Reserva) => {
    const w = window.open("", "_blank", "width=600,height=700");
    if (!w) {
      toast.error("Permita popups para imprimir");
      return;
    }
    const html = `
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <title>Reserva #${r.id}</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #111; }
            h1 { margin: 0 0 4px; font-size: 22px; }
            .sub { color: #666; font-size: 13px; margin-bottom: 24px; }
            .row { display: flex; gap: 24px; margin: 8px 0; font-size: 15px; }
            .field { margin: 10px 0; font-size: 15px; }
            .label { font-weight: 600; }
            .obs { margin-top: 18px; padding: 12px; border: 1px solid #ddd; border-radius: 8px; background: #fafafa; white-space: pre-wrap; }
            hr { border: none; border-top: 1px solid #eee; margin: 20px 0; }
          </style>
        </head>
        <body>
          <h1>Reserva</h1>
          <div class="sub">#${r.id} • Criada em ${new Date(r.created_at).toLocaleString("pt-BR")}</div>
          <hr />
          <div class="field"><span class="label">Nome:</span> ${r.nome ?? "-"}</div>
          <div class="field"><span class="label">Whatsapp:</span> ${r.whatsapp}</div>
          <div class="row">
            <div><span class="label">Data:</span> ${r.data_reserva ?? "-"}</div>
            <div><span class="label">Horário:</span> ${r.horario_reserva ?? "-"}</div>
          </div>
          <div class="field"><span class="label">Número de Pessoas:</span> ${r.qtde_pessoas ?? "-"}</div>
          <div class="field"><span class="label">Observações:</span></div>
          <div class="obs">${r.observacoes ?? "-"}</div>
          <script>window.onload = () => { window.print(); };</script>
        </body>
      </html>
    `;
    w.document.write(html);
    w.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary shrink-0" />
            Reservas
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie as reservas dos clientes
          </p>
        </div>
        <Button onClick={openNew} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Nova Reserva
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">Carregando...</p>
          </CardContent>
        </Card>
      ) : reservas.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">Nenhuma reserva encontrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reservas.map((r) => (
            <Card key={r.id} className="glass-card neon-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <CardTitle className="text-base break-words min-w-0">
                    {r.nome ?? "Sem nome"}
                  </CardTitle>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => imprimirReserva(r)} title="Imprimir">
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(r)} title="Editar">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => remove.mutate(r.id)} title="Excluir">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold text-foreground">Nome:</span>{" "}
                  <span className="text-muted-foreground break-words">{r.nome ?? "-"}</span>
                </div>
                <div>
                  <span className="font-semibold text-foreground">Whatsapp:</span>{" "}
                  <span className="text-muted-foreground break-all">{r.whatsapp}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <div>
                    <span className="font-semibold text-foreground">Data:</span>{" "}
                    <span className="text-muted-foreground">{r.data_reserva ?? "-"}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Horário:</span>{" "}
                    <span className="text-muted-foreground">{r.horario_reserva ?? "-"}</span>
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-foreground">Número de Pessoas:</span>{" "}
                  <span className="text-muted-foreground">{r.qtde_pessoas ?? "-"}</span>
                </div>
                <div>
                  <span className="font-semibold text-foreground">Observações:</span>{" "}
                  <span className="text-muted-foreground whitespace-pre-wrap break-words">
                    {r.observacoes ?? "-"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Reserva" : "Nova Reserva"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-foreground">Nome</label>
              <Input name="nome" value={form.nome} onChange={handleChange} placeholder="Nome do cliente" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">WhatsApp *</label>
              <Input name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="5511999999999" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Data da Reserva</label>
                <Input name="data_reserva" value={form.data_reserva} onChange={handleChange} placeholder="dd/mm/aaaa" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Horário</label>
                <Input name="horario_reserva" value={form.horario_reserva} onChange={handleChange} placeholder="19:00" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Qtde de Pessoas</label>
              <Input name="qtde_pessoas" type="number" value={form.qtde_pessoas} onChange={handleChange} placeholder="2" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Observações</label>
              <Textarea name="observacoes" value={form.observacoes} onChange={handleChange} placeholder="Observações adicionais" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button onClick={() => upsert.mutate()} disabled={!form.whatsapp || upsert.isPending}>
              {upsert.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
