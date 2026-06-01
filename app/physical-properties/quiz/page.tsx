"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { propertyQuestions } from "../data";

export default function PhysicalPropertiesQuizPage() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const question = propertyQuestions[index];
  const answers = useMemo(() => shuffle([question.answer, ...distractors(question.id)]), [question]);

  function checkAnswer() {
    if (!selected || checked) return;
    setChecked(true);
    if (selected === question.answer) setScore((value) => value + 1);
  }

  function nextQuestion() {
    setIndex((value) => (value + 1) % propertyQuestions.length);
    setSelected("");
    setChecked(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900">
      <section className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/physical-properties" className="text-sm font-semibold text-blue-700 hover:text-blue-900">Back to reference</Link>
          <p className="text-sm font-bold text-slate-600">Score: {score} / {index + (checked ? 1 : 0)}</p>
        </div>
        <div className="mt-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
            <div>
              <p className="text-sm font-bold uppercase text-blue-700">{question.property}</p>
              <h1 className="mt-2 text-2xl font-bold">Compare the compounds</h1>
            </div>
            <span className="rounded-full border border-slate-300 px-3 py-1 text-sm font-bold text-slate-600">Question {index + 1} of {propertyQuestions.length}</span>
          </div>
          <p className="mt-6 text-lg text-slate-700">{question.prompt}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {question.compounds.map((compound) => <span key={compound} className="rounded-md border border-slate-300 bg-slate-50 px-4 py-3 font-mono font-bold">{compound}</span>)}
          </div>
          <div className="mt-6 grid gap-3">
            {answers.map((answer) => {
              const state = checked ? answer === question.answer ? "border-emerald-500 bg-emerald-50" : answer === selected ? "border-rose-500 bg-rose-50" : "border-slate-200 bg-white" : answer === selected ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50";
              return <button key={answer} type="button" disabled={checked} onClick={() => setSelected(answer)} className={`rounded-md border p-4 text-left font-mono font-semibold ${state}`}>{answer}</button>;
            })}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" disabled={!selected || checked} onClick={checkAnswer} className="rounded-lg bg-blue-700 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300">Check answer</button>
            {checked && <button type="button" onClick={nextQuestion} className="rounded-lg bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800">Next question</button>}
          </div>
          {checked && (
            <div className={`mt-6 rounded-md border p-4 ${selected === question.answer ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
              <h2 className="font-bold">{selected === question.answer ? "Correct" : "Review the key factor"}</h2>
              <p className="mt-2 font-mono font-semibold">{question.answer}</p>
              <p className="mt-2 leading-7 text-slate-700">{question.explanation}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function distractors(id: string) {
  const choices: Record<string, string[]> = {
    "bp-alcohol-ether-alkane": ["CH3CH2CH3 > CH3OCH3 > CH3CH2OH", "CH3OCH3 > CH3CH2OH > CH3CH2CH3"],
    "bp-branching": ["C(CH3)4 > (CH3)2CHCH2CH3 > CH3CH2CH2CH2CH3", "(CH3)2CHCH2CH3 > CH3CH2CH2CH2CH3 > C(CH3)4"],
    "bp-acid-alcohol-ester": ["CH3COOCH3 > CH3CH2OH > CH3COOH", "CH3CH2OH > CH3COOH > CH3COOCH3"],
    "bp-halides": ["CH3CH2Cl > CH3CH2Br > CH3CH2I", "CH3CH2Br > CH3CH2I > CH3CH2Cl"],
    "sol-alcohol-chain": ["CH3(CH2)5OH > CH3CH2CH2OH > CH3OH", "CH3CH2CH2OH > CH3OH > CH3(CH2)5OH"],
    "sol-salt-acid-alkane": ["CH3CH3 > CH3COOH > CH3COO-Na+", "CH3COOH > CH3COO-Na+ > CH3CH3"],
    "sol-amine-salt": ["CH3CH2NH2", "CH3CH2CH3"],
    "acid-hybridization": ["CH3CH3 > H2C=CH2 > HC#CH", "H2C=CH2 > HC#CH > CH3CH3"],
    "acid-carboxyl-induction": ["CH3CH2OH > CH3COOH > ClCH2COOH", "CH3COOH > ClCH2COOH > CH3CH2OH"],
    "acid-phenol": ["CH3CH2OH > C6H5-OH > p-NO2-C6H4-OH", "C6H5-OH > p-NO2-C6H4-OH > CH3CH2OH"],
    "base-amine-aniline-amide": ["CH3CONH2 > C6H5NH2 > CH3CH2NH2", "C6H5NH2 > CH3CH2NH2 > CH3CONH2"],
    "base-pyridine-pyrrole": ["pyrrole", "They have equal basicity"],
  };
  return choices[id];
}

function shuffle(values: string[]) {
  return [...values].sort((a, b) => a.localeCompare(b));
}
