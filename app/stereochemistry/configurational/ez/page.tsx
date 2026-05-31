"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Tab = "learn" | "explore" | "quiz";
type EZAnswer = "E" | "Z" | "Not applicable";

type Substituent = {
  label: string;
  high: boolean;
  reason: string;
};

type AlkeneExample = {
  id: string;
  name: string;
  formula: string;
  answer: EZAnswer;
  leftTop: Substituent;
  leftBottom: Substituent;
  rightTop: Substituent;
  rightBottom: Substituent;
  explanation: string;
};

const examples: AlkeneExample[] = [
  {
    id: "z-two-butene",
    name: "(Z)-but-2-ene",
    formula: "CH3-CH=CH-CH3",
    answer: "Z",
    leftTop: { label: "CH3", high: true, reason: "C outranks H." },
    leftBottom: { label: "H", high: false, reason: "H has lower priority." },
    rightTop: { label: "CH3", high: true, reason: "C outranks H." },
    rightBottom: { label: "H", high: false, reason: "H has lower priority." },
    explanation: "The higher-priority CH3 groups are on the same side of the double bond, so the alkene is Z.",
  },
  {
    id: "e-two-butene",
    name: "(E)-but-2-ene",
    formula: "CH3-CH=CH-CH3",
    answer: "E",
    leftTop: { label: "CH3", high: true, reason: "C outranks H." },
    leftBottom: { label: "H", high: false, reason: "H has lower priority." },
    rightTop: { label: "H", high: false, reason: "H has lower priority." },
    rightBottom: { label: "CH3", high: true, reason: "C outranks H." },
    explanation: "The higher-priority CH3 groups are on opposite sides of the double bond, so the alkene is E.",
  },
  {
    id: "z-halogen-alkene",
    name: "(Z)-1-bromo-1-chloroprop-1-ene",
    formula: "BrC(Cl)=CH-CH3",
    answer: "Z",
    leftTop: { label: "Br", high: true, reason: "Br outranks Cl by atomic number." },
    leftBottom: { label: "Cl", high: false, reason: "Cl ranks below Br." },
    rightTop: { label: "CH3", high: true, reason: "C outranks H." },
    rightBottom: { label: "H", high: false, reason: "H has lower priority." },
    explanation: "Br and CH3 are the higher-priority groups. They are on the same side, so this alkene is Z.",
  },
  {
    id: "e-halogen-alkene",
    name: "(E)-1-bromo-1-chloroprop-1-ene",
    formula: "BrC(Cl)=CH-CH3",
    answer: "E",
    leftTop: { label: "Br", high: true, reason: "Br outranks Cl by atomic number." },
    leftBottom: { label: "Cl", high: false, reason: "Cl ranks below Br." },
    rightTop: { label: "H", high: false, reason: "H has lower priority." },
    rightBottom: { label: "CH3", high: true, reason: "C outranks H." },
    explanation: "Br and CH3 are the higher-priority groups. They are on opposite sides, so this alkene is E.",
  },
  {
    id: "not-applicable-propene",
    name: "Propene",
    formula: "CH2=CH-CH3",
    answer: "Not applicable",
    leftTop: { label: "H", high: false, reason: "The groups are identical." },
    leftBottom: { label: "H", high: false, reason: "The groups are identical." },
    rightTop: { label: "CH3", high: true, reason: "C outranks H." },
    rightBottom: { label: "H", high: false, reason: "H has lower priority." },
    explanation: "One alkene carbon has two identical H substituents. E/Z notation cannot be assigned.",
  },
];

