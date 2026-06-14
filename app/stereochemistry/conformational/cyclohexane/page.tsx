"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Orientation = "up" | "down";
type Position = "axial" | "equatorial";
type ViewDirection = "front" | "right" | "back" | "left";
type Point = { x: number; y: number };
type Substituent = {
  id: string;
  name: string;
  aValue: number;
  note: string;
};
type Placement = {
  id: string;
  substituentId: string;
  carbon: number;
  orientation: Orientation;
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

const viewLabels: Record<ViewDirection, string> = {
  front: "Front",
  right: "Right side",
  back: "Back",
  left: "Left side"
};

const axialUpPattern = [true, false, true, false, true, false];

function baseRingPoint(index: number, flipped: boolean): Point {
  const points = [
    { x: 72, y: 188 },
    { x: 132, y: 142 },
    { x: 198, y: 166 },
    { x: 278, y: 118 },
    { x: 218, y: 226 },
    { x: 132, y: 252 }
  ];
  const p = points[index % 6];
  if (!flipped) return p;
  return { x: 350 - p.x, y: p.y };
}

function projectPoint(point: Point, view: ViewDirection): Point {
  const center = { x: 175, y: 185 };
  const angles: Record<ViewDirection, number> = {
    front: 0,
    right: 90,
    back: 180,
    left: -90
  };
  const angle = (angles[view] * Math.PI) / 180;
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return {
    x: center.x + dx * Math.cos(angle) - dy * Math.sin(angle),
    y: center.y + dx * Math.sin(angle) + dy * Math.cos(angle)
  };
}

function ringPoint(index: number, flipped: boolean, view: ViewDirection) {
  return projectPoint(baseRingPoint(index, flipped), view);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function chairPath(flipped: boolean, view: ViewDirection) {
  const pts = Array.from({ length: 6 }, (_, i) => ringPoint(i, flipped, view));
  return `${pts.map((p) => `${p.x},${p.y}`).join(" ")}`;
}

function derivedPosition(carbon: number, orientation: Orientation, flipped: boolean): Position {
  const axialUp = flipped ? !axialUpPattern[carbon - 1] : axialUpPattern[carbon - 1];
  return (orientation === "up") === axialUp ? "axial" : "equatorial";
}

function baseSubstituentVector(carbon: number, orientation: Orientation, flipped: boolean) {
  const position = derivedPosition(carbon, orientation, flipped);
  if (position === "axial") return { dx: 0, dy: orientation === "up" ? -72 : 72 };
  const equatorialDirection = [
    { dx: -62, dy: -28 },
    { dx: -58, dy: -36 },
    { dx: 66, dy: -22 },
    { dx: 66, dy: 24 },
    { dx: 30, dy: 64 },
    { dx: -66, dy: 22 }
  ][carbon - 1];
  const pointsUp = orientation === "up";
  const vectorPointsUp = equatorialDirection.dy < 0;
  const vector = pointsUp === vectorPointsUp ? equatorialDirection : { dx: -equatorialDirection.dx, dy: -equatorialDirection.dy };
  return flipped ? { dx: -vector.dx, dy: vector.dy } : vector;
}

function getSubstituent(id: string) {
  return substituents.find((s) => s.id === id) || substituents[1];
}

function placementEnergy(placement: Placement, flipped: boolean) {
  const substituent = getSubstituent(placement.substituentId);
  return derivedPosition(placement.carbon, placement.orientation, flipped) === "axial" ? substituent.aValue : 0;
}

function relationLabel(a: Placement, b: Placement) {
  return a.orientation === b.orientation ? "cis" : "trans";
}

function SubstituentBond({
  placement,
  flipped,
  view,
  color
}: {
  placement: Placement;
  flipped: boolean;
  view: ViewDirection;
  color: string;
}) {
  const substituent = getSubstituent(placement.substituentId);
  const rawStart = baseRingPoint(placement.carbon - 1, flipped);
  const rawVector = baseSubstituentVector(placement.carbon, placement.orientation, flipped);
  const rawEnd = { x: rawStart.x + rawVector.dx, y: rawStart.y + rawVector.dy };
  const start = projectPoint(rawStart, view);
  const end = projectPoint(rawEnd, view);
  const lineVector = { dx: end.x - start.x, dy: end.y - start.y };
  const length = Math.max(1, Math.hypot(lineVector.dx, lineVector.dy));
  const normal = { x: lineVector.dx / length, y: lineVector.dy / length };
  const labelPoint = {
    x: clamp(end.x + normal.x * 24, 34, 316),
    y: clamp(end.y + normal.y * 24, 28, 258)
  };
  const position = derivedPosition(placement.carbon, placement.orientation, flipped);
  const rawAxisTop = { x: rawStart.x, y: rawStart.y - 46 };
  const rawAxisBottom = { x: rawStart.x, y: rawStart.y + 46 };
  const axisTop = projectPoint(rawAxisTop, view);
  const axisBottom = projectPoint(rawAxisBottom, view);

  return (
    <g>
      {position === "axial" && (
        <line
          x1={axisTop.x}
          y1={axisTop.y}
          x2={axisBottom.x}
          y2={axisBottom.y}
          stroke="#cbd5e1"
          strokeWidth="2"
          strokeDasharray="4 5"
        />
      )}
      <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={color} strokeWidth="4" strokeLinecap="round" />
      <circle cx={end.x} cy={end.y} r="5" fill={color} />
      <text x={labelPoint.x} y={labelPoint.y + 4} textAnchor="middle" className="fill-slate-900 text-sm font-bold">
        {substituent.name}
      </text>
      <text x={labelPoint.x} y={labelPoint.y + 20} textAnchor="middle" className="fill-slate-500 text-[10px] font-bold uppercase">
        {placement.id} {placement.orientation}
      </text>
    </g>
  );
}

function CyclohexaneDrawing({
  flipped,
  placements,
  view
}: {
  flipped: boolean;
  placements: Placement[];
  view: ViewDirection;
}) {
  const activeCarbons = new Set(placements.map((p) => p.carbon));

  return (
    <svg viewBox="0 0 350 320" className="h-full min-h-[320px] w-full rounded-lg bg-white">
      <polygon points={chairPath(flipped, view)} fill="none" stroke="#0f172a" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
      {placements.map((placement, index) => (
        <SubstituentBond key={`${placement.id}-${flipped}`} placement={placement} flipped={flipped} view={view} color={index === 0 ? "#dc2626" : "#059669"} />
      ))}
      {Array.from({ length: 6 }, (_, i) => {
        const p = ringPoint(i, flipped, view);
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="10" fill={activeCarbons.has(i + 1) ? "#dbeafe" : "#ffffff"} stroke={activeCarbons.has(i + 1) ? "#2563eb" : "#cbd5e1"} strokeWidth="2" />
            <text x={p.x} y={p.y + 4} textAnchor="middle" className="fill-slate-700 text-[10px] font-bold">
              {i + 1}
            </text>
          </g>
        );
      })}
      <text x="18" y="304" className="fill-slate-600 text-sm font-bold">
        {flipped ? "Ring-flipped chair" : "Original chair"} - {viewLabels[view]} view
      </text>
    </svg>
  );
}

function PlacementControls({
  title,
  placement,
  onChange
}: {
  title: string;
  placement: Placement;
  onChange: (next: Placement) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <h3 className="font-bold">{title}</h3>
      <div className="mt-3 grid gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-slate-700">Substituent</span>
          <select value={placement.substituentId} onChange={(e) => onChange({ ...placement, substituentId: e.target.value })} className="w-full rounded-xl border p-3">
            {substituents.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-bold text-slate-700">Ring carbon</span>
          <select value={placement.carbon} onChange={(e) => onChange({ ...placement, carbon: Number(e.target.value) })} className="w-full rounded-xl border p-3">
            {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>C{n}</option>)}
          </select>
        </label>

        <div>
          <span className="mb-1 block text-sm font-bold text-slate-700">Direction</span>
          <div className="grid grid-cols-2 rounded-xl border p-1">
            {(["up", "down"] as Orientation[]).map((value) => (
              <button
                key={value}
                onClick={() => onChange({ ...placement, orientation: value })}
                className={`rounded-lg px-4 py-3 font-bold capitalize ${placement.orientation === value ? "bg-emerald-700 text-white" : "text-slate-700 hover:bg-slate-100"}`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CyclohexaneConformationPage() {
  const [firstPlacement, setFirstPlacement] = useState<Placement>({ id: "A", substituentId: "methyl", carbon: 1, orientation: "up" });
  const [secondPlacement, setSecondPlacement] = useState<Placement>({ id: "B", substituentId: "ethyl", carbon: 3, orientation: "down" });
  const [view, setView] = useState<ViewDirection>("front");

  const placements = [firstPlacement, secondPlacement];
  const originalEnergy = placements.reduce((sum, p) => sum + placementEnergy(p, false), 0);
  const flippedEnergy = placements.reduce((sum, p) => sum + placementEnergy(p, true), 0);
  const preferred = originalEnergy <= flippedEnergy ? "original chair" : "ring-flipped chair";
  const relation = relationLabel(firstPlacement, secondPlacement);
  const hasSameCarbon = firstPlacement.carbon === secondPlacement.carbon;

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
          <h1 className="mt-2 text-4xl font-bold">Disubstituted Cyclohexane Chair Conformation</h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            Place two substituents on a cyclohexane chair, compare cis/trans relationships, rotate the viewing direction, and see how a ring flip changes axial and equatorial positions.
          </p>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[420px_1fr]">
          <aside className="rounded-3xl bg-white p-5 shadow">
            <h2 className="text-xl font-bold">Controls</h2>
            <div className="mt-5 grid gap-4">
              <PlacementControls title="Substituent A" placement={firstPlacement} onChange={setFirstPlacement} />
              <PlacementControls title="Substituent B" placement={secondPlacement} onChange={setSecondPlacement} />

              <div>
                <span className="mb-2 block font-bold text-slate-700">View direction</span>
                <div className="grid grid-cols-2 gap-2">
                  {(["front", "right", "back", "left"] as ViewDirection[]).map((value) => (
                    <button
                      key={value}
                      onClick={() => setView(value)}
                      className={`rounded-xl border px-3 py-3 font-bold ${view === value ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-700 hover:bg-slate-100"}`}
                    >
                      {viewLabels[value]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-emerald-950">
              <h3 className="font-bold">Key result</h3>
              <p className="mt-2 text-sm">
                The two substituents are <b>{relation}</b> because they point to {relation === "cis" ? "the same face" : "opposite faces"} of the ring.
              </p>
              <p className="mt-2 text-sm">
                The lower energy conformation is the <b>{preferred}</b>.
              </p>
              {hasSameCarbon && (
                <p className="mt-2 rounded-xl bg-amber-100 p-3 text-sm font-bold text-amber-950">
                  Both substituents are currently attached to the same carbon. Change one carbon to practice typical disubstituted cases.
                </p>
              )}
            </div>
          </aside>

          <div className="rounded-3xl bg-white p-5 shadow">
            <div className="grid gap-5 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-3">
                <h2 className="mb-3 text-lg font-bold">Original chair</h2>
                <CyclohexaneDrawing flipped={false} placements={placements} view={view} />
              </div>
              <div className="rounded-2xl border border-slate-200 p-3">
                <h2 className="mb-3 text-lg font-bold">After ring flip</h2>
                <CyclohexaneDrawing flipped placements={placements} view={view} />
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
                <p className="text-sm font-bold text-amber-700">Relationship</p>
                <p className="mt-1 text-2xl font-bold text-amber-950">{relation}</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">
              <b>Important:</b> a ring flip preserves up/down stereochemistry. It only swaps axial and equatorial positions.
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
            <h2 className="text-2xl font-bold">How to read the model</h2>
            <ul className="mt-4 space-y-3 text-slate-700">
              <li className="rounded-2xl bg-slate-100 p-4"><b>Up/down:</b> defines which face of the ring the substituent occupies. Same face means cis; opposite faces means trans.</li>
              <li className="rounded-2xl bg-slate-100 p-4"><b>Axial/equatorial:</b> calculated from the carbon number and up/down direction in the current chair.</li>
              <li className="rounded-2xl bg-slate-100 p-4"><b>View direction:</b> rotates the drawing so the student can inspect the same molecule from another side.</li>
            </ul>
          </article>
        </section>
      </section>
    </main>
  );
}
