"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Position = "axial" | "equatorial";
type Substituent = {
  id: string;
  name: string;
  aValue: number;
  note: string;
};

const substituents: Substituent[] = [
  { id: "h", name: "H", aValue: 0, note: "Hydrogen is the reference and has no meaningful axial penalty." },
  { id: "methyl", name: "CH3", aValue: 1.7, note: "Methyl strongly prefers equatorial to avoid 1,3-diaxial interactions." },
  { id: "ethyl", name: "CH2CH3", aValue: 1.8, note: "Ethyl is slightly bulkier than methyl and also prefers equatorial." },
  { id: "isopropyl", name: "i-Pr", aValue: 2.1, note: "Isopropyl is bulky; equatorial placement is favored." },
  { id: "tert-butyl", name: "t-Bu", aValue: 5.5, note: "tert-Butyl effectively locks the chair with t-Bu equatorial." },
  { id: "oh", name: "OH", aValue: 0.9, note: "OH usually prefers equatorial, though hydrogen bonding can affect special cases." },
  { id: "br", name: "Br", aValue: 0.5, note: "Halogens prefer equatorial, but the penalty is smaller than alkyl groups." }
];

function ringPoint(index: number, flipped: boolean) {
  const points = [
    { x: 100, y: 140 },
    { x: 165, y: 102 },
    { x: 245, y: 128 },
    { x: 245, y: 208 },
    { x: 165, y: 236 },
    { x: 100, y: 200 }
  ];
  const p = points[index % 6];
  if (!flipped) return p;
  return { x: p.x, y: 338 - p.y };
}

function chairPath(flipped: boolean) {
  const pts = Array.from({ length: 6 }, (_, i) => ringPoint(i, flipped));
  return `${pts.map((p) => `${p.x},${p.y}`).join(" ")}`;
}

function substituentVector(carbon: number, position: Position, flipped: boolean) {
  const axialUp = [true, false, true, false, true, false];
  const isAxialUp = flipped ? !axialUp[carbon - 1] : axialUp[carbon - 1];
  if (position === "axial") return { dx: 0, dy: isAxialUp ? -58 : 58 };
  const equatorialDirection = [
    { dx: -54, dy: 24 },
    { dx: 20, dy: -54 },
    { dx: 58, dy: -12 },
    { dx: 54, dy: 24 },
    { dx: -20, dy: 54 },
    { dx: -58, dy: -12 }
  ][carbon - 1];
  return flipped ? { dx: equatorialDirection.dx, dy: -equatorialDirection.dy } : equatorialDirection;
}

function CyclohexaneDrawing({
  flipped,
  carbon,
  position,
  label
}: {
  flipped: boolean;
  carbon: number;
  position: Position;
  label: string;
}) {
  const start = ringPoint(carbon - 1, flipped);
  const v = substituentVector(carbon, position, flipped);
  const end = { x: start.x + v.dx, y: start.y + v.dy };

  return (
    <svg viewBox="0 0 350 310" className="h-full min-h-[310px] w-full rounded-lg bg-white">
      <polyline points={chairPath(flipped)} fill="none" stroke="#0f172a" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
      {Array.from({ length: 6 }, (_, i) => {
        const p = ringPoint(i, flipped);
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="16" fill={i + 1 === carbon ? "#dbeafe" : "#f8fafc"} stroke={i + 1 === carbon ? "#2563eb" : "#cbd5e1"} strokeWidth="2" />
            <text x={p.x} y={p.y + 5} textAnchor="middle" className="fill-slate-700 text-sm font-bold">{i + 1}</text>
          </g>
        );
      })}
      <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={position === "axial" ? "#dc2626" : "#059669"} strokeWidth="4" strokeLinecap="round" />
      <circle cx={end.x} cy={end.y} r="24" fill={position === "axial" ? "#fee2e2" : "#dcfce7"} stroke={position === "axial" ? "#dc2626" : "#059669"} strokeWidth="2" />
      <text x={end.x} y={end.y + 5} textAnchor="middle" className="fill-slate-900 text-sm font-bold">{label}</text>
      <text x="18" y="286" className="fill-slate-600 text-sm font-bold">
        {flipped ? "Ring-flipped chair" : "Original chair"} - C{carbon} {position}
      </text>
    </svg>
  );
}

