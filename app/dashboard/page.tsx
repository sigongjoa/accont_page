"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { ExpenseSummaryCard } from "@/components/expense-summary-card"
import { ExpenseCharts } from "@/components/expense-charts"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { DollarSign, CreditCard, Calendar, AlertCircle } from "lucide-react"
import type { Expense, ExpenseFilters } from "@/types/expense"
import type { Subscription } from "@/types/subscription"
import { calculateExpenseSummary, saveToLocalStorage, loadFromLocalStorage, STORAGE_KEYS, isOnline } from "@/lib/utils"
import logger from "@/lib/logger"
import { convertSubscriptionsToExpenses } from "@/lib/subscription-utils"

export default function DashboardPage() {
  logger.debug("DashboardPage: Component rendering")
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  })
  const [filters, setFilters] = useState<ExpenseFilters>({})
  const [loading, setLoading] = useState(true)
  const [displayCurrency, setDisplayCurrency] = useState<"KRW" | "USD">("KRW")
  const { toast } = useToast()

  // Load data and fetch from API on mount or when online status changes
  useEffect(() => {
    logger.debug("DashboardPage useEffect: Initial data load or online status change")
    if (isOnline()) {
      logger.debug("DashboardPage useEffect: Online, fetching data")
      Promise.all([fetchExpenses(), fetchSubscriptions()])
    } else {
      logger.debug("DashboardPage useEffect: Offline, attempting to load from localStorage")
      const savedExpenses = loadFromLocalStorage(STORAGE_KEYS.EXPENSES)
      const savedSubscriptions = loadFromLocalStorage(STORAGE_KEYS.SUBSCRIPTIONS)

      if (savedExpenses) setExpenses(savedExpenses)
      if (savedSubscriptions) setSubscriptions(savedSubscriptions)

      if (savedExpenses || savedSubscriptions) {
        toast({
          title: "오프라인 모드",
          description: "저장된 데이터를 불러왔습니다.",
        })
      } else {
        toast({
          title: "오프라인 모드",
          description: "로컬에 저장된 데이터가 없습니다.",
          variant: "destructive",
        })
      }
      setLoading(false)
    }
  }, []) // Empty dependency array to run only on mount

  // Save to localStorage whenever data changes
  useEffect(() => {
    logger.debug("DashboardPage useEffect: expenses state changed, saving to localStorage", {
      expensesCount: expenses.length,
    })
    saveToLocalStorage(STORAGE_KEYS.EXPENSES, expenses)
  }, [expenses])

  useEffect(() => {
    logger.debug("DashboardPage useEffect: subscriptions state changed, saving to localStorage", {
      subscriptionsCount: subscriptions.length,
    })
    saveToLocalStorage(STORAGE_KEYS.SUBSCRIPTIONS, subscriptions)
  }, [subscriptions])

  // Fetch expenses
  const fetchExpenses = async () => {
    logger.debug("fetchExpenses: Enter")
    if (!isOnline()) {
      logger.debug("fetchExpenses: Offline, returning")
      toast({
        title: "오프라인",
        description: "인터넷 연결을 확인해주세요.",
        variant: "destructive",
      })
      return
    }

    try {
      logger.debug("fetchExpenses: Setting loading to true")
      setLoading(true)
      const params = new URLSearchParams()

      // Add period filter
      const [year, month] = selectedPeriod.split("-")
      params.append("dateFrom", `${year}-${month}-01`)
      params.append("dateTo", `${year}-${month}-31`)
      logger.debug("fetchExpenses: Period filters added", {
        dateFrom: `${year}-${month}-01`,
        dateTo: `${year}-${month}-31`,
      })

      // Add other filters
      if (filters.category) {
        params.append("category", filters.category)
        logger.debug("fetchExpenses: Category filter added", { category: filters.category })
      }
      if (filters.status) {
        params.append("status", filters.status)
        logger.debug("fetchExpenses: Status filter added", { status: filters.status })
      }
      if (filters.search) {
        params.append("search", filters.search)
        logger.debug("fetchExpenses: Search filter added", { search: filters.search })
      }
      if (filters.dateFrom) {
        params.append("dateFrom", filters.dateFrom)
        logger.debug("fetchExpenses: DateFrom filter added", { dateFrom: filters.dateFrom })
      }
      if (filters.dateTo) {
        params.append("dateTo", filters.dateTo)
        logger.debug("fetchExpenses: DateTo filter added", { dateTo: filters.dateTo })
      }

      logger.debug("fetchExpenses: Sending API request", { params: params.toString() })
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
      saveToLocalStorage(STORAGE_KEYS.EXPENSES, combinedExpenses)
    } catch (error: any) {
      logger.error("fetchExpenses: Error fetching expenses", { error: error.message })
      toast({
        title: "오류",
        description: "지출 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      logger.debug("fetchExpenses: Setting loading to false")
      logger.debug("fetchExpenses: Exit")
    }
  }

  // Fetch subscriptions
  const fetchSubscriptions = async () => {
    logger.debug("fetchSubscriptions: Enter")
    if (!isOnline()) {
      logger.debug("fetchSubscriptions: Offline, returning")
      return
    }

    try {
      const response = await fetch("/api/subscriptions")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      logger.debug("fetchSubscriptions: Data received", { dataCount: data.length })
      setSubscriptions(data)
      saveToLocalStorage(STORAGE_KEYS.SUBSCRIPTIONS, data)
    } catch (error: any) {
      logger.error("fetchSubscriptions: Error fetching subscriptions", { error: error.message })
      toast({
        title: "오류",
        description: "구독 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    logger.debug("DashboardPage useEffect: selectedPeriod or filters changed, refetching expenses")
    if (isOnline()) {
      fetchExpenses()
    } else {
      logger.debug("DashboardPage useEffect: Offline, not refetching from API")
    }
  }, [selectedPeriod, filters])

  const expenseSummary = calculateExpenseSummary(expenses, displayCurrency)
  logger.debug("DashboardPage: Calculated expense summary", { summary: expenseSummary })

  const filteredExpenses = expenses.filter((expense) => {
    logger.debug("DashboardPage: Filtering expense", { expenseDate: expense.date, selectedPeriod })
    const expenseDate = new Date(expense.date)
    const [year, month] = selectedPeriod.split("-").map(Number)
    const matchesPeriod = expenseDate.getFullYear() === year && expenseDate.getMonth() + 1 === month
    logger.debug("DashboardPage: Expense matches period", { expenseId: expense.id, matchesPeriod })
    return matchesPeriod
  })

  // Calculate subscription metrics
  const activeSubscriptions = subscriptions.filter((sub) => sub.isActive)
  const totalMonthlySubscriptions = activeSubscriptions.reduce((total, sub) => {
    let monthlyAmount = sub.amount
    if (sub.billingInterval === "yearly") monthlyAmount = sub.amount / 12
    if (sub.billingInterval === "quarterly") monthlyAmount = sub.amount / 3
    return total + monthlyAmount
  }, 0)

  // Calculate category breakdown
  const categoryBreakdown = expenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const totalExpenses = Object.values(categoryBreakdown).reduce((sum, amount) => sum + amount, 0)

  if (loading) {
    return (
      <div className="flex flex-1 flex-col">
        <Header title="대시보드" selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod} />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-[120px] mb-2" />
                  <Skeleton className="h-3 w-[80px]" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[400px]" />
            <Skeleton className="h-[400px]" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header title="대시보드" selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod} />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 지출</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {displayCurrency === "KRW"
                  ? `₩${(expenseSummary.total ?? 0).toLocaleString()}`
                  : `$${((expenseSummary.total ?? 0) / 1300).toFixed(2)}`}
              </div>
              <p className="text-xs text-muted-foreground">{selectedPeriod} 기준</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">월 구독료</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {displayCurrency === "KRW"
                  ? `₩${(totalMonthlySubscriptions ?? 0).toLocaleString()}`
                  : `$${((totalMonthlySubscriptions ?? 0) / 1300).toFixed(2)}`}
              </div>
              <p className="text-xs text-muted-foreground">활성 구독 {activeSubscriptions.length}개</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">대기중 지출</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expenses.filter((e) => e.status === "대기중").length}</div>
              <p className="text-xs text-muted-foreground">처리 필요</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">이번 달 거래</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredExpenses.length}</div>
              <p className="text-xs text-muted-foreground">총 거래 건수</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Summary Card */}
        <ExpenseSummaryCard
          summary={expenseSummary}
          displayCurrency={displayCurrency}
          onCurrencyChange={setDisplayCurrency}
        />

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>카테고리별 지출 분석</CardTitle>
            <CardDescription>{selectedPeriod} 기간의 카테고리별 지출 현황</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(categoryBreakdown).map(([category, amount]) => {
              const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{category}</Badge>
                      <span className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</span>
                    </div>
                    <span className="font-medium">
                      {displayCurrency === "KRW"
                        ? `₩${(amount ?? 0).toLocaleString()}`
                        : `$${((amount ?? 0) / 1300).toFixed(2)}`}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpenseCharts expenses={filteredExpenses} selectedPeriod={selectedPeriod} />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
            <CardDescription>최근 추가된 지출 내역</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{expense.item}</span>
                      <span className="text-sm text-muted-foreground">
                        {expense.date} • {expense.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        expense.status === "지불완료"
                          ? "default"
                          : expense.status === "대기중"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {expense.status}
                    </Badge>
                    <span className="font-medium">
                      {displayCurrency === "KRW"
                        ? `₩${(expense.amount ?? 0).toLocaleString()}`
                        : `$${((expense.amount ?? 0) / 1300).toFixed(2)}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Toaster />
      </main>
    </div>
  )
}