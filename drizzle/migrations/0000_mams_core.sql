CREATE TABLE public.agents (
  id text PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  paused boolean NOT NULL DEFAULT false,
  last_action text NOT NULL DEFAULT '',
  last_action_at timestamptz NOT NULL DEFAULT now(),
  forced_at timestamptz,
  sort_order int NOT NULL DEFAULT 0
);
CREATE TABLE public.agent_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'completada',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text REFERENCES public.agents(id) ON DELETE SET NULL,
  amount numeric(12,2) NOT NULL,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  severity text NOT NULL DEFAULT 'info',
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text REFERENCES public.agents(id) ON DELETE SET NULL,
  agent_name text NOT NULL,
  action text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.system_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  auto_approval_limit numeric NOT NULL DEFAULT 100,
  human_approval_above numeric NOT NULL DEFAULT 1000,
  max_daily_budget numeric NOT NULL DEFAULT 500,
  max_concurrent_agents int NOT NULL DEFAULT 10,
  mode text NOT NULL DEFAULT 'Autónomo',
  kill_switch boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON public.transactions (created_at DESC);
CREATE INDEX ON public.alerts (created_at DESC);
CREATE INDEX ON public.activity_log (created_at DESC);
CREATE INDEX ON public.agent_tasks (agent_id, created_at DESC);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['agents','agent_tasks','transactions','alerts','activity_log','system_settings'] LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO anon, authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "Dashboard access" ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.revenue_overview()
RETURNS jsonb LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT jsonb_build_object(
    'daily', (SELECT coalesce(sum(amount),0) FROM transactions WHERE created_at >= date_trunc('day', now())),
    'weekly', (SELECT coalesce(sum(amount),0) FROM transactions WHERE created_at >= date_trunc('week', now())),
    'monthly', (SELECT coalesce(sum(amount),0) FROM transactions WHERE created_at >= date_trunc('month', now())),
    'yearly', (SELECT coalesce(sum(amount),0) FROM transactions WHERE created_at >= date_trunc('year', now())),
    'series', (
      SELECT coalesce(jsonb_agg(jsonb_build_object('day', g.d::date, 'revenue', coalesce(s.total,0)) ORDER BY g.d), '[]'::jsonb)
      FROM generate_series(date_trunc('day', now()) - interval '29 days', date_trunc('day', now()), interval '1 day') AS g(d)
      LEFT JOIN (SELECT date_trunc('day', created_at) AS dd, sum(amount) AS total FROM transactions GROUP BY 1) s ON s.dd = g.d
    )
  );
$$;
GRANT EXECUTE ON FUNCTION public.revenue_overview() TO anon, authenticated, service_role;

INSERT INTO public.system_settings (id) VALUES (1);

INSERT INTO public.agents (id, name, role, sort_order, last_action) VALUES
 ('director','Director','Orquestador Ejecutivo Principal',1,'Asignó tareas a 4 agentes'),
 ('researcher','Investigador','Especialista en Inteligencia de Mercado',2,'Identificó 3 tendencias emergentes'),
 ('creator','Creador','Especialista en Producción de Contenido',3,'Generó 5 publicaciones largas'),
 ('marketer','Marketing','Crecimiento y Distribución',4,'Programó 8 publicaciones'),
 ('sales','Ventas','Conversión de Ingresos',5,'Agendó 3 demos'),
 ('analyst','Analista','Datos e Insights',6,'Generó reporte de embudo'),
 ('quality','Calidad','QA y Estándares',7,'Aprobó lote de contenido'),
 ('compliance','Cumplimiento','Riesgo y Legal',8,'Validó 3 divulgaciones'),
 ('finance','Finanzas','Tesorería y Contabilidad',9,'Actualizó modelo de flujo');

INSERT INTO public.transactions (agent_id, amount, description, created_at)
SELECT (ARRAY['sales','finance','marketer'])[1 + (g % 3)],
       round((20 + random() * 30)::numeric, 2),
       'Venta registrada',
       now() - (g * interval '1 hour') - (random() * interval '50 minutes')
FROM generate_series(0, 1080) g;

INSERT INTO public.alerts (severity, message, created_at) VALUES
 ('info','El Director rebalanceó la carga de los agentes', now() - interval '3 minutes'),
 ('warning','Límite de API cercano al máximo (82%)', now() - interval '12 minutes'),
 ('info','Finanzas reconcilió $1,204 en pagos', now() - interval '25 minutes'),
 ('critical','Cumplimiento marcó un mensaje saliente', now() - interval '41 minutes'),
 ('info','Calidad aprobó 24 artefactos', now() - interval '58 minutes');

INSERT INTO public.activity_log (agent_id, agent_name, action, created_at)
SELECT id, name, last_action, now() - (sort_order * interval '4 minutes') FROM public.agents;

INSERT INTO public.agent_tasks (agent_id, name, status, created_at)
SELECT a.id, (ARRAY['Procesar cola de entrada','Sincronizar datos con Director','Generar reporte parcial','Validar resultados previos'])[1 + (g % 4)],
       CASE WHEN g = 0 THEN 'en curso' ELSE 'completada' END,
       now() - (g * interval '9 minutes')
FROM public.agents a, generate_series(0, 3) g;