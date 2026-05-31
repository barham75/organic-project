"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Tab = "learn" | "explore" | "quiz";
type PairType = "Enantiomers" | "Identical";

type Group = {
  label: string;
  color: string;
};

type PairExample = {
  id: string;
  name: string;
  formula: string;
  leftConfiguration: string;
  rightConfiguration: string;
  groups: Group[];
  pairType: PairType;
  explanation: string;
};

const examples: PairExample[] = [
  {
    id: "lactic-acid",
    name: "Lactic acid",
    formula: "CH3-CH(OH)-COOH",
    leftConfiguration: "R",
    rightConfiguration: "S",
    groups: [
      { label: "OH", color: "#dc2626" },
      { label: "COOH", color: "#7c3aed" },
      { label: "CH3", color: "#0369a1" },
      { label: "H", color: "#64748b" },
    ],
    pairType: "Enantiomers",
    explanation: "The two structures are mirror images with opposite configurations at the only stereogenic center: R and S.",
  },
  {
    id: "two-butanol",
    name: "2-Butanol",
    formula: "CH3-CH(OH)-CH2CH3",
    leftConfiguration: "R",
    rightConfiguration: "S",
    groups: [
      { label: "OH", color: "#dc2626" },
      { label: "Et", color: "#7c3aed" },
      { label: "Me", color: "#0369a1" },
      { label: "H", color: "#64748b" },
    ],
    pairType: "Enantiomers",
    explanation: "The mirror image inverts the single stereogenic center. Rotation cannot superimpose the two structures.",
  },
  {
    id: "alanine",
    name: "Alanine",
    formula: "NH2-CH(CH3)-COOH",
    leftConfiguration: "S",
    rightConfiguration: "R",
    groups: [
      { label: "NH2", color: "#2563eb" },
      { label: "COOH", color: "#7c3aed" },
      { label: "CH3", color: "#0369a1" },
      { label: "H", color: "#64748b" },
    ],
    pairType: "Enantiomers",
    explanation: "Alanine is chiral because the alpha carbon is attached to four different groups. Its mirror image has the opposite configuration.",
  },
  {
    id: "ethanol-control",
    name: "Ethanol control",
    formula: "CH3-CH2-OH",
    leftConfiguration: "Achiral",
    rightConfiguration: "Achiral",
    groups: [
      { label: "OH", color: "#dc2626" },
      { label: "CH3", color: "#0369a1" },
      { label: "H", color: "#64748b" },
      { label: "H", color: "#64748b" },
    ],
    pairType: "Identical",
    explanation: "This carbon has two identical hydrogen atoms. It is not stereogenic, so the mirror image is superimposable and identical.",
  },
];

function MoleculeModel({
  example,
  mirrored,
  rotation,
  showLabels = true,
}: {
  example: PairExample;
  mirrored: boolean;
  rotation: number;
  showLabels?: boolean;
}) {
  const points = [
    { x: 136, y: 52 },
    { x: 228, y: 185 },
    { x: 45, y: 185 },
  ];
  const scaleX = mirrored ? -1 : 1;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <svg viewBox="0 0 274 270" className="aspect-square w-full" aria-label={`${mirrored ? "Mirror image" : "Original"} model of ${example.name}`}>
        <rect width="274" height="270" fill="#f8fafc" />
        <g style={{ transform: `translateX(137px) rotate(${rotation}deg) scaleX(${scaleX}) translateX(-137px)`, transformOrigin: "137px 135px" }}>
          <line x1="137" y1="130" x2={points[0].x} y2={points[0].y} stroke="#334155" strokeWidth="6" strokeLinecap="round" />
          <line x1="137" y1="130" x2={points[1].x} y2={points[1].y} stroke="#334155" strokeWidth="6" strokeLinecap="round" />
          <polygon points="137,130 34,174 54,202" fill="#334155" />
          <g stroke="#64748b" strokeWidth="3">
            <line x1="137" y1="130" x2="141" y2="148" />
            <line x1="137" y1="134" x2="145" y2="171" />
            <line x1="137" y1="138" x2="149" y2="194" />
            <line x1="137" y1="142" x2="153" y2="217" />
          </g>

          {example.groups.slice(0, 3).map((group, index) => (
            <g key={`${group.label}-${index}`}>
              <circle cx={points[index].x} cy={points[index].y} r="28" fill={group.color} />
              <text x={points[index].x} y={points[index].y + 6} textAnchor="middle" fill="white" fontSize="16" fontWeight="700">
                {showLabels ? group.label : "?"}
              </text>
            </g>
          ))}
          <circle cx="155" cy="222" r="27" fill={example.groups[3].color} />
          <text x="155" y="228" textAnchor="middle" fill="white" fontSize="16" fontWeight="700">
            {showLabels ? example.groups[3].label : "?"}
          </text>
          <circle cx="137" cy="130" r="31" fill="#0f172a" />
          <text x="137" y="137" textAnchor="middle" fill="white" fontSize="18" fontWeight="700">C*</text>
        </g>
      </svg>
    </div>
  );
}

