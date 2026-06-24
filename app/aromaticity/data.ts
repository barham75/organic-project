export type AromaticityClass = "Aromatic" | "Antiaromatic" | "Nonaromatic";

export type AromaticityExample = {
  name: string;
  formula: string;
  structureId: string;
  classification: AromaticityClass;
  piElectrons: string;
  explanation: string;
};

export const aromaticityExamples: AromaticityExample[] = [
  { name: "Benzene", formula: "C6H6", structureId: "benzene", classification: "Aromatic", piElectrons: "6 pi electrons", explanation: "It is cyclic, planar, fully conjugated, and follows the 4n + 2 rule with n = 1." },
  { name: "Cyclopropenyl cation", formula: "C3H3+", structureId: "cyclopropenyl-cation", classification: "Aromatic", piElectrons: "2 pi electrons", explanation: "The three-membered ring is conjugated and follows the 4n + 2 rule with n = 0." },
  { name: "Cyclopentadienyl anion", formula: "C5H5-", structureId: "cyclopentadienyl-anion", classification: "Aromatic", piElectrons: "6 pi electrons", explanation: "The lone pair contributes two electrons to a continuous conjugated ring." },
  { name: "Tropylium cation", formula: "C7H7+", structureId: "tropylium", classification: "Aromatic", piElectrons: "6 pi electrons", explanation: "All seven carbons participate in a planar conjugated ring with six pi electrons." },
  { name: "Cyclobutadiene", formula: "C4H4", structureId: "cyclobutadiene", classification: "Antiaromatic", piElectrons: "4 pi electrons", explanation: "It is cyclic, planar, conjugated, and follows the 4n rule with n = 1." },
  { name: "Cyclopentadienyl cation", formula: "C5H5+", structureId: "cyclopentadienyl-cation", classification: "Antiaromatic", piElectrons: "4 pi electrons", explanation: "A planar fully conjugated form contains four pi electrons and is destabilized." },
  { name: "Cyclooctatetraene", formula: "C8H8", structureId: "cyclooctatetraene", classification: "Nonaromatic", piElectrons: "8 pi electrons", explanation: "It avoids antiaromaticity by adopting a nonplanar tub shape, so continuous orbital overlap is lost." },
  { name: "Cyclopentadiene", formula: "C5H6", structureId: "cyclopentadiene", classification: "Nonaromatic", piElectrons: "4 pi electrons in two isolated double bonds", explanation: "One sp3 carbon interrupts conjugation around the ring." },
];

export type AromaticityQuestion = {
  id: string;
  prompt: string;
  structureId: string;
  options: string[];
  answer: string;
  explanation: string;
};