function AlkeneModel({
  example,
  showPriorities,
}: {
  example: AlkeneExample;
  showPriorities: boolean;
}) {
  const groups = [
    { ...example.leftTop, x: 78, y: 54 },
    { ...example.leftBottom, x: 78, y: 246 },
    { ...example.rightTop, x: 342, y: 54 },
    { ...example.rightBottom, x: 342, y: 246 },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <svg viewBox="0 0 420 310" className="aspect-[42/31] w-full" aria-label={`Alkene model of ${example.name}`}>
        <rect width="420" height="310" fill="#f8fafc" />
        <line x1="157" y1="142" x2="263" y2="142" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
        <line x1="157" y1="166" x2="263" y2="166" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
        <line x1="157" y1="154" x2="94" y2="74" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
        <line x1="157" y1="154" x2="94" y2="226" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
        <line x1="263" y1="154" x2="326" y2="74" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
        <line x1="263" y1="154" x2="326" y2="226" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
        <circle cx="157" cy="154" r="28" fill="#0f172a" />
        <circle cx="263" cy="154" r="28" fill="#0f172a" />
        <text x="157" y="161" textAnchor="middle" fill="white" fontSize="20" fontWeight="700">C</text>
        <text x="263" y="161" textAnchor="middle" fill="white" fontSize="20" fontWeight="700">C</text>

        {groups.map((group, index) => (
          <g key={`${group.label}-${index}`}>
            <circle
              cx={group.x}
              cy={group.y}
              r="33"
              fill={showPriorities && group.high ? "#e11d48" : "#64748b"}
              stroke={showPriorities && group.high ? "#9f1239" : "#475569"}
              strokeWidth="3"
            />
            <text x={group.x} y={group.y + 6} textAnchor="middle" fill="white" fontSize="17" fontWeight="700">
              {group.label}
            </text>
            {showPriorities && group.high && (
              <text x={group.x + 31} y={group.y - 31} textAnchor="middle" fill="#9f1239" fontSize="16" fontWeight="700">
                high
              </text>
            )}
          </g>
        ))}
        <text x="210" y="294" textAnchor="middle" fill="#475569" fontSize="14">
          Compare the higher-priority group on each alkene carbon
        </text>
      </svg>
    </div>
  );
}

function PrioritySummary({ example }: { example: AlkeneExample }) {
  const leftGroups = [example.leftTop, example.leftBottom];
  const rightGroups = [example.rightTop, example.rightBottom];
  const leftHigh = leftGroups.find((group) => group.high);
  const rightHigh = rightGroups.find((group) => group.high);

  return (
    <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2">
      <div>
        <p className="text-sm font-bold text-slate-500">Left alkene carbon</p>
        <p className="mt-1 font-bold text-rose-700">{leftHigh ? `Higher priority: ${leftHigh.label}` : "Identical groups"}</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">{leftHigh?.reason ?? "E/Z assignment is not possible on this side."}</p>
      </div>
      <div>
        <p className="text-sm font-bold text-slate-500">Right alkene carbon</p>
        <p className="mt-1 font-bold text-rose-700">{rightHigh ? `Higher priority: ${rightHigh.label}` : "Identical groups"}</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">{rightHigh?.reason ?? "E/Z assignment is not possible on this side."}</p>
      </div>
    </div>
  );
}

