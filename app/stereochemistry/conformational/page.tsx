"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot
} from "recharts";

type Vec3 = { x: number; y: number; z: number };

type EnergyPoint = {
  angle: number;
  type: string;
  total: number;
  torsional: number;
  steric: number;
  note: string;
};

type Compound = {
  id: string;
  name: string;
  bond: string;
  description: string;
  frontLabels: string[];
  backLabels: string[];
  sourceNote: string;
  bonds: string[];
  points: EnergyPoint[];
};

const compounds: Compound[] = [
  {
    id: "ethane",
    name: "Ethane",
    bond: "C-C",
    description: "Rotation around the C-C bond. Staggered is lowest and eclipsed is highest.",
    frontLabels: ["H", "H", "H"],
    backLabels: ["H", "H", "H"],
    bonds: ["C1-C2"],
    sourceNote: "Textbook value: rotational barrier about 2.9-3.0 kcal/mol.",
    points: [
      { angle: 0, type: "Eclipsed", total: 3.0, torsional: 3.0, steric: 0.0, note: "Three H-H eclipsing interactions." },
      { angle: 60, type: "Staggered", total: 0.0, torsional: 0.0, steric: 0.0, note: "Lowest energy staggered conformation." },
      { angle: 120, type: "Eclipsed", total: 3.0, torsional: 3.0, steric: 0.0, note: "Three H-H eclipsing interactions." },
      { angle: 180, type: "Staggered", total: 0.0, torsional: 0.0, steric: 0.0, note: "Lowest energy staggered conformation." },
      { angle: 240, type: "Eclipsed", total: 3.0, torsional: 3.0, steric: 0.0, note: "Three H-H eclipsing interactions." },
      { angle: 300, type: "Staggered", total: 0.0, torsional: 0.0, steric: 0.0, note: "Lowest energy staggered conformation." },
      { angle: 360, type: "Eclipsed", total: 3.0, torsional: 3.0, steric: 0.0, note: "Same as 0 degree." }
    ]
  },
  {
    id: "propane",
    name: "Propane",
    bond: "C1-C2",
    description: "Rotation around one terminal C-C bond. Eclipsed propane is higher than ethane because of CH3-H interaction.",
    frontLabels: ["CH3", "H", "H"],
    backLabels: ["H", "H", "H"],
    bonds: ["C1-C2"],
    sourceNote: "Textbook value: rotational barrier about 3.4 kcal/mol.",
    points: [
      { angle: 0, type: "Eclipsed", total: 3.4, torsional: 2.8, steric: 0.6, note: "CH3-H plus H-H eclipsing interactions." },
      { angle: 60, type: "Staggered", total: 0.0, torsional: 0.0, steric: 0.0, note: "Lowest energy staggered conformation." },
      { angle: 120, type: "Eclipsed", total: 3.4, torsional: 2.8, steric: 0.6, note: "Equivalent eclipsed arrangement." },
      { angle: 180, type: "Staggered", total: 0.0, torsional: 0.0, steric: 0.0, note: "Staggered minimum." },
      { angle: 240, type: "Eclipsed", total: 3.4, torsional: 2.8, steric: 0.6, note: "Equivalent eclipsed arrangement." },
      { angle: 300, type: "Staggered", total: 0.0, torsional: 0.0, steric: 0.0, note: "Staggered minimum." },
      { angle: 360, type: "Eclipsed", total: 3.4, torsional: 2.8, steric: 0.6, note: "Same as 0 degree." }
    ]
  },
  {
    id: "butane",
    name: "Butane",
    bond: "C2-C3",
    description: "Classic anti, gauche, eclipsed, and fully eclipsed conformations.",
    frontLabels: ["CH3", "H", "H"],
    backLabels: ["CH3", "H", "H"],
    bonds: ["C2-C3"],
    sourceNote: "Textbook values: anti 0.0, gauche 0.9, eclipsed 3.6, fully eclipsed 5.0 kcal/mol.",
    points: [
      { angle: 0, type: "Fully Eclipsed", total: 5.0, torsional: 3.0, steric: 2.0, note: "CH3-CH3 eclipsing interaction; highest energy." },
      { angle: 60, type: "Gauche", total: 0.9, torsional: 0.0, steric: 0.9, note: "Staggered but CH3 groups are close." },
      { angle: 120, type: "Eclipsed", total: 3.6, torsional: 2.8, steric: 0.8, note: "CH3-H and H-H eclipsing interactions." },
      { angle: 180, type: "Anti", total: 0.0, torsional: 0.0, steric: 0.0, note: "Most stable; CH3 groups are opposite." },
      { angle: 240, type: "Eclipsed", total: 3.6, torsional: 2.8, steric: 0.8, note: "Equivalent eclipsed arrangement." },
      { angle: 300, type: "Gauche", total: 0.9, torsional: 0.0, steric: 0.9, note: "Second gauche minimum." },
      { angle: 360, type: "Fully Eclipsed", total: 5.0, torsional: 3.0, steric: 2.0, note: "Same as 0 degree." }
    ]
  },
  {
    id: "pentane",
    name: "Pentane",
    bond: "C2-C3",
    description: "Approximate Newman analysis around C2-C3; ethyl and methyl group interactions control the profile.",
    frontLabels: ["CH3", "H", "H"],
    backLabels: ["CH2CH3", "H", "H"],
    bonds: ["C2-C3"],
    sourceNote: "Reference teaching estimate from alkane interaction values; anti is set to 0.0.",
    points: [
      { angle: 0, type: "Fully Eclipsed", total: 5.4, torsional: 3.0, steric: 2.4, note: "CH3-ethyl eclipsing interaction." },
      { angle: 60, type: "Gauche", total: 1.0, torsional: 0.0, steric: 1.0, note: "Gauche CH3-ethyl interaction." },
      { angle: 120, type: "Eclipsed", total: 3.8, torsional: 2.8, steric: 1.0, note: "Eclipsed CH3-H and ethyl-H interactions." },
      { angle: 180, type: "Anti", total: 0.0, torsional: 0.0, steric: 0.0, note: "Largest groups are anti." },
      { angle: 240, type: "Eclipsed", total: 3.8, torsional: 2.8, steric: 1.0, note: "Equivalent eclipsed arrangement." },
      { angle: 300, type: "Gauche", total: 1.0, torsional: 0.0, steric: 1.0, note: "Second gauche minimum." },
      { angle: 360, type: "Fully Eclipsed", total: 5.4, torsional: 3.0, steric: 2.4, note: "Same as 0 degree." }
    ]
  },
  {
    id: "isobutane",
    name: "2-Methylpropane",
    bond: "central C-C",
    description: "Rotation around a C-C bond in isobutane; multiple methyl groups increase steric effects.",
    frontLabels: ["CH3", "CH3", "H"],
    backLabels: ["CH3", "H", "H"],
    bonds: ["central C-C"],
    sourceNote: "Reference teaching estimate from alkane interaction values.",
    points: [
      { angle: 0, type: "Fully Eclipsed", total: 5.8, torsional: 3.0, steric: 2.8, note: "Strong methyl-methyl eclipsing interaction." },
      { angle: 60, type: "Gauche", total: 1.2, torsional: 0.0, steric: 1.2, note: "Staggered but bulky methyl groups remain close." },
      { angle: 120, type: "Eclipsed", total: 4.2, torsional: 2.8, steric: 1.4, note: "Several eclipsing interactions." },
      { angle: 180, type: "Anti", total: 0.0, torsional: 0.0, steric: 0.0, note: "Lowest-energy reference conformation." },
      { angle: 240, type: "Eclipsed", total: 4.2, torsional: 2.8, steric: 1.4, note: "Equivalent eclipsed arrangement." },
      { angle: 300, type: "Gauche", total: 1.2, torsional: 0.0, steric: 1.2, note: "Second gauche minimum." },
      { angle: 360, type: "Fully Eclipsed", total: 5.8, torsional: 3.0, steric: 2.8, note: "Same as 0 degree." }
    ]
  },
  {
    id: "dichloroethane",
    name: "1,2-Dichloroethane",
    bond: "C1-C2",
    description: "Anti, gauche, and eclipsed conformations. Anti is usually lower than gauche for Cl-Cl separation.",
    frontLabels: ["Cl", "H", "H"],
    backLabels: ["Cl", "H", "H"],
    bonds: ["C1-C2"],
    sourceNote: "Reported anti-gauche difference about 4.3 kJ/mol = 1.03 kcal/mol; rotational barrier about 3.0 kcal/mol.",
    points: [
      { angle: 0, type: "Fully Eclipsed", total: 3.0, torsional: 2.0, steric: 1.0, note: "Cl-Cl eclipsed; high energy." },
      { angle: 60, type: "Gauche", total: 1.03, torsional: 0.0, steric: 1.03, note: "Gauche conformer is higher than anti." },
      { angle: 120, type: "Eclipsed", total: 2.6, torsional: 2.1, steric: 0.5, note: "Cl-H eclipsing interactions." },
      { angle: 180, type: "Anti", total: 0.0, torsional: 0.0, steric: 0.0, note: "Anti conformer; chlorine atoms far apart." },
      { angle: 240, type: "Eclipsed", total: 2.6, torsional: 2.1, steric: 0.5, note: "Equivalent eclipsed arrangement." },
      { angle: 300, type: "Gauche", total: 1.03, torsional: 0.0, steric: 1.03, note: "Second gauche conformer." },
      { angle: 360, type: "Fully Eclipsed", total: 3.0, torsional: 2.0, steric: 1.0, note: "Same as 0 degree." }
    ]
  },
  {
    id: "difluoroethane",
    name: "1,2-Difluoroethane",
    bond: "C1-C2",
    description: "The gauche effect can make gauche 1,2-difluoroethane competitive or lower than anti.",
    frontLabels: ["F", "H", "H"],
    backLabels: ["F", "H", "H"],
    bonds: ["C1-C2"],
    sourceNote: "Reference value varies by phase/method; included as teaching value for the gauche effect.",
    points: [
      { angle: 0, type: "Fully Eclipsed", total: 4.0, torsional: 2.8, steric: 1.2, note: "F-F eclipsed; high energy." },
      { angle: 60, type: "Gauche", total: 0.0, torsional: 0.0, steric: 0.0, note: "Gauche effect stabilizes this conformation." },
      { angle: 120, type: "Eclipsed", total: 3.0, torsional: 2.5, steric: 0.5, note: "F-H eclipsing interactions." },
      { angle: 180, type: "Anti", total: 0.6, torsional: 0.0, steric: 0.6, note: "Anti is slightly above gauche in this educational profile." },
      { angle: 240, type: "Eclipsed", total: 3.0, torsional: 2.5, steric: 0.5, note: "Equivalent eclipsed arrangement." },
      { angle: 300, type: "Gauche", total: 0.0, torsional: 0.0, steric: 0.0, note: "Second gauche minimum." },
      { angle: 360, type: "Fully Eclipsed", total: 4.0, torsional: 2.8, steric: 1.2, note: "Same as 0 degree." }
    ]
  },
  {
    id: "dibromoethane",
    name: "1,2-Dibromoethane",
    bond: "C1-C2",
    description: "Large bromine atoms make eclipsed and gauche contacts more costly; anti is lowest.",
    frontLabels: ["Br", "H", "H"],
    backLabels: ["Br", "H", "H"],
    bonds: ["C1-C2"],
    sourceNote: "Reference teaching estimate based on larger halogen steric size.",
    points: [
      { angle: 0, type: "Fully Eclipsed", total: 4.2, torsional: 2.4, steric: 1.8, note: "Br-Br eclipsed; very unfavorable." },
      { angle: 60, type: "Gauche", total: 1.4, torsional: 0.0, steric: 1.4, note: "Br-Br gauche repulsion." },
      { angle: 120, type: "Eclipsed", total: 3.2, torsional: 2.4, steric: 0.8, note: "Br-H eclipsing interactions." },
      { angle: 180, type: "Anti", total: 0.0, torsional: 0.0, steric: 0.0, note: "Bromine atoms are farthest apart." },
      { angle: 240, type: "Eclipsed", total: 3.2, torsional: 2.4, steric: 0.8, note: "Equivalent eclipsed arrangement." },
      { angle: 300, type: "Gauche", total: 1.4, torsional: 0.0, steric: 1.4, note: "Second gauche minimum." },
      { angle: 360, type: "Fully Eclipsed", total: 4.2, torsional: 2.4, steric: 1.8, note: "Same as 0 degree." }
    ]
  },
  {
    id: "ethylene-glycol",
    name: "Ethylene Glycol",
    bond: "C1-C2",
    description: "HOCH2-CH2OH can have stabilizing gauche interactions due to intramolecular hydrogen bonding/electronic effects.",
    frontLabels: ["OH", "H", "H"],
    backLabels: ["OH", "H", "H"],
    bonds: ["C1-C2"],
    sourceNote: "Reference teaching value; gauche stabilization depends strongly on phase and H-bonding.",
    points: [
      { angle: 0, type: "Fully Eclipsed", total: 4.4, torsional: 2.8, steric: 1.6, note: "OH-OH eclipsed; high energy." },
      { angle: 60, type: "Gauche", total: 0.0, torsional: 0.0, steric: 0.0, note: "Gauche can be stabilized by intramolecular interaction." },
      { angle: 120, type: "Eclipsed", total: 3.1, torsional: 2.5, steric: 0.6, note: "OH-H eclipsing interactions." },
      { angle: 180, type: "Anti", total: 0.5, torsional: 0.0, steric: 0.5, note: "Anti is slightly above gauche in this profile." },
      { angle: 240, type: "Eclipsed", total: 3.1, torsional: 2.5, steric: 0.6, note: "Equivalent eclipsed arrangement." },
      { angle: 300, type: "Gauche", total: 0.0, torsional: 0.0, steric: 0.0, note: "Second gauche minimum." },
      { angle: 360, type: "Fully Eclipsed", total: 4.4, torsional: 2.8, steric: 1.6, note: "Same as 0 degree." }
    ]
  },
  {
    id: "chloroethanol",
    name: "2-Chloroethanol",
    bond: "C1-C2",
    description: "HOCH2-CH2Cl has anti/gauche competition involving steric and polar interactions.",
    frontLabels: ["OH", "H", "H"],
    backLabels: ["Cl", "H", "H"],
    bonds: ["C1-C2"],
    sourceNote: "Reference teaching estimate; actual values depend on phase and intramolecular H-bonding.",
    points: [
      { angle: 0, type: "Fully Eclipsed", total: 4.1, torsional: 2.7, steric: 1.4, note: "OH-Cl eclipsed; high energy." },
      { angle: 60, type: "Gauche", total: 0.4, torsional: 0.0, steric: 0.4, note: "Gauche conformer may gain polar/H-bond stabilization." },
      { angle: 120, type: "Eclipsed", total: 3.0, torsional: 2.4, steric: 0.6, note: "OH-H and Cl-H eclipsing interactions." },
      { angle: 180, type: "Anti", total: 0.0, torsional: 0.0, steric: 0.0, note: "Anti is used as the reference minimum here." },
      { angle: 240, type: "Eclipsed", total: 3.0, torsional: 2.4, steric: 0.6, note: "Equivalent eclipsed arrangement." },
      { angle: 300, type: "Gauche", total: 0.4, torsional: 0.0, steric: 0.4, note: "Second gauche conformer." },
      { angle: 360, type: "Fully Eclipsed", total: 4.1, torsional: 2.7, steric: 1.4, note: "Same as 0 degree." }
    ]
  }
];

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function rotateY(p: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
}

