"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Tab = "learn" | "explore" | "quiz";
type Relation = "Diastereomers" | "Enantiomers" | "Identical";
type BondDirection = "wedge" | "dash";

type StereoCenter = {
  label: string;
  configuration: "R" | "S";
  direction: BondDirection;
};

type Structure = {
  name: string;
  left: StereoCenter;
  right: StereoCenter;
  terminalLeft: string;
  terminalRight: string;
  substituent: string;
  lowerGroup: string;
};

type PairExample = {
  id: string;
  title: string;
  formula: string;
  a: Structure;
  b: Structure;
  relation: Relation;
  meso: boolean;
  explanation: string;
};

const examples: PairExample[] = [
  {
    id: "dichlorobutane-diastereomers",
    title: "2,3-Dichlorobutane: one center changes",
    formula: "CH3-CH(Cl)-CH(Cl)-CH3",
    a: {
      name: "(2R,3R)-2,3-dichlorobutane",
      left: { label: "C2", configuration: "R", direction: "wedge" },
      right: { label: "C3", configuration: "R", direction: "wedge" },
      terminalLeft: "CH3",
      terminalRight: "CH3",
      substituent: "Cl",
      lowerGroup: "H",
    },
    b: {
      name: "(2R,3S)-2,3-dichlorobutane",
      left: { label: "C2", configuration: "R", direction: "wedge" },
      right: { label: "C3", configuration: "S", direction: "dash" },
      terminalLeft: "CH3",
      terminalRight: "CH3",
      substituent: "Cl",
      lowerGroup: "H",
    },
    relation: "Diastereomers",
    meso: true,
    explanation: "Only C3 changes configuration. The structures are stereoisomers but not mirror images, so they are diastereomers. The (2R,3S) form is meso.",
  },
  {
    id: "dichlorobutane-enantiomers",
    title: "2,3-Dichlorobutane: both centers change",
    formula: "CH3-CH(Cl)-CH(Cl)-CH3",
    a: {
      name: "(2R,3R)-2,3-dichlorobutane",
      left: { label: "C2", configuration: "R", direction: "wedge" },
      right: { label: "C3", configuration: "R", direction: "wedge" },
      terminalLeft: "CH3",
      terminalRight: "CH3",
      substituent: "Cl",
      lowerGroup: "H",
    },
    b: {
      name: "(2S,3S)-2,3-dichlorobutane",
      left: { label: "C2", configuration: "S", direction: "dash" },
      right: { label: "C3", configuration: "S", direction: "dash" },
      terminalLeft: "CH3",
      terminalRight: "CH3",
      substituent: "Cl",
      lowerGroup: "H",
    },
    relation: "Enantiomers",
    meso: false,
    explanation: "Both stereogenic centers invert. The structures are non-superimposable mirror images, so they are enantiomers.",
  },
  {
    id: "tartaric-meso",
    title: "Tartaric acid: meso form",
    formula: "HOOC-CH(OH)-CH(OH)-COOH",
    a: {
      name: "(2R,3R)-tartaric acid",
      left: { label: "C2", configuration: "R", direction: "wedge" },
      right: { label: "C3", configuration: "R", direction: "wedge" },
      terminalLeft: "COOH",
      terminalRight: "COOH",
      substituent: "OH",
      lowerGroup: "H",
    },
    b: {
      name: "meso-(2R,3S)-tartaric acid",
      left: { label: "C2", configuration: "R", direction: "wedge" },
      right: { label: "C3", configuration: "S", direction: "dash" },
      terminalLeft: "COOH",
      terminalRight: "COOH",
      substituent: "OH",
      lowerGroup: "H",
    },
    relation: "Diastereomers",
    meso: true,
    explanation: "The meso form contains stereogenic centers but has an internal plane of symmetry. It is achiral and is a diastereomer of the (2R,3R) form.",
  },
  {
    id: "identical-control",
    title: "Identical control: same configuration twice",
    formula: "CH3-CH(Cl)-CH(Cl)-CH3",
    a: {
      name: "(2R,3R)-2,3-dichlorobutane",
      left: { label: "C2", configuration: "R", direction: "wedge" },
      right: { label: "C3", configuration: "R", direction: "wedge" },
      terminalLeft: "CH3",
      terminalRight: "CH3",
      substituent: "Cl",
      lowerGroup: "H",
    },
    b: {
      name: "(2R,3R)-2,3-dichlorobutane",
      left: { label: "C2", configuration: "R", direction: "wedge" },
      right: { label: "C3", configuration: "R", direction: "wedge" },
      terminalLeft: "CH3",
      terminalRight: "CH3",
      substituent: "Cl",
      lowerGroup: "H",
    },
    relation: "Identical",
    meso: false,
    explanation: "The configurations at both centers are unchanged. These drawings represent the same stereoisomer.",
  },
];

