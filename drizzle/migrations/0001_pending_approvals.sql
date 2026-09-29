CREATE TABLE IF NOT EXISTS public.pending_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text REFERENCES public.agents(id) ON DELETE SET NULL,
  agent_name text NOT NULL,
  action text NOT NULL,
  amount numeric(12,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  requested_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by text
);

CREATE INDEX IF NOT EXISTS pending_approvals_created_idx ON public.pending_approvals (requested_at DESC);

DO $$
BEGIN
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.pending_approvals TO anon, authenticated;
  GRANT ALL ON public.pending_approvals TO service_role;
  ALTER TABLE public.pending_approvals ENABLE ROW LEVEL SECURITY;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pending_approvals' AND policyname = 'Dashboard access pending_approvals'
  ) THEN
    CREATE POLICY "Dashboard access pending_approvals" ON public.pending_approvals FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;
