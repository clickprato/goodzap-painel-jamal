import { useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Clock, Plus, X, CalendarRange, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type AgendamentoTipo = "periodo" | "dias_semana";

export interface AgendamentoState {
  agendamento_ativo: boolean;
  agendamento_tipo: AgendamentoTipo;
  agendamento_data_inicio: string | null; // yyyy-MM-dd
  agendamento_data_final: string | null;
  agendamento_dias_semana: number[]; // 0=Dom..6=Sáb
  agendamento_horarios: string[]; // "HH:MM" em slots de 15 min
  agendamento_timezone: string;
  next_run_at?: string | null;
}

export const emptyAgendamento: AgendamentoState = {
  agendamento_ativo: false,
  agendamento_tipo: "dias_semana",
  agendamento_data_inicio: null,
  agendamento_data_final: null,
  agendamento_dias_semana: [],
  agendamento_horarios: [],
  agendamento_timezone: "America/Sao_Paulo",
  next_run_at: null,
};

const DIAS = [
  { id: 0, label: "Dom", full: "Domingo" },
  { id: 1, label: "Seg", full: "Segunda" },
  { id: 2, label: "Ter", full: "Terça" },
  { id: 3, label: "Qua", full: "Quarta" },
  { id: 4, label: "Qui", full: "Quinta" },
  { id: 5, label: "Sex", full: "Sexta" },
  { id: 6, label: "Sáb", full: "Sábado" },
];

// Slots fixos de 15 min: 00:00 ... 23:45
const SLOTS_15 = Array.from({ length: 96 }, (_, i) => {
  const h = String(Math.floor(i / 4)).padStart(2, "0");
  const m = String((i % 4) * 15).padStart(2, "0");
  return `${h}:${m}`;
});

interface Props {
  value: AgendamentoState;
  onChange: (next: AgendamentoState) => void;
  accentClass?: string; // ex: "neon-glow-magenta"
}

export const AgendamentoCard = ({ value, onChange, accentClass = "" }: Props) => {
  const update = (patch: Partial<AgendamentoState>) => onChange({ ...value, ...patch });

  const toggleDia = (id: number) => {
    const set = new Set(value.agendamento_dias_semana);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    update({ agendamento_dias_semana: Array.from(set).sort((a, b) => a - b) });
  };

  const addHorario = (horario: string) => {
    if (!horario) return;
    if (value.agendamento_horarios.includes(horario)) return;
    update({
      agendamento_horarios: [...value.agendamento_horarios, horario].sort(),
    });
  };

  const removeHorario = (h: string) => {
    update({ agendamento_horarios: value.agendamento_horarios.filter((x) => x !== h) });
  };

  const dataInicioDate = value.agendamento_data_inicio
    ? new Date(value.agendamento_data_inicio + "T00:00:00")
    : undefined;
  const dataFinalDate = value.agendamento_data_final
    ? new Date(value.agendamento_data_final + "T00:00:00")
    : undefined;

  const resumo = useMemo(() => {
    if (!value.agendamento_ativo) return "Agendamento desativado";
    if (value.agendamento_horarios.length === 0) return "Adicione ao menos um horário";

    const horariosTxt = value.agendamento_horarios.join(", ");

    if (value.agendamento_tipo === "periodo") {
      if (!value.agendamento_data_inicio || !value.agendamento_data_final) {
        return "Selecione data inicial e final";
      }
      const ini = format(new Date(value.agendamento_data_inicio + "T00:00:00"), "dd/MM/yyyy");
      const fim = format(new Date(value.agendamento_data_final + "T00:00:00"), "dd/MM/yyyy");
      return `Esta campanha será enviada de ${ini} até ${fim} às ${horariosTxt}`;
    }

    if (value.agendamento_dias_semana.length === 0) return "Selecione ao menos um dia da semana";
    const diasNomes = value.agendamento_dias_semana
      .map((id) => DIAS.find((d) => d.id === id)?.full?.toLowerCase())
      .filter(Boolean)
      .join(", ");
    return `Esta campanha será enviada toda(o) ${diasNomes} às ${horariosTxt}`;
  }, [value]);

  return (
    <div className="space-y-4 p-4 rounded-lg border border-border/50 bg-muted/20">
      {/* Header com toggle */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="flex items-center gap-2 text-base">
            <CalendarIcon className="h-4 w-4 text-primary" />
            Agendamento Automático
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            Configure datas, dias e horários para envio automático
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={value.agendamento_ativo ? "default" : "secondary"}
            className={
              value.agendamento_ativo
                ? "bg-primary/20 text-primary border-primary/50"
                : ""
            }
          >
            {value.agendamento_ativo ? "Ativo" : "Inativo"}
          </Badge>
          <Switch
            checked={value.agendamento_ativo}
            onCheckedChange={(checked) => update({ agendamento_ativo: checked })}
          />
        </div>
      </div>

      {value.agendamento_ativo && (
        <>
          {/* Seletor de tipo */}
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={value.agendamento_tipo === "periodo" ? "default" : "outline"}
              onClick={() => update({ agendamento_tipo: "periodo" })}
              className={value.agendamento_tipo === "periodo" ? accentClass : ""}
            >
              <CalendarRange className="h-4 w-4 mr-2" />
              Período de Datas
            </Button>
            <Button
              type="button"
              size="sm"
              variant={value.agendamento_tipo === "dias_semana" ? "default" : "outline"}
              onClick={() => update({ agendamento_tipo: "dias_semana" })}
              className={value.agendamento_tipo === "dias_semana" ? accentClass : ""}
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Dias da Semana
            </Button>
          </div>

          {/* Opção A: Período */}
          {value.agendamento_tipo === "periodo" && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data inicial</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-muted/50",
                        !dataInicioDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataInicioDate ? format(dataInicioDate, "dd/MM/yyyy") : "Selecione"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataInicioDate}
                      onSelect={(d) =>
                        update({
                          agendamento_data_inicio: d ? format(d, "yyyy-MM-dd") : null,
                        })
                      }
                      initialFocus
                      locale={ptBR}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Data final</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-muted/50",
                        !dataFinalDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataFinalDate ? format(dataFinalDate, "dd/MM/yyyy") : "Selecione"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataFinalDate}
                      onSelect={(d) =>
                        update({
                          agendamento_data_final: d ? format(d, "yyyy-MM-dd") : null,
                        })
                      }
                      disabled={(date) =>
                        dataInicioDate ? date < dataInicioDate : false
                      }
                      initialFocus
                      locale={ptBR}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Opção B: Dias da semana */}
          {value.agendamento_tipo === "dias_semana" && (
            <div className="space-y-2">
              <Label>Dias da semana</Label>
              <div className="flex flex-wrap gap-2">
                {DIAS.map((d) => {
                  const active = value.agendamento_dias_semana.includes(d.id);
                  return (
                    <Button
                      key={d.id}
                      type="button"
                      size="sm"
                      variant={active ? "default" : "outline"}
                      onClick={() => toggleDia(d.id)}
                      className={cn("min-w-[60px]", active && accentClass)}
                    >
                      {d.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Horários */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horários de envio
            </Label>

            <div className="flex flex-wrap gap-2 min-h-[40px] p-2 rounded-md bg-muted/30 border border-border/30">
              {value.agendamento_horarios.length === 0 && (
                <span className="text-sm text-muted-foreground">Nenhum horário adicionado</span>
              )}
              {value.agendamento_horarios.map((h) => (
                <Badge
                  key={h}
                  variant="secondary"
                  className="gap-1 pl-3 pr-1 py-1 text-sm bg-primary/15 border border-primary/40"
                >
                  {h}
                  <button
                    type="button"
                    onClick={() => removeHorario(h)}
                    className="ml-1 hover:bg-destructive/20 rounded p-0.5"
                    aria-label={`Remover ${h}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Select onValueChange={addHorario} value="">
                <SelectTrigger className="bg-muted/50">
                  <SelectValue placeholder="Selecione um horário (slots de 15 min)" />
                </SelectTrigger>
                <SelectContent className="max-h-[280px]">
                  {SLOTS_15.map((s) => (
                    <SelectItem
                      key={s}
                      value={s}
                      disabled={value.agendamento_horarios.includes(s)}
                    >
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  // adiciona próximo slot disponível
                  const next = SLOTS_15.find((s) => !value.agendamento_horarios.includes(s));
                  if (next) addHorario(next);
                }}
                title="Adicionar próximo horário disponível"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Resumo */}
          <div className="p-3 rounded-md bg-primary/5 border border-primary/30">
            <p className="text-sm">
              <span className="font-medium text-primary">📅 Resumo:</span>{" "}
              <span className="text-foreground/90">{resumo}</span>
            </p>
            {value.next_run_at && (
              <p className="text-xs text-muted-foreground mt-1">
                Próxima execução:{" "}
                {format(new Date(value.next_run_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};
