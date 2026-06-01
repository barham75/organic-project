export type StructureQuestion = {
  id: string;
  structureId: string;
  answer: string;
  options: string[];
  formula: string;
  explanation: string;
};

export const structureQuestions: StructureQuestion[] = [
  { id: "alcohol", structureId: "alcohol", answer: "Alcohol", options: ["Alcohol", "Ether", "Carboxylic acid"], formula: "R-OH", explanation: "The hydroxyl group is bonded to an sp3 carbon." },
  { id: "phenol", structureId: "phenol", answer: "Phenol", options: ["Phenol", "Alcohol", "Ether"], formula: "Ar-OH", explanation: "The hydroxyl group is bonded directly to an aromatic ring." },
  { id: "ether", structureId: "ether", answer: "Ether", options: ["Ether", "Ester", "Alcohol"], formula: "R-O-R'", explanation: "An oxygen atom links two carbon groups." },
  { id: "aldehyde", structureId: "aldehyde", answer: "Aldehyde", options: ["Aldehyde", "Ketone", "Carboxylic acid"], formula: "R-CHO", explanation: "The carbonyl carbon is bonded to hydrogen and lies at the end of the chain." },
  { id: "ketone", structureId: "ketone", answer: "Ketone", options: ["Ketone", "Aldehyde", "Ester"], formula: "R-CO-R'", explanation: "The carbonyl carbon is bonded to two carbon groups." },
  { id: "acid", structureId: "acid", answer: "Carboxylic acid", options: ["Carboxylic acid", "Ester", "Amide"], formula: "R-COOH", explanation: "The structure contains a carbonyl and hydroxyl group on the same carbon." },
  { id: "ester", structureId: "ester", answer: "Ester", options: ["Ester", "Ether", "Carboxylic acid"], formula: "R-COOR'", explanation: "The carbonyl carbon is bonded to an alkoxy group." },
  { id: "amide", structureId: "amide", answer: "Amide", options: ["Amide", "Amine", "Nitrile"], formula: "R-CONH2", explanation: "Nitrogen is bonded directly to a carbonyl carbon." },
  { id: "amine", structureId: "amine", answer: "Amine", options: ["Amine", "Amide", "Nitrile"], formula: "R-NH2", explanation: "Nitrogen is bonded to carbon without an adjacent carbonyl group." },
  { id: "nitrile", structureId: "nitrile", answer: "Nitrile", options: ["Nitrile", "Alkyne", "Amide"], formula: "R-CN", explanation: "The functional group contains a carbon-nitrogen triple bond." },
  { id: "acid-chloride", structureId: "acid-chloride", answer: "Acid chloride", options: ["Acid chloride", "Alkyl chloride", "Aldehyde"], formula: "R-COCl", explanation: "Chlorine is bonded directly to the acyl carbon." },
  { id: "anhydride", structureId: "anhydride", answer: "Acid anhydride", options: ["Acid anhydride", "Ester", "Ether"], formula: "R-CO-O-CO-R'", explanation: "An oxygen atom connects two acyl groups." },
  { id: "alkene", structureId: "alkene", answer: "Alkene", options: ["Alkene", "Alkyne", "Alkane"], formula: "C=C", explanation: "The highlighted bond is a carbon-carbon double bond." },
  { id: "alkyne", structureId: "alkyne", answer: "Alkyne", options: ["Alkyne", "Nitrile", "Alkene"], formula: "C#C", explanation: "The highlighted bond is a carbon-carbon triple bond." },
  { id: "halide", structureId: "halide", answer: "Alkyl halide", options: ["Alkyl halide", "Acid chloride", "Aryl halide"], formula: "R-X", explanation: "A halogen is bonded to an sp3 carbon without an adjacent carbonyl." },
  { id: "nitro", structureId: "nitro", answer: "Nitro group", options: ["Nitro group", "Nitrile", "Amine"], formula: "R-NO2", explanation: "The highlighted substituent is a nitro group." },
  { id: "thiol", structureId: "thiol", answer: "Thiol", options: ["Thiol", "Alcohol", "Sulfide"], formula: "R-SH", explanation: "The sulfur analogue of an alcohol contains an S-H bond." },
  { id: "epoxide", structureId: "epoxide", answer: "Epoxide", options: ["Epoxide", "Ether", "Alkene"], formula: "three-membered cyclic ether", explanation: "The oxygen atom belongs to a strained three-membered ring." },
];

export type LaboratoryQuestion = {
  id: string;
  observation: string[];
  answer: string;
  options: string[];
  explanation: string;
  caution?: string;
};

