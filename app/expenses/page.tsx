"use client"

import { useState, useEffect, useCallback } from "react"
import PageTitle from "@/components/PageTitle"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { ExpenseTable } from "@/components/expense-table"
import type { Expense, ExpenseFilters } from "@/types/expense"
import { ExpenseFilters as ExpenseFiltersComponent } from "@/components/expense-filters"
import { convertSubscriptionsToExpenses } from "@/lib/subscription-utils"
import logger from '@/lib/logger';

export default function ExpensesPage() {
  logger.debug('ExpensesPage: Component rendering');
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  })
  const [filters, setFilters] = useState<ExpenseFilters>({})
  const { toast } = useToast()

  // New handler for applying filters from ExpenseFiltersComponent
  const handleApplyFilters = useCallback((newFilters: ExpenseFilters, newPeriod: string) => {
    logger.debug('ExpensesPage handleApplyFilters called', { newFilters, newPeriod });
    setFilters(newFilters);
    setSelectedPeriod(newPeriod);
  }, []);

  // New handler for clearing filters from ExpenseFiltersComponent
  const handleClearFilters = useCallback(() => {
    logger.debug('ExpensesPage handleClearFilters called');
    setFilters({});
  }, []);

  const fetchExpenses = useCallback(async () => {
    logger.debug('fetchExpenses: Enter');
    try {
      setLoading(true)
      const params = new URLSearchParams()

      // Add period filter
      const [year, month] = selectedPeriod.split("-")
      params.append("dateFrom", `${year}-${month}-01`)
      params.append("dateTo", `${year}-${month}-31`)

      // Add other filters
      if (filters.category) { logger.debug(`Filtering by category: ${filters.category}`); params.append("category", filters.category); }
      if (filters.status) { logger.debug(`Filtering by status: ${filters.status}`); params.append("status", filters.status); }
      if (filters.search) { logger.debug(`Filtering by search: ${filters.search}`); params.append("search", filters.search); }
      if (filters.dateFrom) { logger.debug(`Filtering by dateFrom: ${filters.dateFrom}`); params.append("dateFrom", filters.dateFrom); }
      if (filters.dateTo) { logger.debug(`Filtering by dateTo: ${filters.dateTo}`); params.append("dateTo", filters.dateTo); }

      logger.debug(`Fetching expenses from /api/expenses?${params.toString()}`);
      const [expensesResponse, subscriptionsResponse] = await Promise.all([
        fetch(`/api/expenses?${params}`),
        fetch("/api/subscriptions"),
      ]);

      if (!expensesResponse.ok) {
        logger.debug(`Failed to fetch expenses: ${expensesResponse.statusText}`);
        throw new Error("Failed to fetch expenses")
      }
      if (!subscriptionsResponse.ok) {
        logger.debug(`Failed to fetch subscriptions: ${subscriptionsResponse.statusText}`);
        throw new Error("Failed to fetch subscriptions")
      }

      const expensesData: Expense[] = await expensesResponse.json()
      const subscriptionsData: Subscription[] = await subscriptionsResponse.json()

      const currentYear = parseInt(year);
      const currentMonth = parseInt(month);
      const subscriptionExpenses = convertSubscriptionsToExpenses(subscriptionsData, currentYear, currentMonth);
      logger.debug(`Fetched ${subscriptionExpenses.length} subscription expenses`);

      const combinedExpenses = [...expensesData, ...subscriptionExpenses];
      logger.debug(`Combined expenses count: ${combinedExpenses.length}`);

      setExpenses(combinedExpenses)
    } catch (error: any) {
      logger.debug(`Error fetching expenses: ${error.message}`);
      console.error("Error fetching expenses:", error)
      toast({
        title: "오류",
        description: `지출 데이터를 불러오는데 실패했습니다: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      logger.debug('fetchExpenses: Exit');
    }
  }, [selectedPeriod, filters, toast])

  useEffect(() => {
    logger.debug('useEffect: fetchExpenses call');
    fetchExpenses()
  }, [fetchExpenses])

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col p-6">
        <PageTitle title="지출 내역" icon="account_balance_wallet" />
        <ExpenseFiltersComponent
          initialFilters={filters}
          initialSelectedPeriod={selectedPeriod}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />
        <ExpenseTable
          expenses={expenses}
        />
        <Toaster />
      </main>
    </div>
  )
}
