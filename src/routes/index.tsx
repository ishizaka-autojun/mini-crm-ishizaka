import { createFileRoute } from "@tanstack/react-router";
import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Etapa = Database["public"]["Enums"]["etapa"];
type Lead = Database["public"]["Tables"]["Leads"]["Row"];

const ETAPAS: Etapa[] = ["novo", "em contato", "fechado"];
const QUERY_KEY = ["leads"];
const brl = (n: number) =>
  Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const etapaCls: Record<Etapa, string> = {
  novo: "bg-secondary text-secondary-foreground",
  "em contato": "bg-accent text-accent-foreground",
  fechado: "bg-primary text-primary-foreground",
};

const leadsQuery = queryOptions({
  queryKey: QUERY_KEY,
  queryFn: async () => {
    const { data, error } = await supabase.from("Leads").select("*").order("empresa");
    if (error) throw error;
    return (data ?? []) as Lead[];
  },
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clientes — Tabela de acompanhamento" },
      {
        name: "description",
        content: "Tabela de clientes com empresa, valor, etapa e contato, salva no banco de dados.",
      },
      { property: "og:title", content: "Clientes — Tabela de acompanhamento" },
      {
        property: "og:description",
        content: "Tabela de clientes com empresa, valor, etapa e contato, salva no banco de dados.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(leadsQuery),
  component: Index,
});

function Index() {
  const queryClient = useQueryClient();
  const { data: leads } = useSuspenseQuery(leadsQuery);
  const [form, setForm] = useState({
    empresa: "",
    valor: "",
    etapa: "novo" as Etapa,
    nome: "",
  });
  const [erro, setErro] = useState<string | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const add = useMutation({
    mutationFn: async (lead: {
      empresa: string;
      valor: number;
      etapa: Etapa;
      nome: string | null;
    }) => {
      const { error } = await supabase.from("Leads").insert(lead);
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: (e: Error) =>
      setErro(
        e.message.toLowerCase().includes("duplicate")
          ? "Já existe um cliente com essa empresa."
          : "Não foi possível salvar. Tente de novo.",
      ),
  });

  const changeEtapa = useMutation({
    mutationFn: async ({ empresa, etapa }: { empresa: string; etapa: Etapa }) => {
      const { error } = await supabase
        .from("Leads")
        .update({ etapa })
        .eq("empresa", empresa);
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  const remove = useMutation({
    mutationFn: async (empresa: string) => {
      const { error } = await supabase.from("Leads").delete().eq("empresa", empresa);
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  useEffect(() => {
    const channel = supabase
      .channel(`leads-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Leads" },
        () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const empresa = form.empresa.trim();
    if (!empresa) return;
    setErro(null);
    add.mutate({
      empresa,
      valor: Number(form.valor) || 0,
      etapa: form.etapa,
      nome: form.nome.trim() || null,
    });
    setForm({ empresa: "", valor: "", etapa: "novo", nome: "" });
  };

  const total = leads.reduce((s, l) => s + Number(l.valor), 0);
  const input =
    "w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight">Clientes</h1>
      <p className="mt-1 text-muted-foreground">
        {leads.length} clientes · Total {brl(total)}
      </p>

      <form
        onSubmit={submit}
        className="mt-8 grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-[2fr_1fr_1fr_2fr_auto]"
      >
        <input
          className={input}
          placeholder="Empresa"
          value={form.empresa}
          onChange={(e) => setForm({ ...form, empresa: e.target.value })}
        />
        <input
          className={input}
          type="number"
          min="0"
          step="0.01"
          placeholder="Valor (R$)"
          value={form.valor}
          onChange={(e) => setForm({ ...form, valor: e.target.value })}
        />
        <select
          className={input}
          value={form.etapa}
          onChange={(e) => setForm({ ...form, etapa: e.target.value as Etapa })}
        >
          {ETAPAS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        <input
          className={input}
          placeholder="Nome para contato"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
        />
        <button
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
          disabled={add.isPending}
        >
          {add.isPending ? "Salvando…" : "Adicionar"}
        </button>
        {erro && <p className="text-sm text-destructive sm:col-span-full">{erro}</p>}
      </form>

      <div className="mt-6 overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-muted-foreground">
            <tr>
              <th className="p-3">Empresa</th>
              <th className="p-3">Valor</th>
              <th className="p-3">Etapa</th>
              <th className="p-3">Contato</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  Nenhum cliente ainda. Adicione o primeiro acima.
                </td>
              </tr>
            )}
            {leads.map((l) => (
              <tr key={l.empresa} className="border-t">
                <td className="p-3 font-medium">{l.empresa}</td>
                <td className="p-3 tabular-nums">{brl(Number(l.valor))}</td>
                <td className="p-3">
                  <select
                    value={l.etapa}
                    onChange={(e) =>
                      changeEtapa.mutate({ empresa: l.empresa, etapa: e.target.value as Etapa })
                    }
                    className={`rounded-full px-3 py-1 text-xs font-medium ${etapaCls[l.etapa]}`}
                  >
                    {ETAPAS.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3">{l.nome}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => remove.mutate(l.empresa)}
                    className="text-destructive hover:underline"
                  >
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
