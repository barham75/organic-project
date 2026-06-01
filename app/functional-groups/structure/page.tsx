"use client";

import Link from "next/link";
import { useState } from "react";
import { structureQuestions } from "../data";
import { FunctionalGroupStructure } from "../structure-formula";

export default function StructureTestPage() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const question = structureQuestions[index];
  const correct = selected === question.answer;

  function check() { if (selected && !checked) { setChecked(true); if (correct) setScore((value) => value + 1); } }
  function next() { setIndex((value) => (value + 1) % structureQuestions.length); setSelected(""); setChecked(false); }

  return (
    <QuizShell back="/functional-groups" title="Identify from Structure" score={score} progress={`${index + 1} of ${structureQuestions.length}`}>
      <p className="text-lg text-slate-700">Which functional group is highlighted in the structural formula?</p>
      <div className="mt-5 rounded-md border border-blue-200 bg-blue-50 p-4"><FunctionalGroupStructure id={question.structureId} /></div>
      <Options options={question.options} answer={question.answer} selected={selected} checked={checked} onSelect={setSelected} />
      <Actions selected={selected} checked={checked} onCheck={check} onNext={next} />
      {checked && <Feedback correct={correct} answer={question.answer}><p className="mt-2 font-mono font-bold">{question.formula}</p><p className="mt-2 leading-7 text-slate-700">{question.explanation}</p></Feedback>}
    </QuizShell>
  );
}

function QuizShell({ back, title, score, progress, children }: { back: string; title: string; score: number; progress: string; children: React.ReactNode }) {
  return <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900"><section className="mx-auto max-w-4xl"><div className="flex justify-between gap-3"><Link href={back} className="text-sm font-semibold text-blue-700">Back to functional group test</Link><p className="text-sm font-bold text-slate-600">Score: {score}</p></div><article className="mt-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"><div className="flex justify-between gap-3 border-b border-slate-200 pb-5"><h1 className="text-2xl font-bold">{title}</h1><span className="text-sm font-bold text-slate-600">Question {progress}</span></div><div className="mt-6">{children}</div></article></section></main>;
}
function Options({ options, answer, selected, checked, onSelect }: { options: string[]; answer: string; selected: string; checked: boolean; onSelect: (value: string) => void }) {
  return <div className="mt-5 grid gap-3">{options.map((option) => { const state = checked ? option === answer ? "border-emerald-500 bg-emerald-50" : option === selected ? "border-rose-500 bg-rose-50" : "border-slate-200" : option === selected ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:bg-slate-50"; return <button key={option} type="button" disabled={checked} onClick={() => onSelect(option)} className={`rounded-md border bg-white p-4 text-left font-semibold ${state}`}>{option}</button>; })}</div>;
}
function Actions({ selected, checked, onCheck, onNext }: { selected: string; checked: boolean; onCheck: () => void; onNext: () => void }) {
  return <div className="mt-6 flex gap-3"><button type="button" disabled={!selected || checked} onClick={onCheck} className="rounded-lg bg-blue-700 px-5 py-3 font-bold text-white disabled:bg-slate-300">Check answer</button>{checked && <button type="button" onClick={onNext} className="rounded-lg bg-emerald-700 px-5 py-3 font-bold text-white">Next question</button>}</div>;
}
function Feedback({ correct, answer, children }: { correct: boolean; answer: string; children: React.ReactNode }) {
  return <section className={`mt-6 rounded-md border p-4 ${correct ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}><h2 className="font-bold">{correct ? "Correct" : `Correct answer: ${answer}`}</h2>{children}</section>;
}
