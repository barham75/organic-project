"use client";

import Link from "next/link";
import { useState } from "react";
import { aromaticityQuestions } from "../data";
import { AromaticStructure } from "../structure";

export default function AromaticityQuizPage() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const question = aromaticityQuestions[index];

  function checkAnswer() {
    if (!selected || checked) return;
    setChecked(true);
    if (selected === question.answer) setScore((value) => value + 1);
  }

  function nextQuestion() {
    setIndex((value) => (value + 1) % aromaticityQuestions.length);
    setSelected("");
    setChecked(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900">
      <section className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/aromaticity" className="text-sm font-semibold text-indigo-700 hover:text-indigo-900">Back to aromaticity reference</Link>
          <p className="text-sm font-bold text-slate-600">Score: {score} / {index + (checked ? 1 : 0)}</p>
        </div>
        <article className="mt-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
            <div>
              <p className="text-sm font-bold uppercase text-indigo-700">Aromaticity practice</p>
              <h1 className="mt-2 text-2xl font-bold">{question.prompt}</h1>
            </div>
            <span className="rounded-full border border-slate-300 px-3 py-1 text-sm font-bold text-slate-600">Question {index + 1} of {aromaticityQuestions.length}</span>
          </div>

          <div className="mt-6 rounded-md border border-indigo-200 bg-indigo-50 p-5">
            <p className="text-sm font-bold uppercase text-indigo-700">Structure</p>
            <div className="mt-2 rounded-md bg-white p-3">
              <AromaticStructure id={question.structureId} />
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {question.options.map((option) => {
              const state = checked ? option === question.answer ? "border-emerald-500 bg-emerald-50" : option === selected ? "border-rose-500 bg-rose-50" : "border-slate-200 bg-white" : option === selected ? "border-indigo-600 bg-indigo-50" : "border-slate-200 bg-white hover:bg-slate-50";
              return <button key={option} type="button" disabled={checked} onClick={() => setSelected(option)} className={`rounded-md border p-4 text-left font-semibold ${state}`}>{option}</button>;
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" disabled={!selected || checked} onClick={checkAnswer} className="rounded-lg bg-indigo-700 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300">Check answer</button>
            {checked && <button type="button" onClick={nextQuestion} className="rounded-lg bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800">Next question</button>}
          </div>

          {checked && (
            <section className={`mt-6 rounded-md border p-4 ${selected === question.answer ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
              <h2 className="font-bold">{selected === question.answer ? "Correct" : "Review the structural requirement"}</h2>
              <p className="mt-2 text-sm font-bold uppercase text-slate-600">Answer: {question.answer}</p>
              <p className="mt-2 leading-7 text-slate-700">{question.explanation}</p>
            </section>
          )}
        </article>
      </section>
    </main>
  );
}
