// Small dependency-free SVG charts for the admin dashboard. They render on the server, scale with their
// container, and every value is also printed as text (legend, labels or <title>), so colour is never the only cue.

export const CHART_COLORS = ["#3d7bff", "#22d3ee", "#10b981", "#f59e0b", "#a78bfa", "#f472b6", "#64748b"];

export type Slice = { label: string; value: number; color?: string };

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
};

function arc(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number) {
  const [x0, y0] = polar(cx, cy, r1, a0), [x1, y1] = polar(cx, cy, r1, a1);
  const [x2, y2] = polar(cx, cy, r0, a1), [x3, y3] = polar(cx, cy, r0, a0);
  const big = a1 - a0 > 180 ? 1 : 0;
  const inner = r0 > 0 ? `L${x2} ${y2}A${r0} ${r0} 0 ${big} 0 ${x3} ${y3}Z` : `L${cx} ${cy}Z`;
  return `M${x0} ${y0}A${r1} ${r1} 0 ${big} 1 ${x1} ${y1}${inner}`;
}

/** Donut (hole > 0) or full pie (hole = 0) with a legend that lists value and share. */
export function PieChart({ data, hole = 0.62, centerLabel, emptyText = "No data yet." }: { data: Slice[]; hole?: number; centerLabel?: string; emptyText?: string }) {
  const items = data.map((d, i) => ({ ...d, color: d.color ?? CHART_COLORS[i % CHART_COLORS.length]! }));
  const total = items.reduce((n, d) => n + d.value, 0);
  if (total === 0) return <p className="py-10 text-center text-sm text-muted">{emptyText}</p>;
  const live = items.filter((d) => d.value > 0);
  const paths = live.map((d, i) => {
    const a0 = (live.slice(0, i).reduce((n, k) => n + k.value, 0) / total) * 360;
    return { ...d, a0, a1: Math.min(a0 + (d.value / total) * 360, a0 + 359.99) };
  });
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
      <div className="relative size-32 shrink-0 sm:size-36">
        <svg viewBox="0 0 120 120" role="img" aria-label={`${centerLabel ?? "Total"}: ${total}. ${items.map((d) => `${d.label} ${d.value}`).join(", ")}`} className="size-full">
          {paths.map((p) => (
            <path key={p.label} d={arc(60, 60, hole * 56, 56, p.a0, p.a1)} fill={p.color} stroke="var(--surface)" strokeWidth="1.5">
              <title>{`${p.label}: ${p.value} (${Math.round((p.value / total) * 100)}%)`}</title>
            </path>
          ))}
        </svg>
        {hole > 0 && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div><p className="font-display text-2xl font-semibold leading-none">{total}</p><p className="mt-1 text-[11px] text-muted">{centerLabel ?? "Total"}</p></div>
          </div>
        )}
      </div>
      <ul className="w-full min-w-0 flex-1 space-y-2 text-sm">
        {items.map((d) => (
          <li key={d.label} className="flex items-center gap-2.5">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: d.color }} aria-hidden />
            <span className="min-w-0 flex-1 truncate text-muted">{d.label}</span>
            <span className="tabular-nums">{d.value}</span>
            <span className="w-10 text-right tabular-nums text-muted">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Axis maximum is a multiple of 4 so the four gridline steps are whole numbers.
const niceMax = (v: number) => Math.max(4, Math.ceil(v / 4) * 4);

/** Area line chart. `points` are evenly spaced; at most ~7 x labels are drawn. */
export function LineChart({ points, label }: { points: { label: string; value: number }[]; label: string }) {
  const W = 600, H = 230, L = 34, R = 14, T = 14, B = 30;
  const max = niceMax(Math.max(0, ...points.map((p) => p.value)));
  const x = (i: number) => L + (points.length <= 1 ? 0 : (i * (W - L - R)) / (points.length - 1));
  const y = (v: number) => T + (1 - v / max) * (H - T - B);
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i)} ${y(p.value)}`).join("");
  const area = points.length ? `${line}L${x(points.length - 1)} ${H - B}L${x(0)} ${H - B}Z` : "";
  const ticks = [0, 1, 2, 3, 4].map((i) => (max / 4) * i);
  const every = Math.max(1, Math.ceil(points.length / 7));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="h-auto w-full">
      <defs><linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3d7bff" stopOpacity="0.35" /><stop offset="1" stopColor="#3d7bff" stopOpacity="0" /></linearGradient></defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeWidth="1" />
          <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">{Math.round(t * 10) / 10}</text>
        </g>
      ))}
      {area && <path d={area} fill="url(#area-fill)" />}
      {line && <path d={line} fill="none" stroke="#3d7bff" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.value)} r="3.5" fill="#3d7bff" stroke="var(--surface)" strokeWidth="1.5"><title>{`${p.label}: ${p.value}`}</title></circle>
          {i % every === 0 && <text x={x(i)} y={H - 8} textAnchor={i === points.length - 1 && points.length > 1 ? "end" : "middle"} fontSize="11" fill="var(--muted)">{p.label}</text>}
        </g>
      ))}
    </svg>
  );
}

/** Vertical bar chart with the value printed above each bar. */
export function BarChart({ bars, label }: { bars: { label: string; value: number; color?: string }[]; label: string }) {
  const W = 420, H = 230, L = 30, R = 8, T = 22, B = 30;
  const max = niceMax(Math.max(0, ...bars.map((b) => b.value)));
  const slot = (W - L - R) / Math.max(1, bars.length);
  const bw = Math.min(46, slot * 0.6);
  const y = (v: number) => T + (1 - v / max) * (H - T - B);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="h-auto w-full">
      {[0, 1, 2, 3, 4].map((i) => {
        const t = (max / 4) * i;
        return <g key={i}><line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="var(--border)" /><text x={L - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">{Math.round(t * 10) / 10}</text></g>;
      })}
      {bars.map((b, i) => {
        const cx = L + slot * i + slot / 2;
        const h = Math.max(0, H - B - y(b.value));
        return (
          <g key={b.label}>
            <rect x={cx - bw / 2} y={y(b.value)} width={bw} height={h} rx="5" fill={b.color ?? CHART_COLORS[i % CHART_COLORS.length]}><title>{`${b.label}: ${b.value}`}</title></rect>
            <text x={cx} y={y(b.value) - 6} textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--foreground)">{b.value}</text>
            <text x={cx} y={H - 9} textAnchor="middle" fontSize="11" fill="var(--muted)">{b.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
