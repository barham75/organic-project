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

          <Link
            href="/stereochemistry/configurational"
            className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 hover:bg-emerald-100"
          >
            <h2 className="text-xl font-bold text-emerald-900">
              Configurational Isomerism
            </h2>
            <p className="mt-2 text-emerald-800">
              Learn the difference between configurations, then practice assigning R/S stereochemistry.
            </p>
          </Link>

          <Link
            href="/stereochemistry/configurational/enantiomers"
            className="rounded-2xl border border-cyan-200 bg-cyan-50 p-6 hover:bg-cyan-100"
          >
            <h2 className="text-xl font-bold text-cyan-900">
              Enantiomers
            </h2>
            <p className="mt-2 text-cyan-800">
              Compare non-superimposable mirror images and identify R/S pairs.
            </p>
          </Link>

          <Link
            href="/stereochemistry/configurational/diastereomers"
            className="rounded-2xl border border-violet-200 bg-violet-50 p-6 hover:bg-violet-100"
          >
            <h2 className="text-xl font-bold text-violet-900">
              Diastereomers
            </h2>
            <p className="mt-2 text-violet-800">
              Compare molecules with multiple stereocenters and explore meso compounds.
            </p>
          </Link>

          <Link
            href="/stereochemistry/configurational/ez"
            className="rounded-2xl border border-rose-200 bg-rose-50 p-6 hover:bg-rose-100"
          >
            <h2 className="text-xl font-bold text-rose-900">
              E/Z Isomerism
            </h2>
            <p className="mt-2 text-rose-800">
              Apply CIP priorities on both alkene carbons and distinguish E from Z.
            </p>
          </Link>

          <Link
            href="/stereochemistry/configurational/rs"
            className="rounded-2xl border border-amber-200 bg-amber-50 p-6 hover:bg-amber-100"
          >
            <h2 className="text-xl font-bold text-amber-900">
              R/S Configuration
            </h2>
            <p className="mt-2 text-amber-800">
              Interactive CIP priority lab with a tetrahedral model and graded questions.
            </p>
          </Link>

          <Link
            href="/reactions"
            className="rounded-2xl border border-orange-200 bg-orange-50 p-6 hover:bg-orange-100"
          >
            <h2 className="text-xl font-bold text-orange-900">
              Organic Reactions Atlas
            </h2>
            <p className="mt-2 text-orange-800">
              Browse organic reactions by starting functional group or expected product.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
