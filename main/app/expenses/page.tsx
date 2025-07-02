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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageTitle from '@/components/PageTitle';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import logger from '@/lib/logger';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { Subscription } from "@/types/subscription";

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
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');

  const fetchExpenses = useCallback(async () => {
    logger.debug('ExpensesPage: fetchExpenses - fetching data');
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
        logger.debug(`ExpensesPage: fetchExpenses - API error (expenses), status: ${expensesResponse.status}`);
        throw new Error("Failed to fetch expenses")
      }
      if (!subscriptionsResponse.ok) {
        logger.debug(`ExpensesPage: fetchExpenses - API error (subscriptions), status: ${subscriptionsResponse.status}`);
        throw new Error("Failed to fetch subscriptions")
      }

      const expensesData: Expense[] = await expensesResponse.json()
      const subscriptionsData: Subscription[] = await subscriptionsResponse.json()

      const currentYear = parseInt(year);
      const currentMonth = parseInt(month);
      const subscriptionExpenses = convertSubscriptionsToExpenses(subscriptionsData, currentYear, currentMonth);

      const combinedExpenses = [...expensesData, ...subscriptionExpenses];

      setExpenses(combinedExpenses)
    } catch (error: any) {
      logger.error("ExpensesPage: Error fetching expenses:", error.message);
      toast({
        title: "오류",
        description: "지출 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      logger.debug('ExpensesPage: fetchExpenses - loading finished');
    }
  }, [selectedPeriod, filters, toast])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const handleAddExpense = () => {
    logger.debug('ExpensesPage: handleAddExpense - Enter');
    setEditingExpense(null)
    setIsModalOpen(true)
    logger.debug('ExpensesPage: handleAddExpense - Exit');
  }

  const handleEditExpense = (expense: Expense) => {
    logger.debug('ExpensesPage: handleEditExpense - Enter', { expenseId: expense.id });
    setEditingExpense(expense)
    setIsModalOpen(true)
    logger.debug('ExpensesPage: handleEditExpense - Exit');
  }

  const handleDeleteExpense = async (id: string) => {
    logger.debug('ExpensesPage: handleDeleteExpense - deleting expense', { expenseId: id });
    if (id.startsWith("sub-")) {
      logger.debug('ExpensesPage: handleDeleteExpense - Subscription expense, cannot delete directly');
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
        logger.info(`ExpensesPage: Expense ${id} deleted successfully.`);
        fetchExpenses()
      } else {
        logger.debug(`ExpensesPage: handleDeleteExpense - API error, status: ${response.status}`);
        throw new Error("지출 삭제 실패")
      }
    } catch (error: any) {
      logger.error("ExpensesPage: Error deleting expense:", error.message);
      toast({
        title: "오류",
        description: "지출 삭제에 실패했습니다.",
        variant: "destructive",
      })
    }
    logger.debug('ExpensesPage: handleDeleteExpense - Exit');
  }

  const handleSubmitExpense = async (expenseData: Partial<Expense>) => {
    logger.debug(`ExpensesPage: handleSubmitExpense - saving expense: ${expenseData.item}`);
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
        logger.info(`ExpensesPage: Expense ${expenseData.id || expenseData.item} ${editingExpense ? 'updated' : 'added'} successfully.`);
        fetchExpenses()
        setIsModalOpen(false)
      } else {
        logger.debug(`ExpensesPage: handleSubmitExpense - API error, status: ${response.status}`);
        throw new Error(`지출 ${editingExpense ? "수정" : "추가"} 실패`)
      }
    } catch (error: any) {
      logger.error("ExpensesPage: Error submitting expense:", error.message);
      toast({
        title: "오류",
        description: `지출 ${editingExpense ? "수정" : "추가"}에 실패했습니다.`,
        variant: "destructive",
      })
    }
    logger.debug('ExpensesPage: handleSubmitExpense - Exit');
  }

  return (
    <div className="container mx-auto p-4">
      <PageTitle title="지출 내역" />
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Input
            type="text"
            placeholder="지출 검색..."
            value={filters.search || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="max-w-sm"
          />
          <Button onClick={handleAddExpense}>
            <PlusCircledIcon className="mr-2 h-4 w-4" />
            새 지출 추가
          </Button>
        </div>
        <ExpenseFiltersComponent
          filters={filters}
          setFilters={setFilters}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
        />
      </div>

      <div className="mb-6 flex gap-2">
        <Button
          onClick={() => { setViewMode('card'); logger.debug('ExpensesPage: Card View button clicked'); }}
          variant={viewMode === 'card' ? 'default' : 'outline'}
        >
          카드 보기
        </Button>
        <Button
          onClick={() => { setViewMode('table'); logger.debug('ExpensesPage: Table View button clicked'); }}
          variant={viewMode === 'table' ? 'default' : 'outline'}
        >
          테이블 보기
        </Button>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground py-8">로딩 중...</p>
      ) : expenses.length === 0 ? (
        <p className="col-span-full text-center text-muted-foreground py-8">지출을 찾을 수 없습니다.</p>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {expenses.map((expense) => (
            <Card key={expense.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => { handleEditExpense(expense); logger.debug(`ExpensesPage: Card clicked for expense: ${expense.id}`); }}>
              <CardHeader>
                <CardTitle>{expense.item}</CardTitle>
                <p className="text-sm text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
              </CardHeader>
              <CardContent>
                <p className="mb-2">금액: {expense.amount} {expense.currency}</p>
                <p className="text-sm">카테고리: {expense.category}</p>
                <p className="text-sm">결제 방법: {expense.paymentMethod}</p>
                <p className="text-sm">상태: {expense.status}</p>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleEditExpense(expense); logger.debug(`ExpensesPage: Edit button clicked for expense: ${expense.id}`); }}>수정</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); logger.debug(`ExpensesPage: Delete button clicked for expense: ${expense.id}`); }}>삭제</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>정말로 이 지출을 삭제하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                          이 작업은 되돌릴 수 없습니다. 이 지출은 영구적으로 삭제되며 데이터는 서버에서 제거됩니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={(e) => { e.stopPropagation(); }}>취소</AlertDialogCancel>
                        <AlertDialogAction onClick={(e) => { e.stopPropagation(); handleDeleteExpense(expense.id); }}>삭제</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent>
            <ExpenseTable
              expenses={expenses}
              onEditExpense={handleEditExpense}
              onDeleteExpense={handleDeleteExpense}
              loading={loading}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </CardContent>
        </Card>
      )}

      <ExpenseFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingExpense(null); logger.debug('ExpensesPage: ExpenseFormModal closed'); }}
        onSubmit={handleSubmitExpense}
        expense={editingExpense}
      />
      <Toaster />
    </div>
  )
}
