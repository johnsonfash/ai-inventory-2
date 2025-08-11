"use server"

// Fetch high-level sales summary (dummy data version)
export async function fetchSalesSummary() {
  // Static dummy numbers — adjust as needed
  return {
    count: 42,      // total number of sales
    revenue: 9876,  // total revenue in dollars
  }
}
