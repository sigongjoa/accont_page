import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Expense, ExpenseSummary } from "@/types/expense"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "KRW"): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  })
}

export function calculateExpenseSummary(expenses: Expense[]): ExpenseSummary {
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const categoryTotals = expenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  return {
    totalAmount,
    fixedPercentage: totalAmount > 0 ? ((categoryTotals.고정비 || 0) / totalAmount) * 100 : 0,
    variablePercentage: totalAmount > 0 ? ((categoryTotals.변동비 || 0) / totalAmount) * 100 : 0,
    projectPercentage: totalAmount > 0 ? ((categoryTotals.프로젝트 || 0) / totalAmount) * 100 : 0,
    otherPercentage: totalAmount > 0 ? ((categoryTotals.기타 || 0) / totalAmount) * 100 : 0,
  }
}

export function getMonthlyTrends(expenses: Expense[]) {
  const monthlyData = expenses.reduce(
    (acc, expense) => {
      const month = new Date(expense.date).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "short",
      })
      acc[month] = (acc[month] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  return Object.entries(monthlyData).map(([month, amount]) => ({
    month,
    amount,
  }))
}

export function getCategoryData(expenses: Expense[]) {
  const categoryData = expenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  return Object.entries(categoryData).map(([category, amount]) => ({
    category,
    amount,
  }))
}

// Offline storage utilities
export const STORAGE_KEYS = {
  EXPENSES: "expenses_offline",
  SUBSCRIPTIONS: "subscriptions_offline",
  LAST_SYNC: "last_sync_time",
}

export function saveToLocalStorage(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error("로컬 저장소 저장 실패:", error)
  }
}

export function loadFromLocalStorage(key: string) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error("로컬 저장소 로드 실패:", error)
    return null
  }
}

export function isOnline(): boolean {
  return navigator.onLine
}
