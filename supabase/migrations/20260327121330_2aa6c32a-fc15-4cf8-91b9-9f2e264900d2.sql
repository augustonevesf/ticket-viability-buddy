
-- Admin emails for A&B constants editing
CREATE TABLE public.ab_admin_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE
);

ALTER TABLE public.ab_admin_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read admin emails"
ON public.ab_admin_emails FOR SELECT TO authenticated
USING (true);

INSERT INTO public.ab_admin_emails (email) VALUES
  ('leandro.custodio@zig.fun'),
  ('breno.carvalho@zig.fun'),
  ('carlos.junior@zig.fun');

-- Constants overrides (single row, updated by admins)
CREATE TABLE public.ab_constants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data jsonb NOT NULL DEFAULT '{}',
  updated_by text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.ab_constants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read constants"
ON public.ab_constants FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can update constants"
ON public.ab_constants FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.ab_admin_emails WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);

CREATE POLICY "Admins can insert constants"
ON public.ab_constants FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.ab_admin_emails WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);

-- Simulation history
CREATE TABLE public.ab_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_viabilidade text NOT NULL UNIQUE,
  id_hub text DEFAULT '',
  id_proposta text DEFAULT '',
  user_id uuid NOT NULL,
  user_email text,
  client_name text DEFAULT '',
  inputs jsonb NOT NULL,
  results jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.ab_simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all simulations"
ON public.ab_simulations FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can insert simulations"
ON public.ab_simulations FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own simulations"
ON public.ab_simulations FOR UPDATE TO authenticated
USING (auth.uid() = user_id);
