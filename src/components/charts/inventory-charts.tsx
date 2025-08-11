"use client"

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

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
]

const COLORS = ["#7c3aed", "#059669", "#f59e0b", "#ef4444"]

function Grid() {
  return <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
}

export function StockLevelsChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={lineData} margin={{ top: 10, right: 6, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="sold-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#059669" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#059669" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="stock-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <Grid />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="stock" stroke="#7c3aed" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="sold" stroke="#059669" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function SalesVsPurchaseChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={barData} margin={{ top: 10, right: 6, left: 0, bottom: 0 }}>
        <Grid />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="sales" fill="#7c3aed" radius={[6, 6, 0, 0]} />
        <Bar dataKey="purchase" fill="#059669" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function CategoryBreakdownChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Tooltip />
        <Legend />
        <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={56} outerRadius={92} paddingAngle={4}>
          {categoryData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}
