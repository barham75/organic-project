export type AromaticityClass = "Aromatic" | "Antiaromatic" | "Nonaromatic";

export type AromaticityExample = {
  name: string;
  formula: string;
  classification: AromaticityClass;
  piElectrons: string;
  explanation: string;
};

export const aromaticityExamples: AromaticityExample[] = [
  { name: "Benzene", formula: "C6H6", classification: "Aromatic", piElectrons: "6 pi electrons", explanation: "It is cyclic, planar, fully conjugated, and follows the 4n + 2 rule with n = 1." },
  { name: "Cyclopropenyl cation", formula: "C3H3+", classification: "Aromatic", piElectrons: "2 pi electrons", explanation: "The three-membered ring is conjugated and follows the 4n + 2 rule with n = 0." },
  { name: "Cyclopentadienyl anion", formula: "C5H5-", classification: "Aromatic", piElectrons: "6 pi electrons", explanation: "The lone pair contributes two electrons to a continuous conjugated ring." },
  { name: "Tropylium cation", formula: "C7H7+", classification: "Aromatic", piElectrons: "6 pi electrons", explanation: "All seven carbons participate in a planar conjugated ring with six pi electrons." },
  { name: "Cyclobutadiene", formula: "C4H4", classification: "Antiaromatic", piElectrons: "4 pi electrons", explanation: "It is cyclic, planar, conjugated, and follows the 4n rule with n = 1." },
  { name: "Cyclopentadienyl cation", formula: "C5H5+", classification: "Antiaromatic", piElectrons: "4 pi electrons", explanation: "A planar fully conjugated form contains four pi electrons and is destabilized." },
  { name: "Cyclooctatetraene", formula: "C8H8", classification: "Nonaromatic", piElectrons: "8 pi electrons", explanation: "It avoids antiaromaticity by adopting a nonplanar tub shape, so continuous orbital overlap is lost." },
  { name: "Cyclopentadiene", formula: "C5H6", classification: "Nonaromatic", piElectrons: "4 pi electrons in two isolated double bonds", explanation: "One sp3 carbon interrupts conjugation around the ring." },
];

export type AromaticityQuestion = {
  id: string;
  prompt: string;
  structure: string;
  options: string[];
  answer: string;
  explanation: string;
};

export const aromaticityQuestions: AromaticityQuestion[] = [
  { id: "benzene", prompt: "Classify the compound.", structure: "benzene, C6H6", options: ["Aromatic", "Antiaromatic", "Nonaromatic"], answer: "Aromatic", explanation: "Benzene is cyclic, planar, fully conjugated, and has six pi electrons: 4n + 2 where n = 1." },
  { id: "cyclobutadiene", prompt: "Classify the compound.", structure: "cyclobutadiene, C4H4", options: ["Aromatic", "Antiaromatic", "Nonaromatic"], answer: "Antiaromatic", explanation: "Cyclobutadiene is cyclic, planar, fully conjugated, and has four pi electrons: 4n where n = 1." },
  { id: "cyclooctatetraene", prompt: "Classify the compound.", structure: "cyclooctatetraene, C8H8", options: ["Aromatic", "Antiaromatic", "Nonaromatic"], answer: "Nonaromatic", explanation: "Although it has eight pi electrons, it is not planar. Its tub shape prevents continuous orbital overlap and avoids antiaromaticity." },
  { id: "cyclopentadienyl-anion", prompt: "Classify the ion.", structure: "cyclopentadienyl anion, C5H5-", options: ["Aromatic", "Antiaromatic", "Nonaromatic"], answer: "Aromatic", explanation: "The negative charge supplies a lone pair to the conjugated ring, giving six pi electrons." },
  { id: "cyclopentadienyl-cation", prompt: "Classify the ion in its planar conjugated form.", structure: "cyclopentadienyl cation, C5H5+", options: ["Aromatic", "Antiaromatic", "Nonaromatic"], answer: "Antiaromatic", explanation: "The planar conjugated cation has four pi electrons, matching the destabilizing 4n count." },
  { id: "cyclopropenyl-cation", prompt: "Classify the ion.", structure: "cyclopropenyl cation, C3H3+", options: ["Aromatic", "Antiaromatic", "Nonaromatic"], answer: "Aromatic", explanation: "The ion is cyclic, planar, and conjugated with two pi electrons: 4n + 2 where n = 0." },
  { id: "cyclopentadiene", prompt: "Classify the compound.", structure: "cyclopentadiene, C5H6", options: ["Aromatic", "Antiaromatic", "Nonaromatic"], answer: "Nonaromatic", explanation: "An sp3 carbon breaks the continuous ring of p orbitals, so Hückel counting does not apply to the full ring." },
  { id: "tropylium", prompt: "Classify the ion.", structure: "tropylium cation, C7H7+", options: ["Aromatic", "Antiaromatic", "Nonaromatic"], answer: "Aromatic", explanation: "The ring is planar and fully conjugated with six pi electrons." },
  { id: "pyridine-lone-pair", prompt: "Does the nitrogen lone pair in pyridine count toward the aromatic sextet?", structure: "pyridine", options: ["No", "Yes", "Only after protonation"], answer: "No", explanation: "The lone pair lies in an sp2 orbital outside the aromatic pi system. The ring still contains six pi electrons." },
  { id: "pyrrole-lone-pair", prompt: "Does the nitrogen lone pair in pyrrole count toward the aromatic sextet?", structure: "pyrrole", options: ["Yes", "No", "Only after protonation"], answer: "Yes", explanation: "One nitrogen lone pair occupies a p orbital and contributes two electrons to the aromatic sextet." },
  { id: "huckel-six", prompt: "Which electron count can satisfy Hückel's aromaticity rule?", structure: "planar, cyclic, fully conjugated ring", options: ["6 pi electrons", "4 pi electrons", "8 pi electrons"], answer: "6 pi electrons", explanation: "Aromatic systems follow 4n + 2. Six electrons correspond to n = 1." },
  { id: "requirements", prompt: "Which set of conditions is required before applying the 4n + 2 rule?", structure: "general ring system", options: ["cyclic, planar, fully conjugated", "cyclic and saturated", "acyclic and conjugated"], answer: "cyclic, planar, fully conjugated", explanation: "Electron counting is meaningful only after confirming a cyclic, planar, continuously conjugated system." },
];
