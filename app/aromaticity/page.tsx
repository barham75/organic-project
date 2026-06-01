import Link from "next/link";
import { aromaticityExamples } from "./data";

export default function AromaticityPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900">
      <section className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm font-semibold text-blue-700 hover:text-blue-900">Back to lab</Link>
        <div className="mt-4 flex flex-col gap-5 border-b border-slate-200 pb-7 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-indigo-700">Organic chemistry reference</p>
            <h1 className="mt-2 text-3xl font-bold">Aromaticity and Huckel's Rule</h1>
            <p className="mt-3 max-w-3xl text-slate-600">Classify ring systems by checking geometry and conjugation before counting pi electrons.</p>
          </div>
          <Link href="/aromaticity/quiz" className="rounded-lg bg-indigo-700 px-5 py-3 text-center font-bold text-white hover:bg-indigo-800">Start aromaticity quiz</Link>
        </div>

        <section className="mt-7 grid gap-4 md:grid-cols-4">
          <Rule number="1" title="Cyclic" text="The p orbitals must form a ring." />
          <Rule number="2" title="Planar" text="Adjacent p orbitals need effective overlap." />
          <Rule number="3" title="Fully conjugated" text="Every ring atom needs a p orbital." />
          <Rule number="4" title="Count electrons" text="4n + 2 is aromatic; 4n is antiaromatic." />
        </section>

        <section className="mt-7 grid gap-4 md:grid-cols-3">
          <Classification title="Aromatic" style="border-emerald-200 bg-emerald-50 text-emerald-950" text="Cyclic, planar, fully conjugated, and contains 4n + 2 pi electrons." />
          <Classification title="Antiaromatic" style="border-rose-200 bg-rose-50 text-rose-950" text="Cyclic, planar, fully conjugated, and contains 4n pi electrons." />
          <Classification title="Nonaromatic" style="border-slate-200 bg-white text-slate-800" text="Fails at least one structural requirement, commonly planarity or continuous conjugation." />
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold">Reference examples</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {aromaticityExamples.map((example) => (
              <article key={example.name} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold">{example.name}</h3>
                    <p className="mt-1 font-mono text-sm text-slate-600">{example.formula}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${badge(example.classification)}`}>{example.classification}</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-indigo-800">{example.piElectrons}</p>
                <p className="mt-2 leading-6 text-slate-700">{example.explanation}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-7 rounded-lg border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-bold text-amber-950">Key note for heterocycles</h2>
          <p className="mt-2 leading-7 text-amber-950">A lone pair counts only when it occupies a p orbital that completes the cyclic pi system. The pyrrole lone pair counts; the pyridine lone pair does not.</p>
        </section>
      </section>
    </main>
  );
}

function Rule({ number, title, text }: { number: string; title: string; text: string }) {
  return <article className="rounded-lg border border-indigo-200 bg-white p-4"><span className="text-sm font-bold text-indigo-700">{number}</span><h2 className="mt-2 font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>;
}

function Classification({ title, text, style }: { title: string; text: string; style: string }) {
  return <article className={`rounded-lg border p-5 ${style}`}><h2 className="font-bold">{title}</h2><p className="mt-2 leading-7">{text}</p></article>;
}

function badge(classification: string) {
  if (classification === "Aromatic") return "bg-emerald-100 text-emerald-800";
  if (classification === "Antiaromatic") return "bg-rose-100 text-rose-800";
  return "bg-slate-100 text-slate-700";
}
