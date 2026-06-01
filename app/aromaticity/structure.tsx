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

const structures: Record<StructureId, { atoms: number; doubleBonds: number[]; charge?: string; hetero?: Record<number, string>; sp3?: number; nonplanar?: boolean }> = {
  benzene: { atoms: 6, doubleBonds: [0, 2, 4] },
  "cyclopropenyl-cation": { atoms: 3, doubleBonds: [1], charge: "+" },
  "cyclopentadienyl-anion": { atoms: 5, doubleBonds: [0, 2], charge: "-" },
  tropylium: { atoms: 7, doubleBonds: [0, 2, 4], charge: "+" },
  cyclobutadiene: { atoms: 4, doubleBonds: [0, 2] },
  "cyclopentadienyl-cation": { atoms: 5, doubleBonds: [0, 2], charge: "+" },
  cyclooctatetraene: { atoms: 8, doubleBonds: [0, 2, 4, 6], nonplanar: true },
  cyclopentadiene: { atoms: 5, doubleBonds: [0, 2], sp3: 4 },
  pyridine: { atoms: 6, doubleBonds: [0, 2, 4], hetero: { 0: "N" } },
  pyrrole: { atoms: 5, doubleBonds: [1, 3], hetero: { 0: "NH" } },
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
        const first = inset(points[index], center, 0.16);
        const second = inset(points[(index + 1) % points.length], center, 0.16);
        return <line key={`double-${index}`} x1={first.x} y1={first.y} x2={second.x} y2={second.y} stroke="#0f766e" strokeWidth="2.4" strokeLinecap="round" />;
      })}
      {structure.hetero && Object.entries(structure.hetero).map(([index, label]) => {
        const point = points[Number(index)];
        return <AtomLabel key={`${index}-${label}`} point={point} label={label} />;
      })}
      {structure.sp3 !== undefined && <AtomLabel point={points[structure.sp3]} label="CH2" />}
      {structure.charge && <text x={center.x + radius + 18} y={center.y - radius + 10} fill="#7c3aed" fontSize="26" fontWeight="700">{structure.charge}</text>}
      {id === "cyclopentadienyl-anion" && <text x={center.x + radius + 4} y={center.y + 8} fill="#7c3aed" fontSize="18" fontWeight="700">: lone pair</text>}
      {id === "pyridine" && <text x={center.x + radius + 2} y={center.y - radius + 12} fill="#7c3aed" fontSize="18" fontWeight="700">:</text>}
      {id === "pyrrole" && <text x={center.x - 5} y={center.y - radius - 15} fill="#7c3aed" fontSize="18" fontWeight="700">:</text>}
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

function inset(point: Point, center: Point, amount: number) {
  return { x: point.x + (center.x - point.x) * amount, y: point.y + (center.y - point.y) * amount };
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