function MirrorPair({
  example,
  rotation,
  showLabels = true,
}: {
  example: PairExample;
  rotation: number;
  showLabels?: boolean;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
      <div>
        <p className="mb-2 text-center text-sm font-bold text-slate-600">Original: {example.leftConfiguration}</p>
        <MoleculeModel example={example} mirrored={false} rotation={rotation} showLabels={showLabels} />
      </div>
      <div className="flex items-center justify-center text-center">
        <div>
          <div className="mx-auto h-20 w-px bg-cyan-500 md:h-44" />
          <p className="mt-2 text-xs font-bold uppercase text-cyan-700">Mirror</p>
        </div>
      </div>
      <div>
        <p className="mb-2 text-center text-sm font-bold text-slate-600">Mirror image: {example.rightConfiguration}</p>
        <MoleculeModel example={example} mirrored rotation={rotation} showLabels={showLabels} />
      </div>
    </div>
  );
}

export default function EnantiomersPage() {
  const [tab, setTab] = useState<Tab>("learn");
  const [exampleId, setExampleId] = useState(examples[0].id);
  const [rotation, setRotation] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<PairType | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  const selectedExample = useMemo(
    () => examples.find((example) => example.id === exampleId) ?? examples[0],
    [exampleId]
  );
  const question = examples[questionIndex % examples.length];

  function submitAnswer() {
    if (!selectedAnswer || revealed) return;
    if (selectedAnswer === question.pairType) setScore((value) => value + 1);
    setRevealed(true);
  }

  function nextQuestion() {
    setQuestionIndex((value) => (value + 1) % examples.length);
    setSelectedAnswer(null);
    setRevealed(false);
    setRotation(0);
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
            <Link href="/stereochemistry/configurational" className="text-sm font-bold text-cyan-700 hover:text-cyan-900">
              Back to configurational isomerism
            </Link>
            <h1 className="mt-2 text-4xl font-bold">Enantiomers Lab</h1>
            <p className="mt-2 text-slate-600">Compare mirror images and decide whether they are non-superimposable.</p>
          </div>
          <Link href="/stereochemistry/configurational/rs" className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:border-cyan-500">
            Review R/S configuration
          </Link>
        </div>

        <div className="mt-6 flex gap-2 border-b border-slate-200">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`border-b-2 px-5 py-3 font-bold ${
                tab === item.id ? "border-cyan-600 text-cyan-700" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === "learn" && (
          <div className="grid gap-6 py-7 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 className="text-2xl font-bold">What makes an enantiomeric pair?</h2>
              <ul className="mt-5 grid gap-3">
                {[
                  "The two structures are mirror images.",
                  "They are not superimposable by rotation in three-dimensional space.",
                  "For a molecule with one stereogenic center, an R structure and its S mirror image are enantiomers.",
                  "A carbon with two identical groups is not stereogenic; its mirror image is identical.",
                ].map((item) => (
                  <li key={item} className="rounded-lg border border-slate-200 bg-white p-4 leading-7 text-slate-700">{item}</li>
                ))}
              </ul>
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 leading-7 text-amber-950">
                Important: the sign of optical rotation, (+) or (-), cannot be predicted from R or S alone. It must be measured experimentally.
              </p>
            </div>
            <div>
              <MirrorPair example={examples[0]} rotation={0} />
              <p className="mt-3 rounded-lg border border-cyan-200 bg-cyan-50 p-4 leading-7 text-cyan-950">{examples[0].explanation}</p>
            </div>
          </div>
        )}

        {tab === "explore" && (
          <div className="grid gap-6 py-7 lg:grid-cols-[1fr_0.42fr]">
            <div>
              <MirrorPair example={selectedExample} rotation={rotation} />
              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <label htmlFor="mirror-rotation" className="font-bold">Rotate both models</label>
                  <span className="text-sm font-bold text-slate-600">{rotation}°</span>
                </div>
                <input id="mirror-rotation" type="range" min="-180" max="180" value={rotation} onChange={(event) => setRotation(Number(event.target.value))} className="mt-3 w-full accent-cyan-600" />
              </div>
            </div>
            <div>
              <label htmlFor="enantiomer-example" className="block text-sm font-bold text-slate-700">Example pair</label>
              <select id="enantiomer-example" value={exampleId} onChange={(event) => { setExampleId(event.target.value); setRotation(0); }} className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 font-semibold">
                {examples.map((example) => <option key={example.id} value={example.id}>{example.name}</option>)}
              </select>
              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-sm font-bold text-slate-500">Condensed formula</p>
                <p className="mt-1 font-bold">{selectedExample.formula}</p>
                <p className="mt-4 text-sm font-bold text-slate-500">Relationship</p>
                <p className="mt-1 text-2xl font-bold text-cyan-700">{selectedExample.pairType}</p>
              </div>
              <p className="mt-4 rounded-lg border border-cyan-200 bg-cyan-50 p-4 leading-7 text-cyan-950">{selectedExample.explanation}</p>
            </div>
          </div>
        )}

        {tab === "quiz" && (
          <div className="grid gap-6 py-7 lg:grid-cols-[1fr_0.56fr]">
            <MirrorPair example={question} rotation={rotation} />
            <div>
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold uppercase text-cyan-700">Question {questionIndex + 1} of {examples.length}</p>
                  <p className="text-sm font-bold text-slate-700">Score: {score}</p>
                </div>
                <h2 className="mt-4 text-2xl font-bold">{question.name}</h2>
                <p className="mt-1 font-semibold text-slate-600">{question.formula}</p>
                <p className="mt-5 leading-7 text-slate-700">What is the relationship between the displayed structures?</p>
                <div className="mt-5 grid gap-3">
                  {(["Enantiomers", "Identical"] as PairType[]).map((answer) => (
                    <button key={answer} type="button" onClick={() => !revealed && setSelectedAnswer(answer)} className={`rounded-lg border px-5 py-4 text-lg font-bold ${selectedAnswer === answer ? "border-cyan-600 bg-cyan-50 text-cyan-800" : "border-slate-300 bg-white hover:border-cyan-500"}`}>
                      {answer}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={submitAnswer} disabled={!selectedAnswer || revealed} className="mt-4 w-full rounded-lg bg-cyan-700 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
                  Check answer
                </button>
              </div>
              {revealed && (
                <div className={`mt-4 rounded-lg border p-5 ${selectedAnswer === question.pairType ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50"}`}>
                  <p className="text-xl font-bold">{selectedAnswer === question.pairType ? "Correct" : `Correct answer: ${question.pairType}`}</p>
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
