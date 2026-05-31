"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Configuration = "R" | "S";
type Tab = "learn" | "explore" | "quiz";

type Group = {
  label: string;
  priority: number;
  color: string;
  reason: string;
};

type Example = {
  id: string;
  name: string;
  formula: string;
  configuration: Configuration;
  groups: Group[];
  explanation: string;
};

const examples: Example[] = [
  {
    id: "bromochlorofluoromethane",
    name: "Bromochlorofluoromethane",
    formula: "CHBrClF",
    configuration: "R",
    groups: [
      { label: "Br", priority: 1, color: "#b45309", reason: "Br has the highest atomic number." },
      { label: "Cl", priority: 2, color: "#15803d", reason: "Cl ranks below Br and above F." },
      { label: "F", priority: 3, color: "#0284c7", reason: "F ranks above H." },
      { label: "H", priority: 4, color: "#64748b", reason: "H has the lowest atomic number." },
    ],
    explanation: "With H pointing away, the sequence Br → Cl → F is clockwise, so the center is R.",
  },
  {
    id: "lactic-acid",
    name: "Lactic acid",
    formula: "CH3-CH(OH)-COOH",
    configuration: "S",
    groups: [
      { label: "OH", priority: 1, color: "#dc2626", reason: "The directly attached O outranks C and H." },
      { label: "COOH", priority: 2, color: "#7c3aed", reason: "Among carbon groups, COOH outranks CH3 at the first point of difference." },
      { label: "CH3", priority: 3, color: "#0369a1", reason: "CH3 ranks below COOH." },
      { label: "H", priority: 4, color: "#64748b", reason: "H is the lowest-priority group." },
    ],
    explanation: "With H pointing away, the sequence OH → COOH → CH3 is counterclockwise, so the center is S.",
  },
  {
    id: "two-butanol",
    name: "2-Butanol",
    formula: "CH3-CH(OH)-CH2CH3",
    configuration: "R",
    groups: [
      { label: "OH", priority: 1, color: "#dc2626", reason: "O outranks C and H." },
      { label: "CH2CH3", priority: 2, color: "#7c3aed", reason: "Ethyl outranks methyl at the first point of difference." },
      { label: "CH3", priority: 3, color: "#0369a1", reason: "Methyl ranks below ethyl." },
      { label: "H", priority: 4, color: "#64748b", reason: "H is the lowest-priority group." },
    ],
    explanation: "With H pointing away, the sequence OH → CH2CH3 → CH3 is clockwise, so the center is R.",
  },
  {
    id: "alanine",
    name: "Alanine",
    formula: "NH2-CH(CH3)-COOH",
    configuration: "S",
    groups: [
      { label: "NH2", priority: 1, color: "#2563eb", reason: "N outranks C and H." },
      { label: "COOH", priority: 2, color: "#7c3aed", reason: "COOH outranks CH3 at the first point of difference." },
      { label: "CH3", priority: 3, color: "#0369a1", reason: "CH3 is the lower-priority carbon group." },
      { label: "H", priority: 4, color: "#64748b", reason: "H is the lowest-priority group." },
    ],
    explanation: "With H pointing away, the sequence NH2 → COOH → CH3 is counterclockwise, so this model is S.",
  },
];

function positions(configuration: Configuration) {
  return configuration === "R"
    ? [
        { x: 210, y: 58 },
        { x: 325, y: 248 },
        { x: 95, y: 248 },
      ]
    : [
        { x: 210, y: 58 },
        { x: 95, y: 248 },
        { x: 325, y: 248 },
      ];
}

