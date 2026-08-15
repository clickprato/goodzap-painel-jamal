
-- Remove job antigo se existir
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'disparar-campanhas-cron-job') THEN
    PERFORM cron.unschedule('disparar-campanhas-cron-job');
  END IF;
END $$;

-- Agenda a execução a cada 5 minutos
SELECT cron.schedule(
  'disparar-campanhas-cron-job',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ubaicuhjdzasdtyippgw.supabase.co/functions/v1/disparar-campanhas-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViYWljdWhqZHphc2R0eWlwcGd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MTI2NDUsImV4cCI6MjA4MzI4ODY0NX0.nnQOLubT2Wsj9Rm7n-wknLdCPcOhvmklNgUCbVbCRUE'
    ),
    body := jsonb_build_object('triggered_at', now())
  );
  $$
);