function StereoBond({
  x,
  y,
  direction,
  upward,
}: {
  x: number;
  y: number;
  direction: BondDirection;
  upward: boolean;
}) {
  const endY = upward ? y - 74 : y + 74;

  if (direction === "wedge") {
    return <polygon points={`${x},${y} ${x - 15},${endY} ${x + 15},${endY}`} fill="#334155" />;
  }

  const sign = upward ? -1 : 1;
  return (
    <g stroke="#64748b" strokeWidth="3">
      {[1, 2, 3, 4].map((step) => (
        <line key={step} x1={x - step * 3} y1={y + sign * step * 13} x2={x + step * 3} y2={y + sign * step * 13} />
      ))}
    </g>
  );
}

function StructureModel({ structure }: { structure: Structure }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <svg viewBox="0 0 470 250" className="aspect-[47/25] w-full" aria-label={structure.name}>
        <rect width="470" height="250" fill="#f8fafc" />
        <line x1="64" y1="126" x2="176" y2="126" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
        <line x1="176" y1="126" x2="294" y2="126" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
        <line x1="294" y1="126" x2="406" y2="126" stroke="#334155" strokeWidth="6" strokeLinecap="round" />

        <StereoBond x={176} y={126} direction={structure.left.direction} upward />
        <StereoBond x={294} y={126} direction={structure.right.direction} upward />
        <line x1="176" y1="126" x2="176" y2="202" stroke="#64748b" strokeWidth="3" strokeDasharray="7 7" />
        <line x1="294" y1="126" x2="294" y2="202" stroke="#64748b" strokeWidth="3" strokeDasharray="7 7" />

        <text x="30" y="134" fill="#0f172a" fontSize="20" fontWeight="700">{structure.terminalLeft}</text>
        <text x="415" y="134" fill="#0f172a" fontSize="20" fontWeight="700">{structure.terminalRight}</text>
        <text x="156" y="44" fill="#7c3aed" fontSize="20" fontWeight="700">{structure.substituent}</text>
        <text x="274" y="44" fill="#7c3aed" fontSize="20" fontWeight="700">{structure.substituent}</text>
        <text x="162" y="229" fill="#64748b" fontSize="18" fontWeight="700">{structure.lowerGroup}</text>
        <text x="280" y="229" fill="#64748b" fontSize="18" fontWeight="700">{structure.lowerGroup}</text>
        <text x="154" y="112" fill="#0f172a" fontSize="15" fontWeight="700">{structure.left.label}</text>
        <text x="300" y="112" fill="#0f172a" fontSize="15" fontWeight="700">{structure.right.label}</text>
        <text x="147" y="168" fill="#059669" fontSize="18" fontWeight="700">{structure.left.configuration}</text>
        <text x="303" y="168" fill="#059669" fontSize="18" fontWeight="700">{structure.right.configuration}</text>
      </svg>
      <p className="mt-2 text-center text-sm font-bold text-slate-700">{structure.name}</p>
    </div>
  );
}

function PairModels({ example }: { example: PairExample }) {
  return (
    <div className="grid gap-4">
      <StructureModel structure={example.a} />
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-violet-200" />
        <span className="text-xs font-bold uppercase text-violet-700">Compare configurations</span>
        <div className="h-px flex-1 bg-violet-200" />
      </div>
      <StructureModel structure={example.b} />
    </div>
  );
}

