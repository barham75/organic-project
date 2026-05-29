import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <section className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-slate-900">
          Stereochemistry Interactive Lab
        </h1>

        <p className="mt-3 text-slate-600">
          Interactive website for teaching stereochemistry.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link
            href="/stereochemistry/conformational"
            className="rounded-2xl border border-blue-200 bg-blue-50 p-6 hover:bg-blue-100"
          >
            <h2 className="text-xl font-bold text-blue-900">
              Conformational Isomerism
            </h2>
            <p className="mt-2 text-blue-800">
              True 3D ball-and-stick model, mouse rotation, zoom, Newman projection, energy table, and energy graph.
            </p>
          </Link>

          {["Configurational Isomerism", "Enantiomers", "Diastereomers", "E/Z Isomerism", "R/S Configuration"].map((topic) => (
            <div key={topic} className="rounded-2xl border bg-slate-100 p-6 text-slate-500">
              <h2 className="text-xl font-bold">{topic}</h2>
              <p className="mt-2">Coming soon</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