function rotateX(p: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
}

function rotateZ(p: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c, z: p.z };
}

function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function scale(v: Vec3, s: number): Vec3 {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

function labelColor(label: string) {
  if (label.includes("CH3") || label.includes("CH2")) return "#dc2626";
  if (label.includes("Cl")) return "#16a34a";
  if (label.includes("Br")) return "#7c2d12";
  if (label.includes("F")) return "#0891b2";
  if (label.includes("OH")) return "#9333ea";
  return "#1d4ed8";
}

function atomRadius(label: string) {
  if (label.includes("Br")) return 18;
  if (label.includes("Cl")) return 17;
  if (label.includes("F") || label.includes("OH")) return 16;
  if (label.includes("CH")) return 19;
  if (label === "C") return 18;
  return 13;
}

function atomColor(label: string) {
  if (label === "C") return "#334155";
  if (label.includes("CH")) return "#dc2626";
  if (label.includes("Cl")) return "#22c55e";
  if (label.includes("Br")) return "#92400e";
  if (label.includes("F")) return "#06b6d4";
  if (label.includes("OH")) return "#a855f7";
  return "#f8fafc";
}

function polarToXY(cx: number, cy: number, r: number, deg: number) {
  const rad = degToRad(deg - 90);
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad)
  };
}

