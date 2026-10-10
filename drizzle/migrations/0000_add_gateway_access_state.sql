CREATE TABLE public.ai_gateway_access_state (
  id text PRIMARY KEY CHECK (id = 'gateway_access'),
  denied_at timestamptz NOT NULL DEFAULT now(),
  denial_type text NOT NULL,
  denial_reason text NOT NULL
);
GRANT ALL ON TABLE public.ai_gateway_access_state TO service_role;
REVOKE ALL ON TABLE public.ai_gateway_access_state FROM anon, authenticated;
ALTER TABLE public.ai_gateway_access_state ENABLE ROW LEVEL SECURITY;