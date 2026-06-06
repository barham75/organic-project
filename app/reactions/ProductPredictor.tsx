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
  "alkene-hx": markovnikovAlkeneHBr,
  "alkene-hbr-peroxide": radicalAlkeneHBr,
  "alkene-hydration": acidCatalyzedAlkeneHydration,
  "alkene-oxymercuration": oxymercurationAlkene,
  "alkene-hydroboration": hydroborationAlkene,
  "alkene-halohydrin": halohydrinAlkene,
  "alkene-halogenation": halogenationAlkene,
  "alkene-hydrogenation": hydrogenationAlkene,
  "alkene-ozonolysis": alkeneOzonolysis,
  "alkene-epoxidation": (smiles) => replace(smiles, /C=C/, "C1OC1", "Peroxyacid epoxidation converted the alkene into an epoxide while preserving the alkene substituent relationship."),
  "alkene-dihydroxylation": (smiles) => replace(smiles, /C=C/, "C(O)C(O)", "Syn dihydroxylation added two alcohol groups across the alkene. The drawing shows connectivity; the reaction stereochemistry is syn."),
  "alkene-anti-dihydroxylation": (smiles) => replace(smiles, /C=C/, "C(O)C(O)", "Epoxidation followed by hydrolysis added two alcohol groups across the alkene. The drawing shows connectivity; the overall addition is anti."),
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
  "halide-nitrile-formation": (smiles) => terminalHalideReplacement(smiles, "C#N", "Cyanide displaced the terminal halide by an SN2 reaction and added one carbon atom to the chain."),
  "amine-gabriel-synthesis": (smiles) => terminalHalideReplacement(smiles, "N", "Gabriel synthesis converted the terminal primary alkyl halide into a primary amine."),
  "alcohol-pbr3": (smiles) => terminalAlcohol(smiles, "Br", "PBr3 replaced the alcohol group with bromine."),
  "alcohol-socl2": (smiles) => terminalAlcohol(smiles, "Cl", "SOCl2 replaced the alcohol group with chlorine."),
  "alcohol-alkoxide-formation": (smiles) => terminalAlcohol(smiles, "[O-]", "Deprotonation converted the alcohol into an alkoxide. The counterion is omitted from the structural drawing."),
  "alcohol-deoxygenation": (smiles) => terminalAlcohol(smiles, "", "Deoxygenation replaced the terminal alcohol group with hydrogen."),
  "amine-nitrous-acid": (smiles) => replace(smiles, /N$/g, "O", "Nitrous acid converted the terminal primary aliphatic amine into an alcohol with loss of nitrogen gas."),
  "epoxide-opening-basic": ethyleneOxideHydrolysis,
  "epoxide-opening-acid": ethyleneOxideHydrolysis,
  "epoxide-opening-hydride": ethyleneOxideHydrideOpening,
  "halohydrin-epoxide-formation": bromoethanolToEthyleneOxide,
  "ester-hydrolysis": esterToCarboxylate,
  "ester-acidic-hydrolysis": esterToCarboxylicAcid,
  "ester-reduction": esterToPrimaryAlcohol,
  "ester-dibal": esterToAldehyde,
  "benzene-bromination": (smiles) => benzeneSubstitution(smiles, "Br", "Electrophilic aromatic substitution converted benzene into bromobenzene."),
  "benzene-chlorination": (smiles) => benzeneSubstitution(smiles, "Cl", "Electrophilic aromatic substitution converted benzene into chlorobenzene."),
  "benzene-nitration": (smiles) => benzeneSubstitution(smiles, "[N+](=O)[O-]", "Electrophilic aromatic substitution converted benzene into nitrobenzene."),
  "benzene-sulfonation": (smiles) => benzeneSubstitution(smiles, "S(=O)(=O)(O)", "Electrophilic aromatic substitution converted benzene into benzenesulfonic acid."),
  "benzene-nitro-reduction": nitrobenzeneToAniline,
  "benzene-diazonium": anilineToDiazonium,
  "benzene-sandmeyer": (smiles) => diazoniumReplacement(smiles, "Cl", "Sandmeyer substitution replaced the diazonium group with chlorine and released nitrogen gas."),
  "benzene-diazonium-phenol": (smiles) => diazoniumReplacement(smiles, "O", "Hydrolysis replaced the diazonium group with a hydroxyl group and released nitrogen gas."),
  "benzene-diazonium-iodide": (smiles) => diazoniumReplacement(smiles, "I", "Iodide replaced the diazonium group and released nitrogen gas."),
  "benzene-diazonium-reduction": (smiles) => diazoniumReplacement(smiles, "", "Reduction replaced the diazonium group with hydrogen and released nitrogen gas."),
  "benzene-birch-reduction": benzeneBirchReduction,
  "carbonyl-reduction": carbonylToAlcohol,
  "carbonyl-cyanohydrin": (smiles) => carbonylAddition(smiles, "C(O)(C#N)", "C(O)C#N", "Cyanide addition followed by protonation converted the carbonyl group into a cyanohydrin."),
  "carbonyl-hydrate": (smiles) => carbonylAddition(smiles, "C(O)(O)", "C(O)O", "Hydration converted the carbonyl group into a geminal diol."),
  "carbonyl-oxime": (smiles) => carbonylCondensation(smiles, "C(=NO)", "C=NO", "Reaction with hydroxylamine converted the carbonyl group into an oxime."),
  "carbonyl-hydrazone": (smiles) => carbonylCondensation(smiles, "C(=NN)", "C=NN", "Reaction with hydrazine converted the carbonyl group into a hydrazone."),
  "carbonyl-clemmensen": carbonylToMethylene,
  "carbonyl-wolff-kishner": carbonylToMethylene,
  "aldehyde-oxidation": (smiles) => replace(smiles, /C=O$/g, "C(=O)O", "Oxidation converted the aldehyde group into a carboxylic acid."),
  "acid-reduction": (smiles) => replace(smiles, /C\(=O\)O/g, "CO", "Reduction converted the carboxylic acid group into a primary alcohol."),
  "acid-deprotonation": carboxylicAcidToCarboxylate,
  "acid-bicarbonate": carboxylicAcidToCarboxylate,
  "acid-diazomethane": (smiles) => replace(smiles, /C\(=O\)O/g, "C(=O)OC", "Diazomethane converted the carboxylic acid into its methyl ester."),
  "acid-socl2": (smiles) => replace(smiles, /C\(=O\)O/g, "C(=O)Cl", "SOCl2 converted the carboxylic acid into an acid chloride."),
  "acid-chloride-hydrolysis": (smiles) => replace(smiles, /C\(=O\)Cl/g, "C(=O)O", "Hydrolysis converted the acid chloride into a carboxylic acid."),
  "acid-chloride-amide": (smiles) => replace(smiles, /C\(=O\)Cl/g, "C(=O)N", "Reaction with ammonia converted the acid chloride into a primary amide."),
  "acid-chloride-reduction": (smiles) => replace(smiles, /C\(=O\)Cl/g, "C=O", "Rosenmund reduction converted the acid chloride into an aldehyde."),
  "nitrile-hydrolysis": (smiles) => replace(smiles, /C#N/g, "C(=O)O", "Hydrolysis converted the nitrile into a carboxylic acid."),
  "nitrile-basic-hydrolysis": (smiles) => replace(smiles, /C#N/g, "C(=O)O", "Basic hydrolysis followed by acidic workup converted the nitrile into a carboxylic acid."),
  "nitrile-reduction": (smiles) => replace(smiles, /C#N/g, "CN", "Reduction converted the nitrile into a primary amine."),
  "nitrile-dibal": (smiles) => replace(smiles, /C#N/g, "C=O", "Partial DIBAL-H reduction followed by hydrolysis converted the nitrile into an aldehyde."),
  "amide-reduction": (smiles) => replace(smiles, /C\(=O\)N/g, "CN", "LiAlH4 reduction converted the amide carbonyl group into a methylene group while retaining nitrogen."),
  "amide-hydrolysis": (smiles) => replace(smiles, /C\(=O\)N/g, "C(=O)O", "Acidic hydrolysis converted the amide into a carboxylic acid."),
  "amide-basic-hydrolysis": (smiles) => replace(smiles, /C\(=O\)N/g, "C(=O)[O-]", "Basic hydrolysis converted the amide into a carboxylate salt. The counterion is omitted from the structural drawing."),
  "amide-dehydration": (smiles) => replace(smiles, /C\(=O\)N/g, "C#N", "Dehydration converted the primary amide into a nitrile."),
  "amide-hofmann": (smiles) => replace(smiles, /C\(=O\)N/g, "N", "Hofmann rearrangement converted the primary amide into an amine with one fewer carbon atom."),
  "cyclic-bromination": cyclohexeneAntiBromination,
  "cyclic-dihydroxylation": cyclohexeneSynDihydroxylation,
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
function terminalHalideReplacement(smiles: string, group: string, note: string) {
  if (!/(?:Cl|Br|I)$/.test(smiles)) return null;
  return exactPrediction(smiles.replace(/(?:Cl|Br|I)$/, group), note);
}
function ethyleneOxideHydrolysis(smiles: string) {
  if (!isEthyleneOxide(smiles)) return null;
  return exactPrediction("OCCO", "Ring opening of ethylene oxide with water produced ethylene glycol.");
}
function ethyleneOxideHydrideOpening(smiles: string) {
  if (!isEthyleneOxide(smiles)) return null;
  return exactPrediction("CCO", "Hydride opened ethylene oxide and produced ethanol after acidic workup.");
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
  return regioselectiveAlkeneAddition(
    smiles,
    "O",
    "more",
    "Acid-catalyzed hydration placed the alcohol group at the more substituted alkene carbon. Carbocation rearrangements are not modeled.",
    "Acid-catalyzed hydration can give regioisomeric alcohols for this alkene, so both connectivity products are shown.",
  ) ?? methylcycloalkeneAlcohol(smiles, "more", "Acid-catalyzed hydration produced the Markovnikov cycloalkanol.");
}
function oxymercurationAlkene(smiles: string) {
  return regioselectiveAlkeneAddition(
    smiles,
    "O",
    "more",
    "Oxymercuration-demercuration placed the alcohol group at the more substituted alkene carbon without rearrangement.",
    "Oxymercuration can give regioisomeric alcohols for this alkene, so both connectivity products are shown.",
  ) ?? methylcycloalkeneAlcohol(smiles, "more", "Oxymercuration-demercuration produced the Markovnikov cycloalkanol.");
}
function hydroborationAlkene(smiles: string) {
  return regioselectiveAlkeneAddition(
    smiles,
    "O",
    "less",
    "Hydroboration-oxidation placed the alcohol group at the less substituted alkene carbon. The addition is syn when stereochemistry applies.",
    "Hydroboration can give regioisomeric alcohols for this alkene, so both connectivity products are shown.",
  ) ?? methylcycloalkeneAlcohol(smiles, "less", "Hydroboration-oxidation produced the anti-Markovnikov cycloalkanol.");
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
function carbonylAddition(smiles: string, branchedProduct: string, terminalProduct: string, note: string) {
  if (/C\(=O\)/.test(smiles)) return exactPrediction(smiles.replace(/C\(=O\)/, branchedProduct), note);
  if (/C=O/.test(smiles)) return exactPrediction(smiles.replace(/C=O/, terminalProduct), note);
  return null;
}
function carbonylCondensation(smiles: string, branchedProduct: string, terminalProduct: string, note: string) {
  if (/C\(=O\)/.test(smiles)) return exactPrediction(smiles.replace(/C\(=O\)/, branchedProduct), note);
  if (/C=O/.test(smiles)) return exactPrediction(smiles.replace(/C=O/, terminalProduct), note);
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
