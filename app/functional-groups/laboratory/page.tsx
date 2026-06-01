"use client";

import Link from "next/link";
import { useState } from "react";
import { laboratoryQuestions } from "../data";

export default function LaboratoryTestPage() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const question = laboratoryQuestions[index];
  const correct = selected === question.answer;

  function check() { if (selected && !checked) { setChecked(true); if (correct) setScore((value) => value + 1); } }
  function next() { setIndex((value) => (value + 1) % laboratoryQuestions.length); setSelected(""); setChecked(false); }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900">
      <section className="mx-auto max-w-4xl">
        <div className="flex justify-between gap-3"><Link href="/functional-groups" className="text-sm font-semibold text-emerald-700">Back to functional group test</Link><p className="text-sm font-bold text-slate-600">Score: {score}</p></div>
        <article className="mt-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex justify-between gap-3 border-b border-slate-200 pb-5"><div><p className="text-sm font-bold uppercase text-emerald-700">Unknown sample</p><h1 className="mt-2 text-2xl font-bold">Identify in the Laboratory</h1></div><span className="text-sm font-bold text-slate-600">Question {index + 1} of {laboratoryQuestions.length}</span></div>
          <p className="mt-6 text-lg text-slate-700">Which functional group is most strongly supported by these observations?</p>
          <ul className="mt-5 grid gap-3">{question.observation.map((item) => <li key={item} className="rounded-md border border-emerald-200 bg-emerald-50 p-4 font-semibold text-emerald-950">{item}</li>)}</ul>
          <div className="mt-5 grid gap-3">{question.options.map((option) => { const state = checked ? option === question.answer ? "border-emerald-500 bg-emerald-50" : option === selected ? "border-rose-500 bg-rose-50" : "border-slate-200" : option === selected ? "border-emerald-700 bg-emerald-50" : "border-slate-200 hover:bg-slate-50"; return <button key={option} type="button" disabled={checked} onClick={() => setSelected(option)} className={`rounded-md border bg-white p-4 text-left font-semibold ${state}`}>{option}</button>; })}</div>
          <div className="mt-6 flex gap-3"><button type="button" disabled={!selected || checked} onClick={check} className="rounded-lg bg-emerald-700 px-5 py-3 font-bold text-white disabled:bg-slate-300">Check answer</button>{checked && <button type="button" onClick={next} className="rounded-lg bg-blue-700 px-5 py-3 font-bold text-white">Next question</button>}</div>
          {checked && <section className={`mt-6 rounded-md border p-4 ${correct ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}><h2 className="font-bold">{correct ? "Correct" : `Correct answer: ${question.answer}`}</h2><p className="mt-2 leading-7 text-slate-700">{question.explanation}</p>{question.caution && <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-semibold leading-6 text-amber-950">Safety note: {question.caution}</p>}</section>}
        </article>
      </section>
    </main>
  );
}