export default function CyclohexaneConformationPage() {
  const [substituentId, setSubstituentId] = useState("methyl");
  const [carbon, setCarbon] = useState(1);
  const [position, setPosition] = useState<Position>("axial");
  const [flipped, setFlipped] = useState(false);

  const substituent = substituents.find((s) => s.id === substituentId) || substituents[1];
  const flippedPosition: Position = position === "axial" ? "equatorial" : "axial";
  const originalEnergy = position === "axial" ? substituent.aValue : 0;
  const flippedEnergy = flippedPosition === "axial" ? substituent.aValue : 0;
  const preferred = originalEnergy <= flippedEnergy ? "original chair" : "ring-flipped chair";

  const energyRows = useMemo(() => [
    { name: "Chair", energy: "0 kcal/mol", note: "Most stable cyclohexane conformation." },
    { name: "Twist-boat", energy: "~5.5 kcal/mol", note: "Lower than boat but still strained." },
    { name: "Boat", energy: "~6.9 kcal/mol", note: "Flagpole and torsional strain raise energy." },
    { name: "Half-chair", energy: "~10.8 kcal/mol", note: "Highest point in the ring-flip pathway." }
  ], []);

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/stereochemistry/conformational" className="text-sm font-bold text-blue-700 hover:text-blue-900">
            Back to conformational isomerism
          </Link>
          <Link href="/" className="text-sm font-bold text-slate-600 hover:text-slate-900">
            Back to lab
          </Link>
        </div>

        <header className="mt-5 rounded-3xl bg-white p-6 shadow">
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">Cyclohexane conformational analysis</p>
          <h1 className="mt-2 text-4xl font-bold">Cyclohexane Chair Conformation</h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            Explore the chair form, axial and equatorial bonds, ring flipping, and why bulky substituents prefer equatorial positions.
          </p>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
          <aside className="rounded-3xl bg-white p-5 shadow">
            <h2 className="text-xl font-bold">Controls</h2>
            <div className="mt-5 grid gap-4">
              <label className="block">
                <span className="mb-2 block font-bold text-slate-700">Substituent</span>
                <select value={substituentId} onChange={(e) => setSubstituentId(e.target.value)} className="w-full rounded-xl border p-3">
                  {substituents.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block font-bold text-slate-700">Carbon position</span>
                <select value={carbon} onChange={(e) => setCarbon(Number(e.target.value))} className="w-full rounded-xl border p-3">
                  {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>C{n}</option>)}
                </select>
              </label>

              <div>
                <span className="mb-2 block font-bold text-slate-700">Current bond type</span>
                <div className="grid grid-cols-2 rounded-xl border p-1">
                  {(["axial", "equatorial"] as Position[]).map((value) => (
                    <button
                      key={value}
                      onClick={() => setPosition(value)}
                      className={`rounded-lg px-4 py-3 font-bold capitalize ${position === value ? "bg-emerald-700 text-white" : "text-slate-700 hover:bg-slate-100"}`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setFlipped((v) => !v)}
                className="rounded-xl bg-slate-900 px-4 py-3 font-bold text-white hover:bg-slate-700"
              >
                Ring flip
              </button>
            </div>

            <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-emerald-950">
              <h3 className="font-bold">Key result</h3>
              <p className="mt-2 text-sm">
                Ring flip converts every axial bond into an equatorial bond and every equatorial bond into an axial bond.
              </p>
              <p className="mt-2 text-sm">
                For {substituent.name}, the preferred conformation is the <b>{preferred}</b>.
              </p>
            </div>
          </aside>

          <div className="rounded-3xl bg-white p-5 shadow">
            <div className="grid gap-5 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-3">
                <h2 className="mb-3 text-lg font-bold">Original chair</h2>
                <CyclohexaneDrawing flipped={false} carbon={carbon} position={position} label={substituent.name} />
              </div>
              <div className="rounded-2xl border border-slate-200 p-3">
                <h2 className="mb-3 text-lg font-bold">After ring flip</h2>
                <CyclohexaneDrawing flipped carbon={carbon} position={flippedPosition} label={substituent.name} />
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-sm font-bold text-blue-700">Original energy penalty</p>
                <p className="mt-1 text-2xl font-bold text-blue-950">{originalEnergy.toFixed(1)} kcal/mol</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-sm font-bold text-emerald-700">Flipped energy penalty</p>
                <p className="mt-1 text-2xl font-bold text-emerald-950">{flippedEnergy.toFixed(1)} kcal/mol</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-4">
                <p className="text-sm font-bold text-amber-700">A-value</p>
                <p className="mt-1 text-2xl font-bold text-amber-950">{substituent.aValue.toFixed(1)} kcal/mol</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-2xl font-bold">Conformation energy order</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
              {energyRows.map((row) => (
                <div key={row.name} className="grid gap-2 border-b border-slate-200 p-4 last:border-b-0 md:grid-cols-[140px_120px_1fr]">
                  <b>{row.name}</b>
                  <span className="font-semibold text-emerald-700">{row.energy}</span>
                  <span className="text-slate-600">{row.note}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-2xl font-bold">Axial vs equatorial</h2>
            <p className="mt-3 text-slate-600">{substituent.note}</p>
            <ul className="mt-4 space-y-3 text-slate-700">
              <li className="rounded-2xl bg-slate-100 p-4"><b>Axial:</b> parallel to the vertical axis of the chair; can create 1,3-diaxial interactions.</li>
              <li className="rounded-2xl bg-slate-100 p-4"><b>Equatorial:</b> points outward around the ring; usually preferred by bulky groups.</li>
              <li className="rounded-2xl bg-slate-100 p-4"><b>Ring flip:</b> preserves up/down stereochemistry but swaps axial and equatorial positions.</li>
            </ul>
          </article>
        </section>
      </section>
    </main>
  );
}
