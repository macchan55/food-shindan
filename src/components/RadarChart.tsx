import { CORE_AXES, type CoreAxis } from "@/lib/axes";

// Short, chart-friendly labels distinct from CORE_AXIS_SHORT_LABELS: those run up to
// 7 characters ("リーダーシップ") which overflows a compact radar's label ring.
const RADAR_LABELS: Record<CoreAxis, string> = {
  HOS: "接客",
  CRA: "技術",
  TEA: "協働",
  LEA: "統率",
  BUS: "数字",
  CRE: "創造",
  GRO: "成長",
  STA: "再現",
  CHA: "挑戦",
  OWN: "当事者",
};

const WIDTH = 340;
const HEIGHT = 300;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;
const MAX_RADIUS = 92;
const LABEL_RADIUS = MAX_RADIUS + 34;
const RINGS = [0.25, 0.5, 0.75, 1];

function pointOnAxis(index: number, total: number, radius: number) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  return {
    x: CENTER_X + radius * Math.cos(angle),
    y: CENTER_Y + radius * Math.sin(angle),
  };
}

function ringPoints(radius: number, total: number) {
  return Array.from({ length: total }, (_, i) => {
    const { x, y } = pointOnAxis(i, total, radius);
    return `${x},${y}`;
  }).join(" ");
}

export function RadarChart({
  scores,
  color = "var(--brand)",
}: {
  scores: Record<string, { normalized: number }>;
  color?: string;
}) {
  const total = CORE_AXES.length;
  const dataPoints = CORE_AXES.map((axis, i) => {
    const value = Math.max(0, Math.min(100, scores[axis]?.normalized ?? 0));
    return pointOnAxis(i, total, (value / 100) * MAX_RADIUS);
  });

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mx-auto w-full max-w-xs">
      {RINGS.map((r) => (
        <polygon
          key={r}
          points={ringPoints(r * MAX_RADIUS, total)}
          fill="none"
          stroke="var(--border)"
          strokeWidth={1}
        />
      ))}
      {CORE_AXES.map((_, i) => {
        const { x, y } = pointOnAxis(i, total, MAX_RADIUS);
        return (
          <line
            key={i}
            x1={CENTER_X}
            y1={CENTER_Y}
            x2={x}
            y2={y}
            stroke="var(--border)"
            strokeWidth={1}
          />
        );
      })}
      <polygon
        points={dataPoints.map((p) => `${p.x},${p.y}`).join(" ")}
        fill={color}
        fillOpacity={0.35}
        stroke={color}
        strokeWidth={2}
      />
      {dataPoints.map((p, i) => (
        <circle key={CORE_AXES[i]} cx={p.x} cy={p.y} r={3} fill={color} />
      ))}
      {CORE_AXES.map((axis, i) => {
        const { x, y } = pointOnAxis(i, total, LABEL_RADIUS);
        const dx = x - CENTER_X;
        const dy = y - CENTER_Y;
        const anchor = dx > 5 ? "start" : dx < -5 ? "end" : "middle";
        const baseline = dy > 5 ? "hanging" : dy < -5 ? "auto" : "middle";
        return (
          <text
            key={axis}
            x={x}
            y={y}
            textAnchor={anchor}
            dominantBaseline={baseline}
            fontSize={12}
            fontWeight={600}
            className="fill-foreground/70"
          >
            {RADAR_LABELS[axis]}
          </text>
        );
      })}
    </svg>
  );
}