function interpolateEnergy(compound: Compound, angle: number) {
  const points = compound.points;
  const a = Math.max(0, Math.min(360, angle));
  const exact = points.find((p) => p.angle === a);
  if (exact) return exact;

  let left = points[0];
  let right = points[points.length - 1];

  for (let i = 0; i < points.length - 1; i++) {
    if (a >= points[i].angle && a <= points[i + 1].angle) {
      left = points[i];
      right = points[i + 1];
      break;
    }
  }

  const t = (a - left.angle) / (right.angle - left.angle);
  const smooth = (1 - Math.cos(Math.PI * t)) / 2;

  return {
    angle: a,
    type: `Between ${left.type} and ${right.type}`,
    total: Number((left.total + (right.total - left.total) * smooth).toFixed(2)),
    torsional: Number((left.torsional + (right.torsional - left.torsional) * smooth).toFixed(2)),
    steric: Number((left.steric + (right.steric - left.steric) * smooth).toFixed(2)),
    note: `Interpolated between ${left.angle}° and ${right.angle}°.`
  };
}

function buildMolecule3D(compound: Compound, angle: number) {
  const frontC: Vec3 = { x: -1.2, y: 0, z: 0 };
  const backC: Vec3 = { x: 1.2, y: 0, z: 0 };

  const frontBaseAngles = [90, 210, 330];
  const backBaseAngles = [90 + angle, 210 + angle, 330 + angle];

  const substituentDistance = 1.25;

  const frontAtoms = frontBaseAngles.map((a, i) => {
    const rad = degToRad(a);
    const dir: Vec3 = { x: -0.55, y: Math.cos(rad), z: Math.sin(rad) };
    return {
      id: `front-${i}`,
      label: compound.frontLabels[i],
      position: add(frontC, scale(dir, substituentDistance))
    };
  });

  const backAtoms = backBaseAngles.map((a, i) => {
    const rad = degToRad(a);
    const dir: Vec3 = { x: 0.55, y: Math.cos(rad), z: Math.sin(rad) };
    return {
      id: `back-${i}`,
      label: compound.backLabels[i],
      position: add(backC, scale(dir, substituentDistance))
    };
  });

  const atoms = [
    { id: "C-front", label: "C", position: frontC },
    { id: "C-back", label: "C", position: backC },
    ...frontAtoms,
    ...backAtoms
  ];

  const bonds = [
    ["C-front", "C-back", true],
    ...frontAtoms.map((a) => ["C-front", a.id, false]),
    ...backAtoms.map((a) => ["C-back", a.id, false])
  ];

  return { atoms, bonds };
}


