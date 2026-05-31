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

type ReactionDetail = {
  note: string;
  example: string;
  stereo: string;
};

function FormulaText({ value }: { value: string }) {
  const parts = value.split(/(\d+)/);
  return (
    <span className="whitespace-nowrap font-serif text-xl font-semibold text-slate-900">
      {parts.map((part, index) =>
        /^\d+$/.test(part) ? <sub key={`${part}-${index}`}>{part}</sub> : <span key={`${part}-${index}`}>{part}</span>,
      )}
    </span>
  );
}

function Bond({ type }: { type: string }) {
  if (type === "=") {
    return <span className="grid w-5 gap-1"><i className="block h-0.5 bg-slate-800" /><i className="block h-0.5 bg-slate-800" /></span>;
  }
  if (type === "#") {
    return <span className="grid w-5 gap-0.5"><i className="block h-px bg-slate-800" /><i className="block h-px bg-slate-800" /><i className="block h-px bg-slate-800" /></span>;
  }
  return <span className="block h-0.5 w-5 bg-slate-800" />;
}

function Molecule({ value }: { value: string }) {
  const parts = value.trim().split(/(-|=|#)/).filter(Boolean);
  return (
    <span className="inline-flex min-h-12 items-center">
      {parts.map((part, index) =>
        part === "-" || part === "=" || part === "#" ? <Bond key={`${part}-${index}`} type={part} /> : <FormulaText key={`${part}-${index}`} value={part} />,
      )}
    </span>
  );
}

function FormulaSide({ value }: { value: string }) {
  return (
    <div className="flex min-w-max items-center justify-center gap-3">
      {value.split(/\s+\+\s+/).map((molecule, index, items) => (
        <span key={`${molecule}-${index}`} className="contents">
          <Molecule value={molecule} />
          {index < items.length - 1 && <span className="text-2xl font-semibold text-slate-500">+</span>}
        </span>
      ))}
    </div>
  );
}

function ReactionScheme({ reaction }: { reaction: Reaction }) {
  const [left, right = ""] = reaction.equation.split(/\s+->\s+/);
  return (
    <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200 bg-white px-4 py-6">
      <div className="mx-auto flex min-w-[720px] items-center justify-center gap-5">
        <FormulaSide value={left} />
        <div className="w-48 shrink-0 text-center">
          <p className="mb-2 min-h-5 font-mono text-xs font-semibold text-teal-800">{reaction.reagents}</p>
          <svg viewBox="0 0 190 28" className="h-7 w-full" aria-hidden="true">
            <line x1="3" y1="14" x2="178" y2="14" stroke="#0f766e" strokeWidth="3" />
            <polyline points="162,3 179,14 162,25" fill="none" stroke="#0f766e" strokeWidth="3" />
          </svg>
        </div>
        <FormulaSide value={right} />
      </div>
      <p className="mt-5 text-xs text-slate-500">Original reaction scheme based on {reaction.reference}.</p>
    </div>
  );
}

const reactionDetails: Record<string, ReactionDetail> = {
  "alkene-hx": {
    note: "The major product normally follows Markovnikov orientation because protonation favors the more stable carbocation intermediate.",
    example: "Example: propene + HBr gives mainly 2-bromopropane, not 1-bromopropane.",
    stereo: "The reaction is not stereospecific. A planar carbocation can be attacked from either face; a new stereogenic center may therefore form as a mixture.",
  },
  "alkene-hbr-peroxide": {
    note: "Peroxides switch HBr addition to a radical pathway and reverse the usual regiochemistry. This effect is not generally useful with HCl or HI.",
    example: "Example: propene + HBr / ROOR gives mainly 1-bromopropane.",
    stereo: "The radical pathway is not stereospecific. If stereogenic centers are created, a mixture can result.",
  },
  "alkene-hydration": {
    note: "Acid-catalyzed hydration gives a Markovnikov alcohol through a carbocation, so rearrangements can occur.",
    example: "Example: 3,3-dimethylbut-1-ene can rearrange before water attacks, giving a rearranged alcohol.",
    stereo: "The planar carbocation intermediate makes the reaction non-stereospecific. Attack can occur from either face.",
  },
  "alkene-oxymercuration": {
    note: "Oxymercuration-demercuration gives Markovnikov hydration without a free carbocation, so skeletal rearrangement is avoided.",
    example: "Example: 3,3-dimethylbut-1-ene gives the unrearranged Markovnikov alcohol.",
    stereo: "The overall laboratory sequence is commonly treated as not stereospecific after demercuration, although the initial opening of the mercurinium ion is anti.",
  },
  "alkene-hydroboration": {
    note: "Hydroboration-oxidation gives an anti-Markovnikov alcohol and avoids carbocation rearrangement.",
    example: "Example: propene gives propan-1-ol after 1. BH3, THF 2. H2O2, OH-.",
    stereo: "H and OH are installed syn, on the same face of the alkene. Addition to either face of an achiral alkene can give an enantiomeric pair.",
  },
  "alkene-halogenation": {
    note: "A bridged halonium ion prevents free rotation and controls the addition geometry.",
    example: "Example: cyclohexene + Br2 gives trans-1,2-dibromocyclohexane.",
    stereo: "Halogenation is stereospecific anti addition: the two halogens enter from opposite faces.",
  },
  "alkene-halohydrin": {
    note: "Water opens the halonium ion at the more substituted carbon, so OH and halogen show predictable regiochemistry.",
    example: "Example: propene + Br2 / H2O gives mainly 1-bromopropan-2-ol.",
    stereo: "Formation is anti: OH and Br are installed on opposite faces.",
  },
  "alkene-hydrogenation": {
    note: "Hydrogen adds to the double bond on the surface of a metal catalyst.",
    example: "Example: cyclohexene + H2 / Pd gives cyclohexane.",
    stereo: "Catalytic hydrogenation is syn addition: both hydrogen atoms are delivered to the same face.",
  },
  "alkene-ozonolysis": {
    note: "Ozonolysis cleaves the C=C bond and converts each alkene carbon into a carbonyl carbon.",
    example: "Example: 2-methylpropene gives propanone and methanal after reductive workup.",
    stereo: "The original E/Z geometry is lost when the double bond is cleaved; stereochemistry is not retained in the carbonyl fragments.",
  },
  "alkyne-hydrogenation": {
    note: "With an ordinary metal catalyst and excess hydrogen, an alkyne is reduced fully to an alkane.",
    example: "Example: but-2-yne + excess H2 / Pd gives butane.",
    stereo: "The final alkane usually has no alkene geometry. Any intermediate cis-alkene is further reduced.",
  },
  "alkyne-lindlar": {
    note: "The poisoned Lindlar catalyst stops reduction at the alkene stage.",
    example: "Example: but-2-yne + H2 / Lindlar catalyst gives cis-but-2-ene.",
    stereo: "Syn addition produces the cis or Z alkene.",
  },
  "alkyne-na-nh3": {
    note: "Dissolving-metal reduction stops at the alkene stage and complements Lindlar reduction.",
    example: "Example: but-2-yne + Na / NH3(l) gives trans-but-2-ene.",
    stereo: "The stepwise pathway produces the trans or E alkene.",
  },
  "alkyne-hydration": {
    note: "Mercury-catalyzed hydration gives an enol that rapidly tautomerizes. A terminal alkyne gives a methyl ketone.",
    example: "Example: propyne + HgSO4, H2SO4, H2O gives propanone.",
    stereo: "E/Z information is not retained because the enol tautomerizes to a carbonyl compound.",
  },
  "alkyne-hydroboration": {
    note: "Hydroboration-oxidation of a terminal alkyne gives an aldehyde after enol tautomerization.",
    example: "Example: propyne gives propanal after 1. (sia)2BH 2. H2O2, OH-.",
    stereo: "The hydroboration step is syn, but the final aldehyde does not retain alkene geometry.",
  },
  "halide-sn2": {
    note: "SN2 is a one-step backside attack. It is favored by methyl and primary substrates with a strong nucleophile.",
    example: "Example: (R)-2-bromobutane + OH- gives the inverted 2-butanol configuration through substitution.",
    stereo: "SN2 causes inversion of configuration at the reacting stereogenic carbon, often called Walden inversion.",
  },
  "halide-sn1": {
    note: "SN1 proceeds through a carbocation and is favored when that carbocation is stable. Rearrangements can occur.",
    example: "Example: tert-butyl bromide in water gives tert-butanol by solvolysis.",
    stereo: "A planar carbocation can be attacked from either face. A chiral substrate commonly gives substantial racemization.",
  },
  "halide-e2": {
    note: "E2 occurs in one concerted step. The base removes a beta-H while the leaving group departs.",
    example: "Example: 2-bromobutane + EtO- / EtOH, heat gives mainly but-2-ene, with the trans alkene usually more abundant.",
    stereo: "The beta-H and leaving group must be anti-periplanar. In cyclohexanes this usually requires a trans-diaxial arrangement.",
  },
  "alcohol-oxidation-primary": {
    note: "A primary alcohol can stop at an aldehyde with a mild oxidant or continue to a carboxylic acid with stronger aqueous conditions.",
    example: "Example: butan-1-ol + PCC gives butanal; with Jones reagent it gives butanoic acid.",
    stereo: "Any stereogenic center at the oxidized carbon is lost when the planar carbonyl forms. Remote stereogenic centers remain unchanged.",
  },
  "alcohol-oxidation-secondary": {
    note: "A secondary alcohol is oxidized to a ketone.",
    example: "Example: cyclohexanol + PCC gives cyclohexanone.",
    stereo: "A stereogenic alcohol carbon loses its configuration when it becomes a trigonal-planar carbonyl carbon.",
  },
  "alcohol-dehydration": {
    note: "Acid-catalyzed dehydration usually favors the more substituted alkene and can involve rearrangement when a carbocation forms.",
    example: "Example: 2-methylbutan-2-ol + H2SO4, heat gives mainly 2-methylbut-2-ene.",
    stereo: "When E/Z products are possible, the more stable E alkene is often favored, but the outcome depends on substrate and mechanism.",
  },
  "epoxide-opening-basic": {
    note: "Under basic conditions, a nucleophile attacks the less substituted epoxide carbon by an SN2-like pathway.",
    example: "Example: propylene oxide + CH3O-, then H3O+ gives nucleophilic attack mainly at the terminal carbon.",
    stereo: "Backside attack inverts the attacked epoxide carbon and gives anti opening.",
  },
  "carbonyl-reduction": {
    note: "Hydride reduction converts aldehydes to primary alcohols and ketones to secondary alcohols.",
    example: "Example: propanone + NaBH4 gives propan-2-ol.",
    stereo: "A planar carbonyl can be attacked from either face. Reduction of an achiral ketone that creates a stereocenter often gives a racemic mixture.",
  },
  "carbonyl-grignard": {
    note: "A Grignard reagent adds a carbon group to a carbonyl carbon and forms a new C-C bond after workup.",
    example: "Example: propanone + CH3MgBr, then H3O+ gives 2-methylpropan-2-ol.",
    stereo: "Attack can occur from either face of a planar carbonyl. A newly formed stereocenter can therefore give stereoisomers.",
  },
  "carbonyl-wittig": {
    note: "The Wittig reaction replaces the carbonyl oxygen with a C=C bond.",
    example: "Example: cyclohexanone + Ph3P=CH2 gives methylenecyclohexane.",
    stereo: "E/Z selectivity depends on the ylide and reaction conditions. Do not assume a single alkene geometry without checking the ylide type.",
  },
  "acid-esterification": {
    note: "Fischer esterification is an acid-catalyzed equilibrium; removing water helps drive ester formation.",
    example: "Example: ethanoic acid + ethanol / H+ gives ethyl ethanoate and water.",
    stereo: "No characteristic stereochemical change occurs at the acyl carbon. Existing remote stereocenters are normally retained.",
  },
  "ester-hydrolysis": {
    note: "Base-promoted ester hydrolysis, or saponification, gives a carboxylate salt and an alcohol.",
    example: "Example: ethyl ethanoate + OH- gives ethanoate and ethanol.",
    stereo: "The acyl carbon is trigonal planar during substitution; the reaction normally does not alter remote stereocenters.",
  },
  "acid-chloride-amide": {
    note: "Acid chlorides react readily with ammonia or amines to form amides.",
    example: "Example: ethanoyl chloride + excess NH3 gives ethanamide.",
    stereo: "No characteristic stereochemical change occurs unless a chiral amine or chiral acyl fragment is used.",
  },
  "benzene-bromination": {
    note: "Electrophilic aromatic substitution preserves aromaticity by replacing a ring hydrogen with bromine.",
    example: "Example: benzene + Br2 / FeBr3 gives bromobenzene.",
    stereo: "The benzene ring is planar. This reaction is governed by substitution position rather than R/S or E/Z stereochemistry.",
  },
  "benzene-nitration": {
    note: "The nitronium ion acts as the electrophile in aromatic nitration.",
    example: "Example: benzene + HNO3 / H2SO4 gives nitrobenzene.",
    stereo: "The aromatic ring remains planar. Regiochemistry matters for substituted benzenes, but there is no intrinsic stereospecific outcome.",
  },
  "benzene-friedel-crafts": {
    note: "Friedel-Crafts alkylation attaches an alkyl group to an aromatic ring. Carbocation rearrangement and polyalkylation can occur.",
    example: "Example: benzene + CH3Cl / AlCl3 gives methylbenzene.",
    stereo: "The aromatic substitution step is not stereospecific. A rearranged electrophile can change the carbon skeleton.",
  },
  "amine-reductive-amination": {
    note: "Reductive amination converts an aldehyde or ketone into an amine through an imine or iminium intermediate.",
    example: "Example: propanone + CH3NH2, then NaBH3CN gives N-methylpropan-2-amine.",
    stereo: "Reduction of a planar imine or iminium ion can occur from either face. A newly created stereocenter can form as a mixture unless a chiral influence is present.",
  },
};

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
                <ReactionScheme reaction={selected} />
              </section>

              <section className="mt-6">
                <h3 className="text-sm font-bold text-slate-500">REAGENTS AND CONDITIONS</h3>
                <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono" dir="ltr">
                  {selected.reagents}
                </p>
              </section>

              <section className="mt-6 border-t border-slate-200 pt-5">
                <h3 className="font-bold">Key point</h3>
                <p className="mt-2 leading-7 text-slate-700">{reactionDetails[selected.id].note}</p>
              </section>

              <section className="mt-4 border-l-4 border-amber-400 bg-amber-50 p-4">
                <h3 className="font-bold text-amber-950">Example</h3>
                <p className="mt-1 leading-7 text-amber-950">{reactionDetails[selected.id].example}</p>
              </section>

              <section className="mt-4 border-l-4 border-violet-400 bg-violet-50 p-4">
                <h3 className="font-bold text-violet-900">Stereochemistry</h3>
                <p className="mt-1 leading-7 text-violet-900">{reactionDetails[selected.id].stereo}</p>
              </section>
            </article>
          )}
        </section>
      </div>
    </main>
  );
}