export const laboratoryQuestions: LaboratoryQuestion[] = [
  { id: "dnp-tollens", observation: ["2,4-DNP: orange precipitate", "Tollens test: silver mirror"], answer: "Aldehyde", options: ["Aldehyde", "Ketone", "Alcohol"], explanation: "2,4-DNP indicates a carbonyl compound. A positive Tollens test distinguishes an aldehyde from a ketone.", caution: "Tollens reagent is used only as a freshly prepared teaching-lab reagent and must not be stored." },
  { id: "dnp-iodoform", observation: ["2,4-DNP: orange precipitate", "Tollens test: negative", "Iodoform test: yellow precipitate"], answer: "Methyl ketone", options: ["Methyl ketone", "Aldehyde", "Carboxylic acid"], explanation: "The carbonyl test is positive, the aldehyde test is negative, and yellow CHI3 supports a methyl ketone." },
  { id: "acid-bicarbonate", observation: ["NaHCO3 solution: effervescence", "The evolved gas turns limewater cloudy"], answer: "Carboxylic acid", options: ["Carboxylic acid", "Phenol", "Alcohol"], explanation: "A carboxylic acid reacts with bicarbonate to release carbon dioxide." },
  { id: "phenol-ferric", observation: ["Neutral FeCl3: violet color", "NaHCO3 solution: no effervescence"], answer: "Phenol", options: ["Phenol", "Carboxylic acid", "Ether"], explanation: "Many phenols form colored complexes with ferric ions but are not acidic enough to release CO2 from bicarbonate." },
  { id: "alkene-bromine", observation: ["Bromine solution: color disappears", "Dilute KMnO4: purple color disappears and a brown precipitate appears"], answer: "Alkene or alkyne", options: ["Alkene or alkyne", "Alkane", "Aromatic hydrocarbon"], explanation: "Both observations support carbon-carbon unsaturation. A separate test is needed to distinguish an alkene from an alkyne.", caution: "Bromine and permanganate tests require instructor supervision and appropriate protective equipment." },
  { id: "terminal-alkyne", observation: ["Bromine solution: color disappears", "Ammoniacal silver reagent: precipitate"], answer: "Terminal alkyne", options: ["Terminal alkyne", "Internal alkyne", "Alkene"], explanation: "A terminal alkyne can form an insoluble metal acetylide; internal alkynes and alkenes do not.", caution: "Metal acetylides are handled only in a supervised microscale teaching context and are not isolated or stored." },
  { id: "alcohol-jones", observation: ["2,4-DNP: negative", "Jones reagent: orange color changes toward green"], answer: "Primary or secondary alcohol", options: ["Primary or secondary alcohol", "Tertiary alcohol", "Ether"], explanation: "A primary or secondary alcohol is oxidized by Cr(VI); a tertiary alcohol generally is not under the same screening conditions.", caution: "Cr(VI) reagents are hazardous and require strict waste handling." },
  { id: "alcohol-lucas", observation: ["Lucas test: immediate turbidity at room temperature"], answer: "Tertiary alcohol", options: ["Tertiary alcohol", "Primary alcohol", "Phenol"], explanation: "Rapid turbidity supports fast formation of an insoluble tertiary alkyl chloride.", caution: "Lucas reagent is corrosive and is used only under laboratory supervision." },
  { id: "halide-silver", observation: ["Ethanolic AgNO3: cream precipitate"], answer: "Alkyl bromide", options: ["Alkyl bromide", "Alkyl chloride", "Alkyl iodide"], explanation: "Silver bromide is cream-colored; silver chloride is white and silver iodide is yellow." },
  { id: "amine-acid", observation: ["Moist indicator paper: basic response", "Dilute acid: a water-soluble salt forms"], answer: "Amine", options: ["Amine", "Amide", "Nitrile"], explanation: "Amines are basic and form ammonium salts with dilute acid." },
  { id: "ester-hydroxamic", observation: ["Hydroxamic-acid screening sequence: colored iron complex"], answer: "Ester", options: ["Ester", "Ether", "Ketone"], explanation: "The screening sequence supports an acyl derivative such as an ester. Confirmatory interpretation depends on the sample context.", caution: "The page intentionally omits procedural preparation details; follow the approved teaching-lab protocol." },
  { id: "amide-hydrolysis", observation: ["After supervised hydrolysis and warming: ammonia is detected", "Moist red litmus near the evolved gas turns blue"], answer: "Amide", options: ["Amide", "Amine", "Nitrile"], explanation: "Hydrolysis of an amide can release ammonia or an amine, depending on its substitution pattern." },
];