function getEnergyOrigins(compound: Compound, selected: EnergyPoint) {
  const label = selected.type.toLowerCase();
  const isGauche = label.includes("gauche");
  const isEclipsed = label.includes("eclipsed");
  const isAnti = label.includes("anti") || label.includes("staggered");

  const origins: {
    kind: string;
    value: number;
    color: string;
    description: string;
    active: boolean;
    target: "torsional" | "steric" | "gauche" | "halogen" | "stabilization" | "minimum";
  }[] = [];

  origins.push({
    kind: "Torsional Strain",
    value: selected.torsional,
    color: "#fb923c",
    active: selected.torsional > 0.05,
    target: "torsional",
    description: selected.torsional > 0.05
      ? "Eclipsed or partially eclipsed bonds increase electron-pair repulsion."
      : "Very small here because the conformation is staggered or near a minimum."
  });

  let stericKind = "Steric Repulsion";
  let stericTarget: "steric" | "gauche" | "halogen" | "stabilization" = "steric";
  let stericColor = "#ef4444";
  let stericDescription = "Large groups are close to each other, increasing repulsion.";

  if (compound.name.includes("Butane") && isGauche) {
    stericKind = "Gauche CH3-CH3 Interaction";
    stericTarget = "gauche";
    stericColor = "#eab308";
    stericDescription = "The two CH3 groups are staggered but only 60° apart.";
  }

  if (compound.name.includes("Dichloro") || compound.name.includes("Dibromo") || compound.name.includes("Difluoro")) {
    stericKind = compound.name.includes("Difluoro") && isGauche ? "Gauche Effect" : "Halogen-Halogen Interaction";
    stericTarget = compound.name.includes("Difluoro") && isGauche ? "stabilization" : "halogen";
    stericColor = compound.name.includes("Difluoro") && isGauche ? "#a855f7" : "#22c55e";
    stericDescription = compound.name.includes("Difluoro") && isGauche
      ? "The gauche arrangement is electronically stabilized in this teaching profile."
      : "Halogen atoms interact strongly when they are close or eclipsed.";
  }

  if (compound.name.includes("Ethylene Glycol") && isGauche) {
    stericKind = "Intramolecular H-Bond / Stabilization";
    stericTarget = "stabilization";
    stericColor = "#a855f7";
    stericDescription = "The gauche form may be stabilized by an intramolecular interaction.";
  }

  if (compound.name.includes("Chloroethanol") && isGauche) {
    stericKind = "Polar / H-Bond Stabilization";
    stericTarget = "stabilization";
    stericColor = "#a855f7";
    stericDescription = "Gauche conformation can gain polar or intramolecular stabilization.";
  }

  origins.push({
    kind: stericKind,
    value: selected.steric,
    color: stericColor,
    active: selected.steric > 0.05 || stericTarget === "stabilization",
    target: stericTarget,
    description: selected.steric > 0.05 || stericTarget === "stabilization"
      ? stericDescription
      : "Very small here because the large groups are far apart."
  });

  origins.push({
    kind: "Energy Minimum",
    value: selected.total,
    color: "#22c55e",
    active: selected.total <= 0.05 || isAnti,
    target: "minimum",
    description: selected.total <= 0.05
      ? "This is a minimum-energy conformation for the selected profile."
      : "Not the minimum at this angle."
  });

  return origins;
}


