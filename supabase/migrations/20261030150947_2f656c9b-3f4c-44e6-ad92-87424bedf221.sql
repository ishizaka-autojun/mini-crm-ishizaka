-- Libera acesso à tabela Leads do projeto "Banco CRM"
GRANT SELECT, INSERT, UPDATE, DELETE ON public."Leads" TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."Leads" TO authenticated;
GRANT ALL ON public."Leads" TO service_role;

ALTER TABLE public."Leads" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leads_select" ON public."Leads";
CREATE POLICY "leads_select" ON public."Leads"
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "leads_insert" ON public."Leads";
CREATE POLICY "leads_insert" ON public."Leads"
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "leads_update" ON public."Leads";
CREATE POLICY "leads_update" ON public."Leads"
  FOR UPDATE TO anon, authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "leads_delete" ON public."Leads";
CREATE POLICY "leads_delete" ON public."Leads"
  FOR DELETE TO anon, authenticated
  USING (true);