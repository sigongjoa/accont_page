"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { ExpenseTable } from "@/components/expense-table"
import { ExpenseFormModal } from "@/components/expense-form-modal"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import type { Expense, ExpenseFilters } from "@/types/expense"
import { saveToLocalStorage, loadFromLocalStorage, STORAGE_KEYS, isOnline } from "@/lib/utils"
import { ExpenseFilters as ExpenseFiltersComponent } from "@/components/expense-filters"

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState("2025-01")
  const [filters, setFilters] = useState<ExpenseFilters>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

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
        description: "저장된 지출 데이터를 불러왔습니다.",
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

  // Handle expense operations
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

    if (isOnline()) {
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
    } else {
      // Offline deletion
      const updatedExpenses = expenses.filter((expense) => expense.id !== id)
      setExpenses(updatedExpenses)
      toast({
        title: "오프라인 삭제",
        description: "온라인 연결 시 서버에 동기화됩니다.",
      })
    }
  }

  const handleSubmitExpense = async (expenseData: Partial<Expense>) => {
    if (isOnline()) {
      try {
        const url = editingExpense ? `/api/expenses/${editingExpense.id}` : "/api/expenses"
        const method = editingExpense ? "PUT" : "POST"

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(expenseData),
        })

        if (response.ok) {
          toast({
            title: "성공",
            description: `지출이 ${editingExpense ? "수정" : "추가"}되었습니다.`,
          })
          fetchExpenses()
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
    } else {
      // Offline operation
      if (editingExpense) {
        const updatedExpenses = expenses.map((expense) =>
          expense.id === editingExpense.id
            ? { ...expense, ...expenseData, updatedAt: new Date().toISOString() }
            : expense,
        )
        setExpenses(updatedExpenses)
      } else {
        const newExpense: Expense = {
          id: Date.now().toString(),
          ...(expenseData as Expense),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        setExpenses([...expenses, newExpense])
      }

      toast({
        title: "오프라인 저장",
        description: "온라인 연결 시 서버에 동기화됩니다.",
      })
    }
  }

  const filteredExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    const [year, month] = selectedPeriod.split("-").map(Number)
    const matchesPeriod = expenseDate.getFullYear() === year && (expenseDate.getMonth() + 1) === month

    const matchesCategory = filters.category ? expense.category === filters.category : true
    const matchesStatus = filters.status ? expense.status === filters.status : true
    const matchesSearch = filters.search ? expense.item.toLowerCase().includes(filters.search.toLowerCase()) : true

    const matchesDateFrom = filters.dateFrom ? new Date(expense.date) >= new Date(filters.dateFrom) : true
    const matchesDateTo = filters.dateTo ? new Date(expense.date) <= new Date(filters.dateTo) : true

    return matchesPeriod && matchesCategory && matchesStatus && matchesSearch && matchesDateFrom && matchesDateTo
  })

  return (
    <div className="flex flex-1 flex-col">
      <Header title="지출 내역" onAddExpense={handleAddExpense} />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <ExpenseFiltersComponent
          filters={filters}
          setFilters={setFilters}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
        />
        <ExpenseTable
          expenses={filteredExpenses}
          onEdit={handleEditExpense}
          onDelete={handleDeleteExpense}
          loading={loading}
          filters={filters}
          onFiltersChange={setFilters}
        />
        <ExpenseFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmitExpense}
          editingExpense={editingExpense}
        />
        <Toaster />
      </main>
    </div>
  )
} 