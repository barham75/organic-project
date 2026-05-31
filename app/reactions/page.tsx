"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Reaction = {
  id: string;
  title: string;
  substrate: string;
  product: string;
  category: string;
  startingGroup: string;
  productGroup: string;
  reagents: string;
  equation: string;
  note: string;
  stereo?: string;
  reference: string;
};

const reactions: Reaction[] = [
  {
    id: "alkene-hx",
    title: "Hydrohalogenation of an Alkene",
    substrate: "Alkene",
    product: "Alkyl halide",
    category: "Addition",
    startingGroup: "Alkene",
    productGroup: "Alkyl halide",
    reagents: "HX: HCl or HBr or HI",
    equation: "CH3-CH=CH2  +  HBr  ->  CH3-CHBr-CH3",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    reference: "McMurry 7e, Chapter 8",
  },
  {
    id: "alkene-hbr-peroxide",
    title: "Radical Addition of HBr",
    substrate: "Alkene",
    product: "Alkyl halide",
    category: "Radical addition",
    startingGroup: "Alkene",
    productGroup: "Alkyl halide",
    reagents: "HBr, ROOR",
    equation: "CH3-CH=CH2  +  HBr  ->  CH3-CH2-CH2Br",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    reference: "McMurry 7e, Chapter 8",
  },
  {
    id: "alkene-hydration",
    title: "Acid-Catalyzed Hydration of an Alkene",
    substrate: "Alkene",
    product: "Alcohol",
    category: "Addition",
    startingGroup: "Alkene",
    productGroup: "Alcohol",
    reagents: "H2O, H+",
    equation: "CH3-CH=CH2  +  H2O  ->  CH3-CHOH-CH3",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    reference: "McMurry 7e, Chapter 8",
  },
  {
    id: "alkene-oxymercuration",
    title: "Oxymercuration-Demercuration",
    substrate: "Alkene",
    product: "Alcohol",
    category: "Addition",
    startingGroup: "Alkene",
    productGroup: "Alcohol",
    reagents: "1. Hg(OAc)2, H2O  2. NaBH4",
    equation: "R-CH=CH2  ->  R-CHOH-CH3",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    reference: "McMurry 7e, Chapter 8",
  },
  {
    id: "alkene-hydroboration",
    title: "Hydroboration-Oxidation of an Alkene",
    substrate: "Alkene",
    product: "Alcohol",
    category: "Addition",
    startingGroup: "Alkene",
    productGroup: "Alcohol",
    reagents: "1. BH3, THF  2. H2O2, OH-",
    equation: "R-CH=CH2  ->  R-CH2-CH2OH",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    stereo: "Pay attention to the stereochemical outcome and reaction mechanism.",
    reference: "McMurry 7e, Chapter 8",
  },
  {
    id: "alkene-halogenation",
    title: "Halogenation of an Alkene",
    substrate: "Alkene",
    product: "Vicinal dihalide",
    category: "Addition",
    startingGroup: "Alkene",
    productGroup: "Alkyl halide",
    reagents: "Br2 or Cl2",
    equation: "R-CH=CH-R  +  Br2  ->  R-CHBr-CHBr-R",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    stereo: "Pay attention to the stereochemical outcome and reaction mechanism.",
    reference: "McMurry 7e, Chapter 8",
  },
  {
    id: "alkene-halohydrin",
    title: "Halohydrin Formation",
    substrate: "Alkene",
    product: "Halohydrin",
    category: "Addition",
    startingGroup: "Alkene",
    productGroup: "Alcohol",
    reagents: "Br2, H2O",
    equation: "R-CH=CH2  ->  R-CH(OH)-CH2Br",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    stereo: "Pay attention to the stereochemical outcome and reaction mechanism.",
    reference: "McMurry 7e, Chapter 8",
  },
  {
    id: "alkene-hydrogenation",
    title: "Catalytic Hydrogenation of an Alkene",
    substrate: "Alkene",
    product: "Alkane",
    category: "Reduction",
    startingGroup: "Alkene",
    productGroup: "Alkane",
    reagents: "H2, Pd/C or Pt",
    equation: "R-CH=CH-R  +  H2  ->  R-CH2-CH2-R",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    stereo: "Pay attention to the stereochemical outcome and reaction mechanism.",
    reference: "McMurry 7e, Chapter 8",
  },
  {
    id: "alkene-ozonolysis",
    title: "Ozonolysis of an Alkene",
    substrate: "Alkene",
    product: "Aldehyde or Ketone",
    category: "Oxidation",
    startingGroup: "Alkene",
    productGroup: "Carbonyl compound",
    reagents: "1. O3  2. Zn, H3O+",
    equation: "R2C=CR2  ->  R2C=O  +  O=CR2",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    reference: "McMurry 7e, Chapter 8",
  },
  {
    id: "alkyne-hydrogenation",
    title: "Complete Hydrogenation of an Alkyne",
    substrate: "Alkyne",
    product: "Alkane",
    category: "Reduction",
    startingGroup: "Alkyne",
    productGroup: "Alkane",
    reagents: "Excess H2, Pd/C",
    equation: "R-C#C-R  +  2 H2  ->  R-CH2-CH2-R",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    reference: "McMurry 7e, Chapter 9",
  },
  {
    id: "alkyne-lindlar",
    title: "Partial Reduction of an Alkyne to a cis-Alkene",
    substrate: "Alkyne",
    product: "Alkene",
    category: "Reduction",
    startingGroup: "Alkyne",
    productGroup: "Alkene",
    reagents: "H2, Lindlar catalyst",
    equation: "R-C#C-R  ->  cis-R-CH=CH-R",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    stereo: "Pay attention to the stereochemical outcome and reaction mechanism.",
    reference: "McMurry 7e, Chapter 9",
  },
  {
    id: "alkyne-na-nh3",
    title: "Partial Reduction of an Alkyne to a trans-Alkene",
    substrate: "Alkyne",
    product: "Alkene",
    category: "Reduction",
    startingGroup: "Alkyne",
    productGroup: "Alkene",
    reagents: "Na, NH3(l)",
    equation: "R-C#C-R  ->  trans-R-CH=CH-R",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    stereo: "Pay attention to the stereochemical outcome and reaction mechanism.",
    reference: "McMurry 7e, Chapter 9",
  },
  {
    id: "alkyne-hydration",
    title: "Mercury-Catalyzed Hydration of an Alkyne",
    substrate: "Alkyne",
    product: "Ketone",
    category: "Addition followed by tautomerization",
    startingGroup: "Alkyne",
    productGroup: "Carbonyl compound",
    reagents: "HgSO4, H2SO4, H2O",
    equation: "R-C#CH  ->  R-CO-CH3",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    reference: "McMurry 7e, Chapter 9",
  },
  {
    id: "alkyne-hydroboration",
    title: "Hydroboration-Oxidation of a Terminal Alkyne",
    substrate: "Alkyne",
    product: "Aldehyde",
    category: "Addition followed by tautomerization",
    startingGroup: "Alkyne",
    productGroup: "Carbonyl compound",
    reagents: "1. (sia)2BH  2. H2O2, OH-",
    equation: "R-C#CH  ->  R-CH2-CHO",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    reference: "McMurry 7e, Chapter 9",
  },
  {
    id: "halide-sn2",
    title: "SN2 Nucleophilic Substitution",
    substrate: "Alkyl halide",
    product: "Substitution product",
    category: "Substitution",
    startingGroup: "Alkyl halide",
    productGroup: "Various",
    reagents: "Strong Nu-, polar aprotic solvent",
    equation: "CH3CH2-Br  +  OH-  ->  CH3CH2-OH  +  Br-",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    stereo: "Pay attention to the stereochemical outcome and reaction mechanism.",
    reference: "McMurry 7e, Chapter 11",
  },
  {
    id: "halide-sn1",
    title: "SN1 Nucleophilic Substitution",
    substrate: "Alkyl halide",
    product: "Substitution product",
    category: "Substitution",
    startingGroup: "Alkyl halide",
    productGroup: "Various",
    reagents: "Weak nucleophile, polar protic solvent",
    equation: "(CH3)3C-Br  +  H2O  ->  (CH3)3C-OH",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    stereo: "Pay attention to the stereochemical outcome and reaction mechanism.",
    reference: "McMurry 7e, Chapter 11",
  },
  {
    id: "halide-e2",
    title: "E2 Elimination",
    substrate: "Alkyl halide",
    product: "Alkene",
    category: "Elimination",
    startingGroup: "Alkyl halide",
    productGroup: "Alkene",
    reagents: "Strong base, heat",
    equation: "CH3-CHBr-CH3  +  EtO-  ->  CH3-CH=CH2",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    stereo: "Pay attention to the stereochemical outcome and reaction mechanism.",
    reference: "McMurry 7e, Chapter 11",
  },
  {
    id: "alcohol-oxidation-primary",
    title: "Oxidation of a Primary Alcohol",
    substrate: "Alcohol",
    product: "Aldehyde or Carboxylic acid",
    category: "Oxidation",
    startingGroup: "Alcohol",
    productGroup: "Carbonyl compound",
    reagents: "PCC for aldehyde; Jones reagent for acid",
    equation: "R-CH2OH  ->  R-CHO  ->  R-COOH",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    reference: "McMurry 7e, Chapter 17",
  },
  {
    id: "alcohol-oxidation-secondary",
    title: "Oxidation of a Secondary Alcohol",
    substrate: "Alcohol",
    product: "Ketone",
    category: "Oxidation",
    startingGroup: "Alcohol",
    productGroup: "Carbonyl compound",
    reagents: "PCC or CrO3, H3O+",
    equation: "R2CHOH  ->  R2C=O",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    reference: "McMurry 7e, Chapter 17",
  },
  {
    id: "alcohol-dehydration",
    title: "Dehydration of an Alcohol",
    substrate: "Alcohol",
    product: "Alkene",
    category: "Elimination",
    startingGroup: "Alcohol",
    productGroup: "Alkene",
    reagents: "H2SO4, heat",
    equation: "CH3-CHOH-CH3  ->  CH3-CH=CH2  +  H2O",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    reference: "McMurry 7e, Chapter 17",
  },
  {
    id: "epoxide-opening-basic",
    title: "Nucleophilic Ring Opening of an Epoxide",
    substrate: "Epoxide",
    product: "Substituted alcohol",
    category: "Ring opening",
    startingGroup: "Ether and epoxide",
    productGroup: "Alcohol",
    reagents: "Nu-, then H3O+",
    equation: "epoxide  +  Nu-  ->  Nu-CH2-CH2-OH",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    stereo: "Pay attention to the stereochemical outcome and reaction mechanism.",
    reference: "McMurry 7e, Chapter 18",
  },
  {
    id: "carbonyl-reduction",
    title: "Reduction of an Aldehyde or Ketone",
    substrate: "Aldehyde or Ketone",
    product: "Alcohol",
    category: "Reduction",
    startingGroup: "Aldehyde and Ketone",
    productGroup: "Alcohol",
    reagents: "NaBH4 or LiAlH4, then H3O+",
    equation: "R2C=O  ->  R2CHOH",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    reference: "McMurry 7e, Chapter 19",
  },
  {
    id: "carbonyl-grignard",
    title: "Addition of a Grignard Reagent to a Carbonyl",
    substrate: "Aldehyde or Ketone",
    product: "Alcohol",
    category: "Carbon-carbon bond formation",
    startingGroup: "Aldehyde and Ketone",
    productGroup: "Alcohol",
    reagents: "1. RMgBr  2. H3O+",
    equation: "R2C=O  +  R-MgBr  ->  R3C-OH",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    reference: "McMurry 7e, Chapter 19",
  },
  {
    id: "carbonyl-wittig",
    title: "Wittig Reaction",
    substrate: "Aldehyde or Ketone",
    product: "Alkene",
    category: "Carbon-carbon double-bond formation",
    startingGroup: "Aldehyde and Ketone",
    productGroup: "Alkene",
    reagents: "Ph3P=CR2",
    equation: "R2C=O  +  Ph3P=CR2  ->  R2C=CR2",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    reference: "McMurry 7e, Chapter 19",
  },
  {
    id: "acid-esterification",
    title: "Fischer Esterification",
    substrate: "Carboxylic acid",
    product: "Ester",
    category: "Acyl substitution",
    startingGroup: "Carboxylic acid",
    productGroup: "Ester",
    reagents: "ROH, H+",
    equation: "R-COOH  +  R'-OH  <->  R-COOR'  +  H2O",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    reference: "McMurry 7e, Chapter 21",
  },
  {
    id: "ester-hydrolysis",
    title: "Base-Promoted Hydrolysis of an Ester",
    substrate: "Ester",
    product: "Carboxylate and alcohol",
    category: "Acyl substitution",
    startingGroup: "Carboxylic acid derivative",
    productGroup: "Carboxylic acid",
    reagents: "OH-, H2O, heat",
    equation: "R-COOR'  +  OH-  ->  R-COO-  +  R'-OH",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    reference: "McMurry 7e, Chapter 21",
  },
  {
    id: "acid-chloride-amide",
    title: "Preparation of an Amide from an Acid Chloride",
    substrate: "Acid chloride",
    product: "Amide",
    category: "Acyl substitution",
    startingGroup: "Carboxylic acid derivative",
    productGroup: "Amide",
    reagents: "NH3 or RNH2",
    equation: "R-COCl  +  2 NH3  ->  R-CONH2  +  NH4Cl",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    reference: "McMurry 7e, Chapter 21",
  },
  {
    id: "benzene-bromination",
    title: "Bromination of Benzene",
    substrate: "Benzene",
    product: "Aryl halide",
    category: "Electrophilic aromatic substitution",
    startingGroup: "Aromatic compound",
    productGroup: "Aryl halide",
    reagents: "Br2, FeBr3",
    equation: "C6H6  +  Br2  ->  C6H5Br  +  HBr",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    reference: "McMurry 7e, Chapter 16",
  },
  {
    id: "benzene-nitration",
    title: "Nitration of Benzene",
    substrate: "Benzene",
    product: "Nitro compoundBenzene",
    category: "Electrophilic aromatic substitution",
    startingGroup: "Aromatic compound",
    productGroup: "Nitro compound",
    reagents: "HNO3, H2SO4",
    equation: "C6H6  ->  C6H5-NO2",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    reference: "McMurry 7e, Chapter 16",
  },
  {
    id: "benzene-friedel-crafts",
    title: "Friedel-Crafts Alkylation",
    substrate: "Benzene",
    product: "Alkylbenzene",
    category: "Electrophilic aromatic substitution",
    startingGroup: "Aromatic compound",
    productGroup: "Aromatic compound",
    reagents: "R-Cl, AlCl3",
    equation: "C6H6  +  R-Cl  ->  C6H5-R",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    reference: "McMurry 7e, Chapter 16",
  },
  {
    id: "amine-reductive-amination",
    title: "Reductive Amination",
    substrate: "Aldehyde or Ketone",
    product: "Amine",
    category: "Reduction",
    startingGroup: "Aldehyde and Ketone",
    productGroup: "Amine",
    reagents: "1. NH3 or RNH2  2. NaBH3CN",
    equation: "R2C=O  ->  R2CH-NHR",
    note: "Review the substrate, reagents, regiochemistry, and expected product for this transformation.",
    reference: "McMurry 7e, Chapter 24",
  },
];

