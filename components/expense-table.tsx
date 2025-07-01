"use client"
import { Edit, Trash2, Plus, Search, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Expense, ExpenseFilters } from "@/types/expense"
import { formatCurrency, formatDate, isOnline } from "@/lib/utils"
import { useState, useEffect } from "react"

interface ExpenseTableProps {
  expenses: Expense[]
  onEditExpense: (expense: Expense) => void
  onDeleteExpense: (id: string) => void
  filters: ExpenseFilters
  onFiltersChange: (filters: ExpenseFilters) => void
}

export function ExpenseTable({
  expenses,
  onEditExpense,
  onDeleteExpense,
  filters,
  onFiltersChange,
}: ExpenseTableProps) {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    setOnline(isOnline())
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "지불완료":
        return "default"
      case "대기중":
        return "secondary"
      case "취소됨":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "고정비":
        return "text-blue-600"
      case "변동비":
        return "text-green-600"
      case "프로젝트":
        return "text-purple-600"
      case "기타":
        return "text-orange-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>지출 내역</CardTitle>
        </div>

        {!online && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>오프라인 모드입니다. 변경사항은 온라인 연결 시 동기화됩니다.</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="지출 검색..."
              value={filters.search || ""}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="w-64"
            />
          </div>

          <Select
            value={filters.category ?? "all"}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, category: value === "all" ? undefined : (value as any) })
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 카테고리</SelectItem>
              <SelectItem value="고정비">고정비</SelectItem>
              <SelectItem value="변동비">변동비</SelectItem>
              <SelectItem value="프로젝트">프로젝트</SelectItem>
              <SelectItem value="기타">기타</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status ?? "all"}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, status: value === "all" ? undefined : (value as any) })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 상태</SelectItem>
              <SelectItem value="대기중">대기중</SelectItem>
              <SelectItem value="지불완료">지불완료</SelectItem>
              <SelectItem value="취소됨">취소됨</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Input
              type="date"
              value={filters.dateFrom || ""}
              onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
              className="w-40"
            />
            <Input
              type="date"
              value={filters.dateTo || ""}
              onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
              className="w-40"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>날짜</TableHead>
              <TableHead>항목</TableHead>
              <TableHead>카테고리</TableHead>
              <TableHead>금액</TableHead>
              <TableHead>결제방법</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{formatDate(expense.date)}</TableCell>
                <TableCell className="font-medium">{expense.item}</TableCell>
                <TableCell>
                  <span className={getCategoryColor(expense.category)}>{expense.category}</span>
                </TableCell>
                <TableCell>{formatCurrency(expense.amount)}</TableCell>
                <TableCell>{expense.paymentMethod}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(expense.status)}>{expense.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEditExpense(expense)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDeleteExpense(expense.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {expenses.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            지출 내역이 없습니다. 첫 번째 지출을 추가해보세요.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
