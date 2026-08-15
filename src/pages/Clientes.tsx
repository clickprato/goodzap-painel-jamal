import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Users, Search, Phone, MapPin, Calendar, ShoppingBag, DollarSign, Navigation, Home, Clock, Plus, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

type Cliente = Tables<"clientes">;

const emptyForm = {
  nome: "",
  whatsapp: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "SP",
  cep: "",
  aniversario: "",
};

const Clientes = () => {
  const [search, setSearch] = useState("");
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Cliente | null>(null);
  const [clienteMetrics, setClienteMetrics] = useState<{ compras: number; total_gasto: number; ultimo_pedido: string | null } | null>(null);

  const queryClient = useQueryClient();

  const { data: clientes, isLoading } = useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      // Atualiza métricas antes de buscar clientes
      await supabase.rpc("atualizar_metricas_clientes");
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch live metrics from pedidos_goodzap when a client is selected
  useEffect(() => {
    if (!selectedCliente?.whatsapp) {
      setClienteMetrics(null);
      return;
    }
    const fetchMetrics = async () => {
      const { data, error } = await supabase
        .from("pedidos_goodzap")
        .select("total, created_at")
        .eq("whatsapp", selectedCliente.whatsapp!)
        .order("created_at", { ascending: false });
      if (error || !data) {
        setClienteMetrics({ compras: 0, total_gasto: 0, ultimo_pedido: null });
        return;
      }
      const compras = data.length;
      const total_gasto = data.reduce((sum, p) => {
        const val = parseFloat(
          (p.total || "0").replace(/[^0-9,.]/g, "").replace(",", ".")
        );
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
      const ultimo_pedido = data.length > 0 ? data[0].created_at : null;
      setClienteMetrics({ compras, total_gasto, ultimo_pedido });
    };
    fetchMetrics();
  }, [selectedCliente]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingCliente) {
        const { error } = await supabase
          .from("clientes")
          .update({
            nome: data.nome,
            whatsapp: data.whatsapp,
            rua: data.rua,
            numero: data.numero,
            complemento: data.complemento,
            bairro: data.bairro,
            cidade: data.cidade,
            estado: data.estado,
            cep: data.cep,
            aniversario: data.aniversario || null,
            ultima_atualizacao: new Date().toISOString(),
          })
          .eq("id", editingCliente.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("clientes").insert({
          nome: data.nome,
          whatsapp: data.whatsapp,
          rua: data.rua,
          numero: data.numero,
          complemento: data.complemento,
          bairro: data.bairro,
          cidade: data.cidade,
          estado: data.estado,
          cep: data.cep,
          aniversario: data.aniversario || null,
          status: "ativo",
          compras: 0,
          total_gasto: 0,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success(editingCliente ? "Cliente atualizado!" : "Cliente cadastrado!");
      closeForm();
    },
    onError: () => toast.error("Erro ao salvar cliente"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("clientes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente excluído!");
      setDeleteTarget(null);
      if (selectedCliente?.id === deleteTarget?.id) setSelectedCliente(null);
    },
    onError: () => toast.error("Erro ao excluir cliente"),
  });

  const openNew = () => {
    setEditingCliente(null);
    setFormData(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nome: cliente.nome || "",
      whatsapp: cliente.whatsapp || "",
      rua: cliente.rua || "",
      numero: cliente.numero || "",
      complemento: cliente.complemento || "",
      bairro: cliente.bairro || "",
      cidade: cliente.cidade || "",
      estado: cliente.estado || "SP",
      cep: cliente.cep || "",
      aniversario: cliente.aniversario || "",
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingCliente(null);
    setFormData(emptyForm);
  };

  const handleSubmit = () => {
    if (!formData.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    saveMutation.mutate(formData);
  };

  const filteredClientes = clientes?.filter(cliente =>
    cliente.nome?.toLowerCase().includes(search.toLowerCase()) ||
    cliente.whatsapp?.includes(search)
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try { return new Date(dateStr).toLocaleDateString("pt-BR"); } catch { return dateStr; }
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try { return new Date(dateStr).toLocaleString("pt-BR"); } catch { return dateStr; }
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
            <span className="neon-text-cyan">Clientes</span>
          </h2>
          <p className="text-muted-foreground">
            {clientes?.length || 0} clientes cadastrados
          </p>
        </div>
        <Button onClick={openNew} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou WhatsApp..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-muted/50 border-border/50 focus:border-primary"
        />
      </div>

      {/* Clients List */}
      <Card className="glass-card neon-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Lista de Clientes
          </CardTitle>
          <CardDescription>
            {filteredClientes?.length || 0} resultados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredClientes && filteredClientes.length > 0 ? (
            <div className="space-y-4">
              {filteredClientes.map((cliente) => (
                <div
                  key={cliente.id}
                  className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="space-y-2 flex-1 min-w-0 cursor-pointer"
                      onClick={() => setSelectedCliente(cliente)}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium break-words">{cliente.nome || "Sem nome"}</h4>
                        {cliente.status && (
                          <Badge variant={cliente.status === "ativo" ? "default" : "secondary"}>
                            {cliente.status}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {cliente.whatsapp && (
                          <span className="flex items-center gap-1 min-w-0">
                            <Phone className="h-3 w-3 shrink-0" />
                            <span className="truncate">{cliente.whatsapp}</span>
                          </span>
                        )}
                        {cliente.bairro && (
                          <span className="flex items-center gap-1 min-w-0">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{cliente.bairro}, {cliente.cidade}</span>
                          </span>
                        )}
                        {cliente.aniversario && (
                          <span className="flex items-center gap-1 min-w-0">
                            <Calendar className="h-3 w-3 shrink-0" />
                            <span className="truncate">{cliente.aniversario}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Compras</div>
                        <div className="font-medium neon-text-cyan text-sm">{cliente.compras || 0}</div>
                        {cliente.total_gasto && (
                          <div className="text-xs text-accent">
                            R$ {cliente.total_gasto.toFixed(2).replace(".", ",")}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cliente)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(cliente)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum cliente encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Dialog open={!!selectedCliente} onOpenChange={() => setSelectedCliente(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-card border-primary/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5 text-primary" />
              <span className="neon-text-cyan">{selectedCliente?.nome || "Cliente"}</span>
              {selectedCliente?.status && (
                <Badge variant={selectedCliente.status === "ativo" ? "default" : "secondary"}>
                  {selectedCliente.status}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedCliente && (
            <div className="space-y-6 mt-4">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-primary flex items-center gap-2"><Phone className="h-4 w-4" />Contato</h3>
                <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-muted/30">
                  <div><p className="text-xs text-muted-foreground">WhatsApp</p><p className="font-medium">{selectedCliente.whatsapp || "-"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Código</p><p className="font-medium">{selectedCliente.codigo || "-"}</p></div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-primary flex items-center gap-2"><Home className="h-4 w-4" />Endereço</h3>
                <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-muted/30">
                  <div className="col-span-2"><p className="text-xs text-muted-foreground">Rua</p><p className="font-medium">{selectedCliente.rua || "-"}, {selectedCliente.numero || "S/N"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Complemento</p><p className="font-medium">{selectedCliente.complemento || "-"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Bairro</p><p className="font-medium">{selectedCliente.bairro || "-"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Cidade/Estado</p><p className="font-medium">{selectedCliente.cidade || "-"} / {selectedCliente.estado || "-"}</p></div>
                  <div><p className="text-xs text-muted-foreground">CEP</p><p className="font-medium">{selectedCliente.cep || "-"}</p></div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-primary flex items-center gap-2"><Navigation className="h-4 w-4" />Informações de Entrega</h3>
                <div className="grid grid-cols-3 gap-4 p-3 rounded-lg bg-muted/30">
                  <div><p className="text-xs text-muted-foreground">Área de Entrega</p><p className="font-medium">{selectedCliente.area_entrega || "-"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Distância</p><p className="font-medium">{selectedCliente.distancia ? `${selectedCliente.distancia} m` : "-"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Distância Máxima</p><p className="font-medium">{selectedCliente.distancia_maxima ? `${selectedCliente.distancia_maxima} m` : "-"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Valor do Frete</p><p className="font-medium neon-text-green">{selectedCliente.valor_frete ? `R$ ${selectedCliente.valor_frete.toFixed(2).replace(".", ",")}` : "-"}</p></div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-primary flex items-center gap-2"><ShoppingBag className="h-4 w-4" />Histórico de Compras</h3>
                <div className="grid grid-cols-3 gap-4 p-3 rounded-lg bg-muted/30">
                  <div><p className="text-xs text-muted-foreground">Total de Compras</p><p className="font-medium text-lg neon-text-cyan">{clienteMetrics?.compras ?? selectedCliente.compras ?? 0}</p></div>
                  <div><p className="text-xs text-muted-foreground">Total Gasto</p><p className="font-medium text-lg neon-text-green">R$ {(clienteMetrics?.total_gasto ?? selectedCliente.total_gasto ?? 0).toFixed(2).replace(".", ",")}</p></div>
                  <div><p className="text-xs text-muted-foreground">Último Pedido</p><p className="font-medium">{clienteMetrics?.ultimo_pedido ? formatDateTime(clienteMetrics.ultimo_pedido) : (selectedCliente.ultimo_pedido || "-")}</p></div>
                  <div><p className="text-xs text-muted-foreground">Última Compra</p><p className="font-medium">{formatDate(selectedCliente.ultima_compra)}</p></div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-primary flex items-center gap-2"><Clock className="h-4 w-4" />Datas</h3>
                <div className="grid grid-cols-3 gap-4 p-3 rounded-lg bg-muted/30">
                  <div><p className="text-xs text-muted-foreground">Aniversário</p><p className="font-medium flex items-center gap-1"><Calendar className="h-3 w-3 text-accent" />{selectedCliente.aniversario || "-"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Cadastrado em</p><p className="font-medium">{formatDateTime(selectedCliente.created_at)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Última Atualização</p><p className="font-medium">{formatDateTime(selectedCliente.ultima_atualizacao)}</p></div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Cadastro/Edição */}
      <Dialog open={formOpen} onOpenChange={closeForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto glass-card border-primary/30">
          <DialogHeader>
            <DialogTitle>{editingCliente ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Nome *</Label>
                <Input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} placeholder="Nome do cliente" />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} placeholder="5511999999999" />
              </div>
              <div className="space-y-2">
                <Label>Aniversário</Label>
                <Input type="date" value={formData.aniversario} onChange={(e) => setFormData({ ...formData, aniversario: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Rua</Label>
                <Input value={formData.rua} onChange={(e) => setFormData({ ...formData, rua: e.target.value })} placeholder="Rua" />
              </div>
              <div className="space-y-2">
                <Label>Número</Label>
                <Input value={formData.numero} onChange={(e) => setFormData({ ...formData, numero: e.target.value })} placeholder="Nº" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Complemento</Label>
                <Input value={formData.complemento} onChange={(e) => setFormData({ ...formData, complemento: e.target.value })} placeholder="Apto, Bloco..." />
              </div>
              <div className="space-y-2">
                <Label>Bairro</Label>
                <Input value={formData.bairro} onChange={(e) => setFormData({ ...formData, bairro: e.target.value })} placeholder="Bairro" />
              </div>
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input value={formData.cidade} onChange={(e) => setFormData({ ...formData, cidade: e.target.value })} placeholder="Cidade" />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Input value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value })} placeholder="UF" maxLength={2} />
              </div>
              <div className="space-y-2">
                <Label>CEP</Label>
                <Input value={formData.cep} onChange={(e) => setFormData({ ...formData, cep: e.target.value })} placeholder="00000-000" />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={closeForm}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de Exclusão */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deleteTarget?.nome}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Clientes;