export default function DiastereomersPage() {
  const [tab, setTab] = useState<Tab>("learn");
  const [exampleId, setExampleId] = useState(examples[0].id);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<Relation | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  const selectedExample = useMemo(
    () => examples.find((example) => example.id === exampleId) ?? examples[0],
    [exampleId]
  );
  const question = examples[questionIndex % examples.length];

  function submitAnswer() {
    if (!selectedAnswer || revealed) return;
    if (selectedAnswer === question.relation) setScore((value) => value + 1);
    setRevealed(true);
  }

  function nextQuestion() {
    setQuestionIndex((value) => (value + 1) % examples.length);
    setSelectedAnswer(null);
    setRevealed(false);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "learn", label: "Learn" },
    { id: "explore", label: "Explore" },
    { id: "quiz", label: "Quiz" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <Link href="/stereochemistry/configurational" className="text-sm font-bold text-violet-700 hover:text-violet-900">
              Back to configurational isomerism
            </Link>
            <h1 className="mt-2 text-4xl font-bold">Diastereomers Lab</h1>
            <p className="mt-2 text-slate-600">Compare stereoisomers with more than one stereogenic center.</p>
          </div>
          <Link href="/stereochemistry/configurational/enantiomers" className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:border-violet-500">
            Review enantiomers
          </Link>
        </div>

        <div className="mt-6 flex gap-2 border-b border-slate-200">
          {tabs.map((item) => (
            <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`border-b-2 px-5 py-3 font-bold ${tab === item.id ? "border-violet-600 text-violet-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
              {item.label}
            </button>
          ))}
        </div>

        {tab === "learn" && (
          <div className="grid gap-6 py-7 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 className="text-2xl font-bold">Classify a stereoisomeric relationship</h2>
              <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white">
                {[
                  ["All stereocenters invert", "Enantiomers"],
                  ["Some, but not all, stereocenters invert", "Diastereomers"],
                  ["No stereocenters change", "Identical"],
                ].map(([condition, result]) => (
                  <div key={condition} className="grid grid-cols-[1.4fr_0.8fr] gap-3 border-b border-slate-200 p-4 last:border-b-0">
                    <p className="leading-7 text-slate-700">{condition}</p>
                    <p className="font-bold text-violet-700">{result}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 leading-7 text-amber-950">
                A meso compound contains stereogenic centers but is achiral because it has an internal plane of symmetry.
              </p>
            </div>
            <div>
              <PairModels example={examples[0]} />
              <p className="mt-4 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7 text-violet-950">{examples[0].explanation}</p>
            </div>
          </div>
        )}

        {tab === "explore" && (
          <div className="grid gap-6 py-7 lg:grid-cols-[1fr_0.42fr]">
            <PairModels example={selectedExample} />
            <div>
              <label htmlFor="diastereomer-example" className="block text-sm font-bold text-slate-700">Example pair</label>
              <select id="diastereomer-example" value={exampleId} onChange={(event) => setExampleId(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 font-semibold">
                {examples.map((example) => <option key={example.id} value={example.id}>{example.title}</option>)}
              </select>
              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-sm font-bold text-slate-500">Formula</p>
                <p className="mt-1 font-bold">{selectedExample.formula}</p>
                <p className="mt-4 text-sm font-bold text-slate-500">Relationship</p>
                <p className="mt-1 text-2xl font-bold text-violet-700">{selectedExample.relation}</p>
                {selectedExample.meso && <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm font-bold text-amber-900">Includes a meso form</p>}
              </div>
              <p className="mt-4 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7 text-violet-950">{selectedExample.explanation}</p>
            </div>
          </div>
        )}

        {tab === "quiz" && (
          <div className="grid gap-6 py-7 lg:grid-cols-[1fr_0.52fr]">
            <PairModels example={question} />
            <div>
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold uppercase text-violet-700">Question {questionIndex + 1} of {examples.length}</p>
                  <p className="text-sm font-bold text-slate-700">Score: {score}</p>
                </div>
                <h2 className="mt-4 text-2xl font-bold">{question.formula}</h2>
                <p className="mt-4 leading-7 text-slate-700">What is the relationship between structure A and structure B?</p>
                <div className="mt-5 grid gap-3">
                  {(["Diastereomers", "Enantiomers", "Identical"] as Relation[]).map((answer) => (
                    <button key={answer} type="button" onClick={() => !revealed && setSelectedAnswer(answer)} className={`rounded-lg border px-5 py-4 text-lg font-bold ${selectedAnswer === answer ? "border-violet-600 bg-violet-50 text-violet-800" : "border-slate-300 bg-white hover:border-violet-500"}`}>
                      {answer}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={submitAnswer} disabled={!selectedAnswer || revealed} className="mt-4 w-full rounded-lg bg-violet-700 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
                  Check answer
                </button>
              </div>
              {revealed && (
                <div className={`mt-4 rounded-lg border p-5 ${selectedAnswer === question.relation ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50"}`}>
                  <p className="text-xl font-bold">{selectedAnswer === question.relation ? "Correct" : `Correct answer: ${question.relation}`}</p>
                  <p className="mt-2 leading-7 text-slate-700">{question.explanation}</p>
                  <button type="button" onClick={nextQuestion} className="mt-4 rounded-lg bg-slate-900 px-5 py-3 font-bold text-white">Next question</button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
