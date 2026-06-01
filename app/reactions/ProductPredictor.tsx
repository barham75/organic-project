"use client";

import { forwardRef, useEffect, useRef, useState } from "react";

type Prediction = { product: string; note: string };
type ChemicalEditor = { getSmiles: () => Promise<string>; setMolecule: (structure: string) => Promise<void> };
type EditorWindow = Window & typeof globalThis & { ketcher?: ChemicalEditor };
const editorUrl = "/standalone/index.html";

const transformations: Record<string, (smiles: string) => Prediction | null> = {
  "alkene-hydrogenation": (smiles) => replace(smiles, /C=C/g, "CC", "Catalytic hydrogenation removed the alkene pi bond."),
  "alkyne-hydrogenation": (smiles) => replace(smiles, /C#C/g, "CC", "Complete hydrogenation removed the alkyne pi bonds."),
  "alkyne-lindlar": (smiles) => partialAlkyneReduction(smiles, "Lindlar reduction produced the cis (Z) alkene when E/Z stereochemistry applies."),
  "alkyne-na-nh3": (smiles) => partialAlkyneReduction(smiles, "Dissolving-metal reduction produced the trans (E) alkene when E/Z stereochemistry applies."),
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

export default function ProductPredictor({ reactionId }: { reactionId: string }) {
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
    const smiles = (await substrateEditor.getSmiles()).trim();
    if (!smiles) {
      setMessage("Draw a starting material before predicting the product.");
      return;
    }
    setSubstrateName(simpleHydrocarbonName(smiles));
    const transformation = transformations[reactionId];
    if (!transformation) {
      setPrediction(null);
      setMessage("Interactive prediction for this reaction is not enabled yet. This transformation needs a verified regioselectivity or stereochemistry rule before a product can be generated safely.");
      await productEditor.setMolecule("");
      return;
    }
    const result = transformation(smiles);
    if (!result || result.product === smiles) {
      setPrediction(null);
      setMessage("The drawing does not contain the functional group required for the selected reaction.");
      await productEditor.setMolecule("");
      return;
    }
    await productEditor.setMolecule(result.product);
    setPrediction(result);
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
        <Editor title="Expected product" name={prediction ? simpleHydrocarbonName(prediction.product) : ""} ref={productRef} />
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
        <div className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm leading-6 text-emerald-950">
          <p className="font-bold">Predicted product SMILES: <span className="font-mono">{prediction.product}</span></p>
          <p>{prediction.note}</p>
        </div>
      )}
    </section>
  );
}

const Editor = forwardRef<HTMLIFrameElement, { title: string; name: string }>(function Editor({ title, name }, ref) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-bold uppercase text-amber-950">{title}</h4>
      <iframe ref={ref} src={editorUrl} className="h-[360px] w-full rounded-lg border border-amber-200 bg-white" title={title} />
      {name && <p className="mt-2 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-bold text-amber-950">Name: {name}</p>}
    </div>
  );
});

function replace(smiles: string, pattern: RegExp, replacement: string, note: string): Prediction | null {
  if (!pattern.test(smiles)) return null;
  return { product: smiles.replace(pattern, replacement), note };
}
function terminalAlcohol(smiles: string, halogen: string, note: string) {
  if (!/O$/.test(smiles) || /C\(=O\)O$/.test(smiles)) return null;
  return { product: smiles.replace(/O$/, halogen), note };
}
function carbonylToMethylene(smiles: string) {
  if (!/C\(=O\)|C=O/.test(smiles)) return null;
  return { product: smiles.replace(/C\(=O\)|C=O/g, "C"), note: "Reduction replaced the carbonyl group with a methylene group." };
}
function carbonylToAlcohol(smiles: string) {
  if (!/C\(=O\)|C=O/.test(smiles)) return null;
  return { product: smiles.replace(/C\(=O\)/g, "C(O)").replace(/C=O/g, "CO"), note: "Reduction converted the carbonyl group into an alcohol." };
}
function partialAlkyneReduction(smiles: string, note: string) {
  if (!/^C#C|C#C$/.test(smiles)) return null;
  return replace(smiles, /C#C/g, "C=C", note);
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
