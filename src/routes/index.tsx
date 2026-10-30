import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clientes — Tabela de acompanhamento" },
      { name: "description", content: "Tabela de clientes com empresa, valor, etapa e contato." },
      { property: "og:title", content: "Clientes — Tabela de acompanhamento" },
      { property: "og:description", content: "Tabela de clientes com empresa, valor, etapa e contato." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Etapa = "novo" | "em contato" | "fechado";
type Cliente = { id: string; empresa: string; valor: number; etapa: Etapa; contato: string };

const ETAPAS: Etapa[] = ["novo", "em contato", "fechado"];
const KEY = "clientes-v1";
const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const etapaCls: Record<Etapa, string> = {
  novo: "bg-secondary text-secondary-foreground",
  "em contato": "bg-accent text-accent-foreground",
  fechado: "bg-primary text-primary-foreground",
};

function Index() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({ empresa: "", valor: "", etapa: "novo" as Etapa, contato: "" });

  useEffect(() => {
    try { setClientes(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem(KEY, JSON.stringify(clientes)); }, [clientes, loaded]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.empresa.trim()) return;
    setClientes((c) => [...c, { id: crypto.randomUUID(), empresa: form.empresa.trim(), valor: Number(form.valor) || 0, etapa: form.etapa, contato: form.contato.trim() }]);
    setForm({ empresa: "", valor: "", etapa: "novo", contato: "" });
  };
  const update = (id: string, patch: Partial<Cliente>) => setClientes((c) => c.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const total = clientes.reduce((s, c) => s + c.valor, 0);
  const input = "w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight">Clientes</h1>
      <p className="mt-1 text-muted-foreground">{clientes.length} clientes · Total {brl(total)}</p>

      <form onSubmit={add} className="mt-8 grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-[2fr_1fr_1fr_2fr_auto]">
        <input className={input} placeholder="Empresa" value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} />
        <input className={input} type="number" min="0" step="0.01" placeholder="Valor (R$)" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
        <select className={input} value={form.etapa} onChange={(e) => setForm({ ...form, etapa: e.target.value as Etapa })}>
          {ETAPAS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        <input className={input} placeholder="Nome para contato" value={form.contato} onChange={(e) => setForm({ ...form, contato: e.target.value })} />
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Adicionar</button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-muted-foreground">
            <tr><th className="p-3">Empresa</th><th className="p-3">Valor</th><th className="p-3">Etapa</th><th className="p-3">Contato</th><th className="p-3" /></tr>
          </thead>
          <tbody>
            {clientes.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Nenhum cliente ainda. Adicione o primeiro acima.</td></tr>
            )}
            {clientes.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-medium">{c.empresa}</td>
                <td className="p-3 tabular-nums">{brl(c.valor)}</td>
                <td className="p-3">
                  <select value={c.etapa} onChange={(e) => update(c.id, { etapa: e.target.value as Etapa })} className={`rounded-full px-3 py-1 text-xs font-medium ${etapaCls[c.etapa]}`}>
                    {ETAPAS.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </td>
                <td className="p-3">{c.contato}</td>
                <td className="p-3 text-right">
                  <button onClick={() => setClientes((l) => l.filter((x) => x.id !== c.id))} className="text-destructive hover:underline">Remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
