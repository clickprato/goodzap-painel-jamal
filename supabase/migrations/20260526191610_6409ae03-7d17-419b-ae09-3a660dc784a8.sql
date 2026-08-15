ALTER TABLE public.promocao_aniversario
  ALTER COLUMN agendamento_dias_semana DROP DEFAULT;

ALTER TABLE public.promocao_aniversario
  ALTER COLUMN agendamento_dias_semana TYPE integer[]
  USING agendamento_dias_semana::integer[];

ALTER TABLE public.promocao_aniversario
  ALTER COLUMN agendamento_dias_semana SET DEFAULT '{}'::integer[];