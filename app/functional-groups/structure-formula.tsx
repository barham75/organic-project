const accent = "#0f766e";
const ink = "#1e293b";

export function FunctionalGroupStructure({ id }: { id: string }) {
  const group = structures[id] ?? structures.alcohol;
  return (
    <svg viewBox="0 0 420 190" role="img" aria-label="Structural formula" className="mx-auto h-auto w-full max-w-md">
      <path d="M45 105 L105 70 L165 105" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {group}
    </svg>
  );
}

const Bond = ({ x1, y1, x2, y2, color = ink, width = 4 }: { x1: number; y1: number; x2: number; y2: number; color?: string; width?: number }) =>
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round" />;

const Label = ({ x, y, text }: { x: number; y: number; text: string }) =>
  <text x={x} y={y} fill={accent} fontSize="22" fontWeight="700" textAnchor="middle">{text}</text>;

const Carbonyl = ({ x = 220 }: { x?: number }) => <><Bond x1={165} y1={105} x2={x} y2={105} /><Bond x1={x} y1={101} x2={x} y2={48} color={accent} /><Bond x1={x + 8} y1={101} x2={x + 8} y2={48} color={accent} /><Label x={x + 4} y={34} text="O" /></>;

const structures: Record<string, React.ReactNode> = {
  alcohol: <><Bond x1={165} y1={105} x2={230} y2={105} color={accent} /><Label x={258} y={112} text="OH" /></>,
  phenol: <><Ring /><Bond x1={270} y1={105} x2={324} y2={105} color={accent} /><Label x={354} y={112} text="OH" /></>,
  ether: <><Bond x1={165} y1={105} x2={222} y2={105} color={accent} /><Label x={244} y={112} text="O" /><Bond x1={262} y1={105} x2={322} y2={70} color={accent} /></>,
  aldehyde: <><Carbonyl /><Bond x1={224} y1={105} x2={280} y2={105} color={accent} /><Label x={300} y={112} text="H" /></>,
  ketone: <><Carbonyl /><Bond x1={224} y1={105} x2={292} y2={72} color={accent} /></>,
  acid: <><Carbonyl /><Bond x1={224} y1={105} x2={280} y2={105} color={accent} /><Label x={310} y={112} text="OH" /></>,
  ester: <><Carbonyl /><Bond x1={224} y1={105} x2={276} y2={105} color={accent} /><Label x={298} y={112} text="O" /><Bond x1={316} y1={105} x2={370} y2={72} color={accent} /></>,
  amide: <><Carbonyl /><Bond x1={224} y1={105} x2={278} y2={105} color={accent} /><Label x={315} y={112} text="NH2" /></>,
  amine: <><Bond x1={165} y1={105} x2={232} y2={105} color={accent} /><Label x={270} y={112} text="NH2" /></>,
  nitrile: <><Bond x1={165} y1={105} x2={232} y2={105} color={accent} /><Bond x1={232} y1={98} x2={302} y2={98} color={accent} /><Bond x1={232} y1={105} x2={302} y2={105} color={accent} /><Bond x1={232} y1={112} x2={302} y2={112} color={accent} /><Label x={328} y={112} text="N" /></>,
  "acid-chloride": <><Carbonyl /><Bond x1={224} y1={105} x2={280} y2={105} color={accent} /><Label x={306} y={112} text="Cl" /></>,
  anhydride: <><Carbonyl x={205} /><Bond x1={209} y1={105} x2={255} y2={105} color={accent} /><Label x={276} y={112} text="O" /><Bond x1={294} y1={105} x2={326} y2={105} color={accent} /><Bond x1={326} y1={101} x2={326} y2={50} color={accent} /><Bond x1={334} y1={101} x2={334} y2={50} color={accent} /><Label x={330} y={36} text="O" /><Bond x1={334} y1={105} x2={382} y2={78} color={accent} /></>,
  alkene: <><Bond x1={165} y1={101} x2={245} y2={58} color={accent} /><Bond x1={170} y1={111} x2={250} y2={68} color={accent} /><Bond x1={250} y1={63} x2={320} y2={102} /></>,
  alkyne: <><Bond x1={165} y1={98} x2={270} y2={98} color={accent} /><Bond x1={165} y1={105} x2={270} y2={105} color={accent} /><Bond x1={165} y1={112} x2={270} y2={112} color={accent} /><Bond x1={270} y1={105} x2={338} y2={70} /></>,
  halide: <><Bond x1={165} y1={105} x2={230} y2={105} color={accent} /><Label x={260} y={112} text="Br" /></>,
  nitro: <><Bond x1={165} y1={105} x2={232} y2={105} color={accent} /><Label x={276} y={112} text="NO2" /></>,
  thiol: <><Bond x1={165} y1={105} x2={232} y2={105} color={accent} /><Label x={265} y={112} text="SH" /></>,
  epoxide: <><Bond x1={165} y1={105} x2={242} y2={105} color={accent} /><Bond x1={242} y1={105} x2={282} y2={55} color={accent} /><Bond x1={282} y1={55} x2={322} y2={105} color={accent} /><Bond x1={322} y1={105} x2={242} y2={105} color={accent} /><Label x={282} y={48} text="O" /></>,
};

function Ring() {
  return <><path d="M165 105 L190 62 L240 62 L270 105 L240 148 L190 148 Z" fill="none" stroke={ink} strokeWidth="4" strokeLinejoin="round" /><Bond x1={196} y1={71} x2={232} y2={71} width={2.5} color={accent} /><Bond x1={254} y1={108} x2={235} y2={137} width={2.5} color={accent} /><Bond x1={184} y1={137} x2={170} y2={111} width={2.5} color={accent} /></>;
}