const all = "All";

export default function ReactionsPage() {
  const [startingGroup, setStartingGroup] = useState(all);
  const [productGroup, setProductGroup] = useState(all);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(reactions[0].id);

  const startingGroups = [all, ...new Set(reactions.map((reaction) => reaction.startingGroup))];
  const productGroups = [all, ...new Set(reactions.map((reaction) => reaction.productGroup))];

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return reactions.filter((reaction) => {
      const matchesStarting = startingGroup === all || reaction.startingGroup === startingGroup;
      const matchesProduct = productGroup === all || reaction.productGroup === productGroup;
      const matchesQuery =
        !normalizedQuery ||
        [
          reaction.title,
          reaction.substrate,
          reaction.product,
          reaction.reagents,
          reaction.category,
        ].some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesStarting && matchesProduct && matchesQuery;
    });
  }, [productGroup, query, startingGroup]);

  const selected =
    filtered.find((reaction) => reaction.id === selectedId) ?? filtered[0] ?? null;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-slate-200 pb-6">
          <Link href="/" className="text-sm font-bold text-orange-700 hover:text-orange-900">
            Back to home
          </Link>
          <h1 className="mt-4 text-3xl font-bold">Organic Reactions Atlas</h1>
          <p className="mt-2 max-w-3xl leading-7 text-slate-600">
            Browse essential organic transformations by starting functional group or expected product.</p>
          <p className="mt-2 text-sm text-slate-500">
            Educational reference: Organic Chemistry, McMurry, 7th Edition. Schemes are original study aids based on the textbook.</p>
        </header>

        <section className="grid gap-4 border-b border-slate-200 py-6 md:grid-cols-3">
          <label className="text-sm font-bold text-slate-700">
            Starting functional group
            <select
              value={startingGroup}
              onChange={(event) => setStartingGroup(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 font-normal"
            >
              {startingGroups.map((group) => (
                <option key={group}>{group}</option>
              ))}
            </select>
          </label>

          <label className="text-sm font-bold text-slate-700">
            Product type
            <select
              value={productGroup}
              onChange={(event) => setProductGroup(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 font-normal"
            >
              {productGroups.map((group) => (
                <option key={group}>{group}</option>
              ))}
            </select>
          </label>

          <label className="text-sm font-bold text-slate-700">
            Search
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Example: oxidation, alcohol, HBr"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 font-normal"
            />
          </label>
        </section>

        <section className="grid gap-6 py-6 lg:grid-cols-[360px_1fr]">
          <aside>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">Reactions</h2>
              <span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-bold">
                {filtered.length}
              </span>
            </div>

            <div className="grid max-h-[720px] gap-2 overflow-y-auto pl-1">
              {filtered.map((reaction) => (
                <button
                  key={reaction.id}
                  type="button"
                  onClick={() => setSelectedId(reaction.id)}
                  className={`rounded-lg border p-3 text-left transition ${
                    selected?.id === reaction.id
                      ? "border-orange-400 bg-orange-50"
                      : "border-slate-200 bg-white hover:border-orange-200"
                  }`}
                >
                  <span className="block font-bold">{reaction.title}</span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {reaction.substrate} → {reaction.product}
                  </span>
                </button>
              ))}

              {!filtered.length && (
                <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
                  No reaction matches these filters. Change a selection or clear the search field.      </p>
              )}
            </div>
          </aside>

          {selected && (
            <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-orange-700">{selected.category}</p>
                  <h2 className="mt-1 text-2xl font-bold">{selected.title}</h2>
                </div>
                <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
                  {selected.reference}
                </span>
              </div>

              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="border-l-4 border-blue-400 bg-blue-50 p-4">
                  <dt className="text-xs font-bold text-blue-700">STARTING MATERIAL</dt>
                  <dd className="mt-1 font-bold">{selected.substrate}</dd>
                </div>
                <div className="border-l-4 border-emerald-400 bg-emerald-50 p-4">
                  <dt className="text-xs font-bold text-emerald-700">PRODUCT</dt>
                  <dd className="mt-1 font-bold">{selected.product}</dd>
                </div>
              </dl>

              <section className="mt-6">
                <h3 className="text-sm font-bold text-slate-500">REACTION SCHEME</h3>
                <p
                  className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-4 font-mono text-lg text-white"
                  dir="ltr"
                >
                  {selected.equation}
                </p>
              </section>

              <section className="mt-6">
                <h3 className="text-sm font-bold text-slate-500">REAGENTS AND CONDITIONS</h3>
                <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono" dir="ltr">
                  {selected.reagents}
                </p>
              </section>

              <section className="mt-6 border-t border-slate-200 pt-5">
                <h3 className="font-bold">Key point</h3>
                <p className="mt-2 leading-7 text-slate-700">{selected.note}</p>
              </section>

              {selected.stereo && (
                <section className="mt-4 border-l-4 border-violet-400 bg-violet-50 p-4">
                  <h3 className="font-bold text-violet-900">Stereochemistry</h3>
                  <p className="mt-1 leading-7 text-violet-900">{selected.stereo}</p>
                </section>
              )}
            </article>
          )}
        </section>
      </div>
    </main>
  );
}
