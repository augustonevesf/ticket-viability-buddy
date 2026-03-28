
-- Table for ticket simulations history
CREATE TABLE public.ticket_simulations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  id_viabilidade text NOT NULL,
  id_hub text DEFAULT '',
  id_proposta text DEFAULT '',
  client_name text DEFAULT '',
  user_email text,
  inputs jsonb NOT NULL,
  results jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.ticket_simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert ticket simulations" ON public.ticket_simulations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read all ticket simulations" ON public.ticket_simulations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own ticket simulations" ON public.ticket_simulations FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Table for ticket admin constants (same pattern as ab_constants)
CREATE TABLE public.ticket_constants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.ticket_constants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read ticket constants" ON public.ticket_constants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert ticket constants" ON public.ticket_constants FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM ab_admin_emails WHERE ab_admin_emails.email = (SELECT users.email FROM auth.users WHERE users.id = auth.uid())::text)
);
CREATE POLICY "Admins can update ticket constants" ON public.ticket_constants FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM ab_admin_emails WHERE ab_admin_emails.email = (SELECT users.email FROM auth.users WHERE users.id = auth.uid())::text)
);