function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (const word of words) {
    const testLine = line + word + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== "") {
      ctx.fillText(line, x, currentY);
      line = word + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  ctx.fillText(line, x, currentY);
}

function drawDoubleArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 10;

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  function headAt(x: number, y: number, dir: number) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - head * Math.cos(dir - Math.PI / 6), y - head * Math.sin(dir - Math.PI / 6));
    ctx.lineTo(x - head * Math.cos(dir + Math.PI / 6), y - head * Math.sin(dir + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  }

  headAt(x2, y2, angle);
  headAt(x1, y1, angle + Math.PI);
}


function True3DViewer({ compound, angle, selected, showForces, onToggleForces }: { compound: Compound; angle: number; selected: EnergyPoint; showForces: boolean; onToggleForces: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotX, setRotX] = useState(-0.45);
  const [rotY, setRotY] = useState(0.75);
  const [zoom, setZoom] = useState(1);
  const dragRef = useRef({ dragging: false, x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    const width = parent?.clientWidth || 700;
    const height = 470;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const { atoms, bonds } = buildMolecule3D(compound, angle);
    const origins = getEnergyOrigins(compound, selected);

    function transform(p: Vec3) {
      let q = rotateX(p, rotX);
      q = rotateY(q, rotY);
      q = rotateZ(q, 0.05);
      const perspective = 420 / (420 - q.z * 55);
      return {
        x: width / 2 + q.x * 95 * zoom * perspective,
        y: height / 2 + q.y * 95 * zoom * perspective,
        z: q.z,
        perspective
      };
    }

    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#020617");
    gradient.addColorStop(1, "#111827");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 22px Arial";
    ctx.textAlign = "center";
    ctx.fillText("True 3D Ball-and-Stick Viewer", width / 2, 34);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "14px Arial";
    ctx.fillText("Drag with mouse to rotate | Mouse wheel to zoom | Slider rotates back carbon", width / 2, 58);

    const projected = new Map<string, ReturnType<typeof transform>>();
    atoms.forEach((atom) => projected.set(atom.id, transform(atom.position)));

    const bondItems = bonds.map(([a, b, main]) => {
      const pa = projected.get(a as string)!;
      const pb = projected.get(b as string)!;
      return { a: a as string, b: b as string, main: Boolean(main), z: (pa.z + pb.z) / 2 };
    }).sort((x, y) => x.z - y.z);

    for (const bond of bondItems) {
      const pa = projected.get(bond.a)!;
      const pb = projected.get(bond.b)!;

      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.strokeStyle = bond.main ? "#facc15" : "#94a3b8";
      ctx.lineWidth = bond.main ? 10 : 6;
      ctx.lineCap = "round";
      ctx.stroke();

      if (bond.main) {
        ctx.fillStyle = "#fde68a";
        ctx.font = "700 13px Arial";
        ctx.fillText(`Selected bond: ${compound.bond}`, (pa.x + pb.x) / 2, (pa.y + pb.y) / 2 - 18);
      }
    }

    const atomItems = atoms.map((atom) => ({ atom, p: projected.get(atom.id)! })).sort((a, b) => a.p.z - b.p.z);

    for (const item of atomItems) {
      const { atom, p } = item;
      const r = atomRadius(atom.label) * zoom * Math.max(0.75, p.perspective);

      ctx.beginPath();
      ctx.arc(p.x + 4, p.y + 5, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = atomColor(atom.label);
      ctx.fill();
      ctx.strokeStyle = atom.label === "C" ? "#e2e8f0" : labelColor(atom.label);
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = atom.label === "C" ? "#ffffff" : "#0f172a";
      ctx.font = "700 13px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(atom.label, p.x, p.y);
    }


    // Force toggle button drawn inside canvas
    const btnW = 190;
    const btnH = 38;
    const btnX = width - btnW - 24;
    const btnY = 78;
    ctx.fillStyle = showForces ? "#16a34a" : "#475569";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    roundRect(ctx, btnX, btnY, btnW, btnH, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(showForces ? "Hide Energy Forces" : "Show Energy Forces", btnX + btnW / 2, btnY + 24);

    if (showForces) {
      // Energy origin annotations on the 3D molecule
      const originBoxX = 24;
      const originBoxY = 84;
      const originBoxW = Math.min(360, width - 48);
      const originBoxH = 54 + origins.length * 58;

      ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 2;
      roundRect(ctx, originBoxX, originBoxY, originBoxW, originBoxH, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "700 16px Arial";
      ctx.textAlign = "left";
      ctx.fillText("Energy forces / origins", originBoxX + 18, originBoxY + 28);

      origins.forEach((origin, index) => {
        const y = originBoxY + 58 + index * 58;
        ctx.globalAlpha = origin.active ? 1 : 0.38;

        ctx.beginPath();
        ctx.arc(originBoxX + 28, y - 5, 8, 0, Math.PI * 2);
        ctx.fillStyle = origin.color;
        ctx.fill();

        ctx.fillStyle = "#e2e8f0";
        ctx.font = "700 13px Arial";
        const valueText = origin.target === "minimum" ? `${origin.value} kcal/mol total` : `${origin.value} kcal/mol`;
        ctx.fillText(`${origin.kind}: ${valueText}`, originBoxX + 46, y);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "12px Arial";
        wrapText(ctx, origin.description, originBoxX + 46, y + 18, originBoxW - 65, 14);

        ctx.globalAlpha = 1;
      });

      const front0 = projected.get("front-0");
      const front1 = projected.get("front-1");
      const front2 = projected.get("front-2");
      const back0 = projected.get("back-0");
      const back1 = projected.get("back-1");
      const back2 = projected.get("back-2");
      const cFront = projected.get("C-front")!;
      const cBack = projected.get("C-back")!;

      origins.forEach((origin, index) => {
        if (!origin.active) return;

        ctx.save();
        ctx.strokeStyle = origin.color;
        ctx.fillStyle = origin.color;
        ctx.lineWidth = 4;
        ctx.font = "700 13px Arial";

        if (origin.target === "torsional") {
          const midX = (cFront.x + cBack.x) / 2;
          const midY = (cFront.y + cBack.y) / 2;
          ctx.setLineDash([8, 6]);
          ctx.beginPath();
          ctx.arc(midX, midY, 48, -0.4, 4.9);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillText("Torsional strain", midX + 55, midY - 24);

          // orange small lines showing eclipsed bond pairs
          const pairs = [[front0, back0], [front1, back1], [front2, back2]];
          pairs.forEach((pair) => {
            const [a, b] = pair;
            if (!a || !b) return;
            ctx.globalAlpha = 0.45;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          });
        }

        if (origin.target === "steric" && front0 && back0) {
          ctx.setLineDash([]);
          drawDoubleArrow(ctx, front0.x, front0.y, back0.x, back0.y, origin.color);
          ctx.fillText("Steric repulsion", (front0.x + back0.x) / 2 + 8, (front0.y + back0.y) / 2 - 10);
        }

        if (origin.target === "gauche" && front0 && back0) {
          ctx.setLineDash([8, 6]);
          ctx.beginPath();
          ctx.moveTo(front0.x, front0.y);
          ctx.lineTo(back0.x, back0.y);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillText("Gauche interaction", (front0.x + back0.x) / 2 + 8, (front0.y + back0.y) / 2 - 10);
        }

        if (origin.target === "halogen" && front0 && back0) {
          ctx.setLineDash([4, 5]);
          drawDoubleArrow(ctx, front0.x, front0.y, back0.x, back0.y, origin.color);
          ctx.setLineDash([]);
          ctx.fillText("Halogen interaction", (front0.x + back0.x) / 2 + 8, (front0.y + back0.y) / 2 - 10);
        }

        if (origin.target === "stabilization" && front0 && back0) {
          ctx.setLineDash([10, 6]);
          ctx.beginPath();
          ctx.moveTo(front0.x, front0.y);
          ctx.lineTo(back0.x, back0.y);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillText("Stabilization", (front0.x + back0.x) / 2 + 8, (front0.y + back0.y) / 2 - 10);
        }

        if (origin.target === "minimum") {
          const midX = (cFront.x + cBack.x) / 2;
          const midY = (cFront.y + cBack.y) / 2 + 45;
          ctx.fillStyle = "#22c55e";
          ctx.beginPath();
          ctx.arc(midX, midY, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillText("Minimum / stable", midX + 18, midY + 5);
        }

        ctx.restore();
      });
    }

    // Newman viewing arrow
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(80, height - 45);
    ctx.lineTo(width - 80, height - 45);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width - 80, height - 45);
    ctx.lineTo(width - 98, height - 55);
    ctx.lineTo(width - 98, height - 35);
    ctx.closePath();
    ctx.fillStyle = "#facc15";
    ctx.fill();

    ctx.fillStyle = "#fde68a";
    ctx.font = "700 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Look along this C-C bond direction to obtain the Newman Projection", width / 2, height - 17);
  }, [compound, angle, selected, showForces, rotX, rotY, zoom]);

  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const btnW = 190;
      const btnH = 38;
      const btnX = rect.width - btnW - 24;
      const btnY = 78;

      if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
        onToggleForces();
        return;
      }
    }

    dragRef.current = { dragging: true, x: e.clientX, y: e.clientY };
  }

  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    dragRef.current.x = e.clientX;
    dragRef.current.y = e.clientY;
    setRotY((v) => v + dx * 0.01);
    setRotX((v) => v + dy * 0.01);
  }

  function onMouseUp() {
    dragRef.current.dragging = false;
  }

  function onWheel(e: React.WheelEvent<HTMLCanvasElement>) {
    e.preventDefault();
    setZoom((z) => Math.min(1.8, Math.max(0.55, z - e.deltaY * 0.001)));
  }

  return (
    <div className="rounded-3xl bg-white p-4 shadow">
      <canvas
        ref={canvasRef}
        className="w-full cursor-grab rounded-2xl active:cursor-grabbing"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => {
            setRotX(-0.45);
            setRotY(0.75);
            setZoom(1);
          }}
          className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white"
        >
          Reset 3D View
        </button>
        <span className="rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-700">
          Zoom: {zoom.toFixed(2)}x
        </span>
      </div>
    </div>
  );
}

