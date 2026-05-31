import Link from "next/link";

const topics = [
  {
    title: "R/S Configuration",
    description: "Assign CIP priorities and identify the absolute configuration of a chiral center.",
    href: "/stereochemistry/configurational/rs",
    ready: true,
  },
  {
    title: "Enantiomers",
    description: "Compare non-superimposable mirror images and connect R/S pairs.",
    href: "/stereochemistry/configurational/enantiomers",
    ready: true,
  },
  {
    title: "Diastereomers",
    description: "Compare stereoisomers with multiple stereocenters, including meso compounds.",
    href: "/stereochemistry/configurational/diastereomers",
    ready: true,
  },
  {
    title: "E/Z Isomerism",
    description: "Apply CIP rules on each alkene carbon to distinguish E from Z.",
    ready: false,
  },
];

export default function ConfigurationalPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <section className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm font-semibold text-emerald-700 hover:text-emerald-900">
          Back to stereochemistry lab
        </Link>

        <div className="mt-5 border-b border-slate-200 pb-6">
          <p className="text-sm font-bold uppercase text-emerald-700">
            Stereochemistry Interactive Lab
          </p>
          <h1 className="mt-2 text-4xl font-bold">Configurational Isomerism</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            Configurational isomers cannot be interconverted by simple rotation around a single
            bond. Changing one configuration requires breaking and reforming bonds.
          </p>
        </div>

        <div className="grid gap-5 py-8 md:grid-cols-2">
          {topics.map((topic) =>
            topic.ready ? (
              <Link
                key={topic.title}
                href={topic.href}
                className="rounded-lg border border-emerald-200 bg-white p-6 shadow-sm transition hover:border-emerald-500 hover:bg-emerald-50"
              >
                <p className="text-xs font-bold uppercase text-emerald-700">Interactive module</p>
                <h2 className="mt-2 text-2xl font-bold">{topic.title}</h2>
                <p className="mt-3 leading-7 text-slate-600">{topic.description}</p>
                <p className="mt-5 font-bold text-emerald-700">Open lab</p>
              </Link>
            ) : (
              <div key={topic.title} className="rounded-lg border border-slate-200 bg-slate-100 p-6">
                <p className="text-xs font-bold uppercase text-slate-500">Coming soon</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-700">{topic.title}</h2>
                <p className="mt-3 leading-7 text-slate-600">{topic.description}</p>
              </div>
            )
          )}
        </div>
      </section>
    </main>
  );
}
