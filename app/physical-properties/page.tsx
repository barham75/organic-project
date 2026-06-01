"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { propertyGroups } from "./data";

export default function PhysicalPropertiesPage() {
  const [selectedId, setSelectedId] = useState(propertyGroups[0].id);
  const selected = useMemo(() => propertyGroups.find((group) => group.id === selectedId) ?? propertyGroups[0], [selectedId]);

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900">
      <section className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm font-semibold text-blue-700 hover:text-blue-900">Back to lab</Link>
        <div className="mt-4 flex flex-col gap-5 border-b border-slate-200 pb-7 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-blue-700">Organic chemistry reference</p>
            <h1 className="mt-2 text-3xl font-bold">Physical Properties, Solubility, and Acidity</h1>
            <p className="mt-3 max-w-3xl text-slate-600">Compare functional groups through intermolecular forces, boiling-point trends, water solubility, and acid-base behavior.</p>
          </div>
          <Link href="/physical-properties/quiz" className="rounded-lg bg-blue-700 px-5 py-3 text-center font-bold text-white hover:bg-blue-800">Start comparison quiz</Link>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside>
            <label htmlFor="functional-group" className="text-sm font-bold text-slate-700">Functional group</label>
            <select id="functional-group" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm font-semibold">
              {propertyGroups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
            </select>
            <nav className="mt-4 hidden gap-1 lg:grid">
              {propertyGroups.map((group) => (
                <button key={group.id} type="button" onClick={() => setSelectedId(group.id)} className={`rounded-md px-3 py-2 text-left text-sm font-semibold ${selectedId === group.id ? "bg-blue-700 text-white" : "text-slate-700 hover:bg-slate-200"}`}>
                  {group.name}
                </button>
              ))}
            </nav>
          </aside>

          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="border-b border-slate-200 pb-5">
              <h2 className="text-2xl font-bold">{selected.name}</h2>
              <p className="mt-2 font-mono text-sm text-slate-600">{selected.examples}</p>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Info title="Intermolecular forces" text={selected.intermolecularForces} />
              <Info title="Boiling-point trend" text={selected.boilingPoint} />
              <Info title="Water solubility" text={selected.solubility} />
              <Info title="Acidity or basicity" text={selected.acidityBasicity} />
            </div>
            <div className="mt-6 border-t border-slate-200 pt-5">
              <h3 className="text-sm font-bold uppercase text-slate-500">Key factors</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {selected.factors.map((factor) => <span key={factor} className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-700">{factor}</span>)}
              </div>
            </div>
            <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-4">
              <h3 className="text-sm font-bold uppercase text-emerald-800">Comparison example</h3>
              <p className="mt-2 text-emerald-950">{selected.comparison}</p>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

function Info({ title, text }: { title: string; text: string }) {
  return <section><h3 className="text-sm font-bold uppercase text-blue-700">{title}</h3><p className="mt-2 leading-7 text-slate-700">{text}</p></section>;
}
