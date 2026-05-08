'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

// ---------------- TYPES ----------------
interface ChartCardProps {
  title: string;
  subtitle?: string;
  data: Array<{ name: string; value: number; value2?: number }>;
  type?: 'line' | 'area' | 'bar';
  showSecondLine?: boolean;
}

// ---------------- FORMATTERS ----------------
function formatValue(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}m`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
  return String(v);
}

function formatTooltipValue(v: number): [string, string] {
  if (v >= 1_000_000) return [`${(v / 1_000_000).toFixed(2)}m posts`, 'Posts'];
  if (v >= 1_000) return [`${(v / 1_000).toFixed(1)}k posts`, 'Posts'];
  return [`${v} posts`, 'Posts'];
}

// ---------------- CUSTOM TOOLTIP ----------------
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value ?? 0;
  const [formatted] = formatTooltipValue(val);

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #E8F5E9',
        borderRadius: '14px',
        padding: '10px 14px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        fontSize: '13px',
        color: '#374151',
      }}>
      <div style={{ fontWeight: 600, marginBottom: 2, color: '#111827' }}>#{label}</div>
      <div style={{ color: '#6B7280' }}>{formatted}</div>
    </div>
  );
};

// ---------------- BAR COLORS ----------------
const BAR_COLORS = [
  '#A7D7A0',
  '#85C97C',
  '#63BB58',
  '#B8E0B3',
  '#CFEFCC',
  '#9ED097',
  '#76C470',
  '#5DB968',
  '#4CAF50',
  '#3D9E42',
];

// ---------------- COMPONENT ----------------
export function ChartCard({ title, subtitle, data, type = 'area', showSecondLine = false }: ChartCardProps) {
  const hasData = data && data.length > 0;

  return (
    <div className="rounded-[20px] bg-card p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]" style={{ minHeight: 320 }}>
      {/* HEADER */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>

      {/* EMPTY STATE */}
      {!hasData ?
        <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">No data available</div>
      : <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {/* ---- BAR ---- */}
            {type === 'bar' ?
              <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 48 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8F5E9" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 11 }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 11 }}
                  tickFormatter={formatValue}
                  width={55}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(167,215,160,0.1)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {data.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            : /* ---- AREA ---- */
            type === 'area' ?
              <AreaChart data={data} margin={{ top: 4, right: 8, left: 10, bottom: 4 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A7D7A0" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#A7D7A0" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorValue2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#CFEFFF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#CFEFFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8F5E9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 11 }}
                  tickFormatter={formatValue}
                  width={55}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#A7D7A0"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
                {showSecondLine && (
                  <Area
                    type="monotone"
                    dataKey="value2"
                    stroke="#CFEFFF"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorValue2)"
                  />
                )}
              </AreaChart>
            : /* ---- LINE ---- */
              <LineChart data={data} margin={{ top: 4, right: 8, left: 10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8F5E9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 11 }}
                  tickFormatter={formatValue}
                  width={55}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="value" stroke="#A7D7A0" strokeWidth={3} dot={false} />
                {showSecondLine && (
                  <Line type="monotone" dataKey="value2" stroke="#CFEFFF" strokeWidth={3} dot={false} />
                )}
              </LineChart>
            }
          </ResponsiveContainer>
        </div>
      }
    </div>
  );
}
