import { type NextRequest, NextResponse } from "next/server"
import type { Expense, ExpenseFilters } from "@/types/expense"

// Mock data with Korean categories
const expenses: Expense[] = [
  {
    id: "1",
    date: "2025-01-01",
    item: "사무실 임대료",
    category: "고정비",
    amount: 1200000,
    currency: "KRW",
    paymentMethod: "계좌이체",
    status: "지불완료",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "2",
    date: "2025-01-03",
    item: "AWS 서버",
    category: "고정비",
    amount: 300000,
    currency: "KRW",
    paymentMethod: "카드",
    status: "지불완료",
    createdAt: "2025-01-03T00:00:00Z",
    updatedAt: "2025-01-03T00:00:00Z",
  },
  {
    id: "3",
    date: "2025-01-05",
    item: "프리랜서 A",
    category: "프로젝트",
    amount: 500000,
    currency: "KRW",
    paymentMethod: "계좌이체",
    status: "대기중",
    createdAt: "2025-01-05T00:00:00Z",
    updatedAt: "2025-01-05T00:00:00Z",
  },
  {
    id: "4",
    date: "2025-01-10",
    item: "마케팅 광고",
    category: "변동비",
    amount: 800000,
    currency: "KRW",
    paymentMethod: "카드",
    status: "지불완료",
    createdAt: "2025-01-10T00:00:00Z",
    updatedAt: "2025-01-10T00:00:00Z",
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const filters: ExpenseFilters = {
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
    category: (searchParams.get("category") as any) || undefined,
    status: (searchParams.get("status") as any) || undefined,
    search: searchParams.get("search") || undefined,
  }

  let filteredExpenses = [...expenses]

  // Apply filters
  if (filters.dateFrom) {
    filteredExpenses = filteredExpenses.filter((expense) => expense.date >= filters.dateFrom!)
  }
  if (filters.dateTo) {
    filteredExpenses = filteredExpenses.filter((expense) => expense.date <= filters.dateTo!)
  }
  if (filters.category) {
    filteredExpenses = filteredExpenses.filter((expense) => expense.category === filters.category)
  }
  if (filters.status) {
    filteredExpenses = filteredExpenses.filter((expense) => expense.status === filters.status)
  }
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filteredExpenses = filteredExpenses.filter((expense) => expense.item.toLowerCase().includes(searchLower))
  }

  return NextResponse.json(filteredExpenses)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const newExpense: Expense = {
    id: Date.now().toString(),
    ...body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  expenses.push(newExpense)
  return NextResponse.json(newExpense, { status: 201 })
}
