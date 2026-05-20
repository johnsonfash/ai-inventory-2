import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ChartTooltipContent } from "@/components/ui/chart"

// All chart colors flow through CSS variables (--chart-1..6) declared
// in index.css. Light/dark theme swaps happen automatically when the
// `.dark` class flips on <html>.
const CHART = {
  c1: "var(--chart-1)",
  c2: "var(--chart-2)",
  c3: "var(--chart-3)",
  c4: "var(--chart-4)",
  c5: "var(--chart-5)",
  c6: "var(--chart-6)",
  grid: "var(--border)",
  axis: "var(--muted-foreground)",
} as const

const lineData = [
  { month: "Jan", stock: 1240, sold: 820 },
  { month: "Feb", stock: 1310, sold: 910 },
  { month: "Mar", stock: 1220, sold: 870 },
  { month: "Apr", stock: 1400, sold: 990 },
  { month: "May", stock: 1350, sold: 1050 },
  { month: "Jun", stock: 1500, sold: 1120 },
]

const barData = [
  { name: "Mon", sales: 210, purchase: 120 },
  { name: "Tue", sales: 240, purchase: 150 },
  { name: "Wed", sales: 260, purchase: 180 },
  { name: "Thu", sales: 230, purchase: 140 },
  { name: "Fri", sales: 320, purchase: 210 },
  { name: "Sat", sales: 280, purchase: 170 },
  { name: "Sun", sales: 190, purchase: 120 },
]

const categoryData = [
  { name: "Electronics", value: 44 },
  { name: "Apparel", value: 26 },
  { name: "Home", value: 18 },
  { name: "Beauty", value: 12 },
  { name: "Other", value: 8 },
]

const pieColors = [CHART.c1, CHART.c2, CHART.c3, CHART.c4, CHART.c5, CHART.c6] as const

const axisProps = {
  stroke: CHART.axis,
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const

function Grid() {
  return <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} strokeOpacity={0.5} />
}

export function StockLevelsChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={lineData} margin={{ top: 10, right: 6, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="stock-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART.c1} stopOpacity={0.4} />
            <stop offset="100%" stopColor={CHART.c1} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="sold-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART.c2} stopOpacity={0.4} />
            <stop offset="100%" stopColor={CHART.c2} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <Grid />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip content={<ChartTooltipContent labelKey="month" />} cursor={{ stroke: CHART.grid, strokeWidth: 1 }} />
        <Area type="monotone" dataKey="stock" stroke={CHART.c1} strokeWidth={2} fill="url(#stock-grad)" />
        <Area type="monotone" dataKey="sold" stroke={CHART.c2} strokeWidth={2} fill="url(#sold-grad)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function SalesVsPurchaseChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={barData} margin={{ top: 10, right: 6, left: 0, bottom: 0 }}>
        <Grid />
        <XAxis dataKey="name" {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip content={<ChartTooltipContent />} cursor={{ fill: "var(--muted)", fillOpacity: 0.35 }} />
        <Bar dataKey="sales" fill={CHART.c1} radius={[6, 6, 0, 0]} />
        <Bar dataKey="purchase" fill={CHART.c2} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function CategoryBreakdownChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Tooltip content={<ChartTooltipContent />} />
        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
        />
        <Pie
          data={categoryData}
          dataKey="value"
          nameKey="name"
          innerRadius={56}
          outerRadius={92}
          paddingAngle={3}
          stroke="var(--background)"
          strokeWidth={2}
        >
          {categoryData.map((_, i) => (
            <Cell key={i} fill={pieColors[i % pieColors.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}