export default function EZPage() {
  const [tab, setTab] = useState<Tab>("learn");
  const [exampleId, setExampleId] = useState(examples[0].id);
  const [showPriorities, setShowPriorities] = useState(true);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<EZAnswer | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  const selectedExample = useMemo(
    () => examples.find((example) => example.id === exampleId) ?? examples[0],
    [exampleId]
  );
  const question = examples[questionIndex % examples.length];

  function submitAnswer() {
    if (!selectedAnswer || revealed) return;
    if (selectedAnswer === question.answer) setScore((value) => value + 1);
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
            <Link href="/stereochemistry/configurational" className="text-sm font-bold text-rose-700 hover:text-rose-900">
              Back to configurational isomerism
            </Link>
            <h1 className="mt-2 text-4xl font-bold">E/Z Isomerism Lab</h1>
            <p className="mt-2 text-slate-600">Apply CIP rules to each carbon of an alkene double bond.</p>
          </div>
          <Link href="/stereochemistry/configurational/rs" className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:border-rose-500">
            Review CIP priorities
          </Link>
        </div>

        <div className="mt-6 flex gap-2 border-b border-slate-200">
          {tabs.map((item) => (
            <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`border-b-2 px-5 py-3 font-bold ${tab === item.id ? "border-rose-600 text-rose-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
              {item.label}
            </button>
          ))}
        </div>

        {tab === "learn" && (
          <div className="grid gap-6 py-7 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 className="text-2xl font-bold">Assign E or Z in three steps</h2>
              <ol className="mt-5 grid gap-3">
                {[
                  "Check that each alkene carbon has two different substituents.",
                  "Use CIP rules separately on the left and right alkene carbons.",
                  "Higher-priority groups on the same side give Z; opposite sides give E.",
                ].map((step, index) => (
                  <li key={step} className="flex gap-4 rounded-lg border border-slate-200 bg-white p-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 font-bold text-rose-800">{index + 1}</span>
                    <span className="leading-7 text-slate-700">{step}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 leading-7 text-amber-950">
                Cis/trans terminology works only in simpler cases. E/Z notation is the systematic method when substituents differ.
              </p>
            </div>
            <div>
              <AlkeneModel example={examples[0]} showPriorities />
              <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4 leading-7 text-rose-950">{examples[0].explanation}</p>
            </div>
          </div>
        )}

        {tab === "explore" && (
          <div className="grid gap-6 py-7 lg:grid-cols-[1fr_0.52fr]">
            <div>
              <AlkeneModel example={selectedExample} showPriorities={showPriorities} />
              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                <label className="flex items-center gap-3 text-sm font-bold text-slate-700">
                  <input type="checkbox" checked={showPriorities} onChange={(event) => setShowPriorities(event.target.checked)} className="h-4 w-4 accent-rose-600" />
                  Highlight higher-priority groups
                </label>
              </div>
              <div className="mt-4"><PrioritySummary example={selectedExample} /></div>
            </div>
            <div>
              <label htmlFor="ez-example" className="block text-sm font-bold text-slate-700">Example alkene</label>
              <select id="ez-example" value={exampleId} onChange={(event) => setExampleId(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 font-semibold">
                {examples.map((example) => <option key={example.id} value={example.id}>{example.name}</option>)}
              </select>
              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-sm font-bold text-slate-500">Condensed formula</p>
                <p className="mt-1 font-bold">{selectedExample.formula}</p>
                <p className="mt-4 text-sm font-bold text-slate-500">Assignment</p>
                <p className="mt-1 text-3xl font-bold text-rose-700">{selectedExample.answer}</p>
              </div>
              <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4 leading-7 text-rose-950">{selectedExample.explanation}</p>
            </div>
          </div>
        )}

        {tab === "quiz" && (
          <div className="grid gap-6 py-7 lg:grid-cols-[1fr_0.5fr]">
            <div>
              <AlkeneModel example={question} showPriorities={false} />
            </div>
            <div>
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold uppercase text-rose-700">Question {questionIndex + 1} of {examples.length}</p>
                  <p className="text-sm font-bold text-slate-700">Score: {score}</p>
                </div>
                <h2 className="mt-4 text-2xl font-bold">{question.formula}</h2>
                <p className="mt-4 leading-7 text-slate-700">Choose the correct alkene assignment.</p>
                <div className="mt-5 grid gap-3">
                  {(["E", "Z", "Not applicable"] as EZAnswer[]).map((answer) => (
                    <button key={answer} type="button" onClick={() => !revealed && setSelectedAnswer(answer)} className={`rounded-lg border px-5 py-4 text-lg font-bold ${selectedAnswer === answer ? "border-rose-600 bg-rose-50 text-rose-800" : "border-slate-300 bg-white hover:border-rose-500"}`}>
                      {answer}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={submitAnswer} disabled={!selectedAnswer || revealed} className="mt-4 w-full rounded-lg bg-rose-700 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
                  Check answer
                </button>
              </div>
              {revealed && (
                <div className={`mt-4 rounded-lg border p-5 ${selectedAnswer === question.answer ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50"}`}>
                  <p className="text-xl font-bold">{selectedAnswer === question.answer ? "Correct" : `Correct answer: ${question.answer}`}</p>
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
