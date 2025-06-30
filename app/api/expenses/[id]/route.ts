import { type NextRequest, NextResponse } from "next/server"
import type { Expense } from "@/types/expense"

// Mock data - same as above
const expenses: Expense[] = [
  {
    id: "1",
    date: "2025-01-01",
    item: "Office Rent",
    category: "Fixed",
    amount: 1200000,
    currency: "KRW",
    paymentMethod: "Bank Transfer",
    status: "Paid",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "2",
    date: "2025-01-03",
    item: "AWS Servers",
    category: "Fixed",
    amount: 300000,
    currency: "KRW",
    paymentMethod: "Card",
    status: "Paid",
    createdAt: "2025-01-03T00:00:00Z",
    updatedAt: "2025-01-03T00:00:00Z",
  },
  {
    id: "3",
    date: "2025-01-05",
    item: "Freelancer A",
    category: "Project",
    amount: 500000,
    currency: "KRW",
    paymentMethod: "Bank Transfer",
    status: "Pending",
    createdAt: "2025-01-05T00:00:00Z",
    updatedAt: "2025-01-05T00:00:00Z",
  },
  {
    id: "4",
    date: "2025-01-10",
    item: "Marketing Ads",
    category: "Variable",
    amount: 800000,
    currency: "KRW",
    paymentMethod: "Card",
    status: "Paid",
    createdAt: "2025-01-10T00:00:00Z",
    updatedAt: "2025-01-10T00:00:00Z",
  },
]

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const body = await request.json()

  const expenseIndex = expenses.findIndex((expense) => expense.id === id)
  if (expenseIndex === -1) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 })
  }

  expenses[expenseIndex] = {
    ...expenses[expenseIndex],
    ...body,
    updatedAt: new Date().toISOString(),
  }

  return NextResponse.json(expenses[expenseIndex])
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params

  const expenseIndex = expenses.findIndex((expense) => expense.id === id)
  if (expenseIndex === -1) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 })
  }

  expenses.splice(expenseIndex, 1)
  return NextResponse.json({ message: "Expense deleted successfully" })
}
