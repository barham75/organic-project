type StructureId =
  | "benzene"
  | "cyclopropenyl-cation"
  | "cyclopentadienyl-anion"
  | "tropylium"
  | "cyclobutadiene"
  | "cyclopentadienyl-cation"
  | "cyclooctatetraene"
  | "cyclopentadiene"
  | "pyridine"
  | "pyrrole"
  | "generic-conjugated";

type Point = { x: number; y: number };

type RingStructure = {
  atoms: number;
  doubleBonds: number[];
  charge?: string;
  chargeAtom?: number;
  chargeInCenter?: boolean;
  hetero?: Record<number, string>;
  lonePairAtom?: number;
  sp3?: number;
  nonplanar?: boolean;
};

const structures: Record<StructureId, RingStructure> = {
  benzene: { atoms: 6, doubleBonds: [0, 2, 4] },
  "cyclopropenyl-cation": { atoms: 3, doubleBonds: [1], charge: "+", chargeAtom: 0 },
  "cyclopentadienyl-anion": { atoms: 5, doubleBonds: [0, 2], charge: "-", chargeAtom: 4, lonePairAtom: 4 },
  tropylium: { atoms: 7, doubleBonds: [0, 2, 4], charge: "+", chargeInCenter: true },
  cyclobutadiene: { atoms: 4, doubleBonds: [0, 2] },
  "cyclopentadienyl-cation": { atoms: 5, doubleBonds: [0, 2], charge: "+", chargeAtom: 4 },
  cyclooctatetraene: { atoms: 8, doubleBonds: [0, 2, 4, 6], nonplanar: true },
  cyclopentadiene: { atoms: 5, doubleBonds: [0, 2], sp3: 4 },
  pyridine: { atoms: 6, doubleBonds: [0, 2, 4], hetero: { 0: "N" }, lonePairAtom: 0 },
  pyrrole: { atoms: 5, doubleBonds: [1, 3], hetero: { 0: "NH" }, lonePairAtom: 0 },
  "generic-conjugated": { atoms: 6, doubleBonds: [0, 2, 4] },
};

export function AromaticStructure({ id, compact = false }: { id: string; compact?: boolean }) {
  const structure = structures[id as StructureId] ?? structures["generic-conjugated"];
  const width = compact ? 250 : 320;
  const height = compact ? 145 : 180;
  const center = { x: width / 2, y: height / 2 + 3 };
  const radius = compact ? 52 : 67;
  const points = polygon(structure.atoms, center, radius, structure.nonplanar);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Structural formula" className="mx-auto h-auto w-full max-w-xs">
      {points.map((point, index) => {
        const next = points[(index + 1) % points.length];
        return <line key={`bond-${index}`} x1={point.x} y1={point.y} x2={next.x} y2={next.y} stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />;
      })}
      {structure.doubleBonds.map((index) => {
        const [first, second] = parallelInnerBond(points[index], points[(index + 1) % points.length], center);
        return <line key={`double-${index}`} x1={first.x} y1={first.y} x2={second.x} y2={second.y} stroke="#0f766e" strokeWidth="2.4" strokeLinecap="round" />;
      })}
      {structure.hetero && Object.entries(structure.hetero).map(([index, label]) => {
        const point = points[Number(index)];
        return <AtomLabel key={`${index}-${label}`} point={point} label={label} />;
      })}
      {structure.sp3 !== undefined && <AtomLabel point={points[structure.sp3]} label="CH2" />}
      {structure.charge && (
        <ChargeLabel
          point={
            structure.chargeInCenter || structure.chargeAtom === undefined
              ? center
              : markPoint(points[structure.chargeAtom], center, structure.chargeAtom === structure.lonePairAtom ? 38 : 28)
          }
          sign={structure.charge}
        />
      )}
      {structure.lonePairAtom !== undefined && <LonePairLabel point={markPoint(points[structure.lonePairAtom], center, 20)} />}
      {id === "generic-conjugated" && <text x={center.x} y={center.y + 5} textAnchor="middle" fill="#4f46e5" fontSize="15" fontWeight="700">continuous p orbitals</text>}
      {structure.nonplanar && <text x={center.x} y={height - 8} textAnchor="middle" fill="#475569" fontSize="14" fontWeight="700">nonplanar tub conformation</text>}
    </svg>
  );
}

function polygon(atoms: number, center: Point, radius: number, nonplanar = false) {
  return Array.from({ length: atoms }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / atoms;
    const wave = nonplanar ? (index % 2 === 0 ? -9 : 9) : 0;
    return { x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) + wave };
  });
}

function parallelInnerBond(start: Point, end: Point, center: Point): [Point, Point] {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const normal = { x: -dy / length, y: dx / length };
  const midpoint = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
  const towardCenter = { x: center.x - midpoint.x, y: center.y - midpoint.y };
  const sign = normal.x * towardCenter.x + normal.y * towardCenter.y >= 0 ? 1 : -1;
  const offset = 9;
  const shorten = 0.17;
  return [
    {
      x: start.x + dx * shorten + normal.x * offset * sign,
      y: start.y + dy * shorten + normal.y * offset * sign
    },
    {
      x: end.x - dx * shorten + normal.x * offset * sign,
      y: end.y - dy * shorten + normal.y * offset * sign
    }
  ];
}

function markPoint(point: Point, center: Point, distance: number) {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  return { x: point.x + (dx / length) * distance, y: point.y + (dy / length) * distance };
}

function AtomLabel({ point, label }: { point: Point; label: string }) {
  const width = label.length > 1 ? 42 : 26;
  return (
    <g>
      <rect x={point.x - width / 2} y={point.y - 14} width={width} height="28" rx="4" fill="#fff" />
      <text x={point.x} y={point.y + 6} textAnchor="middle" fill="#be123c" fontSize="18" fontWeight="700">{label}</text>
    </g>
  );
}

function ChargeLabel({ point, sign }: { point: Point; sign: string }) {
  return (
    <text x={point.x} y={point.y + 8} textAnchor="middle" fill="#7c3aed" fontSize="24" fontWeight="700">
      {sign}
    </text>
  );
}

function LonePairLabel({ point }: { point: Point }) {
  return (
    <text x={point.x} y={point.y + 6} textAnchor="middle" fill="#7c3aed" fontSize="18" fontWeight="700">
      :
    </text>
  );
}
