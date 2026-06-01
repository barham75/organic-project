export type PropertyGroup = {
  id: string;
  name: string;
  examples: string;
  intermolecularForces: string;
  boilingPoint: string;
  solubility: string;
  acidityBasicity: string;
  factors: string[];
  comparison: string;
};

export const propertyGroups: PropertyGroup[] = [
  {
    id: "hydrocarbons",
    name: "Hydrocarbons",
    examples: "alkanes, alkenes, alkynes, aromatic hydrocarbons",
    intermolecularForces: "London dispersion forces dominate. Polarizability rises with molecular size.",
    boilingPoint: "Usually low. It rises with molar mass and surface area; branching generally lowers boiling point.",
    solubility: "Essentially insoluble in water and soluble in nonpolar organic solvents.",
    acidityBasicity: "Very weak acids. Terminal alkynes are more acidic than alkenes and alkanes because the conjugate base places charge on an sp carbon.",
    factors: ["carbon chain length", "branching", "surface area", "sp, sp2, or sp3 hybridization"],
    comparison: "CH3-C#CH is more acidic than CH2=CH2, which is more acidic than CH3-CH3.",
  },
  {
    id: "alkyl-halides",
    name: "Alkyl Halides",
    examples: "R-F, R-Cl, R-Br, R-I",
    intermolecularForces: "Dipole-dipole interactions and London dispersion forces.",
    boilingPoint: "Higher than comparable alkanes. It generally increases with halogen size and molar mass.",
    solubility: "Poor water solubility. They dissolve well in many organic solvents.",
    acidityBasicity: "Not normally treated as acids or bases in introductory organic chemistry.",
    factors: ["halogen polarizability", "molar mass", "chain length", "branching"],
    comparison: "CH3CH2I generally has a higher boiling point than CH3CH2Br and CH3CH2Cl.",
  },
  {
    id: "alcohols-phenols",
    name: "Alcohols and Phenols",
    examples: "R-OH, Ar-OH",
    intermolecularForces: "Strong intermolecular hydrogen bonding plus dipole-dipole interactions.",
    boilingPoint: "Higher than ethers and hydrocarbons of similar molar mass because alcohol molecules hydrogen-bond to one another.",
    solubility: "Small alcohols are water-miscible. Water solubility decreases as the hydrocarbon portion grows.",
    acidityBasicity: "Alcohols are weak acids. Phenols are more acidic because phenoxide is resonance-stabilized.",
    factors: ["hydrogen bonding", "hydrocarbon chain length", "resonance in phenoxide", "inductive effects"],
    comparison: "Phenol is more acidic than cyclohexanol; ethanol is more water-soluble than 1-hexanol.",
  },
  {
    id: "ethers",
    name: "Ethers and Epoxides",
    examples: "R-O-R', three-membered cyclic ethers",
    intermolecularForces: "Dipole-dipole interactions. Ethers accept hydrogen bonds from water but do not donate hydrogen bonds to one another.",
    boilingPoint: "Lower than isomeric alcohols and higher than many comparable hydrocarbons.",
    solubility: "Small ethers have moderate water solubility. Solubility decreases with a larger hydrocarbon portion.",
    acidityBasicity: "Weak Lewis bases because oxygen has lone pairs.",
    factors: ["oxygen lone pairs", "chain length", "ring strain for epoxides", "absence of O-H donation"],
    comparison: "CH3CH2OH has a higher boiling point than CH3OCH3, although both contain one oxygen atom.",
  },
  {
    id: "carbonyls",
    name: "Aldehydes and Ketones",
    examples: "R-CHO, R-CO-R'",
    intermolecularForces: "Strong carbonyl dipole. They accept hydrogen bonds from water but do not self-associate as strongly as alcohols.",
    boilingPoint: "Intermediate: typically higher than hydrocarbons and ethers but lower than comparable alcohols.",
    solubility: "Low-molar-mass aldehydes and ketones are water-soluble. Solubility decreases as carbon count rises.",
    acidityBasicity: "Alpha hydrogens are weakly acidic because the conjugate-base enolate is resonance-stabilized.",
    factors: ["carbonyl dipole", "hydrogen-bond acceptance", "alpha hydrogens", "enolate resonance", "chain length"],
    comparison: "Acetone is water-miscible, while larger ketones become progressively less soluble.",
  },
  {
    id: "carboxylic-acids",
    name: "Carboxylic Acids",
    examples: "R-COOH",
    intermolecularForces: "Very strong hydrogen bonding. Carboxylic acids commonly form hydrogen-bonded dimers.",
    boilingPoint: "High relative to compounds of comparable molar mass.",
    solubility: "Small acids are water-soluble. Their carboxylate salts are usually much more water-soluble.",
    acidityBasicity: "Acidic because the carboxylate conjugate base is resonance-stabilized.",
    factors: ["resonance stabilization", "electron-withdrawing groups", "distance from substituent", "chain length", "salt formation"],
    comparison: "ClCH2COOH is more acidic than CH3COOH because chlorine stabilizes the carboxylate by induction.",
  },
  {
    id: "acid-derivatives",
    name: "Carboxylic Acid Derivatives",
    examples: "acid chlorides, anhydrides, esters, amides",
    intermolecularForces: "Depend on the derivative. Amides form especially strong hydrogen-bond networks; esters are polar hydrogen-bond acceptors.",
    boilingPoint: "Amides are usually highest among comparable derivatives. Acid chlorides and esters boil lower.",
    solubility: "Small derivatives may dissolve in water. Amides are often more water-soluble than comparable esters.",
    acidityBasicity: "Reactivity toward acyl substitution decreases approximately: acid chloride > anhydride > ester > amide.",
    factors: ["hydrogen bonding", "leaving-group ability", "resonance donation", "chain length", "hydrolysis"],
    comparison: "CH3CONH2 has a much higher boiling point than CH3COOCH3 because amides form stronger hydrogen bonds.",
  },
  {
    id: "amines",
    name: "Amines",
    examples: "R-NH2, R2NH, R3N, Ar-NH2",
    intermolecularForces: "Primary and secondary amines hydrogen-bond. Tertiary amines accept hydrogen bonds but do not donate them.",
    boilingPoint: "Usually higher than comparable hydrocarbons but often lower than comparable alcohols.",
    solubility: "Small amines are water-soluble. Protonated ammonium salts are generally very water-soluble.",
    acidityBasicity: "Amines are bases. Alkyl groups often increase basicity by induction; resonance decreases aniline basicity.",
    factors: ["hydrogen bonding", "inductive donation", "resonance", "solvation", "salt formation"],
    comparison: "Cyclohexylamine is more basic than aniline because the nitrogen lone pair in aniline is delocalized into the ring.",
  },
  {
    id: "aromatics",
    name: "Aromatic Compounds",
    examples: "benzene and substituted benzenes",
    intermolecularForces: "London dispersion forces dominate in hydrocarbons; substituents add dipoles or hydrogen bonding.",
    boilingPoint: "Substituents and molar mass strongly influence boiling point.",
    solubility: "Benzene is poorly soluble in water. Polar substituents can improve solubility; ionic substituents improve it substantially.",
    acidityBasicity: "Substituents alter acidity and basicity through resonance and induction.",
    factors: ["substituent polarity", "resonance", "inductive effects", "ionic forms", "molar mass"],
    comparison: "p-Nitrophenol is more acidic than phenol because the nitro group stabilizes the phenoxide ion.",
  },
  {
    id: "nitriles",
    name: "Nitriles",
    examples: "R-CN",
    intermolecularForces: "A strong C-N dipole gives substantial dipole-dipole attraction.",
    boilingPoint: "Often higher than hydrocarbons of similar size.",
    solubility: "Small nitriles are water-soluble; solubility decreases as the hydrocarbon portion grows.",
    acidityBasicity: "Hydrogens alpha to a nitrile are more acidic than ordinary alkane hydrogens because the conjugate base is stabilized.",
    factors: ["strong dipole", "chain length", "alpha hydrogens", "anion stabilization"],
    comparison: "CH3CN is water-miscible, while longer-chain nitriles are less soluble.",
  },
];

