import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Expense, ExpenseSummary } from "@/types/expense"
import logger from "./logger"

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
  logger.debug("calculateExpenseSummary: Enter", { expensesCount: expenses.length })
  const totalAmount = expenses.reduce((sum, expense) => {
    logger.debug("calculateExpenseSummary: Reducing expense", { expenseId: expense.id, expenseAmount: expense.amount })
    const amount = typeof expense.amount === 'number' ? expense.amount : 0;
    return sum + amount
  }, 0)
  logger.debug("calculateExpenseSummary: totalAmount calculated", { totalAmount })

  const categoryTotals = expenses.reduce(
    (acc, expense) => {
      logger.debug("calculateExpenseSummary: Processing category total for expense", { category: expense.category, amount: expense.amount })
      const amount = typeof expense.amount === 'number' ? expense.amount : 0; // Safely handle expense.amount
      acc[expense.category] = (acc[expense.category] || 0) + amount
      return acc
    },
    {} as Record<string, number>,
  )
  logger.debug("calculateExpenseSummary: categoryTotals calculated", { categoryTotals })

  const fixedPercentage = totalAmount > 0 ? (((categoryTotals.고정비 ?? 0) / totalAmount) * 100) : 0;
  const variablePercentage = totalAmount > 0 ? (((categoryTotals.변동비 ?? 0) / totalAmount) * 100) : 0;
  const projectPercentage = totalAmount > 0 ? (((categoryTotals.프로젝트 ?? 0) / totalAmount) * 100) : 0;
  const otherPercentage = totalAmount > 0 ? (((categoryTotals.기타 ?? 0) / totalAmount) * 100) : 0;

  logger.debug("calculateExpenseSummary: Percentages calculated", { fixedPercentage, variablePercentage, projectPercentage, otherPercentage })

  const summary = {
    totalAmount,
    fixedPercentage,
    variablePercentage,
    projectPercentage,
    otherPercentage,
  }
  logger.debug("calculateExpenseSummary: Exit", { summary })
  return summary
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
