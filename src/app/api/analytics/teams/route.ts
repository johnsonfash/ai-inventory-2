import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Dummy static data
    const bySalesperson = [
      { salesperson: "Alice", sales: 15, revenue: 3000 },
      { salesperson: "Bob", sales: 12, revenue: 2400 },
      { salesperson: "Charlie", sales: 8, revenue: 1600 },
      { salesperson: "Unassigned", sales: 4, revenue: 500 },
    ]

    const byLocation = [
      { location: "New York", sales: 14, revenue: 2800 },
      { location: "San Francisco", sales: 10, revenue: 2000 },
      { location: "London", sales: 8, revenue: 1600 },
      { location: "Unknown", sales: 2, revenue: 300 },
    ]

    const byChannel = [
      { channel: "Online", sales: 20, revenue: 4000 },
      { channel: "Retail", sales: 10, revenue: 1800 },
      { channel: "Wholesale", sales: 4, revenue: 900 },
      { channel: "Unknown", sales: 0, revenue: 0 },
    ]

    return NextResponse.json({ bySalesperson, byLocation, byChannel })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Error" },
      { status: 500 }
    )
  }
}