function TetrahedralModel({
  example,
  rotation,
  showPriorities,
}: {
  example: Example;
  rotation: number;
  showPriorities: boolean;
}) {
  const visibleGroups = example.groups.slice(0, 3);
  const coords = positions(example.configuration);
  const center = { x: 210, y: 164 };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <svg viewBox="0 0 420 330" className="aspect-[21/16] w-full" aria-label={`Tetrahedral model of ${example.name}`}>
        <rect width="420" height="330" fill="#f8fafc" />
        <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: "210px 164px" }}>
          <line x1={center.x} y1={center.y} x2={coords[0].x} y2={coords[0].y} stroke="#334155" strokeWidth="7" strokeLinecap="round" />
          <line x1={center.x} y1={center.y} x2={coords[1].x} y2={coords[1].y} stroke="#334155" strokeWidth="7" strokeLinecap="round" />
          <polygon points="210,164 80,232 108,264" fill="#334155" opacity="0.95" />
          <g stroke="#64748b" strokeWidth="3">
            <line x1="210" y1="164" x2="214" y2="184" />
            <line x1="208" y1="168" x2="219" y2="207" />
            <line x1="206" y1="173" x2="224" y2="231" />
            <line x1="204" y1="178" x2="229" y2="255" />
          </g>

          {visibleGroups.map((group, index) => (
            <g key={`${group.label}-${group.priority}`}>
              <circle cx={coords[index].x} cy={coords[index].y} r="31" fill={group.color} />
              <text x={coords[index].x} y={coords[index].y + 7} textAnchor="middle" fill="white" fontSize="20" fontWeight="700">
                {group.label}
              </text>
              {showPriorities && (
                <text x={coords[index].x + 26} y={coords[index].y - 25} textAnchor="middle" fill="#0f172a" fontSize="18" fontWeight="700">
                  {group.priority}
                </text>
              )}
            </g>
          ))}

          <circle cx="232" cy="265" r="27" fill={example.groups[3].color} />
          <text x="232" y="272" textAnchor="middle" fill="white" fontSize="20" fontWeight="700">
            {example.groups[3].label}
          </text>
          {showPriorities && (
            <text x="262" y="255" textAnchor="middle" fill="#0f172a" fontSize="18" fontWeight="700">
              4
            </text>
          )}

          <circle cx={center.x} cy={center.y} r="35" fill="#0f172a" />
          <text x={center.x} y={center.y + 7} textAnchor="middle" fill="white" fontSize="20" fontWeight="700">
            C*
          </text>
        </g>
        <text x="18" y="306" fill="#475569" fontSize="14">
          Solid wedge: toward viewer · dashed bond: away from viewer
        </text>
      </svg>
    </div>
  );
}

