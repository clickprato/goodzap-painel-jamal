CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

DO $$
DECLARE
  v_jobid bigint;
BEGIN
  SELECT jobid INTO v_jobid FROM cron.job WHERE jobname = 'disparar-campanhas-cron-min';
  IF v_jobid IS NOT NULL THEN
    PERFORM cron.unschedule(v_jobid);
  END IF;
END $$;

SELECT cron.schedule(
  'disparar-campanhas-cron-min',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://kiedjtdtxhtpisisaybh.supabase.co/functions/v1/disparar-campanhas-cron',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpZWRqdGR0eGh0cGlzaXNheWJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxODkzNTUsImV4cCI6MjA4ODc2NTM1NX0.jkD9ic6EbJnnUzROht4k6K_9PqT0EX6ENsYpYG5iKU8","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpZWRqdGR0eGh0cGlzaXNheWJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxODkzNTUsImV4cCI6MjA4ODc2NTM1NX0.jkD9ic6EbJnnUzROht4k6K_9PqT0EX6ENsYpYG5iKU8"}'::jsonb,
    body := jsonb_build_object('source','pg_cron','at', now())
  );
  $$
);