export type PropertyQuestion = {
  id: string;
  property: "Boiling point" | "Water solubility" | "Acidity" | "Basicity";
  prompt: string;
  compounds: string[];
  answer: string;
  explanation: string;
};

export const propertyQuestions: PropertyQuestion[] = [
  { id: "bp-alcohol-ether-alkane", property: "Boiling point", prompt: "Choose the order from highest to lowest boiling point.", compounds: ["CH3CH2OH", "CH3OCH3", "CH3CH2CH3"], answer: "CH3CH2OH > CH3OCH3 > CH3CH2CH3", explanation: "Ethanol forms hydrogen bonds. Dimethyl ether has dipole-dipole interactions, while propane depends mainly on London dispersion forces." },
  { id: "bp-branching", property: "Boiling point", prompt: "Choose the order from highest to lowest boiling point.", compounds: ["CH3CH2CH2CH2CH3", "(CH3)2CHCH2CH3", "C(CH3)4"], answer: "CH3CH2CH2CH2CH3 > (CH3)2CHCH2CH3 > C(CH3)4", explanation: "For isomeric alkanes, branching reduces surface contact and weakens dispersion forces." },
  { id: "bp-acid-alcohol-ester", property: "Boiling point", prompt: "Choose the order from highest to lowest boiling point.", compounds: ["CH3COOH", "CH3CH2OH", "CH3COOCH3"], answer: "CH3COOH > CH3CH2OH > CH3COOCH3", explanation: "Carboxylic acids form strongly hydrogen-bonded dimers. Alcohols hydrogen-bond, while esters cannot donate hydrogen bonds." },
  { id: "bp-halides", property: "Boiling point", prompt: "Choose the order from highest to lowest boiling point.", compounds: ["CH3CH2I", "CH3CH2Br", "CH3CH2Cl"], answer: "CH3CH2I > CH3CH2Br > CH3CH2Cl", explanation: "Polarizability and molar mass rise down the halogen group, strengthening dispersion forces." },
  { id: "sol-alcohol-chain", property: "Water solubility", prompt: "Choose the order from most to least water-soluble.", compounds: ["CH3OH", "CH3CH2CH2OH", "CH3(CH2)5OH"], answer: "CH3OH > CH3CH2CH2OH > CH3(CH2)5OH", explanation: "All three alcohols hydrogen-bond with water, but the nonpolar hydrocarbon portion increasingly opposes dissolution." },
  { id: "sol-salt-acid-alkane", property: "Water solubility", prompt: "Choose the order from most to least water-soluble.", compounds: ["CH3COO-Na+", "CH3COOH", "CH3CH3"], answer: "CH3COO-Na+ > CH3COOH > CH3CH3", explanation: "The ionic carboxylate is strongly hydrated. Acetic acid is polar and hydrogen-bonds. Ethane is nonpolar." },
  { id: "sol-amine-salt", property: "Water solubility", prompt: "Which compound is most water-soluble?", compounds: ["CH3CH2NH3+Cl-", "CH3CH2NH2", "CH3CH2CH3"], answer: "CH3CH2NH3+Cl-", explanation: "Protonation converts the amine into an ionic ammonium salt, which interacts strongly with water." },
  { id: "acid-hybridization", property: "Acidity", prompt: "Choose the order from strongest to weakest acid.", compounds: ["HC#CH", "H2C=CH2", "CH3CH3"], answer: "HC#CH > H2C=CH2 > CH3CH3", explanation: "The conjugate base becomes more stable as the carbon bearing negative charge has more s character: sp > sp2 > sp3." },
  { id: "acid-carboxyl-induction", property: "Acidity", prompt: "Choose the order from strongest to weakest acid.", compounds: ["ClCH2COOH", "CH3COOH", "CH3CH2OH"], answer: "ClCH2COOH > CH3COOH > CH3CH2OH", explanation: "Carboxylate ions are resonance-stabilized. Chlorine further stabilizes the conjugate base by induction." },
  { id: "acid-phenol", property: "Acidity", prompt: "Choose the order from strongest to weakest acid.", compounds: ["p-NO2-C6H4-OH", "C6H5-OH", "CH3CH2OH"], answer: "p-NO2-C6H4-OH > C6H5-OH > CH3CH2OH", explanation: "Phenoxide is resonance-stabilized, and a para nitro group stabilizes it further through electron withdrawal." },
  { id: "base-amine-aniline-amide", property: "Basicity", prompt: "Choose the order from strongest to weakest base.", compounds: ["CH3CH2NH2", "C6H5NH2", "CH3CONH2"], answer: "CH3CH2NH2 > C6H5NH2 > CH3CONH2", explanation: "The lone pair is available in ethylamine, partly delocalized in aniline, and strongly delocalized into the carbonyl group in an amide." },
  { id: "base-pyridine-pyrrole", property: "Basicity", prompt: "Which nitrogen compound is the stronger base?", compounds: ["pyridine", "pyrrole"], answer: "pyridine", explanation: "The pyridine lone pair is not part of the aromatic sextet. The pyrrole lone pair is required for aromaticity and is less available for protonation." },
];