function PriorityTable({ example }: { example: Example }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Group</th>
            <th className="px-4 py-3">Reason</th>
          </tr>
        </thead>
        <tbody>
          {example.groups.map((group) => (
            <tr key={`${group.label}-${group.priority}`} className="border-t border-slate-200">
              <td className="px-4 py-3 font-bold">{group.priority}</td>
              <td className="px-4 py-3 font-bold" style={{ color: group.color }}>
                {group.label}
              </td>
              <td className="px-4 py-3 text-slate-600">{group.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function RSConfigurationPage() {
  const [tab, setTab] = useState<Tab>("learn");
  const [exampleId, setExampleId] = useState(examples[0].id);
  const [rotation, setRotation] = useState(0);
  const [showPriorities, setShowPriorities] = useState(true);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<Configuration | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  const selectedExample = useMemo(
    () => examples.find((example) => example.id === exampleId) ?? examples[0],
    [exampleId]
  );
  const question = examples[questionIndex % examples.length];

  function submitAnswer() {
    if (!selectedAnswer || revealed) return;
    if (selectedAnswer === question.configuration) setScore((value) => value + 1);
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
          <div>
            <Link href="/stereochemistry/configurational" className="text-sm font-bold text-emerald-700 hover:text-emerald-900">
              Back to configurational isomerism
            </Link>
            <h1 className="mt-2 text-4xl font-bold">R/S Configuration Lab</h1>
            <p className="mt-2 text-slate-600">Assign absolute configuration using the Cahn-Ingold-Prelog priority rules.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">
            Lowest priority group is shown pointing away
          </div>
        </div>

        <div className="mt-6 flex gap-2 border-b border-slate-200">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`border-b-2 px-5 py-3 font-bold ${
                tab === item.id ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === "learn" && (
          <div className="grid gap-6 py-7 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <h2 className="text-2xl font-bold">How to assign R or S</h2>
              <ol className="mt-5 grid gap-3">
                {[
                  "Rank the four groups using CIP rules. Higher atomic number gets higher priority.",
                  "When the directly attached atoms tie, move outward until the first point of difference.",
                  "Orient priority 4 away from the viewer. In this lab it is the dashed bond.",
                  "Trace 1 → 2 → 3. Clockwise is R; counterclockwise is S.",
                ].map((step, index) => (
                  <li key={step} className="flex gap-4 rounded-lg border border-slate-200 bg-white p-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
                      {index + 1}
                    </span>
                    <span className="leading-7 text-slate-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <TetrahedralModel example={examples[0]} rotation={0} showPriorities />
              <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 leading-7 text-emerald-950">
                {examples[0].explanation}
              </p>
            </div>
          </div>
        )}

        {tab === "explore" && (
          <div className="grid gap-6 py-7 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <TetrahedralModel example={selectedExample} rotation={rotation} showPriorities={showPriorities} />
              <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <label htmlFor="rotation" className="font-bold">Rotate model</label>
                  <span className="text-sm font-bold text-slate-600">{rotation}°</span>
                </div>
                <input
                  id="rotation"
                  type="range"
                  min="-180"
                  max="180"
                  value={rotation}
                  onChange={(event) => setRotation(Number(event.target.value))}
                  className="w-full accent-emerald-600"
                />
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={showPriorities}
                    onChange={(event) => setShowPriorities(event.target.checked)}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  Show CIP priorities
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="example" className="block text-sm font-bold text-slate-700">Example compound</label>
              <select
                id="example"
                value={exampleId}
                onChange={(event) => {
                  setExampleId(event.target.value);
                  setRotation(0);
                }}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 font-semibold"
              >
                {examples.map((example) => (
                  <option key={example.id} value={example.id}>{example.name}</option>
                ))}
              </select>
              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-sm font-bold text-slate-500">Condensed formula</p>
                <p className="mt-1 text-xl font-bold">{selectedExample.formula}</p>
                <p className="mt-3 text-sm font-bold text-slate-500">Configuration</p>
                <p className="mt-1 text-3xl font-bold text-emerald-700">{selectedExample.configuration}</p>
              </div>
              <div className="mt-4"><PriorityTable example={selectedExample} /></div>
              <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 leading-7 text-emerald-950">
                {selectedExample.explanation}
              </p>
            </div>
          </div>
        )}

        {tab === "quiz" && (
          <div className="grid gap-6 py-7 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <TetrahedralModel example={question} rotation={rotation} showPriorities />
              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <label htmlFor="quiz-rotation" className="font-bold">Rotate model</label>
                  <span className="text-sm font-bold text-slate-600">{rotation}°</span>
                </div>
                <input
                  id="quiz-rotation"
                  type="range"
                  min="-180"
                  max="180"
                  value={rotation}
                  onChange={(event) => setRotation(Number(event.target.value))}
                  className="mt-3 w-full accent-emerald-600"
                />
              </div>
            </div>
            <div>
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold uppercase text-emerald-700">Question {questionIndex + 1} of {examples.length}</p>
                  <p className="text-sm font-bold text-slate-700">Score: {score}</p>
                </div>
                <h2 className="mt-4 text-2xl font-bold">{question.name}</h2>
                <p className="mt-1 font-semibold text-slate-600">{question.formula}</p>
                <p className="mt-5 leading-7 text-slate-700">What is the absolute configuration of the stereogenic center?</p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {(["R", "S"] as Configuration[]).map((answer) => (
                    <button
                      key={answer}
                      type="button"
                      onClick={() => !revealed && setSelectedAnswer(answer)}
                      className={`rounded-lg border px-5 py-4 text-2xl font-bold ${
                        selectedAnswer === answer
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                          : "border-slate-300 bg-white text-slate-800 hover:border-emerald-500"
                      }`}
                    >
                      {answer}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={submitAnswer}
                  disabled={!selectedAnswer || revealed}
                  className="mt-4 w-full rounded-lg bg-emerald-600 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Check answer
                </button>
              </div>

              {revealed && (
                <div className={`mt-4 rounded-lg border p-5 ${selectedAnswer === question.configuration ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50"}`}>
                  <p className="text-xl font-bold">
                    {selectedAnswer === question.configuration ? "Correct" : `Correct answer: ${question.configuration}`}
                  </p>
                  <p className="mt-2 leading-7 text-slate-700">{question.explanation}</p>
                  <button type="button" onClick={nextQuestion} className="mt-4 rounded-lg bg-slate-900 px-5 py-3 font-bold text-white">
                    Next question
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
