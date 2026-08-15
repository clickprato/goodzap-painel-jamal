import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PanelModel = "standard" | "advanced";

const RESTRICTED_ROUTES = ["/relatorios", "/metricas", "/pedidos", "/reservas"];
const ADMIN_BYPASS_ROUTES = ["/reservas"];

export function useModel() {
  const { data: model, isLoading } = useQuery({
    queryKey: ["panel_model"],
    queryFn: async (): Promise<PanelModel> => {
      const { data, error } = await supabase
        .from("configuracoes_goodzap")
        .select("model")
        .eq("id", 1)
        .maybeSingle();

      if (error) {
        console.error("[useModel] erro ao buscar model:", error);
        return "standard";
      }

      const raw = (data?.model ?? "standard").toString().toLowerCase().trim();
      // aceita "avancado", "avançado", "advanced"
      if (raw === "advanced" || raw === "avancado" || raw === "avançado") {
        return "advanced";
      }
      return "standard";
    },
    staleTime: 1000 * 60 * 5,
  });

  const isAdvanced = model === "advanced";

  const isRouteRestricted = (path: string, isAdmin = false) => {
    if (isAdvanced) return false;
    if (!RESTRICTED_ROUTES.includes(path)) return false;
    if (isAdmin && ADMIN_BYPASS_ROUTES.includes(path)) return false;
    return true;
  };

  return { model: model || "standard", isAdvanced, isLoading, isRouteRestricted, RESTRICTED_ROUTES };
}
