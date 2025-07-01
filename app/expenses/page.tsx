"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { ExpenseTable } from "@/components/expense-table"
import { ExpenseFormModal } from "@/components/expense-form-modal"
import type { Expense, ExpenseFilters } from "@/types/expense"
import { ExpenseFilters as ExpenseFiltersComponent } from "@/components/expense-filters"
import { convertSubscriptionsToExpenses } from "@/lib/subscription-utils"

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  })
  const [filters, setFilters] = useState<ExpenseFilters>({})
  const { toast } = useToast()

  const fetchExpenses = useCallback(async () => {
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

      const [expensesResponse, subscriptionsResponse] = await Promise.all([
        fetch(`/api/expenses?${params}`),
        fetch("/api/subscriptions"),
      ]);

      if (!expensesResponse.ok) {
        throw new Error("Failed to fetch expenses")
      }
      if (!subscriptionsResponse.ok) {
        throw new Error("Failed to fetch subscriptions")
      }

      const expensesData: Expense[] = await expensesResponse.json()
      const subscriptionsData: Subscription[] = await subscriptionsResponse.json()

      const currentYear = parseInt(year);
      const currentMonth = parseInt(month);
      const subscriptionExpenses = convertSubscriptionsToExpenses(subscriptionsData, currentYear, currentMonth);

      const combinedExpenses = [...expensesData, ...subscriptionExpenses];

      setExpenses(combinedExpenses)
    } catch (error) {
      console.error("Error fetching expenses:", error)
      toast({
        title: "오류",
        description: "지출 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [selectedPeriod, filters, toast])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const handleAddExpense = () => {
    setEditingExpense(null)
    setIsModalOpen(true)
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setIsModalOpen(true)
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("이 지출을 삭제하시겠습니까?")) return

    if (id.startsWith("sub-")) {
      toast({
        title: "알림",
        description: "구독 지출은 여기서 삭제할 수 없습니다. 구독 관리 페이지에서 변경해주세요.",
        variant: "default",
      });
      return;
    }

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast({
          title: "성공",
          description: "지출이 삭제되었습니다.",
        })
        fetchExpenses()
      } else {
        throw new Error("지출 삭제 실패")
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "지출 삭제에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleSubmitExpense = async (expenseData: Partial<Expense>) => {
    try {
      const url = editingExpense ? `/api/expenses/${editingExpense.id}` : "/api/expenses"
      const method = editingExpense ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseData),
      })

      if (response.ok) {
        toast({
          title: "성공",
          description: `지출이 ${editingExpense ? "수정" : "추가"}되었습니다.`,
        })
        fetchExpenses()
        setIsModalOpen(false)
      } else {
        throw new Error(`지출 ${editingExpense ? "수정" : "추가"} 실패`)
      }
    } catch (error) {
      toast({
        title: "오류",
        description: `지출 ${editingExpense ? "수정" : "추가"}에 실패했습니다.`,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header title="지출 내역" onAddExpense={handleAddExpense} selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod} />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <ExpenseFiltersComponent
          filters={filters}
          setFilters={setFilters}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
        />
        <ExpenseTable
          expenses={expenses}
          onEditExpense={handleEditExpense}
          onDeleteExpense={handleDeleteExpense}
          loading={loading}
          filters={filters}
          onFiltersChange={setFilters}
        />
        <ExpenseFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmitExpense}
          expense={editingExpense}
        />
        <Toaster />
      </main>
    </div>
  )
}
