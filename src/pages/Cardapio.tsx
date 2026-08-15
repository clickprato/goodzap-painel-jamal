import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { UtensilsCrossed, Coffee, Package, Plus, Edit, Trash2, X, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { HelpButton } from "@/components/HelpButton";

type PizzaSize = { id?: string; name: string; price: number };

type CardapioItem = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  available: boolean | null;
  category: string;
  pizza_sizes: unknown;
  has_variations: boolean | null;
  price_from: boolean | null;
};

const parseSizes = (raw: unknown): PizzaSize[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
    .map((s) => ({
      id: typeof s.id === "string" ? s.id : undefined,
      name: String(s.name ?? ""),
      price: Number(s.price ?? 0),
    }))
    .filter((s) => s.name !== "" || s.price > 0);
};

const formatPrice = (price: number | null | undefined) => {
  const value = Number(price ?? 0);
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
};

const toNumber = (value: string) => parseFloat(value.replace(",", ".")) || 0;

const Cardapio = () => {
  const queryClient = useQueryClient();

  const [pratoDialogOpen, setPratoDialogOpen] = useState(false);
  const [bebidaDialogOpen, setBebidaDialogOpen] = useState(false);
  const [outroProdutoDialogOpen, setOutroProdutoDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [editingPrato, setEditingPrato] = useState<CardapioItem | null>(null);
  const [editingBebida, setEditingBebida] = useState<{ id: number } | null>(null);
  const [editingOutroProduto, setEditingOutroProduto] = useState<{ id: number } | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{ type: 'prato' | 'bebida' | 'outro'; id: string | number; name: string } | null>(null);

  const [pratoForm, setPratoForm] = useState<{ name: string; description: string; category: string; price: string; sizes: { name: string; price: string }[]; available: boolean }>({
    name: "", description: "", category: "", price: "", sizes: [], available: true,
  });
  const [bebidaForm, setBebidaForm] = useState({ nome: "", tipo: "", tamanho: "", valor: "" });
  const [outroProdutoForm, setOutroProdutoForm] = useState({ produto: "", descricao: "", tipo: "", valor: "" });

  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas");

  const { data: cardapio, isLoading: loadingCardapio } = useQuery({
    queryKey: ["cardapio"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cardapio")
        .select("id, name, description, price, available, category, pizza_sizes, has_variations, price_from")
        .order("category")
        .order("display_order")
        .order("name");
      if (error) throw error;
      return data as CardapioItem[];
    },
  });

  const { data: bebidas, isLoading: loadingBebidas } = useQuery({
    queryKey: ["bebidas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bebidas").select("*").order("nome");
      if (error) throw error;
      return data;
    },
  });

  const { data: outrosProdutos } = useQuery({
    queryKey: ["outros_produtos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("outros_produtos").select("*").order("produto");
      if (error) throw error;
      return data;
    },
  });

  const categorias = useMemo(() => {
    const set = new Set((cardapio ?? []).map((i) => i.category).filter(Boolean));
    return Array.from(set).sort();
  }, [cardapio]);

  const pratosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return (cardapio ?? []).filter((item) => {
      const matchCategoria = categoriaFiltro === "todas" || item.category === categoriaFiltro;
      const matchBusca = !termo || item.name?.toLowerCase().includes(termo) || (item.description ?? "").toLowerCase().includes(termo);
      return matchCategoria && matchBusca;
    });
  }, [cardapio, busca, categoriaFiltro]);

  const savePratoMutation = useMutation({
    mutationFn: async () => {
      const sizes: PizzaSize[] = pratoForm.sizes
        .filter((s) => s.name.trim() !== "")
        .map((s) => ({ id: crypto.randomUUID(), name: s.name.trim(), price: toNumber(s.price) }));

      const basePrice = sizes.length > 0
        ? Math.min(...sizes.map((s) => s.price))
        : toNumber(pratoForm.price);

      const payload = {
        name: pratoForm.name.trim(),
        description: pratoForm.description,
        category: pratoForm.category.trim() || "geral",
        price: basePrice,
        pizza_sizes: sizes,
        has_variations: sizes.length > 0,
        price_from: sizes.length > 0,
        available: pratoForm.available,
      };

      if (editingPrato) {
        // Preserva os IDs originais dos tamanhos quando o nome não mudou
        const originais = parseSizes(editingPrato.pizza_sizes);
        payload.pizza_sizes = sizes.map((s) => ({
          ...s,
          id: originais.find((o) => o.name === s.name)?.id ?? s.id,
        }));
        const { error } = await supabase.from("cardapio").update(payload).eq("id", editingPrato.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cardapio").insert({ id: crypto.randomUUID(), image: "", ...payload });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cardapio"] });
      toast.success(editingPrato ? "Item atualizado!" : "Item adicionado!");
      setPratoDialogOpen(false);
      setEditingPrato(null);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Erro ao salvar item"),
  });

  const saveBebidaMutation = useMutation({
    mutationFn: async (bebida: { id?: number; nome: string; tipo: string; tamanho: string; valor: number }) => {
      if (bebida.id) {
        const { error } = await supabase.from("bebidas").update({
          nome: bebida.nome, tipo: bebida.tipo, tamanho: bebida.tamanho, valor: bebida.valor,
        }).eq("id", bebida.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("bebidas").insert({
          nome: bebida.nome, tipo: bebida.tipo, tamanho: bebida.tamanho, valor: bebida.valor,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bebidas"] });
      toast.success(editingBebida ? "Bebida atualizada!" : "Bebida adicionada!");
      setBebidaDialogOpen(false);
      setEditingBebida(null);
      setBebidaForm({ nome: "", tipo: "", tamanho: "", valor: "" });
    },
    onError: () => toast.error("Erro ao salvar bebida"),
  });

  const saveOutroProdutoMutation = useMutation({
    mutationFn: async (outro: { id?: number; produto: string; descricao: string; tipo: string; valor: number }) => {
      if (outro.id) {
        const { error } = await supabase.from("outros_produtos").update({
          produto: outro.produto, descricao: outro.descricao, tipo: outro.tipo, valor: outro.valor,
        }).eq("id", outro.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("outros_produtos").insert({
          produto: outro.produto, descricao: outro.descricao, tipo: outro.tipo, valor: outro.valor,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outros_produtos"] });
      toast.success(editingOutroProduto ? "Produto atualizado!" : "Produto adicionado!");
      setOutroProdutoDialogOpen(false);
      setEditingOutroProduto(null);
      setOutroProdutoForm({ produto: "", descricao: "", tipo: "", valor: "" });
    },
    onError: () => toast.error("Erro ao salvar produto"),
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: 'prato' | 'bebida' | 'outro'; id: string | number }) => {
      if (type === 'prato') {
        const { error } = await supabase.from("cardapio").delete().eq("id", String(id));
        if (error) throw error;
        return;
      }
      const table = type === 'bebida' ? 'bebidas' : 'outros_produtos';
      const { error } = await supabase.from(table).delete().eq("id", Number(id));
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cardapio"] });
      queryClient.invalidateQueries({ queryKey: ["bebidas"] });
      queryClient.invalidateQueries({ queryKey: ["outros_produtos"] });
      toast.success("Item excluído!");
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    },
    onError: () => toast.error("Erro ao excluir item"),
  });

  const togglePratoDisponibilidadeMutation = useMutation({
    mutationFn: async ({ id, available }: { id: string; available: boolean }) => {
      const { error } = await supabase.from("cardapio").update({ available }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cardapio"] }),
    onError: () => toast.error("Erro ao atualizar disponibilidade"),
  });

  const toggleBebidaDisponibilidadeMutation = useMutation({
    mutationFn: async ({ id, disponivel }: { id: number; disponivel: boolean }) => {
      const { error } = await supabase.from("bebidas").update({ disponivel }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bebidas"] }),
    onError: () => toast.error("Erro ao atualizar disponibilidade"),
  });

  const toggleOutroProdutoDisponibilidadeMutation = useMutation({
    mutationFn: async ({ id, disponivel }: { id: number; disponivel: boolean }) => {
      const { error } = await supabase.from("outros_produtos").update({ disponivel }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outros_produtos"] }),
    onError: () => toast.error("Erro ao atualizar disponibilidade"),
  });

  const isLoading = loadingCardapio || loadingBebidas;

  const openEditPrato = (item: CardapioItem) => {
    setEditingPrato(item);
    const sizes = parseSizes(item.pizza_sizes);
    setPratoForm({
      name: item.name || "",
      description: item.description || "",
      category: item.category || "",
      price: item.price != null ? String(item.price).replace(".", ",") : "",
      sizes: sizes.map((s) => ({ name: s.name, price: String(s.price).replace(".", ",") })),
      available: item.available ?? true,
    });
    setPratoDialogOpen(true);
  };

  const openNewPrato = () => {
    setEditingPrato(null);
    setPratoForm({ name: "", description: "", category: categoriaFiltro !== "todas" ? categoriaFiltro : "", price: "", sizes: [], available: true });
    setPratoDialogOpen(true);
  };

  const openEditBebida = (bebida: NonNullable<typeof bebidas>[number]) => {
    setEditingBebida(bebida);
    setBebidaForm({ nome: bebida.nome || "", tipo: bebida.tipo || "", tamanho: bebida.tamanho || "", valor: bebida.valor?.toString() || "" });
    setBebidaDialogOpen(true);
  };

  const openEditOutroProduto = (outro: NonNullable<typeof outrosProdutos>[number]) => {
    setEditingOutroProduto(outro);
    setOutroProdutoForm({ produto: outro.produto || "", descricao: outro.descricao || "", tipo: outro.tipo || "", valor: outro.valor?.toString() || "" });
    setOutroProdutoDialogOpen(true);
  };

  const openNewBebida = () => { setEditingBebida(null); setBebidaForm({ nome: "", tipo: "", tamanho: "", valor: "" }); setBebidaDialogOpen(true); };
  const openNewOutroProduto = () => { setEditingOutroProduto(null); setOutroProdutoForm({ produto: "", descricao: "", tipo: "", valor: "" }); setOutroProdutoDialogOpen(true); };

  const confirmDelete = (type: 'prato' | 'bebida' | 'outro', id: string | number, name: string) => {
    setDeleteTarget({ type, id, name });
    setDeleteDialogOpen(true);
  };

  const handleSaveBebida = () => {
    saveBebidaMutation.mutate({
      id: editingBebida?.id,
      nome: bebidaForm.nome, tipo: bebidaForm.tipo, tamanho: bebidaForm.tamanho, valor: toNumber(bebidaForm.valor),
    });
  };

  const handleSaveOutroProduto = () => {
    saveOutroProdutoMutation.mutate({
      id: editingOutroProduto?.id,
      produto: outroProdutoForm.produto, descricao: outroProdutoForm.descricao, tipo: outroProdutoForm.tipo, valor: toNumber(outroProdutoForm.valor),
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2"><span className="neon-text-cyan">Cardápio</span></h2>
          <p className="text-muted-foreground">Gerencie os itens do seu cardápio</p>
        </div>
        <HelpButton section="cardapio" />
      </div>

      <Tabs defaultValue="pratos" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger value="pratos" className="data-[state=active]:bg-primary/20"><UtensilsCrossed className="h-4 w-4 mr-2" />Pratos</TabsTrigger>
          <TabsTrigger value="bebidas" className="data-[state=active]:bg-secondary/20"><Coffee className="h-4 w-4 mr-2" />Bebidas</TabsTrigger>
          <TabsTrigger value="outros" className="data-[state=active]:bg-accent/20"><Package className="h-4 w-4 mr-2" />Outros</TabsTrigger>
        </TabsList>

        <TabsContent value="pratos" className="mt-6">
          <Card className="glass-card neon-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pratos do Cardápio</CardTitle>
                <CardDescription>{pratosFiltrados.length} de {cardapio?.length || 0} itens</CardDescription>
              </div>
              <Button onClick={openNewPrato} className="neon-glow-cyan"><Plus className="h-4 w-4 mr-2" />Novo Item</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9 w-full" placeholder="Buscar por nome ou descrição..." value={busca} onChange={(e) => setBusca(e.target.value)} />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  <Button size="sm" variant={categoriaFiltro === "todas" ? "default" : "outline"} onClick={() => setCategoriaFiltro("todas")}>Todas</Button>
                  {categorias.map((cat) => (
                    <Button key={cat} size="sm" variant={categoriaFiltro === cat ? "default" : "outline"} className="whitespace-nowrap" onClick={() => setCategoriaFiltro(cat)}>{cat}</Button>
                  ))}
                </div>
              </div>

              {pratosFiltrados.length > 0 ? (
                <div className="grid gap-4">
                  {pratosFiltrados.map((item) => {
                    const sizes = parseSizes(item.pizza_sizes);
                    return (
                      <div key={item.id} className={`p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/50 transition-colors ${!item.available ? 'opacity-50' : ''}`}>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h4 className="font-medium">{item.name}</h4>
                          {item.category && <Badge variant="secondary" className="text-xs">{item.category}</Badge>}
                          {!item.available && <Badge variant="outline" className="text-xs">Indisponível</Badge>}
                        </div>
                        {item.description && <p className="text-sm text-muted-foreground px-1 mb-3">{item.description}</p>}
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <Switch checked={item.available ?? false} onCheckedChange={(checked) => togglePratoDisponibilidadeMutation.mutate({ id: item.id, available: checked })} />
                            <span className="text-xs text-muted-foreground hidden sm:inline">{item.available ? 'Disponível' : 'Indisponível'}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            {sizes.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {sizes.map((s) => (
                                  <Badge key={`${item.id}-${s.name}`} variant="outline" className="neon-text-cyan">
                                    {s.name}: {formatPrice(s.price)}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <Badge variant="outline" className="neon-text-cyan">{formatPrice(item.price)}</Badge>
                            )}
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon" onClick={() => openEditPrato(item)}><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => confirmDelete('prato', item.id, item.name || 'Item')}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum item encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bebidas" className="mt-6">
          <Card className="glass-card neon-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Bebidas</CardTitle>
                <CardDescription>{bebidas?.length || 0} bebidas cadastradas</CardDescription>
              </div>
              <Button onClick={openNewBebida} className="neon-glow-magenta"><Plus className="h-4 w-4 mr-2" />Nova Bebida</Button>
            </CardHeader>
            <CardContent>
              {bebidas && bebidas.length > 0 ? (
                <div className="grid gap-4">
                  {bebidas.map((bebida) => (
                    <div key={bebida.id} className={`p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-secondary/50 transition-colors ${!bebida.disponivel ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{bebida.nome}</h4>
                        {!bebida.disponivel && <Badge variant="secondary" className="text-xs">Indisponível</Badge>}
                      </div>
                      <div className="flex gap-2 mb-3">
                        {bebida.tipo && <Badge variant="secondary">{bebida.tipo}</Badge>}
                        {bebida.tamanho && <Badge variant="outline">{bebida.tamanho}</Badge>}
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Switch checked={bebida.disponivel} onCheckedChange={(checked) => toggleBebidaDisponibilidadeMutation.mutate({ id: bebida.id, disponivel: checked })} />
                          <span className="text-xs text-muted-foreground hidden sm:inline">{bebida.disponivel ? 'Disponível' : 'Indisponível'}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="neon-text-magenta">{formatPrice(bebida.valor)}</Badge>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditBebida(bebida)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => confirmDelete('bebida', bebida.id, bebida.nome || 'Item')}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Coffee className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma bebida cadastrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outros" className="mt-6">
          <Card className="glass-card neon-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Outros Produtos</CardTitle>
                <CardDescription>{outrosProdutos?.length || 0} produtos cadastrados</CardDescription>
              </div>
              <Button onClick={openNewOutroProduto} className="neon-glow-green"><Plus className="h-4 w-4 mr-2" />Novo Produto</Button>
            </CardHeader>
            <CardContent>
              {outrosProdutos && outrosProdutos.length > 0 ? (
                <div className="grid gap-4">
                  {outrosProdutos.map((outro) => (
                    <div key={outro.id} className={`p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-accent/50 transition-colors ${!outro.disponivel ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{outro.produto}</h4>
                        {!outro.disponivel && <Badge variant="secondary" className="text-xs">Indisponível</Badge>}
                      </div>
                      {outro.descricao && <p className="text-sm text-muted-foreground px-1 mb-3">{outro.descricao}</p>}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Switch checked={outro.disponivel ?? true} onCheckedChange={(checked) => toggleOutroProdutoDisponibilidadeMutation.mutate({ id: outro.id, disponivel: checked })} />
                          <span className="text-xs text-muted-foreground hidden sm:inline">{outro.disponivel ? 'Disponível' : 'Indisponível'}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          {outro.tipo && <Badge variant="secondary">{outro.tipo}</Badge>}
                          <Badge variant="outline" className="neon-text-green">{formatPrice(outro.valor)}</Badge>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditOutroProduto(outro)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => confirmDelete('outro', outro.id, outro.produto || 'Item')}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum produto cadastrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Prato */}
      <Dialog open={pratoDialogOpen} onOpenChange={setPratoDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPrato ? "Editar Item" : "Novo Item"}</DialogTitle>
            <DialogDescription>Defina preços por tamanho ou um preço único</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome do Prato</Label><Input value={pratoForm.name} onChange={(e) => setPratoForm({ ...pratoForm, name: e.target.value })} /></div>
            <div><Label>Descrição</Label><Textarea value={pratoForm.description} onChange={(e) => setPratoForm({ ...pratoForm, description: e.target.value })} /></div>
            <div>
              <Label>Categoria</Label>
              <Input list="categorias-cardapio" value={pratoForm.category} onChange={(e) => setPratoForm({ ...pratoForm, category: e.target.value })} placeholder="Ex: esfihas, as-tradicionais..." />
              <datalist id="categorias-cardapio">
                {categorias.map((cat) => <option key={cat} value={cat} />)}
              </datalist>
            </div>

            {pratoForm.sizes.length === 0 ? (
              <div>
                <Label>Preço único</Label>
                <Input value={pratoForm.price} onChange={(e) => setPratoForm({ ...pratoForm, price: e.target.value })} placeholder="0,00" />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Preços por tamanho</Label>
                {pratoForm.sizes.map((size, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      className="flex-1"
                      placeholder="Tamanho (ex: Broto)"
                      value={size.name}
                      onChange={(e) => {
                        const sizes = [...pratoForm.sizes];
                        sizes[index] = { ...sizes[index], name: e.target.value };
                        setPratoForm({ ...pratoForm, sizes });
                      }}
                    />
                    <Input
                      className="w-28"
                      placeholder="0,00"
                      value={size.price}
                      onChange={(e) => {
                        const sizes = [...pratoForm.sizes];
                        sizes[index] = { ...sizes[index], price: e.target.value };
                        setPratoForm({ ...pratoForm, sizes });
                      }}
                    />
                    <Button variant="ghost" size="icon" onClick={() => setPratoForm({ ...pratoForm, sizes: pratoForm.sizes.filter((_, i) => i !== index) })}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Button variant="outline" size="sm" onClick={() => setPratoForm({ ...pratoForm, sizes: [...pratoForm.sizes, { name: "", price: "" }] })}>
              <Plus className="h-4 w-4 mr-2" />Adicionar tamanho
            </Button>

            <div className="flex items-center gap-3 pt-2">
              <Switch checked={pratoForm.available} onCheckedChange={(checked) => setPratoForm({ ...pratoForm, available: checked })} />
              <Label className="mb-0">{pratoForm.available ? "Disponível" : "Indisponível"}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPratoDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => savePratoMutation.mutate()} disabled={savePratoMutation.isPending || !pratoForm.name.trim()}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Bebida */}
      <Dialog open={bebidaDialogOpen} onOpenChange={setBebidaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBebida ? "Editar Bebida" : "Nova Bebida"}</DialogTitle>
            <DialogDescription>Preencha as informações da bebida</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome</Label><Input value={bebidaForm.nome} onChange={(e) => setBebidaForm({ ...bebidaForm, nome: e.target.value })} /></div>
            <div><Label>Tipo</Label><Input value={bebidaForm.tipo} onChange={(e) => setBebidaForm({ ...bebidaForm, tipo: e.target.value })} placeholder="Ex: Refrigerante, Suco..." /></div>
            <div><Label>Tamanho</Label><Input value={bebidaForm.tamanho} onChange={(e) => setBebidaForm({ ...bebidaForm, tamanho: e.target.value })} placeholder="Ex: 350ml, 1L..." /></div>
            <div><Label>Valor</Label><Input value={bebidaForm.valor} onChange={(e) => setBebidaForm({ ...bebidaForm, valor: e.target.value })} placeholder="0,00" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBebidaDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveBebida}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Outro Produto */}
      <Dialog open={outroProdutoDialogOpen} onOpenChange={setOutroProdutoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingOutroProduto ? "Editar Produto" : "Novo Produto"}</DialogTitle>
            <DialogDescription>Preencha as informações do produto</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome do Produto</Label><Input value={outroProdutoForm.produto} onChange={(e) => setOutroProdutoForm({ ...outroProdutoForm, produto: e.target.value })} /></div>
            <div><Label>Descrição</Label><Textarea value={outroProdutoForm.descricao} onChange={(e) => setOutroProdutoForm({ ...outroProdutoForm, descricao: e.target.value })} /></div>
            <div><Label>Tipo</Label><Input value={outroProdutoForm.tipo} onChange={(e) => setOutroProdutoForm({ ...outroProdutoForm, tipo: e.target.value })} placeholder="Ex: Sobremesa, Acompanhamento..." /></div>
            <div><Label>Valor</Label><Input value={outroProdutoForm.valor} onChange={(e) => setOutroProdutoForm({ ...outroProdutoForm, valor: e.target.value })} placeholder="0,00" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOutroProdutoDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveOutroProduto}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deleteTarget?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && deleteMutation.mutate({ type: deleteTarget.type, id: deleteTarget.id })}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Cardapio;
