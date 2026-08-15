-- 1. Adicionar colunas de agendamento nas três tabelas de campanhas
ALTER TABLE public.promocao_aniversario
  ADD COLUMN IF NOT EXISTS agendamento_ativo boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS agendamento_tipo text,
  ADD COLUMN IF NOT EXISTS agendamento_data_inicio date,
  ADD COLUMN IF NOT EXISTS agendamento_data_final date,
  ADD COLUMN IF NOT EXISTS agendamento_dias_semana int[] DEFAULT '{}'::int[],
  ADD COLUMN IF NOT EXISTS agendamento_horarios text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS agendamento_timezone text NOT NULL DEFAULT 'America/Sao_Paulo',
  ADD COLUMN IF NOT EXISTS next_run_at timestamptz;

ALTER TABLE public.recuperacao_clientes
  ADD COLUMN IF NOT EXISTS agendamento_ativo boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS agendamento_tipo text,
  ADD COLUMN IF NOT EXISTS agendamento_data_inicio date,
  ADD COLUMN IF NOT EXISTS agendamento_data_final date,
  ADD COLUMN IF NOT EXISTS agendamento_dias_semana int[] DEFAULT '{}'::int[],
  ADD COLUMN IF NOT EXISTS agendamento_horarios text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS agendamento_timezone text NOT NULL DEFAULT 'America/Sao_Paulo',
  ADD COLUMN IF NOT EXISTS next_run_at timestamptz;

ALTER TABLE public.promocoes_goodzap
  ADD COLUMN IF NOT EXISTS agendamento_ativo boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS agendamento_tipo text,
  ADD COLUMN IF NOT EXISTS agendamento_data_inicio date,
  ADD COLUMN IF NOT EXISTS agendamento_data_final date,
  ADD COLUMN IF NOT EXISTS agendamento_dias_semana int[] DEFAULT '{}'::int[],
  ADD COLUMN IF NOT EXISTS agendamento_horarios text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS agendamento_timezone text NOT NULL DEFAULT 'America/Sao_Paulo',
  ADD COLUMN IF NOT EXISTS next_run_at timestamptz;

-- 2. Função para calcular o próximo horário de execução
CREATE OR REPLACE FUNCTION public.calcular_next_run_at(
  p_ativo boolean,
  p_tipo text,
  p_data_inicio date,
  p_data_final date,
  p_dias_semana int[],
  p_horarios text[],
  p_timezone text
) RETURNS timestamptz
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  v_now timestamptz := now();
  v_local_now timestamp;
  v_candidate_date date;
  v_horario text;
  v_candidate_local timestamp;
  v_candidate_utc timestamptz;
  v_best timestamptz;
  v_max_days int := 14; -- janela de busca
  v_i int;
  v_dow int;
BEGIN
  -- Não calcular se desativado ou sem horários
  IF p_ativo IS NOT TRUE OR p_horarios IS NULL OR array_length(p_horarios, 1) IS NULL THEN
    RETURN NULL;
  END IF;

  v_local_now := (v_now AT TIME ZONE COALESCE(p_timezone, 'America/Sao_Paulo'));

  FOR v_i IN 0..v_max_days LOOP
    v_candidate_date := (v_local_now + (v_i || ' days')::interval)::date;

    -- Filtrar por tipo
    IF p_tipo = 'periodo' THEN
      IF p_data_inicio IS NOT NULL AND v_candidate_date < p_data_inicio THEN
        CONTINUE;
      END IF;
      IF p_data_final IS NOT NULL AND v_candidate_date > p_data_final THEN
        EXIT; -- período acabou, parar
      END IF;
    ELSIF p_tipo = 'dias_semana' THEN
      IF p_dias_semana IS NULL OR array_length(p_dias_semana, 1) IS NULL THEN
        RETURN NULL;
      END IF;
      v_dow := EXTRACT(DOW FROM v_candidate_date)::int; -- 0=Dom..6=Sáb
      IF NOT (v_dow = ANY(p_dias_semana)) THEN
        CONTINUE;
      END IF;
    ELSE
      RETURN NULL;
    END IF;

    -- Iterar horários do dia
    FOREACH v_horario IN ARRAY p_horarios LOOP
      BEGIN
        v_candidate_local := (v_candidate_date::text || ' ' || v_horario || ':00')::timestamp;
      EXCEPTION WHEN OTHERS THEN
        CONTINUE;
      END;
      v_candidate_utc := v_candidate_local AT TIME ZONE COALESCE(p_timezone, 'America/Sao_Paulo');
      IF v_candidate_utc > v_now THEN
        IF v_best IS NULL OR v_candidate_utc < v_best THEN
          v_best := v_candidate_utc;
        END IF;
      END IF;
    END LOOP;

    IF v_best IS NOT NULL THEN
      RETURN v_best;
    END IF;
  END LOOP;

  RETURN v_best;
END;
$$;

-- 3. Trigger genérico que atualiza next_run_at
CREATE OR REPLACE FUNCTION public.tg_atualizar_next_run_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.next_run_at := public.calcular_next_run_at(
    NEW.agendamento_ativo,
    NEW.agendamento_tipo,
    NEW.agendamento_data_inicio,
    NEW.agendamento_data_final,
    NEW.agendamento_dias_semana,
    NEW.agendamento_horarios,
    NEW.agendamento_timezone
  );
  RETURN NEW;
END;
$$;

-- 4. Aplicar triggers nas três tabelas
DROP TRIGGER IF EXISTS trg_next_run_promocao_aniversario ON public.promocao_aniversario;
CREATE TRIGGER trg_next_run_promocao_aniversario
BEFORE INSERT OR UPDATE ON public.promocao_aniversario
FOR EACH ROW EXECUTE FUNCTION public.tg_atualizar_next_run_at();

DROP TRIGGER IF EXISTS trg_next_run_recuperacao_clientes ON public.recuperacao_clientes;
CREATE TRIGGER trg_next_run_recuperacao_clientes
BEFORE INSERT OR UPDATE ON public.recuperacao_clientes
FOR EACH ROW EXECUTE FUNCTION public.tg_atualizar_next_run_at();

DROP TRIGGER IF EXISTS trg_next_run_promocoes_goodzap ON public.promocoes_goodzap;
CREATE TRIGGER trg_next_run_promocoes_goodzap
BEFORE INSERT OR UPDATE ON public.promocoes_goodzap
FOR EACH ROW EXECUTE FUNCTION public.tg_atualizar_next_run_at();

-- 5. Índices para o n8n consultar rapidamente
CREATE INDEX IF NOT EXISTS idx_promocao_aniversario_next_run ON public.promocao_aniversario(next_run_at) WHERE agendamento_ativo = true;
CREATE INDEX IF NOT EXISTS idx_recuperacao_clientes_next_run ON public.recuperacao_clientes(next_run_at) WHERE agendamento_ativo = true;
CREATE INDEX IF NOT EXISTS idx_promocoes_goodzap_next_run ON public.promocoes_goodzap(next_run_at) WHERE agendamento_ativo = true;