export const aromaticityQuestions: AromaticityQuestion[] = [
  { id: "benzene", prompt: "Classify the compound.", structureId: "benzene", options: ["Aromatic", "Antiaromatic", "Nonaromatic"], answer: "Aromatic", explanation: "Benzene is cyclic, planar, fully conjugated, and has six pi electrons: 4n + 2 where n = 1." },
  { id: "cyclobutadiene", prompt: "Classify the compound.", structureId: "cyclobutadiene", options: ["Aromatic", "Antiaromatic", "Nonaromatic"], answer: "Antiaromatic", explanation: "Cyclobutadiene is cyclic, planar, fully conjugated, and has four pi electrons: 4n where n = 1." },
  { id: "cyclooctatetraene", prompt: "Classify the compound.", structureId: "cyclooctatetraene", options: ["Aromatic", "Antiaromatic", "Nonaromatic"], answer: "Nonaromatic", explanation: "Although it has eight pi electrons, it is not planar. Its tub shape prevents continuous orbital overlap and avoids antiaromaticity." },
  { id: "cyclopentadienyl-anion", prompt: "Classify the ion.", structureId: "cyclopentadienyl-anion", options: ["Aromatic", "Antiaromatic", "Nonaromatic"], answer: "Aromatic", explanation: "The negative charge supplies a lone pair to the conjugated ring, giving six pi electrons." },
  { id: "cyclopentadienyl-cation", prompt: "Classify the ion in its planar conjugated form.", structureId: "cyclopentadienyl-cation", options: ["Aromatic", "Antiaromatic", "Nonaromatic"], answer: "Antiaromatic", explanation: "The planar conjugated cation has four pi electrons, matching the destabilizing 4n count." },
  { id: "cyclopropenyl-cation", prompt: "Classify the ion.", structureId: "cyclopropenyl-cation", options: ["Aromatic", "Antiaromatic", "Nonaromatic"], answer: "Aromatic", explanation: "The ion is cyclic, planar, and conjugated with two pi electrons: 4n + 2 where n = 0." },
  { id: "cyclopentadiene", prompt: "Classify the compound.", structureId: "cyclopentadiene", options: ["Aromatic", "Antiaromatic", "Nonaromatic"], answer: "Nonaromatic", explanation: "An sp3 carbon breaks the continuous ring of p orbitals, so Hückel counting does not apply to the full ring." },
  { id: "tropylium", prompt: "Classify the ion.", structureId: "tropylium", options: ["Aromatic", "Antiaromatic", "Nonaromatic"], answer: "Aromatic", explanation: "The ring is planar and fully conjugated with six pi electrons." },
  { id: "pyridine-lone-pair", prompt: "Does the nitrogen lone pair count toward the aromatic sextet?", structureId: "pyridine", options: ["No", "Yes", "Only after protonation"], answer: "No", explanation: "The lone pair lies in an sp2 orbital outside the aromatic pi system. The ring still contains six pi electrons." },
  { id: "pyrrole-lone-pair", prompt: "Does the nitrogen lone pair count toward the aromatic sextet?", structureId: "pyrrole", options: ["Yes", "No", "Only after protonation"], answer: "Yes", explanation: "One nitrogen lone pair occupies a p orbital and contributes two electrons to the aromatic sextet." },
  { id: "huckel-six", prompt: "Which electron count can satisfy Hückel's aromaticity rule?", structureId: "generic-conjugated", options: ["6 pi electrons", "4 pi electrons", "8 pi electrons"], answer: "6 pi electrons", explanation: "Aromatic systems follow 4n + 2. Six electrons correspond to n = 1." },
  { id: "requirements", prompt: "Which set of conditions is required before applying the 4n + 2 rule?", structureId: "generic-conjugated", options: ["cyclic, planar, fully conjugated", "cyclic and saturated", "acyclic and conjugated"], answer: "cyclic, planar, fully conjugated", explanation: "Electron counting is meaningful only after confirming a cyclic, planar, continuously conjugated system." },
  { id: "cyclopropenyl-anion", prompt: "Classify the planar conjugated ion.", structureId: "cyclopropenyl-anion", options: ["Aromatic", "Antiaromatic", "Nonaromatic"], answer: "Antiaromatic", explanation: "The anion has one double bond plus a lone pair, giving four pi electrons in a cyclic conjugated system: 4n where n = 1." },
  { id: "cycloheptatrienyl-anion", prompt: "Classify the planar conjugated ion.", structureId: "cycloheptatrienyl-anion", options: ["Aromatic", "Antiaromatic", "Nonaromatic"], answer: "Antiaromatic", explanation: "Three double bonds plus the anion lone pair give eight pi electrons. A planar fully conjugated form follows 4n and is antiaromatic." },
  { id: "cycloheptatriene", prompt: "Classify the compound.", structureId: "cycloheptatriene", options: ["Aromatic", "Antiaromatic", "Nonaromatic"], answer: "Nonaromatic", explanation: "One sp3 carbon interrupts the continuous ring of p orbitals, so the seven-membered ring is not fully conjugated." },
  { id: "pyridinium", prompt: "Classify the protonated pyridine ring.", structureId: "pyridinium", options: ["Aromatic", "Antiaromatic", "Nonaromatic"], answer: "Aromatic", explanation: "Protonation uses the nitrogen lone pair, but the six pi electrons in the ring remain cyclic, planar, and fully conjugated." },
  { id: "furan", prompt: "Classify the heterocycle.", structureId: "furan", options: ["Aromatic", "Antiaromatic", "Nonaromatic"], answer: "Aromatic", explanation: "Furan has four pi electrons from two double bonds and one oxygen lone pair contributing two more, for six pi electrons." },
  { id: "thiophene", prompt: "Classify the heterocycle.", structureId: "thiophene", options: ["Aromatic", "Antiaromatic", "Nonaromatic"], answer: "Aromatic", explanation: "Thiophene has six pi electrons: two double bonds plus one sulfur lone pair in a p orbital." },
  { id: "imidazole", prompt: "Which heteroatom lone pair contributes to aromaticity?", structureId: "imidazole", options: ["The pyrrole-like NH lone pair", "The pyridine-like N lone pair", "Both nitrogen lone pairs"], answer: "The pyrrole-like NH lone pair", explanation: "The NH lone pair occupies a p orbital and completes the sextet. The pyridine-like nitrogen lone pair stays outside the pi system." },
  { id: "four-electron-rule", prompt: "A planar fully conjugated ring with four pi electrons is usually classified as:", structureId: "cyclobutadiene", options: ["Antiaromatic", "Aromatic", "Nonaromatic"], answer: "Antiaromatic", explanation: "Four pi electrons match the 4n antiaromatic count when the system is cyclic, planar, and fully conjugated." },
  { id: "eight-electron-rule", prompt: "A planar fully conjugated ring with eight pi electrons is usually classified as:", structureId: "cycloheptatrienyl-anion", options: ["Antiaromatic", "Aromatic", "Nonaromatic"], answer: "Antiaromatic", explanation: "Eight pi electrons fit 4n where n = 2, so a planar fully conjugated ring would be antiaromatic." },
  { id: "broken-conjugation", prompt: "What makes this ring nonaromatic?", structureId: "cyclopentadiene", options: ["An sp3 carbon breaks conjugation", "It has too many pi electrons", "It is acyclic"], answer: "An sp3 carbon breaks conjugation", explanation: "Cyclopentadiene contains two double bonds, but one saturated sp3 carbon prevents continuous cyclic conjugation." },
  { id: "nonplanar-eight", prompt: "Why is this eight-pi-electron ring nonaromatic rather than antiaromatic?", structureId: "cyclooctatetraene", options: ["It adopts a nonplanar tub shape", "It has six pi electrons", "It is not cyclic"], answer: "It adopts a nonplanar tub shape", explanation: "Cyclooctatetraene avoids antiaromaticity by becoming nonplanar, so the p orbitals do not overlap continuously around the ring." },
  { id: "pyridine-vs-pyrrole", prompt: "Which statement is correct?", structureId: "pyrrole", options: ["A pyrrole lone pair counts; a pyridine lone pair does not", "Both lone pairs always count", "Neither lone pair can count"], answer: "A pyrrole lone pair counts; a pyridine lone pair does not", explanation: "A pyrrole-like lone pair is part of the pi system, while a pyridine-like lone pair lies in an sp2 orbital outside it." },
];
