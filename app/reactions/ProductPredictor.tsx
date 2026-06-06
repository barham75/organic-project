"use client";

import { forwardRef, useEffect, useRef, useState } from "react";

type Prediction = {
  product: string;
  note: string;
  expectedProduct: string;
  generalScheme: string;
  exactStructure: boolean;
};
type ChemicalEditor = { getSmiles: () => Promise<string>; setMolecule: (structure: string) => Promise<void> };
type EditorWindow = Window & typeof globalThis & { ketcher?: ChemicalEditor };
const editorUrl = "/standalone/index.html";

const transformations: Record<string, (smiles: string) => Prediction | null> = {
  "alkane-bromination": (smiles) => alkaneHalogenation(smiles, "Br"),
  "alkane-chlorination": (smiles) => alkaneHalogenation(smiles, "Cl"),
  "alkane-combustion": combustionProducts,
  "alkane-cracking": alkaneCracking,
  "cycloalkane-combustion": combustionProducts,
  "alkene-hx": markovnikovAlkeneHBr,
  "alkene-hbr-peroxide": radicalAlkeneHBr,
  "alkene-hydration": acidCatalyzedAlkeneHydration,
  "alkene-oxymercuration": oxymercurationAlkene,
  "alkene-hydroboration": hydroborationAlkene,
  "alkene-halohydrin": halohydrinAlkene,
  "alkene-halogenation": halogenationAlkene,
  "alkene-hydrogenation": hydrogenationAlkene,
  "alkene-ozonolysis": alkeneOzonolysis,
  "alkene-epoxidation": alkeneEpoxidation,
  "alkene-dihydroxylation": alkeneDihydroxylation,
  "alkene-anti-dihydroxylation": alkeneDihydroxylation,
  "alkene-cyclopropanation": alkeneCyclopropanation,
  "alkene-oxidative-cleavage": alkeneOxidativeCleavage,
  "alkyne-hydrogenation": completeAlkyneHydrogenation,
  "alkyne-lindlar": (smiles) => partialAlkyneReduction(smiles, "cis", "Lindlar reduction produced the cis (Z) alkene when E/Z stereochemistry applies."),
  "alkyne-na-nh3": (smiles) => partialAlkyneReduction(smiles, "trans", "Dissolving-metal reduction produced the trans (E) alkene when E/Z stereochemistry applies."),
  "alkyne-hydration": terminalAlkyneHydration,
  "alkyne-hydroboration": terminalAlkyneHydroboration,
  "alkyne-hx": (smiles) => terminalAlkyneHydrohalogenation(smiles, false),
  "alkyne-halogenation": oneEquivalentAlkyneHalogenation,
  "alkyne-acetylide": terminalAlkyneAlkylation,
  "alkyne-hx-two-equivalents": (smiles) => terminalAlkyneHydrohalogenation(smiles, true),
  "alkyne-halogenation-two-equivalents": twoEquivalentAlkyneHalogenation,
  "alkyne-oxidative-cleavage": internalAlkyneOxidativeCleavage,
  "alkyne-internal-hydration": internalAlkyneHydration,
  "halide-sn2": (smiles) => halideReplacement(smiles, "O", "SN2 substitution replaced the leaving group with hydroxide to give the alcohol."),
  "halide-sn1": (smiles) => halideReplacement(smiles, "O", "SN1 solvolysis replaced the leaving group with an alcohol group. Rearrangements are not modeled."),
  "halide-e2": halideElimination,
  "halide-e1": halideElimination,
  "halide-grignard-formation": (smiles) => halideReplacement(smiles, "[Mg]Br", "Magnesium inserted into the carbon-halogen bond to form the Grignard reagent. The drawing uses MgBr as the organometallic group."),
  "halide-organolithium-formation": (smiles) => halideReplacement(smiles, "[Li]", "Lithium-halogen exchange formed an organolithium reagent. The drawing omits inorganic salts."),
  "halide-organocuprate-coupling": (smiles) => halideReplacement(smiles, "C", "Organocuprate coupling replaced the halide with a methyl fragment as the displayed coupling partner."),
  "halide-nitrile-formation": (smiles) => terminalHalideReplacement(smiles, "C#N", "Cyanide displaced the terminal halide by an SN2 reaction and added one carbon atom to the chain."),
  "amine-gabriel-synthesis": (smiles) => terminalHalideReplacement(smiles, "N", "Gabriel synthesis converted the terminal primary alkyl halide into a primary amine."),
  "alcohol-hx": (smiles) => alcoholReplacement(smiles, "Br", "HX converted the alcohol into an alkyl bromide in this displayed rule."),
  "alcohol-pbr3": (smiles) => terminalAlcohol(smiles, "Br", "PBr3 replaced the alcohol group with bromine."),
  "alcohol-socl2": (smiles) => terminalAlcohol(smiles, "Cl", "SOCl2 replaced the alcohol group with chlorine."),
  "alcohol-tosylate": (smiles) => alcoholReplacement(smiles, "OS(=O)(=O)c1ccccc1", "Tosyl chloride converted the alcohol into a tosylate leaving group."),
  "alcohol-alkoxide-formation": (smiles) => terminalAlcohol(smiles, "[O-]", "Deprotonation converted the alcohol into an alkoxide. The counterion is omitted from the structural drawing."),
  "alcohol-deoxygenation": (smiles) => terminalAlcohol(smiles, "", "Deoxygenation replaced the terminal alcohol group with hydrogen."),
  "alcohol-oxidation-primary": primaryAlcoholOxidation,
  "alcohol-oxidation-secondary": secondaryAlcoholOxidation,
  "alcohol-dehydration": alcoholDehydration,
  "ether-cleavage": etherCleavage,
  "ether-williamson": williamsonEther,
  "amine-nitrous-acid": (smiles) => replace(smiles, /N$/g, "O", "Nitrous acid converted the terminal primary aliphatic amine into an alcohol with loss of nitrogen gas."),
  "amine-alkylation": (smiles) => replace(smiles, /N$/g, "NC", "Alkylation added a methyl substituent to the amine as the displayed alkyl group."),
  "amine-acylation": (smiles) => replace(smiles, /N$/g, "NC(C)=O", "Acylation converted the amine into an amide using an acetyl group as the displayed acyl fragment."),
  "epoxide-opening-basic": ethyleneOxideHydrolysis,
  "epoxide-opening-acid": ethyleneOxideHydrolysis,
  "epoxide-opening-hydride": ethyleneOxideHydrideOpening,
  "epoxide-opening-alkoxide": ethyleneOxideMethoxideOpening,
  "epoxide-grignard": ethyleneOxideGrignardOpening,
  "halohydrin-epoxide-formation": bromoethanolToEthyleneOxide,
  "acid-esterification": carboxylicAcidToMethylEster,
  "acid-decarboxylation": decarboxylation,
  "acid-hvz": hvzBromination,
  "acid-malonic-ester-synthesis": malonicEsterSynthesis,
  "acid-acetoacetic-ester-synthesis": acetoaceticEsterSynthesis,
  "ester-hydrolysis": esterToCarboxylate,
  "ester-acidic-hydrolysis": esterToCarboxylicAcid,
  "ester-reduction": esterToPrimaryAlcohol,
  "ester-dibal": esterToAldehyde,
  "ester-grignard": esterToTertiaryAlcohol,
  "ester-transesterification": esterTransesterification,
  "anhydride-ester": anhydrideToEster,
  "anhydride-hydrolysis": anhydrideHydrolysis,
  "anhydride-amide": anhydrideToAmide,
  "anhydride-reduction": anhydrideReduction,
  "lactone-hydrolysis": lactoneHydrolysis,
  "lactone-formation": lactoneFormation,
  "benzene-bromination": (smiles) => benzeneSubstitution(smiles, "Br", "Electrophilic aromatic substitution converted benzene into bromobenzene."),
  "benzene-chlorination": (smiles) => benzeneSubstitution(smiles, "Cl", "Electrophilic aromatic substitution converted benzene into chlorobenzene."),
  "benzene-nitration": (smiles) => benzeneSubstitution(smiles, "[N+](=O)[O-]", "Electrophilic aromatic substitution converted benzene into nitrobenzene."),
  "benzene-sulfonation": (smiles) => benzeneSubstitution(smiles, "S(=O)(=O)(O)", "Electrophilic aromatic substitution converted benzene into benzenesulfonic acid."),
  "benzene-friedel-crafts": (smiles) => benzeneSubstitution(smiles, "C", "Friedel-Crafts alkylation attached a methyl group as the displayed alkyl fragment."),
  "benzene-fc-acylation": (smiles) => benzeneSubstitution(smiles, "C(C)=O", "Friedel-Crafts acylation attached an acetyl group as the displayed acyl fragment."),
  "benzene-side-chain-oxidation": alkylbenzeneSideChainOxidation,
  "benzene-alkyl-side-chain-bromination": benzylicBromination,
  "benzene-nucleophilic-aromatic-substitution": activatedArylHalideHydrolysis,
  "benzene-nitro-reduction": nitrobenzeneToAniline,
  "benzene-diazonium": anilineToDiazonium,
  "benzene-sandmeyer": (smiles) => diazoniumReplacement(smiles, "Cl", "Sandmeyer substitution replaced the diazonium group with chlorine and released nitrogen gas."),
  "benzene-diazonium-phenol": (smiles) => diazoniumReplacement(smiles, "O", "Hydrolysis replaced the diazonium group with a hydroxyl group and released nitrogen gas."),
  "benzene-diazonium-iodide": (smiles) => diazoniumReplacement(smiles, "I", "Iodide replaced the diazonium group and released nitrogen gas."),
  "benzene-diazonium-reduction": (smiles) => diazoniumReplacement(smiles, "", "Reduction replaced the diazonium group with hydrogen and released nitrogen gas."),
  "benzene-birch-reduction": benzeneBirchReduction,
  "carbonyl-reduction": carbonylToAlcohol,
  "carbonyl-grignard": carbonylGrignard,
  "carbonyl-wittig": carbonylWittig,
  "carbonyl-cyanohydrin": (smiles) => carbonylAddition(smiles, "C(O)(C#N)", "C(O)C#N", "Cyanide addition followed by protonation converted the carbonyl group into a cyanohydrin."),
  "carbonyl-hydrate": (smiles) => carbonylAddition(smiles, "C(O)(O)", "C(O)O", "Hydration converted the carbonyl group into a geminal diol."),
  "carbonyl-hemiacetal": (smiles) => carbonylAddition(smiles, "C(O)(OC)", "C(O)OC", "Addition of methanol produced the displayed hemiacetal."),
  "carbonyl-acetal": carbonylAcetal,
  "carbonyl-acetal-hydrolysis": acetalHydrolysis,
  "carbonyl-oxime": (smiles) => carbonylCondensation(smiles, "C(=NO)", "C=NO", "Reaction with hydroxylamine converted the carbonyl group into an oxime."),
  "carbonyl-hydrazone": (smiles) => carbonylCondensation(smiles, "C(=NN)", "C=NN", "Reaction with hydrazine converted the carbonyl group into a hydrazone."),
  "carbonyl-imine": (smiles) => carbonylCondensation(smiles, "C=NC", "C=NC", "Condensation with a primary amine produced the displayed imine."),
  "carbonyl-enamine": carbonylEnamine,
  "carbonyl-clemmensen": carbonylToMethylene,
  "carbonyl-wolff-kishner": carbonylToMethylene,
  "carbonyl-baeyer-villiger": baeyerVilliger,
  "carbonyl-alpha-bromination": alphaBromination,
  "carbonyl-organocuprate-conjugate-addition": conjugateAddition,
  "carbonyl-aldol": aldolAddition,
  "carbonyl-aldol-condensation": aldolCondensation,
  "carbonyl-crossed-aldol": aldolCondensation,
  "carbonyl-intramolecular-aldol": intramolecularAldol,
  "carbonyl-cannizzaro": cannizzaro,
  "carbonyl-haloform": haloform,
  "carbonyl-michael-addition": conjugateAddition,
  "carbonyl-enolate-alkylation": alphaMethylation,
  "carbonyl-stork-enamine": alphaMethylation,
  "carbonyl-robinson-annulation": robinsonAnnulation,
  "aldehyde-oxidation": (smiles) => replace(smiles, /C=O$/g, "C(=O)O", "Oxidation converted the aldehyde group into a carboxylic acid."),
  "acid-reduction": (smiles) => replace(smiles, /C\(=O\)O/g, "CO", "Reduction converted the carboxylic acid group into a primary alcohol."),
  "acid-deprotonation": carboxylicAcidToCarboxylate,
  "acid-bicarbonate": carboxylicAcidToCarboxylate,
  "acid-diazomethane": (smiles) => replace(smiles, /C\(=O\)O/g, "C(=O)OC", "Diazomethane converted the carboxylic acid into its methyl ester."),
  "acid-socl2": (smiles) => replace(smiles, /C\(=O\)O/g, "C(=O)Cl", "SOCl2 converted the carboxylic acid into an acid chloride."),
  "acid-chloride-ester": (smiles) => replace(smiles, /C\(=O\)Cl/g, "C(=O)OC", "Alcohol converted the acid chloride into a methyl ester as the displayed alcohol partner."),
  "acid-chloride-anhydride": (smiles) => replace(smiles, /C\(=O\)Cl/g, "C(=O)OC(=O)C", "Carboxylate converted the acid chloride into an anhydride. Acetate is used as the displayed partner."),
  "acid-chloride-gilman": (smiles) => replace(smiles, /C\(=O\)Cl/g, "C(=O)C", "Gilman reagent converted the acid chloride into a ketone using methyl as the displayed alkyl group."),
  "acid-chloride-hydrolysis": (smiles) => replace(smiles, /C\(=O\)Cl/g, "C(=O)O", "Hydrolysis converted the acid chloride into a carboxylic acid."),
  "acid-chloride-amide": (smiles) => replace(smiles, /C\(=O\)Cl/g, "C(=O)N", "Reaction with ammonia converted the acid chloride into a primary amide."),
  "acid-chloride-reduction": (smiles) => replace(smiles, /C\(=O\)Cl/g, "C=O", "Rosenmund reduction converted the acid chloride into an aldehyde."),
  "nitrile-hydrolysis": (smiles) => replace(smiles, /C#N/g, "C(=O)O", "Hydrolysis converted the nitrile into a carboxylic acid."),
  "nitrile-basic-hydrolysis": (smiles) => replace(smiles, /C#N/g, "C(=O)O", "Basic hydrolysis followed by acidic workup converted the nitrile into a carboxylic acid."),
  "nitrile-reduction": (smiles) => replace(smiles, /C#N/g, "CN", "Reduction converted the nitrile into a primary amine."),
  "nitrile-dibal": (smiles) => replace(smiles, /C#N/g, "C=O", "Partial DIBAL-H reduction followed by hydrolysis converted the nitrile into an aldehyde."),
  "nitrile-grignard": (smiles) => replace(smiles, /C#N/g, "C(=O)C", "Grignard addition to the nitrile followed by hydrolysis gave a ketone. Methyl is used as the displayed Grignard fragment."),
  "amide-reduction": (smiles) => replace(smiles, /C\(=O\)N/g, "CN", "LiAlH4 reduction converted the amide carbonyl group into a methylene group while retaining nitrogen."),
  "amide-hydrolysis": (smiles) => replace(smiles, /C\(=O\)N/g, "C(=O)O", "Acidic hydrolysis converted the amide into a carboxylic acid."),
  "amide-basic-hydrolysis": (smiles) => replace(smiles, /C\(=O\)N/g, "C(=O)[O-]", "Basic hydrolysis converted the amide into a carboxylate salt. The counterion is omitted from the structural drawing."),
  "amide-dehydration": (smiles) => replace(smiles, /C\(=O\)N/g, "C#N", "Dehydration converted the primary amide into a nitrile."),
  "amide-hofmann": (smiles) => replace(smiles, /C\(=O\)N/g, "N", "Hofmann rearrangement converted the primary amide into an amine with one fewer carbon atom."),
  "amine-reductive-amination": reductiveAmination,
  "amine-hofmann-elimination": hofmannElimination,
  "ester-aminolysis": esterAminolysis,
  "ester-enolate-alkylation": esterAlphaMethylation,
  "claisen-condensation": claisenCondensation,
  "ester-dieckmann": dieckmannCondensation,
  "cyclic-bromination": cyclohexeneAntiBromination,
  "cyclic-dihydroxylation": cyclohexeneSynDihydroxylation,
  "cyclic-hydroboration": hydroborationAlkene,
  "cyclic-oxymercuration": oxymercurationAlkene,
  "cyclic-hydrogenation": hydrogenationAlkene,
  "cyclic-e2": methylcyclohexeneE2,
};

type ProductPredictorProps = {
  reactionId: string;
  expectedProduct: string;
  generalScheme: string;
};

export default function ProductPredictor({ reactionId, expectedProduct, generalScheme }: ProductPredictorProps) {
  const substrateRef = useRef<HTMLIFrameElement>(null);
  const productRef = useRef<HTMLIFrameElement>(null);
  const [message, setMessage] = useState("");
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [substrateName, setSubstrateName] = useState("");

  useEffect(() => {
    setMessage("");
    setPrediction(null);
    setSubstrateName("");
    void editor(productRef)?.setMolecule("");
  }, [reactionId]);

  async function predict() {
    const substrateEditor = editor(substrateRef);
    const productEditor = editor(productRef);
    if (!substrateEditor || !productEditor) {
      setMessage("The chemical editor is still loading. Try again in a moment.");
      return;
    }
    const smiles = normalizeKetcherSmiles((await substrateEditor.getSmiles()).trim());
    if (!smiles) {
      setMessage("Draw a starting material before predicting the product.");
      return;
    }
    setSubstrateName(simpleHydrocarbonName(smiles));
    const transformation = transformations[reactionId];
    if (!transformation) {
      await productEditor.setMolecule("");
      setPrediction(fallbackPrediction(expectedProduct, generalScheme));
      setMessage("");
      return;
    }
    const result = transformation(smiles);
    if (!result || result.product === smiles) {
      await productEditor.setMolecule("");
      setPrediction(fallbackPrediction(expectedProduct, generalScheme, `The exact structural drawing could not be generated safely from the read structure: ${smiles}`));
      setMessage("");
      return;
    }
    await productEditor.setMolecule(result.product);
    setPrediction({ ...result, expectedProduct, generalScheme, exactStructure: true });
    setMessage("");
  }

  async function clear() {
    await editor(substrateRef)?.setMolecule("");
    await editor(productRef)?.setMolecule("");
    setPrediction(null);
    setSubstrateName("");
    setMessage("");
  }

  return (
    <section className="mt-4 border-l-4 border-amber-400 bg-amber-50 p-4">
      <h3 className="font-bold text-amber-950">Draw a substrate and predict its product</h3>
      <p className="mt-1 text-sm leading-6 text-amber-900">
        Draw a compound containing the required functional group. The verified predictor preserves your carbon framework and renders the expected product when this reaction rule is enabled.
      </p>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Editor title="Starting material" name={substrateName} ref={substrateRef} />
        <Editor
          title="Expected product"
          summary={prediction ? productSummary(prediction) : ""}
          ref={productRef}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={predict} className="rounded-lg bg-orange-700 px-5 py-3 font-bold text-white hover:bg-orange-800">
          Predict product
        </button>
        <button type="button" onClick={clear} className="rounded-lg border border-amber-300 bg-white px-5 py-3 font-bold text-amber-950 hover:bg-amber-100">
          Clear
        </button>
      </div>
      {message && <p className="mt-4 rounded-lg border border-amber-300 bg-white p-3 text-sm leading-6 text-amber-950">{message}</p>}
      {prediction && (
        <div className={`mt-4 rounded-lg border p-3 text-sm leading-6 ${prediction.exactStructure ? "border-emerald-300 bg-emerald-50 text-emerald-950" : "border-amber-300 bg-white text-amber-950"}`}>
          {prediction.exactStructure ? (
            <p className="font-bold">Predicted product SMILES: <span className="font-mono">{prediction.product}</span></p>
          ) : (
            <>
              <p className="font-bold">Expected product type: {prediction.expectedProduct}</p>
              <p className="mt-1 font-mono" dir="ltr">General scheme: {prediction.generalScheme}</p>
            </>
          )}
          <p>{prediction.note}</p>
        </div>
      )}
    </section>
  );
}

const Editor = forwardRef<HTMLIFrameElement, { title: string; name?: string; summary?: string }>(function Editor({ title, name, summary }, ref) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-bold uppercase text-amber-950">{title}</h4>
      <iframe ref={ref} src={editorUrl} className="h-[360px] w-full rounded-lg border border-amber-200 bg-white" title={title} />
      {name && <p className="mt-2 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-bold text-amber-950">Name: {name}</p>}
      {summary && <p className="mt-2 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-bold text-amber-950">{summary}</p>}
    </div>
  );
});

function replace(smiles: string, pattern: RegExp, replacement: string, note: string): Prediction | null {
  if (!pattern.test(smiles)) return null;
  return exactPrediction(smiles.replace(pattern, replacement), note);
}
function exactPrediction(product: string, note: string): Prediction {
  return { product, note, expectedProduct: "", generalScheme: "", exactStructure: true };
}
function fallbackPrediction(expectedProduct: string, generalScheme: string, note = "The expected product is shown as a verified general scheme. An exact structural drawing is not generated yet because this reaction needs an additional regioselectivity, stereochemistry, or reagent-fragment rule.") {
  return { product: "", expectedProduct, generalScheme, exactStructure: false, note };
}
function productSummary(prediction: Prediction) {
  if (!prediction.exactStructure) return `Expected product type: ${prediction.expectedProduct}`;
  const name = simpleHydrocarbonName(prediction.product);
  return name ? `Name: ${name}` : `Expected product type: ${prediction.expectedProduct}`;
}
function normalizeKetcherSmiles(smiles: string) {
  const normalized = smiles
    .split(/\s+\|/)[0]
    .replace(/\[H\]/g, "")
    .replace(/\[(?:\d+)?(C|N|O|F|Cl|Br|I)H?\d*[^\]]*\]/g, "$1")
    .replace(/-/g, "");
  return linearCarbonChain(normalized) ?? normalized;
}
function linearCarbonChain(smiles: string) {
  if (!/^[C()#=\\/]+$/.test(smiles)) return null;
  const atoms: { bonds: { atom: number; symbol: string }[] }[] = [];
  const branches: number[] = [];
  let current = -1;
  let symbol = "";
  for (const token of smiles) {
    if (token === "(") { branches.push(current); continue; }
    if (token === ")") { current = branches.pop() ?? current; continue; }
    if (token === "#" || token === "=" || token === "/" || token === "\\") { symbol = token; continue; }
    if (token !== "C") return null;
    const next = atoms.push({ bonds: [] }) - 1;
    if (current >= 0) {
      atoms[current].bonds.push({ atom: next, symbol });
      atoms[next].bonds.push({ atom: current, symbol });
    }
    current = next;
    symbol = "";
  }
  if (!atoms.length || atoms.some((atom) => atom.bonds.length > 2)) return null;
  const terminal = atoms.findIndex((atom) => atom.bonds.length <= 1);
  if (terminal < 0) return null;
  let result = "C";
  let previous = -1;
  current = terminal;
  while (true) {
    const bond = atoms[current].bonds.find((item) => item.atom !== previous);
    if (!bond) break;
    result += `${bond.symbol}C`;
    previous = current;
    current = bond.atom;
  }
  return result;
}
type AcyclicAtom = { element: "C" | "Br" | "O"; bonds: { atom: number; symbol: string }[] };
type AcyclicGraph = { atoms: AcyclicAtom[] };
function alkaneHalogenation(smiles: string, halogen: "Cl" | "Br") {
  if (!/^C+$/.test(smiles)) return null;
  return exactPrediction(smiles.replace(/C$/, `C${halogen}`), `Radical halogenation replaced one terminal hydrogen with ${halogen}. Constitutional mixtures are possible for larger alkanes.`);
}
function combustionProducts(smiles: string) {
  if (!/C/.test(smiles)) return null;
  return exactPrediction("O=C=O.O", "Combustion is represented by carbon dioxide and water. Stoichiometric coefficients are omitted from the structural drawing.");
}
function alkaneCracking(smiles: string) {
  if (!/^C{5,}$/.test(smiles)) return null;
  const midpoint = Math.floor((smiles.match(/C/g) ?? []).length / 2);
  return exactPrediction(`${"C".repeat(midpoint)}.${"C".repeat(Math.max(2, smiles.length - midpoint - 1))}=C`, "Cracking is represented by a shorter alkane and a shorter alkene fragment.");
}
function parseAcyclicCarbonGraph(smiles: string): AcyclicGraph | null {
  if (!/^[C()=#\\/]+$/.test(smiles) || /[0-9]/.test(smiles)) return null;
  const atoms: AcyclicAtom[] = [];
  const branches: number[] = [];
  let current = -1;
  let symbol = "";
  for (const token of smiles) {
    if (token === "(") {
      if (current < 0) return null;
      branches.push(current);
      continue;
    }
    if (token === ")") {
      current = branches.pop() ?? -1;
      if (current < 0) return null;
      continue;
    }
    if (token === "=" || token === "#") {
      symbol = token;
      continue;
    }
    if (token === "/" || token === "\\") {
      continue;
    }
    if (token !== "C") return null;
    const next = atoms.push({ element: "C", bonds: [] }) - 1;
    if (current >= 0) {
      atoms[current].bonds.push({ atom: next, symbol });
      atoms[next].bonds.push({ atom: current, symbol });
    }
    current = next;
    symbol = "";
  }
  if (!atoms.length || branches.length) return null;
  return { atoms };
}
function carbonSubstitution(graph: AcyclicGraph, atom: number, alkenePartner: number) {
  return graph.atoms[atom].bonds.filter((bond) => bond.atom !== alkenePartner && graph.atoms[bond.atom].element === "C").length;
}
function serializeAcyclicGraph(graph: AcyclicGraph) {
  const root = graph.atoms.findIndex((atom) => atom.element === "C" && atom.bonds.length <= 1);
  const visited = new Set<number>();
  return serializeFrom(root >= 0 ? root : 0, -1, graph, visited);
}
function serializeFrom(atomIndex: number, parent: number, graph: AcyclicGraph, visited: Set<number>): string {
  visited.add(atomIndex);
  const atom = graph.atoms[atomIndex];
  const neighbors = atom.bonds
    .filter((bond) => bond.atom !== parent && !visited.has(bond.atom))
    .sort((a, b) => Number(graph.atoms[a.atom].element !== "C") - Number(graph.atoms[b.atom].element !== "C"));
  const main = neighbors.find((bond) => graph.atoms[bond.atom].element === "C") ?? neighbors[0];
  const branches = neighbors.filter((bond) => bond !== main);
  let text = atom.element;
  for (const branch of branches) {
    text += `(${branch.symbol}${serializeFrom(branch.atom, atomIndex, graph, visited)})`;
  }
  if (main) text += `${main.symbol}${serializeFrom(main.atom, atomIndex, graph, visited)}`;
  return text;
}
function terminalAlcohol(smiles: string, halogen: string, note: string) {
  if (!/O$/.test(smiles) || /C\(=O\)O$/.test(smiles)) return null;
  return exactPrediction(smiles.replace(/O$/, halogen), note);
}
function alcoholReplacement(smiles: string, replacement: string, note: string) {
  if (/C\(=O\)O/.test(smiles)) return null;
  if (/O$/.test(smiles)) return exactPrediction(smiles.replace(/O$/, replacement), note);
  if (/C\(O\)/.test(smiles)) return exactPrediction(smiles.replace(/C\(O\)/, `C(${replacement})`), note);
  return null;
}
function halideReplacement(smiles: string, replacement: string, note: string) {
  if (!/(Cl|Br|I)/.test(smiles)) return null;
  return exactPrediction(smiles.replace(/(Cl|Br|I)(?!.*(?:Cl|Br|I))/, replacement), note);
}
function terminalHalideReplacement(smiles: string, group: string, note: string) {
  if (!/(?:Cl|Br|I)$/.test(smiles)) return null;
  return exactPrediction(smiles.replace(/(?:Cl|Br|I)$/, group), note);
}
function halideElimination(smiles: string) {
  const terminal = smiles.match(/^(.*)C(?:Cl|Br|I)$/);
  if (terminal && /C$/.test(terminal[1])) {
    return exactPrediction(`${terminal[1]}=C`, "Elimination removed HX and formed the terminal alkene. Zaitsev and stereochemical alternatives are not exhaustively modeled.");
  }
  const secondary = smiles.match(/^(.*)C\((?:Cl|Br|I)\)C(.*)$/);
  if (secondary) {
    return exactPrediction(`${secondary[1]}C=C${secondary[2]}`, "Elimination removed HX and formed an alkene between the halogen-bearing carbon and an adjacent carbon.");
  }
  return null;
}
function primaryAlcoholOxidation(smiles: string) {
  if (/CO$/.test(smiles)) return exactPrediction(smiles.replace(/CO$/, "C=O"), "Primary alcohol oxidation is shown to the aldehyde stage. Stronger oxidants can continue to the carboxylic acid.");
  return null;
}
function secondaryAlcoholOxidation(smiles: string) {
  if (/C\(O\)/.test(smiles)) return exactPrediction(smiles.replace(/C\(O\)/, "C(=O)"), "Secondary alcohol oxidation converted the alcohol into a ketone.");
  return null;
}
function alcoholDehydration(smiles: string) {
  if (/CC\(O\)/.test(smiles)) return exactPrediction(smiles.replace(/CC\(O\)/, "C=C"), "Dehydration removed water and formed the alkene. Regioisomeric alkenes can occur for unsymmetrical substrates.");
  if (/C\(O\)C/.test(smiles)) return exactPrediction(smiles.replace(/C\(O\)C/, "C=C"), "Dehydration removed water and formed the alkene. Regioisomeric alkenes can occur for unsymmetrical substrates.");
  if (/CO$/.test(smiles)) return exactPrediction(smiles.replace(/CO$/, "=C"), "Dehydration of a terminal alcohol formed the terminal alkene when a beta hydrogen is available.");
  return null;
}
function etherCleavage(smiles: string) {
  if (!/COC/.test(smiles)) return null;
  return exactPrediction(smiles.replace(/COC/, "CO.CBr"), "Acidic ether cleavage is represented as one alcohol fragment and one alkyl bromide fragment.");
}
function williamsonEther(smiles: string) {
  if (/\[O-\]$/.test(smiles)) return exactPrediction(smiles.replace(/\[O-\]$/, "OC"), "Williamson synthesis is represented by methylation of the alkoxide to form an ether.");
  if (/O$/.test(smiles)) return exactPrediction(smiles.replace(/O$/, "OC"), "Williamson synthesis is represented by converting the alcohol-derived alkoxide into a methyl ether.");
  return null;
}
function ethyleneOxideHydrolysis(smiles: string) {
  if (!isEthyleneOxide(smiles)) return null;
  return exactPrediction("OCCO", "Ring opening of ethylene oxide with water produced ethylene glycol.");
}
function ethyleneOxideHydrideOpening(smiles: string) {
  if (!isEthyleneOxide(smiles)) return null;
  return exactPrediction("CCO", "Hydride opened ethylene oxide and produced ethanol after acidic workup.");
}
function ethyleneOxideMethoxideOpening(smiles: string) {
  if (!isEthyleneOxide(smiles)) return null;
  return exactPrediction("COCCO", "Methoxide opened ethylene oxide to give a beta-methoxy alcohol after workup.");
}
function ethyleneOxideGrignardOpening(smiles: string) {
  if (!isEthyleneOxide(smiles)) return null;
  return exactPrediction("CCCO", "A methyl Grignard reagent opened ethylene oxide and extended the chain by two carbons before protonation.");
}
function bromoethanolToEthyleneOxide(smiles: string) {
  if (smiles !== "OCCBr" && smiles !== "BrCCO") return null;
  return exactPrediction("C1CO1", "Intramolecular substitution converted 2-bromoethanol into ethylene oxide.");
}
function isEthyleneOxide(smiles: string) {
  return smiles === "C1CO1" || smiles === "O1CC1";
}
function esterToCarboxylate(smiles: string) {
  if (!/C\(=O\)O[^.]+$/.test(smiles)) return null;
  return exactPrediction(smiles.replace(/C\(=O\)O[^.]+$/, "C(=O)[O-]"), "Base-promoted hydrolysis converted the ester into a carboxylate salt. The alcohol coproduct and counterion are omitted from the structural drawing.");
}
function esterToCarboxylicAcid(smiles: string) {
  if (!/C\(=O\)O[^.]+$/.test(smiles)) return null;
  return exactPrediction(smiles.replace(/C\(=O\)O[^.]+$/, "C(=O)O"), "Acid-catalyzed hydrolysis converted the ester into a carboxylic acid. The alcohol coproduct is omitted from the structural drawing.");
}
function esterToPrimaryAlcohol(smiles: string) {
  if (!/C\(=O\)O[^.]+$/.test(smiles)) return null;
  return exactPrediction(smiles.replace(/C\(=O\)O[^.]+$/, "CO"), "LiAlH4 reduction converted the ester acyl fragment into a primary alcohol. The alcohol formed from the alkoxy fragment is omitted from the structural drawing.");
}
function esterToAldehyde(smiles: string) {
  if (!/C\(=O\)O[^.]+$/.test(smiles)) return null;
  return exactPrediction(smiles.replace(/C\(=O\)O[^.]+$/, "C=O"), "DIBAL-H partial reduction converted the ester into an aldehyde.");
}
function carboxylicAcidToMethylEster(smiles: string) {
  return replace(smiles, /C\(=O\)O/g, "C(=O)OC", "Fischer esterification converted the carboxylic acid into the methyl ester as the displayed alcohol partner.");
}
function decarboxylation(smiles: string) {
  if (!/C\(=O\)O/.test(smiles)) return null;
  return exactPrediction(smiles.replace(/C\(=O\)O/, ""), "Decarboxylation removed the carboxyl group as carbon dioxide. The remaining organic fragment is shown.");
}
function hvzBromination(smiles: string) {
  if (/CC\(=O\)O/.test(smiles)) return exactPrediction(smiles.replace(/CC\(=O\)O/, "C(Br)C(=O)O"), "HVZ bromination installed bromine at the alpha carbon of the carboxylic acid.");
  return null;
}
function malonicEsterSynthesis(smiles: string) {
  if (!/C\(=O\)O/.test(smiles)) return null;
  return exactPrediction("CCC(=O)O", "Malonic ester synthesis is represented by formation of a substituted acetic acid after hydrolysis and decarboxylation. Ethyl is used as the displayed alkyl group.");
}
function acetoaceticEsterSynthesis(smiles: string) {
  if (!/C\(=O\)/.test(smiles)) return null;
  return exactPrediction("CCC(=O)C", "Acetoacetic ester synthesis is represented by formation of an alkylated methyl ketone. Ethyl is used as the displayed alkyl group.");
}
function esterToTertiaryAlcohol(smiles: string) {
  if (!/C\(=O\)O[^.]+$/.test(smiles)) return null;
  return exactPrediction(smiles.replace(/C\(=O\)O[^.]+$/, "C(O)(C)C"), "Excess Grignard reagent converted the ester into a tertiary alcohol. Methyl groups are used as the displayed Grignard fragments.");
}
function esterTransesterification(smiles: string) {
  if (!/C\(=O\)O[^.]+$/.test(smiles)) return null;
  return exactPrediction(smiles.replace(/C\(=O\)O[^.]+$/, "C(=O)OC"), "Transesterification replaced the alkoxy group with methoxy as the displayed alcohol partner.");
}
function anhydrideToEster(smiles: string) {
  if (!/C\(=O\)OC\(=O\)/.test(smiles)) return null;
  return exactPrediction(smiles.replace(/C\(=O\)OC\(=O\).*/, "C(=O)OC"), "Alcoholysis converted one anhydride acyl fragment into an ester. The carboxylic acid coproduct is omitted.");
}
function anhydrideHydrolysis(smiles: string) {
  if (!/C\(=O\)OC\(=O\)/.test(smiles)) return null;
  return exactPrediction(smiles.replace(/C\(=O\)OC\(=O\).*/, "C(=O)O"), "Hydrolysis converted the anhydride into carboxylic acids. One representative acid fragment is shown.");
}
function anhydrideToAmide(smiles: string) {
  if (!/C\(=O\)OC\(=O\)/.test(smiles)) return null;
  return exactPrediction(smiles.replace(/C\(=O\)OC\(=O\).*/, "C(=O)N"), "Ammonia or an amine converted one anhydride acyl fragment into an amide. The acid coproduct is omitted.");
}
function anhydrideReduction(smiles: string) {
  if (!/C\(=O\)OC\(=O\)/.test(smiles)) return null;
  return exactPrediction(smiles.replace(/C\(=O\)OC\(=O\).*/, "CO"), "LiAlH4 reduction of the anhydride is represented by the primary alcohol from one acyl fragment.");
}
function lactoneHydrolysis(smiles: string) {
  if (!/C1.*C\(=O\)O.*1|O1.*C\(=O\).*1/.test(smiles)) return null;
  return exactPrediction("OCCCC(=O)O", "Lactone hydrolysis opened the ring to a hydroxy carboxylic acid. The drawing shows a representative open-chain product.");
}
function lactoneFormation(smiles: string) {
  if (!/O.*C\(=O\)O|C\(=O\)O.*O/.test(smiles)) return null;
  return exactPrediction("O=C1OCCC1", "Intramolecular esterification formed a lactone. The drawing shows a representative five-membered lactone.");
}
function carboxylicAcidToCarboxylate(smiles: string) {
  return replace(smiles, /C\(=O\)O/g, "C(=O)[O-]", "Deprotonation converted the carboxylic acid into a carboxylate salt. The counterion is omitted from the structural drawing.");
}
function terminalAlkeneAddition(smiles: string, position: "terminal" | "internal", group: string, note: string) {
  if (/^C=C/.test(smiles)) {
    return exactPrediction(smiles.replace(/^C=C/, position === "terminal" ? `${group}CC` : `CC(${group})`), note);
  }
  if (/C=C$/.test(smiles)) {
    return exactPrediction(smiles.replace(/C=C$/, position === "terminal" ? `CC${group}` : `C(${group})C`), note);
  }
  return null;
}
function terminalAlkeneHalohydrin(smiles: string) {
  const note = "Halohydrin formation placed the alcohol group at the more substituted carbon and bromine at the less substituted carbon. The addition is anti.";
  if (/^C=C/.test(smiles)) return exactPrediction(smiles.replace(/^C=C/, "BrCC(O)"), note);
  if (/C=C$/.test(smiles)) return exactPrediction(smiles.replace(/C=C$/, "C(O)CBr"), note);
  return null;
}
function acidCatalyzedAlkeneHydration(smiles: string) {
  return branchedTerminalAlkeneAlcohol(smiles, "more") ?? regioselectiveAlkeneAddition(
    smiles,
    "O",
    "more",
    "Acid-catalyzed hydration placed the alcohol group at the more substituted alkene carbon. Carbocation rearrangements are not modeled.",
    "Acid-catalyzed hydration can give regioisomeric alcohols for this alkene, so both connectivity products are shown.",
  ) ?? methylcycloalkeneAlcohol(smiles, "more", "Acid-catalyzed hydration produced the Markovnikov cycloalkanol.");
}
function oxymercurationAlkene(smiles: string) {
  return branchedTerminalAlkeneAlcohol(smiles, "more") ?? regioselectiveAlkeneAddition(
    smiles,
    "O",
    "more",
    "Oxymercuration-demercuration placed the alcohol group at the more substituted alkene carbon without rearrangement.",
    "Oxymercuration can give regioisomeric alcohols for this alkene, so both connectivity products are shown.",
  ) ?? methylcycloalkeneAlcohol(smiles, "more", "Oxymercuration-demercuration produced the Markovnikov cycloalkanol.");
}
function hydroborationAlkene(smiles: string) {
  return branchedTerminalAlkeneAlcohol(smiles, "less") ?? regioselectiveAlkeneAddition(
    smiles,
    "O",
    "less",
    "Hydroboration-oxidation placed the alcohol group at the less substituted alkene carbon. The addition is syn when stereochemistry applies.",
    "Hydroboration can give regioisomeric alcohols for this alkene, so both connectivity products are shown.",
  ) ?? methylcycloalkeneAlcohol(smiles, "less", "Hydroboration-oxidation produced the anti-Markovnikov cycloalkanol.");
}
function alkeneEpoxidation(smiles: string) {
  const branched = branchedTerminalAlkeneEpoxide(smiles);
  if (branched) return branched;
  return replace(smiles, /C=C/, "C1OC1", "Peroxyacid epoxidation converted the alkene into an epoxide while preserving the alkene substituent relationship.");
}
function alkeneDihydroxylation(smiles: string) {
  const product = alkeneAdditionProduct(smiles, "both", "O", "O");
  if (product) return exactPrediction(product, "Dihydroxylation added OH to both alkene carbons. The drawing shows connectivity; syn or anti stereochemistry depends on the selected reaction card.");
  return replace(smiles, /C=C/, "C(O)C(O)", "Dihydroxylation added two alcohol groups across the alkene.");
}
function alkeneCyclopropanation(smiles: string) {
  if (!/C=C/.test(smiles)) return null;
  return exactPrediction(smiles.replace(/C=C/, "C1CC1"), "Cyclopropanation converted the alkene into a cyclopropane. The drawing preserves connectivity in a simplified representative way.");
}
function alkeneOxidativeCleavage(smiles: string) {
  const graph = parseAcyclicCarbonGraph(smiles);
  const doubleBond = firstDoubleBond(graph);
  if (!graph || !doubleBond) return alkeneOzonolysis(smiles);
  const leftSubstitution = carbonSubstitution(graph, doubleBond.left, doubleBond.right);
  const rightSubstitution = carbonSubstitution(graph, doubleBond.right, doubleBond.left);
  const left = leftSubstitution === 0 ? "O=C=O" : carbonylFragmentAt(graph, doubleBond.left, doubleBond.right, leftSubstitution === 1 ? "acid" : "ketone");
  const right = rightSubstitution === 0 ? "O=C=O" : carbonylFragmentAt(graph, doubleBond.right, doubleBond.left, rightSubstitution === 1 ? "acid" : "ketone");
  if (!left || !right) return null;
  return exactPrediction(`${left}.${right}`, "Strong oxidative cleavage split the alkene into carbonyl or carboxylic acid fragments. Terminal CH2 gives carbon dioxide.");
}
function carbonylFragmentAt(graph: AcyclicGraph, carbonyl: number, blocked: number, mode: "ketone" | "acid") {
  const copy = cloneAcyclicGraph(graph);
  copy.atoms[carbonyl].bonds = copy.atoms[carbonyl].bonds.filter((bond) => bond.atom !== blocked);
  for (const atom of copy.atoms) atom.bonds = atom.bonds.filter((bond) => bond.atom !== blocked);
  addBondedAtom(copy, carbonyl, "O", "=");
  if (mode === "acid") addBondedAtom(copy, carbonyl, "O");
  return serializeAcyclicGraph(copy);
}
function branchedTerminalAlkeneAlcohol(smiles: string, position: "more" | "less") {
  const normalized = smiles.replace(/[\\/]/g, "");
  const rightTerminal = normalized.match(/^(C+)C\(C\)=C$/);
  if (rightTerminal) {
    const product = position === "more" ? `${rightTerminal[1]}C(C)(O)C` : `${rightTerminal[1]}C(C)CO`;
    return exactPrediction(product, position === "more"
      ? "Hydration placed OH on the more substituted alkene carbon for this branched terminal alkene."
      : "Hydroboration-oxidation placed OH on the terminal, less substituted alkene carbon for this branched terminal alkene.");
  }
  const leftTerminal = normalized.match(/^C=C\(C\)(C+)$/);
  if (leftTerminal) {
    const product = position === "more" ? `CC(C)(O)${leftTerminal[1]}` : `OCC(C)${leftTerminal[1]}`;
    return exactPrediction(product, position === "more"
      ? "Hydration placed OH on the more substituted alkene carbon for this branched terminal alkene."
      : "Hydroboration-oxidation placed OH on the terminal, less substituted alkene carbon for this branched terminal alkene.");
  }
  return null;
}
function branchedTerminalAlkeneEpoxide(smiles: string) {
  const normalized = smiles.replace(/[\\/]/g, "");
  const rightTerminal = normalized.match(/^(C+)C\(C\)=C$/);
  if (rightTerminal) {
    return exactPrediction(`${rightTerminal[1]}C1(C)CO1`, "Peroxyacid epoxidation converted the terminal branched alkene into the corresponding epoxide.");
  }
  const leftTerminal = normalized.match(/^C=C\(C\)(C+)$/);
  if (leftTerminal) {
    return exactPrediction(`C1OC1(C)${leftTerminal[1]}`, "Peroxyacid epoxidation converted the terminal branched alkene into the corresponding epoxide.");
  }
  return null;
}
function halogenationAlkene(smiles: string) {
  const product = alkeneAdditionProduct(smiles, "both", "Br", "Br");
  return product ? exactPrediction(product, "Bromination added bromine atoms to both alkene carbons. The drawing shows connectivity; the reaction is anti when stereochemistry is represented.") : null;
}
function halohydrinAlkene(smiles: string) {
  return halohydrinAcyclic(smiles) ?? methylcycloalkeneHalohydrin(smiles);
}
function hydrogenationAlkene(smiles: string) {
  const product = alkeneAdditionProduct(smiles, "none");
  return product ? exactPrediction(product, "Catalytic hydrogenation removed the alkene pi bond while preserving the carbon framework.") : methylcycloalkeneHydrogenation(smiles);
}
function regioselectiveAlkeneAddition(smiles: string, group: "O" | "Br", target: "more" | "less", note: string, mixtureNote: string) {
  const graph = parseAcyclicCarbonGraph(smiles);
  const doubleBond = firstDoubleBond(graph);
  if (!graph || !doubleBond) return null;
  const leftSubstitution = carbonSubstitution(graph, doubleBond.left, doubleBond.right);
  const rightSubstitution = carbonSubstitution(graph, doubleBond.right, doubleBond.left);
  if (leftSubstitution === rightSubstitution) {
    const leftProduct = substitutedAlkeneAdditionProduct(graph, doubleBond.left, doubleBond.right, group);
    const rightProduct = substitutedAlkeneAdditionProduct(graph, doubleBond.right, doubleBond.left, group);
    if (!leftProduct || !rightProduct || leftProduct === rightProduct) return null;
    return exactPrediction(`${leftProduct}.${rightProduct}`, mixtureNote);
  }
  const selected = target === "more"
    ? (leftSubstitution > rightSubstitution ? doubleBond.left : doubleBond.right)
    : (leftSubstitution < rightSubstitution ? doubleBond.left : doubleBond.right);
  const product = substitutedAlkeneAdditionProduct(graph, selected, selected === doubleBond.left ? doubleBond.right : doubleBond.left, group);
  return product ? exactPrediction(product, note) : null;
}
function halohydrinAcyclic(smiles: string) {
  const graph = parseAcyclicCarbonGraph(smiles);
  const doubleBond = firstDoubleBond(graph);
  if (!graph || !doubleBond) return null;
  const leftSubstitution = carbonSubstitution(graph, doubleBond.left, doubleBond.right);
  const rightSubstitution = carbonSubstitution(graph, doubleBond.right, doubleBond.left);
  if (leftSubstitution === rightSubstitution) {
    const leftProduct = disubstitutedAlkeneAdditionProduct(graph, doubleBond.left, doubleBond.right, "O", "Br");
    const rightProduct = disubstitutedAlkeneAdditionProduct(graph, doubleBond.right, doubleBond.left, "O", "Br");
    if (!leftProduct || !rightProduct || leftProduct === rightProduct) return null;
    return exactPrediction(`${leftProduct}.${rightProduct}`, "Halohydrin formation can give regioisomeric products for this alkene, so both connectivity products are shown. The addition is anti.");
  }
  const oxygenated = leftSubstitution > rightSubstitution ? doubleBond.left : doubleBond.right;
  const brominated = oxygenated === doubleBond.left ? doubleBond.right : doubleBond.left;
  const product = disubstitutedAlkeneAdditionProduct(graph, oxygenated, brominated, "O", "Br");
  return product ? exactPrediction(product, "Halohydrin formation placed OH on the more substituted alkene carbon and Br on the less substituted carbon. The addition is anti.") : null;
}
function firstDoubleBond(graph: AcyclicGraph | null) {
  return graph?.atoms.flatMap((atom, atomIndex) =>
    atom.bonds
      .filter((bond) => bond.symbol === "=" && atomIndex < bond.atom)
      .map((bond) => ({ left: atomIndex, right: bond.atom })),
  )[0] ?? null;
}
function firstTripleBond(graph: AcyclicGraph | null) {
  return graph?.atoms.flatMap((atom, atomIndex) =>
    atom.bonds
      .filter((bond) => bond.symbol === "#" && atomIndex < bond.atom)
      .map((bond) => ({ left: atomIndex, right: bond.atom })),
  )[0] ?? null;
}
function alkeneAdditionProduct(smiles: string, mode: "none" | "both", leftGroup?: "O" | "Br", rightGroup?: "O" | "Br") {
  const graph = parseAcyclicCarbonGraph(smiles);
  const doubleBond = firstDoubleBond(graph);
  if (!graph || !doubleBond) return null;
  if (mode === "none") return saturatedAlkeneProduct(graph, doubleBond.left, doubleBond.right);
  if (!leftGroup || !rightGroup) return null;
  return disubstitutedAlkeneAdditionProduct(graph, doubleBond.left, doubleBond.right, leftGroup, rightGroup);
}
function saturatedAlkeneProduct(graph: AcyclicGraph, left: number, right: number) {
  const copy = cloneAcyclicGraph(graph);
  const bond = copy.atoms[left].bonds.find((item) => item.atom === right);
  const reverseBond = copy.atoms[right].bonds.find((item) => item.atom === left);
  if (!bond || !reverseBond) return null;
  bond.symbol = "";
  reverseBond.symbol = "";
  return serializeAcyclicGraph(copy);
}
function substitutedAlkeneAdditionProduct(graph: AcyclicGraph, substituted: number, partner: number, group: "O" | "Br") {
  const copy = cloneAcyclicGraph(graph);
  const bond = copy.atoms[substituted].bonds.find((item) => item.atom === partner);
  const reverseBond = copy.atoms[partner].bonds.find((item) => item.atom === substituted);
  if (!bond || !reverseBond) return null;
  bond.symbol = "";
  reverseBond.symbol = "";
  addAtom(copy, substituted, group);
  return serializeAcyclicGraph(copy);
}
function disubstitutedAlkeneAdditionProduct(graph: AcyclicGraph, left: number, right: number, leftGroup: "O" | "Br", rightGroup: "O" | "Br") {
  const copy = cloneAcyclicGraph(graph);
  const bond = copy.atoms[left].bonds.find((item) => item.atom === right);
  const reverseBond = copy.atoms[right].bonds.find((item) => item.atom === left);
  if (!bond || !reverseBond) return null;
  bond.symbol = "";
  reverseBond.symbol = "";
  addAtom(copy, left, leftGroup);
  addAtom(copy, right, rightGroup);
  return serializeAcyclicGraph(copy);
}
function addAtom(graph: AcyclicGraph, target: number, element: "O" | "Br") {
  const next = graph.atoms.push({ element, bonds: [{ atom: target, symbol: "" }] }) - 1;
  graph.atoms[target].bonds.push({ atom: next, symbol: "" });
}
function addBondedAtom(graph: AcyclicGraph, target: number, element: "C" | "O" | "Br", symbol = "") {
  const next = graph.atoms.push({ element, bonds: [{ atom: target, symbol }] }) - 1;
  graph.atoms[target].bonds.push({ atom: next, symbol });
  return next;
}
function markovnikovAlkeneHBr(smiles: string) {
  const cyclic = methylcyclohexeneHBr(smiles);
  if (cyclic) return cyclic;
  const graph = parseAcyclicCarbonGraph(smiles);
  if (!graph) return null;
  const doubleBond = graph.atoms.flatMap((atom, atomIndex) =>
    atom.bonds
      .filter((bond) => bond.symbol === "=" && atomIndex < bond.atom)
      .map((bond) => ({ left: atomIndex, right: bond.atom })),
  )[0];
  if (!doubleBond) return null;
  const leftSubstitution = carbonSubstitution(graph, doubleBond.left, doubleBond.right);
  const rightSubstitution = carbonSubstitution(graph, doubleBond.right, doubleBond.left);
  if (leftSubstitution === rightSubstitution) return null;
  const brominated = leftSubstitution > rightSubstitution ? doubleBond.left : doubleBond.right;
  const bond = graph.atoms[doubleBond.left].bonds.find((item) => item.atom === doubleBond.right);
  const reverseBond = graph.atoms[doubleBond.right].bonds.find((item) => item.atom === doubleBond.left);
  if (!bond || !reverseBond) return null;
  bond.symbol = "";
  reverseBond.symbol = "";
  const bromine = graph.atoms.push({ element: "Br", bonds: [{ atom: brominated, symbol: "" }] }) - 1;
  graph.atoms[brominated].bonds.push({ atom: bromine, symbol: "" });
  return exactPrediction(serializeAcyclicGraph(graph), "HBr addition followed Markovnikov regiochemistry: bromine was placed on the more substituted alkene carbon. The reaction card uses HBr as the displayed HX example.");
}
function radicalAlkeneHBr(smiles: string) {
  const graph = parseAcyclicCarbonGraph(smiles);
  if (!graph) return null;
  const doubleBond = graph.atoms.flatMap((atom, atomIndex) =>
    atom.bonds
      .filter((bond) => bond.symbol === "=" && atomIndex < bond.atom)
      .map((bond) => ({ left: atomIndex, right: bond.atom })),
  )[0];
  if (!doubleBond) return null;
  const leftSubstitution = carbonSubstitution(graph, doubleBond.left, doubleBond.right);
  const rightSubstitution = carbonSubstitution(graph, doubleBond.right, doubleBond.left);
  if (leftSubstitution === rightSubstitution) {
    const leftProduct = brominatedAlkeneAdditionProduct(graph, doubleBond.left, doubleBond.right);
    const rightProduct = brominatedAlkeneAdditionProduct(graph, doubleBond.right, doubleBond.left);
    if (!leftProduct || !rightProduct || leftProduct === rightProduct) return null;
    return exactPrediction(`${leftProduct}.${rightProduct}`, "Radical HBr addition is not strongly regioselective for this internal alkene, so both bromoalkane regioisomers are shown.");
  }
  const brominated = leftSubstitution < rightSubstitution ? doubleBond.left : doubleBond.right;
  const product = brominatedAlkeneAdditionProduct(graph, brominated, brominated === doubleBond.left ? doubleBond.right : doubleBond.left);
  if (!product) return null;
  return exactPrediction(product, "Radical HBr addition followed anti-Markovnikov regiochemistry: bromine was placed on the less substituted alkene carbon.");
}
function brominatedAlkeneAdditionProduct(graph: AcyclicGraph, brominated: number, partner: number) {
  const copy = cloneAcyclicGraph(graph);
  const bond = copy.atoms[brominated].bonds.find((item) => item.atom === partner);
  const reverseBond = copy.atoms[partner].bonds.find((item) => item.atom === brominated);
  if (!bond || !reverseBond) return null;
  bond.symbol = "";
  reverseBond.symbol = "";
  const bromine = copy.atoms.push({ element: "Br", bonds: [{ atom: brominated, symbol: "" }] }) - 1;
  copy.atoms[brominated].bonds.push({ atom: bromine, symbol: "" });
  return serializeAcyclicGraph(copy);
}
function cloneAcyclicGraph(graph: AcyclicGraph): AcyclicGraph {
  return { atoms: graph.atoms.map((atom) => ({ element: atom.element, bonds: atom.bonds.map((bond) => ({ ...bond })) })) };
}
function methylcyclohexeneHBr(smiles: string) {
  const compact = smiles.replace(/[\\/]/g, "");
  const knownMethylcyclohexenes = new Set([
    "CC1=CCCCC1",
    "C1=C(C)CCCC1",
    "C1CC=C(C)CC1",
    "C1CCC(C)=CC1",
    "C1CCCC(C)=C1",
    "C1CCCCC1C=C",
  ]);
  if (
    knownMethylcyclohexenes.has(compact) ||
    (compact.includes("C1CC=CC1") && compact.includes("C1CCCC(C)C1"))
  ) {
    return exactPrediction("CC1(Br)CCCCC1", "HBr addition to 1-methylcyclohexene followed Markovnikov regiochemistry and produced 1-bromo-1-methylcyclohexane.");
  }
  return null;
}
function methylcycloalkeneAlcohol(smiles: string, position: "more" | "less", note: string) {
  const size = methylcycloalkeneRingSize(smiles);
  if (!size) return null;
  if (size === 5) return exactPrediction(position === "more" ? "CC1(O)CCCC1" : "CC1CCCC(O)1", note);
  if (size === 6) return exactPrediction(position === "more" ? "CC1(O)CCCCC1" : "CC1CCCCC(O)1", note);
  return null;
}
function methylcycloalkeneHalohydrin(smiles: string) {
  const size = methylcycloalkeneRingSize(smiles);
  if (!size) return null;
  if (size === 5) return exactPrediction("CC1(O)CCCC(Br)1", "Halohydrin formation placed OH on the methyl-substituted alkene carbon and Br on the adjacent alkene carbon. The addition is anti.");
  if (size === 6) return exactPrediction("CC1(O)CCCCC(Br)1", "Halohydrin formation placed OH on the methyl-substituted alkene carbon and Br on the adjacent alkene carbon. The addition is anti.");
  return null;
}
function methylcycloalkeneHydrogenation(smiles: string) {
  const size = methylcycloalkeneRingSize(smiles);
  if (!size) return null;
  if (size === 5) return exactPrediction("CC1CCCC1", "Catalytic hydrogenation removed the ring alkene pi bond and produced methylcyclopentane.");
  if (size === 6) return exactPrediction("CC1CCCCC1", "Catalytic hydrogenation removed the ring alkene pi bond and produced methylcyclohexane.");
  return null;
}
function methylcycloalkeneRingSize(smiles: string) {
  const compact = smiles.replace(/[\\/]/g, "");
  const methylcyclopentenes = new Set(["C1C(C)=CCC1", "C1CC=C(C)C1", "C1CCC(C)=C1", "CC1=CCCC1"]);
  const methylcyclohexenes = new Set(["C1C(C)=CCCC1", "C1CC=C(C)CC1", "C1CCC(C)=CC1", "C1CCCC(C)=C1", "CC1=CCCCC1"]);
  if (methylcyclopentenes.has(compact)) return 5;
  if (methylcyclohexenes.has(compact)) return 6;
  return null;
}
function alkeneOzonolysis(smiles: string) {
  if (!/C=C/.test(smiles)) return null;
  return exactPrediction(smiles.replace(/C=C/, "C=O.O=C"), "Reductive ozonolysis cleaved the alkene and produced the corresponding aldehyde or ketone fragments.");
}
function terminalAlkyneHydration(smiles: string) {
  return alkyneCarbonylProduct(
    smiles,
    "markovnikov",
    "Mercury-catalyzed hydration produced the ketone after enol-keto tautomerization.",
    "Internal alkyne hydration can give regioisomeric ketones, so both connectivity products are shown.",
  );
}
function terminalAlkyneHydroboration(smiles: string) {
  return alkyneCarbonylProduct(
    smiles,
    "antiMarkovnikov",
    "Hydroboration-oxidation produced the carbonyl compound after enol tautomerization. A terminal alkyne gives an aldehyde.",
    "This substrate is an internal alkyne; hydroboration-oxidation can give regioisomeric ketones, so both connectivity products are shown.",
  );
}
function terminalAlkyneHydrohalogenation(smiles: string, twoEquivalents: boolean) {
  return alkyneHydrohalogenationProduct(smiles, twoEquivalents);
}
function internalAlkyneHydration(smiles: string) {
  return alkyneCarbonylProduct(
    smiles,
    "internalMixture",
    "Hydration of the internal alkyne produced the ketone after enol-keto tautomerization.",
    "Unsymmetrical internal alkyne hydration can give regioisomeric ketones, so both connectivity products are shown.",
  );
}
function completeAlkyneHydrogenation(smiles: string) {
  const product = alkyneBondProduct(smiles, "");
  return product ? exactPrediction(product, "Complete hydrogenation converted the alkyne into the corresponding alkane.") : null;
}
function oneEquivalentAlkyneHalogenation(smiles: string) {
  const product = alkyneVicinalHalogenationProduct(smiles, false);
  return product ? exactPrediction(product, "One equivalent of bromine converted the alkyne into a dibromoalkene. The drawing shows connectivity.") : null;
}
function twoEquivalentAlkyneHalogenation(smiles: string) {
  const product = alkyneVicinalHalogenationProduct(smiles, true);
  return product ? exactPrediction(product, "Two equivalents of bromine converted the alkyne into a tetrabromoalkane.") : null;
}
function terminalAlkyneAlkylation(smiles: string) {
  const graph = parseAcyclicCarbonGraph(smiles);
  const tripleBond = firstTripleBond(graph);
  if (!graph || !tripleBond) return null;
  const leftSubstitution = carbonSubstitution(graph, tripleBond.left, tripleBond.right);
  const rightSubstitution = carbonSubstitution(graph, tripleBond.right, tripleBond.left);
  const terminal = leftSubstitution === 0 ? tripleBond.left : rightSubstitution === 0 ? tripleBond.right : null;
  if (terminal === null) return null;
  const copy = cloneAcyclicGraph(graph);
  addBondedAtom(copy, terminal, "C");
  return exactPrediction(serializeAcyclicGraph(copy), "Acetylide alkylation formed a new carbon-carbon bond at the terminal alkyne carbon. The reagent fragment is represented as a methyl group in the generated product.");
}
function alkyneCarbonylProduct(smiles: string, regiochemistry: "markovnikov" | "antiMarkovnikov" | "internalMixture", note: string, mixtureNote: string) {
  const graph = parseAcyclicCarbonGraph(smiles);
  const tripleBond = firstTripleBond(graph);
  if (!graph || !tripleBond) return null;
  const leftSubstitution = carbonSubstitution(graph, tripleBond.left, tripleBond.right);
  const rightSubstitution = carbonSubstitution(graph, tripleBond.right, tripleBond.left);
  if (leftSubstitution > 0 && rightSubstitution > 0) {
    const leftProduct = alkyneKetoneAt(graph, tripleBond.left, tripleBond.right);
    const rightProduct = alkyneKetoneAt(graph, tripleBond.right, tripleBond.left);
    if (!leftProduct || !rightProduct) return null;
    if (leftProduct === rightProduct) return exactPrediction(leftProduct, note);
    return exactPrediction(`${leftProduct}.${rightProduct}`, mixtureNote);
  }
  const terminal = leftSubstitution === 0 ? tripleBond.left : rightSubstitution === 0 ? tripleBond.right : null;
  const internal = terminal === tripleBond.left ? tripleBond.right : terminal === tripleBond.right ? tripleBond.left : null;
  if (terminal === null || internal === null) return null;
  const carbonyl = regiochemistry === "antiMarkovnikov" ? terminal : internal;
  const partner = carbonyl === tripleBond.left ? tripleBond.right : tripleBond.left;
  const product = alkyneKetoneAt(graph, carbonyl, partner);
  return product ? exactPrediction(product, note) : null;
}
function alkyneKetoneAt(graph: AcyclicGraph, carbonyl: number, partner: number) {
  const copy = cloneAcyclicGraph(graph);
  const bond = copy.atoms[carbonyl].bonds.find((item) => item.atom === partner);
  const reverseBond = copy.atoms[partner].bonds.find((item) => item.atom === carbonyl);
  if (!bond || !reverseBond) return null;
  bond.symbol = "";
  reverseBond.symbol = "";
  addBondedAtom(copy, carbonyl, "O", "=");
  return serializeAcyclicGraph(copy);
}
function alkyneHydrohalogenationProduct(smiles: string, twoEquivalents: boolean) {
  const graph = parseAcyclicCarbonGraph(smiles);
  const tripleBond = firstTripleBond(graph);
  if (!graph || !tripleBond) return null;
  const leftSubstitution = carbonSubstitution(graph, tripleBond.left, tripleBond.right);
  const rightSubstitution = carbonSubstitution(graph, tripleBond.right, tripleBond.left);
  const products: string[] = [];
  if (leftSubstitution > 0 && rightSubstitution > 0) {
    for (const target of [tripleBond.left, tripleBond.right]) {
      const partner = target === tripleBond.left ? tripleBond.right : tripleBond.left;
      const product = alkyneBromideAt(graph, target, partner, twoEquivalents);
      if (product && !products.includes(product)) products.push(product);
    }
    if (!products.length) return null;
    return exactPrediction(products.join("."), twoEquivalents
      ? "Two equivalents of HBr gave geminal dibromide regioisomers from this internal alkyne."
      : "One equivalent of HBr gave vinyl bromide regioisomers from this internal alkyne.");
  }
  const brominated = leftSubstitution >= rightSubstitution ? tripleBond.left : tripleBond.right;
  const partner = brominated === tripleBond.left ? tripleBond.right : tripleBond.left;
  const product = alkyneBromideAt(graph, brominated, partner, twoEquivalents);
  return product ? exactPrediction(product, twoEquivalents
    ? "Two equivalents of HBr added Markovnikov to give a geminal dibromide."
    : "One equivalent of HBr added Markovnikov to give a vinyl bromide.") : null;
}
function alkyneBromideAt(graph: AcyclicGraph, brominated: number, partner: number, twoEquivalents: boolean) {
  const copy = cloneAcyclicGraph(graph);
  const bond = copy.atoms[brominated].bonds.find((item) => item.atom === partner);
  const reverseBond = copy.atoms[partner].bonds.find((item) => item.atom === brominated);
  if (!bond || !reverseBond) return null;
  bond.symbol = twoEquivalents ? "" : "=";
  reverseBond.symbol = twoEquivalents ? "" : "=";
  addAtom(copy, brominated, "Br");
  if (twoEquivalents) addAtom(copy, brominated, "Br");
  return serializeAcyclicGraph(copy);
}
function alkyneVicinalHalogenationProduct(smiles: string, twoEquivalents: boolean) {
  const graph = parseAcyclicCarbonGraph(smiles);
  const tripleBond = firstTripleBond(graph);
  if (!graph || !tripleBond) return null;
  const copy = cloneAcyclicGraph(graph);
  const bond = copy.atoms[tripleBond.left].bonds.find((item) => item.atom === tripleBond.right);
  const reverseBond = copy.atoms[tripleBond.right].bonds.find((item) => item.atom === tripleBond.left);
  if (!bond || !reverseBond) return null;
  bond.symbol = twoEquivalents ? "" : "=";
  reverseBond.symbol = twoEquivalents ? "" : "=";
  addAtom(copy, tripleBond.left, "Br");
  addAtom(copy, tripleBond.right, "Br");
  if (twoEquivalents) {
    addAtom(copy, tripleBond.left, "Br");
    addAtom(copy, tripleBond.right, "Br");
  }
  return serializeAcyclicGraph(copy);
}
function alkyneBondProduct(smiles: string, bondSymbol: "" | "=") {
  const graph = parseAcyclicCarbonGraph(smiles);
  const tripleBond = firstTripleBond(graph);
  if (!graph || !tripleBond) return null;
  const copy = cloneAcyclicGraph(graph);
  const bond = copy.atoms[tripleBond.left].bonds.find((item) => item.atom === tripleBond.right);
  const reverseBond = copy.atoms[tripleBond.right].bonds.find((item) => item.atom === tripleBond.left);
  if (!bond || !reverseBond) return null;
  bond.symbol = bondSymbol;
  reverseBond.symbol = bondSymbol;
  return serializeAcyclicGraph(copy);
}
function internalAlkyneOxidativeCleavage(smiles: string) {
  if (!/C#C/.test(smiles) || /^C#C|C#C$/.test(smiles)) return null;
  return exactPrediction(smiles.replace(/C#C/, "C(=O)O.OC(=O)"), "Oxidative cleavage split the internal alkyne into two carboxylic acids.");
}
function benzeneSubstitution(smiles: string, group: string, note: string) {
  if (smiles === "c1ccccc1") return exactPrediction(`${group}c1ccccc1`, note);
  if (smiles === "C1=CC=CC=C1") return exactPrediction(`${group}C1=CC=CC=C1`, note);
  return null;
}
function alkylbenzeneSideChainOxidation(smiles: string) {
  if (/Cc1ccccc1|c1ccccc1C/.test(smiles)) return exactPrediction("O=C(O)c1ccccc1", "Oxidation of an alkylbenzene side chain produced benzoic acid when a benzylic hydrogen is available.");
  return null;
}
function benzylicBromination(smiles: string) {
  if (/Cc1ccccc1/.test(smiles)) return exactPrediction(smiles.replace(/C(?=c1ccccc1)/, "CBr"), "NBS brominated the benzylic position.");
  if (/c1ccccc1C/.test(smiles)) return exactPrediction(smiles.replace(/c1ccccc1C/, "c1ccccc1CBr"), "NBS brominated the benzylic position.");
  return null;
}
function activatedArylHalideHydrolysis(smiles: string) {
  if (!/(Cl|Br|I).*c1|c1.*(Cl|Br|I)/.test(smiles)) return null;
  return exactPrediction(smiles.replace(/Cl|Br|I/, "O"), "Nucleophilic aromatic substitution replaced the aryl halide with hydroxyl on an activated aromatic ring.");
}
function nitrobenzeneToAniline(smiles: string) {
  if (smiles === "[N+](=O)[O-]c1ccccc1") return exactPrediction("Nc1ccccc1", "Reduction converted nitrobenzene into aniline.");
  return null;
}
function anilineToDiazonium(smiles: string) {
  if (smiles !== "Nc1ccccc1") return null;
  return exactPrediction("[N+]#Nc1ccccc1", "Diazotization converted aniline into an arenediazonium ion. The counterion is omitted from the structural drawing.");
}
function diazoniumReplacement(smiles: string, group: string, note: string) {
  if (smiles !== "[N+]#Nc1ccccc1" && smiles !== "N#[N+]c1ccccc1") return null;
  return exactPrediction(`${group}c1ccccc1`, note);
}
function benzeneBirchReduction(smiles: string) {
  if (smiles !== "c1ccccc1" && smiles !== "C1=CC=CC=C1") return null;
  return exactPrediction("C1=CCC=CC1", "Birch reduction converted benzene into 1,4-cyclohexadiene.");
}
function carbonylToMethylene(smiles: string) {
  if (!/C\(=O\)|C=O/.test(smiles)) return null;
  return exactPrediction(smiles.replace(/C\(=O\)|C=O/g, "C"), "Reduction replaced the carbonyl group with a methylene group.");
}
function carbonylToAlcohol(smiles: string) {
  if (!/C\(=O\)|C=O/.test(smiles)) return null;
  return exactPrediction(smiles.replace(/C\(=O\)/g, "C(O)").replace(/C=O/g, "CO"), "Reduction converted the carbonyl group into an alcohol.");
}
function carbonylGrignard(smiles: string) {
  if (!/C\(=O\)|C=O/.test(smiles)) return null;
  return exactPrediction(smiles.replace(/C\(=O\)/, "C(O)(C)").replace(/C=O/, "C(O)C"), "Grignard addition attached a methyl group as the displayed organometallic fragment and formed an alcohol after workup.");
}
function carbonylWittig(smiles: string) {
  if (!/C\(=O\)|C=O/.test(smiles)) return null;
  return exactPrediction(smiles.replace(/C\(=O\)/, "C=C").replace(/C=O/, "C=C"), "Wittig reaction replaced the carbonyl oxygen with a methylene group to form an alkene.");
}
function carbonylAddition(smiles: string, branchedProduct: string, terminalProduct: string, note: string) {
  if (/C\(=O\)/.test(smiles)) return exactPrediction(smiles.replace(/C\(=O\)/, branchedProduct), note);
  if (/C=O/.test(smiles)) return exactPrediction(smiles.replace(/C=O/, terminalProduct), note);
  return null;
}
function carbonylAcetal(smiles: string) {
  return carbonylAddition(smiles, "C(OC)(OC)", "C(OC)OC", "Acetal formation replaced the carbonyl oxygen with two methoxy groups as the displayed alcohol partner.");
}
function acetalHydrolysis(smiles: string) {
  if (/C\(OC\)\(OC\)|C\(OC\)OC/.test(smiles)) return exactPrediction(smiles.replace(/C\(OC\)\(OC\)|C\(OC\)OC/, "C(=O)"), "Acetal hydrolysis regenerated the carbonyl compound.");
  return null;
}
function carbonylCondensation(smiles: string, branchedProduct: string, terminalProduct: string, note: string) {
  if (/C\(=O\)/.test(smiles)) return exactPrediction(smiles.replace(/C\(=O\)/, branchedProduct), note);
  if (/C=O/.test(smiles)) return exactPrediction(smiles.replace(/C=O/, terminalProduct), note);
  return null;
}
function carbonylEnamine(smiles: string) {
  if (/CC\(=O\)/.test(smiles)) return exactPrediction(smiles.replace(/CC\(=O\)/, "C=C(N(C)C)"), "Enamine formation is represented with dimethylamine as the displayed secondary amine.");
  if (/C\(=O\)C/.test(smiles)) return exactPrediction(smiles.replace(/C\(=O\)C/, "C(N(C)C)=C"), "Enamine formation is represented with dimethylamine as the displayed secondary amine.");
  return null;
}
function baeyerVilliger(smiles: string) {
  if (/C\(=O\)/.test(smiles)) return exactPrediction(smiles.replace(/C\(=O\)/, "C(=O)O"), "Baeyer-Villiger oxidation inserted oxygen next to the ketone carbonyl to form an ester in a simplified representative product.");
  return null;
}
function alphaBromination(smiles: string) {
  if (/C\(=O\)C/.test(smiles)) return exactPrediction(smiles.replace(/C\(=O\)C/, "C(=O)CBr"), "Alpha bromination installed bromine on an alpha carbon next to the carbonyl.");
  if (/CC\(=O\)/.test(smiles)) return exactPrediction(smiles.replace(/CC\(=O\)/, "C(Br)C(=O)"), "Alpha bromination installed bromine on an alpha carbon next to the carbonyl.");
  return null;
}
function conjugateAddition(smiles: string) {
  if (/C=CC\(=O\)/.test(smiles)) return exactPrediction(smiles.replace(/C=CC\(=O\)/, "CC(C)C(=O)"), "Organocuprate conjugate addition added a methyl group at the beta carbon of the alpha,beta-unsaturated carbonyl.");
  return null;
}
function aldolAddition(smiles: string) {
  if (!/C\(=O\)|C=O/.test(smiles)) return null;
  return exactPrediction("CC(O)CC=O", "Aldol addition is represented with acetaldehyde as the displayed enolate partner, giving a beta-hydroxy carbonyl.");
}
function aldolCondensation(smiles: string) {
  if (!/C\(=O\)|C=O/.test(smiles)) return null;
  return exactPrediction("CC=CC=O", "Aldol condensation is represented by dehydration of the beta-hydroxy carbonyl to an alpha,beta-unsaturated carbonyl.");
}
function intramolecularAldol(smiles: string) {
  if (!/C\(=O\).+C\(=O\)|C=O.+C=O/.test(smiles)) return null;
  return exactPrediction("O=C1C=CCCC1", "Intramolecular aldol condensation is represented by a cyclohexenone product.");
}
function cannizzaro(smiles: string) {
  if (!/C=O$/.test(smiles)) return null;
  return exactPrediction(`${smiles.replace(/C=O$/, "CO")}.${smiles.replace(/C=O$/, "C(=O)[O-]")}`, "Cannizzaro reaction disproportionated a non-enolizable aldehyde into an alcohol and carboxylate.");
}
function haloform(smiles: string) {
  if (!/C\(=O\)C$|CC\(=O\)/.test(smiles)) return null;
  return exactPrediction("C(=O)[O-].C(Br)(Br)Br", "Haloform reaction of a methyl ketone produced a carboxylate and bromoform in the displayed bromine variant.");
}
function alphaMethylation(smiles: string) {
  if (/C\(=O\)C/.test(smiles)) return exactPrediction(smiles.replace(/C\(=O\)C/, "C(=O)C(C)"), "Enolate alkylation added a methyl group at the alpha carbon.");
  if (/CC\(=O\)/.test(smiles)) return exactPrediction(smiles.replace(/CC\(=O\)/, "C(C)C(=O)"), "Enolate alkylation added a methyl group at the alpha carbon.");
  return null;
}
function robinsonAnnulation(smiles: string) {
  if (!/C\(=O\)|C=O/.test(smiles)) return null;
  return exactPrediction("O=C1C=CCCC1", "Robinson annulation is represented by the cyclohexenone ring product.");
}
function reductiveAmination(smiles: string) {
  if (!/C\(=O\)|C=O/.test(smiles)) return null;
  return exactPrediction(smiles.replace(/C\(=O\)/, "C(N)").replace(/C=O/, "CN"), "Reductive amination converted the carbonyl compound into an amine.");
}
function esterAminolysis(smiles: string) {
  if (!/C\(=O\)O[^.]+$/.test(smiles)) return null;
  return exactPrediction(smiles.replace(/C\(=O\)O[^.]+$/, "C(=O)N"), "Aminolysis converted the ester into an amide. The alcohol coproduct is omitted.");
}
function esterAlphaMethylation(smiles: string) {
  if (/CC\(=O\)O/.test(smiles)) return exactPrediction(smiles.replace(/CC\(=O\)O/, "C(C)C(=O)O"), "Ester enolate alkylation added a methyl group at the alpha carbon.");
  return null;
}
function claisenCondensation(smiles: string) {
  if (!/C\(=O\)O/.test(smiles)) return null;
  return exactPrediction("CC(=O)CC(=O)OC", "Claisen condensation is represented by a beta-keto ester product.");
}
function dieckmannCondensation(smiles: string) {
  if (!/C\(=O\)O/.test(smiles)) return null;
  return exactPrediction("O=C1CCC(=O)OC1", "Dieckmann condensation is represented by a cyclic beta-keto ester.");
}
function hofmannElimination(smiles: string) {
  if (!/N/.test(smiles)) return null;
  return exactPrediction("C=C", "Hofmann elimination is represented by formation of the least substituted alkene.");
}
function methylcyclohexeneE2(smiles: string) {
  if (/Br.*C1|C1.*Br/.test(smiles)) return exactPrediction("CC1=CCCCC1", "Trans-diaxial E2 elimination in a cyclohexane system formed the cyclohexene product. A representative methylcyclohexene is shown.");
  return null;
}
function cyclohexeneAntiBromination(smiles: string) {
  if (smiles !== "C1=CCCCC1") return null;
  return exactPrediction("Br[C@H]1[C@@H](Br)CCCC1", "Anti bromination of cyclohexene produced trans-1,2-dibromocyclohexane. The product drawing includes opposite stereochemical bonds.");
}
function cyclohexeneSynDihydroxylation(smiles: string) {
  if (smiles !== "C1=CCCCC1") return null;
  return exactPrediction("O[C@H]1[C@H](O)CCCC1", "Syn dihydroxylation of cyclohexene produced cis-1,2-cyclohexanediol. The product drawing includes stereochemical bonds on the same face.");
}
function partialAlkyneReduction(smiles: string, geometry: "cis" | "trans", note: string) {
  if (!/C#C/.test(smiles)) return null;
  const terminal = /^C#C|C#C$/.test(smiles);
  if (terminal) return replace(smiles, /C#C/g, "C=C", note);
  const linear = smiles.match(/^(C+)C#C(C+)$/);
  if (!linear) return null;
  return exactPrediction(`${linear[1]}/C=C${geometry === "cis" ? "\\" : "/"}${linear[2]}`, note);
}
function simpleHydrocarbonName(smiles: string) {
  if (!/^C(?:[#=]?C)*$/.test(smiles)) return "";
  const carbonCount = (smiles.match(/C/g) ?? []).length;
  if (carbonCount < 1 || carbonCount > 10) return "";
  const stems = ["", "meth", "eth", "prop", "but", "pent", "hex", "hept", "oct", "non", "dec"];
  const bondMatches = [...smiles.matchAll(/[#=]/g)];
  if (!bondMatches.length) return `${stems[carbonCount]}ane`;
  if (bondMatches.length !== 1) return "";
  const bondMatch = bondMatches[0];
  const leftLocant = smiles.slice(0, bondMatch.index).replace(/[^C]/g, "").length;
  const locant = Math.min(leftLocant, carbonCount - leftLocant);
  return `${stems[carbonCount]}-${locant}-${bondMatch[0] === "#" ? "yne" : "ene"}`;
}
function editor(ref: { current: HTMLIFrameElement | null }) {
  return (ref.current?.contentWindow as EditorWindow | null)?.ketcher;
}