function NewmanProjection({ compound, angle }: { compound: Compound; angle: number }) {
  const cx = 180;
  const cy = 170;
  const frontAngles = [0, 120, 240];
  const backAngles = frontAngles.map((a) => a + angle);

  return (
    <svg viewBox="0 0 360 340" className="h-[330px] w-full">
      <circle cx={cx} cy={cy} r="62" fill="#f8fafc" stroke="#64748b" strokeWidth="4" />

      {backAngles.map((bondAngle, i) => {
        const end = polarToXY(cx, cy, 120, bondAngle);
        const label = polarToXY(cx, cy, 150, bondAngle);
        return (
          <g key={`back-${i}`}>
            <line x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
            <circle cx={label.x} cy={label.y} r="22" fill="white" stroke="#94a3b8" />
            <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="700" fill={labelColor(compound.backLabels[i])}>
              {compound.backLabels[i]}
            </text>
          </g>
        );
      })}

      <circle cx={cx} cy={cy} r="13" fill="#0f172a" />

      {frontAngles.map((bondAngle, i) => {
        const end = polarToXY(cx, cy, 105, bondAngle);
        const label = polarToXY(cx, cy, 132, bondAngle);
        return (
          <g key={`front-${i}`}>
            <line x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#1d4ed8" strokeWidth="5" strokeLinecap="round" />
            <circle cx={label.x} cy={label.y} r="22" fill="#eff6ff" stroke="#1d4ed8" />
            <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="700" fill={labelColor(compound.frontLabels[i])}>
              {compound.frontLabels[i]}
            </text>
          </g>
        );
      })}

      <text x="180" y="25" textAnchor="middle" fontSize="20" fontWeight="700" fill="#0f172a">Newman Projection</text>
      <text x="180" y="50" textAnchor="middle" fontSize="13" fill="#64748b">Generated from the selected C-C bond view</text>
      <text x="180" y="315" textAnchor="middle" fontSize="14" fill="#475569">{compound.name} | angle = {angle}°</text>
    </svg>
  );
}

