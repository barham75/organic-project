import Link from "next/link";

export default function FunctionalGroupsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900">
      <section className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm font-semibold text-blue-700 hover:text-blue-900">Back to lab</Link>
        <div className="mt-4 border-b border-slate-200 pb-7">
          <p className="text-sm font-bold uppercase text-emerald-700">Organic chemistry practice</p>
          <h1 className="mt-2 text-3xl font-bold">Functional Group Test</h1>
          <p className="mt-3 max-w-3xl text-slate-600">Identify functional groups from structural formulas or interpret laboratory observations for an unknown sample.</p>
        </div>
        <section className="mt-7 grid gap-4 md:grid-cols-2">
          <Link href="/functional-groups/structure" className="rounded-lg border border-blue-200 bg-blue-50 p-6 hover:bg-blue-100">
            <h2 className="text-xl font-bold text-blue-950">Identify from Structure</h2>
            <p className="mt-2 leading-7 text-blue-900">Read clear structural formulas, recognize similar groups, and review the defining pattern after each answer.</p>
          </Link>
          <Link href="/functional-groups/laboratory" className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 hover:bg-emerald-100">
            <h2 className="text-xl font-bold text-emerald-950">Identify in the Laboratory</h2>
            <p className="mt-2 leading-7 text-emerald-900">Infer a functional group from screening tests, observations, and confirmatory evidence.</p>
          </Link>
        </section>
        <section className="mt-7 rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-950">
          <h2 className="font-bold">Laboratory safety note</h2>
          <p className="mt-2 leading-7">The laboratory section is an interpretation exercise. It intentionally omits preparation steps and quantities. Perform real tests only under an approved teaching-lab protocol with instructor supervision.</p>
        </section>
      </section>
    </main>
  );
}
