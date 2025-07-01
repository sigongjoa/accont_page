"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { ExpenseSummaryCard } from "@/components/expense-summary-card"
import { ExpenseCharts } from "@/components/expense-charts"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import type { Expense, ExpenseFilters } from "@/types/expense"
import { calculateExpenseSummary, saveToLocalStorage, loadFromLocalStorage, STORAGE_KEYS, isOnline } from "@/lib/utils"
import type { Subscription, SubscriptionFilters } from "@/types/subscription"

export default function DashboardPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState("2025-01")
  const [filters, setFilters] = useState<ExpenseFilters>({})
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // For Dashboard, we only need expenses summary and charts, so we don't need subscription states here.
  const [displayCurrency, setDisplayCurrency] = useState<"KRW" | "USD">("KRW")

  // Load data from localStorage on mount
  useEffect(() => {
    const savedExpenses = loadFromLocalStorage(STORAGE_KEYS.EXPENSES)

    if (savedExpenses) setExpenses(savedExpenses)

    if (isOnline()) {
      fetchExpenses()
    } else {
      setLoading(false)
      toast({
        title: "오프라인 모드",
        description: "저장된 데이터를 불러왔습니다.",
      })
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.EXPENSES, expenses)
  }, [expenses])

  // Fetch expenses
  const fetchExpenses = async () => {
    if (!isOnline()) {
      toast({
        title: "오프라인",
        description: "인터넷 연결을 확인해주세요.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const params = new URLSearchParams()

      // Add period filter
      const [year, month] = selectedPeriod.split("-")
      params.append("dateFrom", `${year}-${month}-01`)
      params.append("dateTo", `${year}-${month}-31`)

      // Add other filters
      if (filters.category) params.append("category", filters.category)
      if (filters.status) params.append("status", filters.status)
      if (filters.search) params.append("search", filters.search)
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom)
      if (filters.dateTo) params.append("dateTo", filters.dateTo)

      const response = await fetch(`/api/expenses?${params}`)
      const data = await response.json()
      setExpenses(data)
      saveToLocalStorage(STORAGE_KEYS.EXPENSES, data)
    } catch (error) {
      toast({
        title: "오류",
        description: "지출 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOnline()) {
      fetchExpenses()
    }
  }, [selectedPeriod, filters])

  const expenseSummary = calculateExpenseSummary(expenses, displayCurrency)

  const filteredExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    const [year, month] = selectedPeriod.split("-").map(Number)
    return expenseDate.getFullYear() === year && (expenseDate.getMonth() + 1) === month
  })

  return (
    <div className="flex flex-1 flex-col">
      <Header title="대시보드" />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <ExpenseSummaryCard summary={expenseSummary} displayCurrency={displayCurrency} onCurrencyChange={setDisplayCurrency} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpenseCharts expenses={filteredExpenses} selectedPeriod={selectedPeriod} />
        </div>
        <Toaster />
      </main>
    </div>
  )
} 