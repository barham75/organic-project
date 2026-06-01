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
  "alkene-hydrogenation": (smiles) => replace(smiles, /C=C/g, "CC", "Catalytic hydrogenation removed the alkene pi bond."),
  "alkyne-hydrogenation": (smiles) => replace(smiles, /C#C/g, "CC", "Complete hydrogenation removed the alkyne pi bonds."),
  "alkyne-lindlar": (smiles) => partialAlkyneReduction(smiles, "cis", "Lindlar reduction produced the cis (Z) alkene when E/Z stereochemistry applies."),
  "alkyne-na-nh3": (smiles) => partialAlkyneReduction(smiles, "trans", "Dissolving-metal reduction produced the trans (E) alkene when E/Z stereochemistry applies."),
  "alcohol-pbr3": (smiles) => terminalAlcohol(smiles, "Br", "PBr3 replaced the alcohol group with bromine."),
  "alcohol-socl2": (smiles) => terminalAlcohol(smiles, "Cl", "SOCl2 replaced the alcohol group with chlorine."),
  "carbonyl-reduction": carbonylToAlcohol,
  "carbonyl-clemmensen": carbonylToMethylene,
  "carbonyl-wolff-kishner": carbonylToMethylene,
  "aldehyde-oxidation": (smiles) => replace(smiles, /C=O$/g, "C(=O)O", "Oxidation converted the aldehyde group into a carboxylic acid."),
  "acid-reduction": (smiles) => replace(smiles, /C\(=O\)O/g, "CO", "Reduction converted the carboxylic acid group into a primary alcohol."),
  "acid-socl2": (smiles) => replace(smiles, /C\(=O\)O/g, "C(=O)Cl", "SOCl2 converted the carboxylic acid into an acid chloride."),
  "acid-chloride-hydrolysis": (smiles) => replace(smiles, /C\(=O\)Cl/g, "C(=O)O", "Hydrolysis converted the acid chloride into a carboxylic acid."),
  "nitrile-hydrolysis": (smiles) => replace(smiles, /C#N/g, "C(=O)O", "Hydrolysis converted the nitrile into a carboxylic acid."),
  "nitrile-reduction": (smiles) => replace(smiles, /C#N/g, "CN", "Reduction converted the nitrile into a primary amine."),
  "amide-dehydration": (smiles) => replace(smiles, /C\(=O\)N/g, "C#N", "Dehydration converted the primary amide into a nitrile."),
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
  return { product: smiles.replace(pattern, replacement), note, expectedProduct: "", generalScheme: "", exactStructure: true };
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
  return { product: smiles.replace(/O$/, halogen), note, expectedProduct: "", generalScheme: "", exactStructure: true };
}
function carbonylToMethylene(smiles: string) {
  if (!/C\(=O\)|C=O/.test(smiles)) return null;
  return { product: smiles.replace(/C\(=O\)|C=O/g, "C"), note: "Reduction replaced the carbonyl group with a methylene group.", expectedProduct: "", generalScheme: "", exactStructure: true };
}
function carbonylToAlcohol(smiles: string) {
  if (!/C\(=O\)|C=O/.test(smiles)) return null;
  return { product: smiles.replace(/C\(=O\)/g, "C(O)").replace(/C=O/g, "CO"), note: "Reduction converted the carbonyl group into an alcohol.", expectedProduct: "", generalScheme: "", exactStructure: true };
}
function partialAlkyneReduction(smiles: string, geometry: "cis" | "trans", note: string) {
  if (!/C#C/.test(smiles)) return null;
  const terminal = /^C#C|C#C$/.test(smiles);
  if (terminal) return replace(smiles, /C#C/g, "C=C", note);
  const linear = smiles.match(/^(C+)C#C(C+)$/);
  if (!linear) return null;
  return { product: `${linear[1]}/C=C${geometry === "cis" ? "\\" : "/"}${linear[2]}`, note, expectedProduct: "", generalScheme: "", exactStructure: true };
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
