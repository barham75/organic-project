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
  "alkene-hbr-peroxide": (smiles) => terminalAlkeneAddition(smiles, "terminal", "Br", "Radical addition of HBr placed bromine at the less substituted end of the terminal alkene."),
  "alkene-hydration": (smiles) => terminalAlkeneAddition(smiles, "internal", "O", "Acid-catalyzed hydration placed the alcohol group at the more substituted carbon of the terminal alkene."),
  "alkene-oxymercuration": (smiles) => terminalAlkeneAddition(smiles, "internal", "O", "Oxymercuration-demercuration produced the Markovnikov alcohol without a carbocation rearrangement."),
  "alkene-hydroboration": (smiles) => terminalAlkeneAddition(smiles, "terminal", "O", "Hydroboration-oxidation produced the anti-Markovnikov alcohol. The addition is syn when stereochemistry applies."),
  "alkene-halohydrin": terminalAlkeneHalohydrin,
  "alkene-hydrogenation": (smiles) => replace(smiles, /C=C/g, "CC", "Catalytic hydrogenation removed the alkene pi bond."),
  "alkene-ozonolysis": alkeneOzonolysis,
  "alkene-epoxidation": (smiles) => replace(smiles, /C=C/, "C1OC1", "Peroxyacid epoxidation converted the alkene into an epoxide while preserving the alkene substituent relationship."),
  "alkene-dihydroxylation": (smiles) => replace(smiles, /C=C/, "C(O)C(O)", "Syn dihydroxylation added two alcohol groups across the alkene. The drawing shows connectivity; the reaction stereochemistry is syn."),
  "alkene-anti-dihydroxylation": (smiles) => replace(smiles, /C=C/, "C(O)C(O)", "Epoxidation followed by hydrolysis added two alcohol groups across the alkene. The drawing shows connectivity; the overall addition is anti."),
  "alkyne-hydrogenation": (smiles) => replace(smiles, /C#C/g, "CC", "Complete hydrogenation removed the alkyne pi bonds."),
  "alkyne-lindlar": (smiles) => partialAlkyneReduction(smiles, "cis", "Lindlar reduction produced the cis (Z) alkene when E/Z stereochemistry applies."),
  "alkyne-na-nh3": (smiles) => partialAlkyneReduction(smiles, "trans", "Dissolving-metal reduction produced the trans (E) alkene when E/Z stereochemistry applies."),
  "alcohol-pbr3": (smiles) => terminalAlcohol(smiles, "Br", "PBr3 replaced the alcohol group with bromine."),
  "alcohol-socl2": (smiles) => terminalAlcohol(smiles, "Cl", "SOCl2 replaced the alcohol group with chlorine."),
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
function terminalAlcohol(smiles: string, halogen: string, note: string) {
  if (!/O$/.test(smiles) || /C\(=O\)O$/.test(smiles)) return null;
  return exactPrediction(smiles.replace(/O$/, halogen), note);
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
function alkeneOzonolysis(smiles: string) {
  if (!/C=C/.test(smiles)) return null;
  return exactPrediction(smiles.replace(/C=C/, "C=O.O=C"), "Reductive ozonolysis cleaved the alkene and produced the corresponding aldehyde or ketone fragments.");
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