function GenerationSteps({ compound, angle }: { compound: Compound; angle: number }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow">
      <h2 className="text-2xl font-bold text-slate-900">How Newman Projection Is Generated</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-slate-100 p-4">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 font-bold text-white">1</div>
          <h3 className="font-bold text-slate-900">3D molecule</h3>
          <p className="mt-2 text-sm text-slate-600">The molecule is shown as a true interactive 3D ball-and-stick model.</p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-4">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 font-bold text-white">2</div>
          <h3 className="font-bold text-slate-900">Choose bond</h3>
          <p className="mt-2 text-sm text-slate-600">Selected bond: {compound.bond}. This bond becomes the viewing axis.</p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-4">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 font-bold text-white">3</div>
          <h3 className="font-bold text-slate-900">Look along bond</h3>
          <p className="mt-2 text-sm text-slate-600">The front carbon becomes the central dot and the back carbon becomes the circle.</p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-4">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 font-bold text-white">4</div>
          <h3 className="font-bold text-slate-900">Rotate</h3>
          <p className="mt-2 text-sm text-slate-600">At {angle}°, the back groups rotate to generate the displayed Newman projection.</p>
        </div>
      </div>
    </div>
  );
}

export default function ConformationalPage() {
  const [compoundId, setCompoundId] = useState("butane");
  const [angle, setAngle] = useState(180);
  const [showSteps, setShowSteps] = useState(true);
  const [showForces, setShowForces] = useState(true);

  const compound = compounds.find((c) => c.id === compoundId) || compounds[0];
  const selected = interpolateEnergy(compound, angle);

  const graphData = useMemo(() => {
    const data = [];
    for (let a = 0; a <= 360; a += 5) {
      data.push({ angle: a, energy: interpolateEnergy(compound, a).total });
    }
    return data;
  }, [compound]);

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-white p-6 shadow">
          <h1 className="text-3xl font-bold text-slate-900">Conformational Isomerism</h1>
          <p className="mt-2 text-slate-600">
            True 3D ball-and-stick model with mouse rotation, zoom, fixed rotating bond, synchronized Newman projection, visible energy origins, and reference energy values.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block font-bold text-slate-800">Choose Compound</label>
              <select
                value={compoundId}
                onChange={(e) => {
                  setCompoundId(e.target.value);
                  setAngle(180);
                }}
                className="w-full rounded-xl border p-3"
              >
                {compounds.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-bold text-slate-800">Fixed Rotating Bond</label>
              <div className="rounded-xl border bg-slate-100 p-3 font-semibold text-slate-800">
                {compound.bond}
              </div>
            </div>

            <div>
              <label className="mb-2 block font-bold text-slate-800">Dihedral Angle: {angle}°</label>
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {compound.points.map((p) => (
              <button
                key={p.angle}
                onClick={() => setAngle(p.angle)}
                className={`rounded-xl px-4 py-2 font-semibold ${angle === p.angle ? "bg-blue-700 text-white" : "bg-blue-50 text-blue-800"}`}
              >
                {p.angle}°
              </button>
            ))}
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white"
            >
              {showSteps ? "Hide Steps" : "Show How Newman Is Generated"}
            </button>

            <button
              onClick={() => setShowForces((v) => !v)}
              className={`rounded-xl px-4 py-2 font-semibold text-white ${showForces ? "bg-green-700" : "bg-slate-500"}`}
            >
              {showForces ? "Hide Energy Forces" : "Show Energy Forces"}
            </button>
          </div>

          <p className="mt-4 rounded-2xl bg-slate-100 p-4 text-slate-700">
            <b>{compound.bond} rotation:</b> {compound.description}
          </p>
        </div>

        <div className="mt-6">
          <True3DViewer compound={compound} angle={angle} selected={selected} showForces={showForces} onToggleForces={() => setShowForces((v) => !v)} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow">
            <NewmanProjection compound={compound} angle={angle} />
          </div>

          <div className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-2xl font-bold text-slate-900">Selected Position</h2>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-sm text-blue-700">Angle</p>
                <p className="text-2xl font-bold text-blue-900">{angle}°</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-sm text-emerald-700">Conformation</p>
                <p className="text-xl font-bold text-emerald-900">{selected.type}</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-4">
                <p className="text-sm text-amber-700">Energy</p>
                <p className="text-2xl font-bold text-amber-900">{selected.total} kcal/mol</p>
              </div>
            </div>

            <h3 className="mt-6 text-xl font-bold text-slate-900">Energy Details</h3>

            <div className="mt-3 overflow-hidden rounded-2xl border">
              <table className="w-full text-left">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-3">Contribution</th>
                    <th className="p-3">Value kcal/mol</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3">Torsional Energy</td>
                    <td className="p-3 font-semibold">{selected.torsional}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3">Steric / Electronic Contribution</td>
                    <td className="p-3 font-semibold">{selected.steric}</td>
                  </tr>
                  <tr className="border-t bg-slate-50">
                    <td className="p-3 font-bold">Total Relative Energy</td>
                    <td className="p-3 font-bold">{selected.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-4 rounded-2xl bg-indigo-50 p-4 text-indigo-900">{selected.note}</p>
          </div>
        </div>

        {showSteps && (
          <div className="mt-6">
            <GenerationSteps compound={compound} angle={angle} />
          </div>
        )}

        <div className="mt-6 rounded-3xl bg-white p-6 shadow">
          <h2 className="text-2xl font-bold text-slate-900">Energy Profile</h2>
          <p className="mt-2 text-slate-600">X-axis: dihedral angle. Y-axis: relative energy in kcal/mol.</p>

          <div className="mt-6 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={graphData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="angle" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="energy" strokeWidth={3} dot={false} />
                <ReferenceDot x={angle} y={selected.total} r={8} label="Selected" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-white p-6 shadow">
          <h2 className="text-2xl font-bold text-slate-900">Reference Energy Table</h2>

          <div className="mt-4 overflow-hidden rounded-2xl border">
            <table className="w-full text-left">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3">Angle</th>
                  <th className="p-3">Conformation</th>
                  <th className="p-3">Torsional</th>
                  <th className="p-3">Steric / Electronic</th>
                  <th className="p-3">Total Energy kcal/mol</th>
                </tr>
              </thead>
              <tbody>
                {compound.points.map((p) => (
                  <tr
                    key={p.angle}
                    onClick={() => setAngle(p.angle)}
                    className={`cursor-pointer border-t hover:bg-blue-50 ${angle === p.angle ? "bg-blue-100" : ""}`}
                  >
                    <td className="p-3 font-semibold">{p.angle}°</td>
                    <td className="p-3">{p.type}</td>
                    <td className="p-3">{p.torsional}</td>
                    <td className="p-3">{p.steric}</td>
                    <td className="p-3 font-bold">{p.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
            <b>Energy source note:</b> {compound.sourceNote}
          </p>
        </div>
      </section>
    </main>
  );
}
