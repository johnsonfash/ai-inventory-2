"use client"

export type VirtualAccount = {
  bank: string
  accountNumber: string
  accountName: string
  location: string
  cashier: string
}

const LOCATIONS = ["HQ", "Downtown", "Uptown"] as const
const CASHIERS: Record<(typeof LOCATIONS)[number], string[]> = {
  HQ: ["Alice", "Bob"],
  Downtown: ["Cara", "Drew"],
  Uptown: ["Elle", "Frank"],
}

const VIRTUAL_ACCOUNTS: VirtualAccount[] = [
  { bank: "V0 Bank", accountNumber: "1002003001", accountName: "HQ - Alice", location: "HQ", cashier: "Alice" },
  { bank: "V0 Bank", accountNumber: "1002003002", accountName: "HQ - Bob", location: "HQ", cashier: "Bob" },
  {
    bank: "V0 Bank",
    accountNumber: "2003004001",
    accountName: "Downtown - Cara",
    location: "Downtown",
    cashier: "Cara",
  },
  {
    bank: "V0 Bank",
    accountNumber: "2003004002",
    accountName: "Downtown - Drew",
    location: "Downtown",
    cashier: "Drew",
  },
  { bank: "V0 Bank", accountNumber: "3004005001", accountName: "Uptown - Elle", location: "Uptown", cashier: "Elle" },
  { bank: "V0 Bank", accountNumber: "3004005002", accountName: "Uptown - Frank", location: "Uptown", cashier: "Frank" },
]

export function listLocations(): string[] {
  return [...LOCATIONS]
}

export function listCashiersForLocation(location: string): string[] {
  return CASHIERS[location as keyof typeof CASHIERS] || []
}

export function findVirtualAccount(location: string, cashier: string) {
  return VIRTUAL_ACCOUNTS.find((v) => v.location === location && v.cashier === cashier) || null
}
