"use client"

import { Edit, Trash2, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Subscription, SubscriptionFilters } from "@/types/subscription"
import { formatSubscriptionCurrency, convertCurrency } from "@/lib/subscription-utils"

interface SubscriptionTableProps {
  subscriptions: Subscription[]
  onAddSubscription: (s: any) => void
  onEditSubscription: (subscription: Subscription) => void
  onDeleteSubscription: (id: string) => void
  filters: SubscriptionFilters
  onFilterChange: (key: keyof SubscriptionFilters, value: string | undefined) => void
  displayCurrency: "KRW" | "USD"
  onDisplayCurrencyChange: (currency: "KRW" | "USD") => void
}

export function SubscriptionTable({
  subscriptions,
  onAddSubscription,
  onEditSubscription,
  onDeleteSubscription,
  filters,
  onFilterChange,
  displayCurrency,
  onDisplayCurrencyChange,
}: SubscriptionTableProps) {
  const getIntervalBadgeVariant = (interval: string) => {
    switch (interval) {
      case "monthly":
        return "default"
      case "quarterly":
        return "secondary"
      case "yearly":
        return "outline"
      default:
        return "outline"
    }
  }

  const formatDisplayAmount = (amount: number, originalCurrency: "KRW" | "USD") => {
    if (originalCurrency === displayCurrency) {
      return formatSubscriptionCurrency(amount, displayCurrency)
    }
    const convertedAmount = convertCurrency(amount, originalCurrency, displayCurrency)
    return formatSubscriptionCurrency(convertedAmount, displayCurrency)
  }

  const formatNextBillingDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return `${Math.abs(diffDays)}일 지남`
    } else if (diffDays === 0) {
      return "오늘 마감"
    } else if (diffDays <= 7) {
      return `${diffDays}일 남음`
    } else {
      return date.toLocaleDateString("ko-KR")
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>구독 관리</CardTitle>
          <Button onClick={onAddSubscription}>
            <Plus className="h-4 w-4 mr-2" />
            구독 추가
          </Button>
        </div>

        {/* Filters and Currency Toggle */}
        <div className="flex gap-4 flex-wrap items-center">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="구독 검색..."
              value={filters.search || ""}
              onChange={(e) => onFilterChange("search", e.target.value)}
              className="w-64"
            />
          </div>

          <Select
            value={filters.currency ?? "all"}
            onValueChange={(value) =>
              onFilterChange("currency", value)
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="통화" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모두</SelectItem>
              <SelectItem value="KRW">KRW</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.interval ?? "all"}
            onValueChange={(value) =>
              onFilterChange("interval", value)
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="간격" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 간격</SelectItem>
              <SelectItem value="monthly">매월</SelectItem>
              <SelectItem value="quarterly">분기별</SelectItem>
              <SelectItem value="yearly">매년</SelectItem>
            </SelectContent>
          </Select>

          {/* Currency Display Toggle */}
          <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
            <span className="text-sm">표시 통화:</span>
            <Button
              variant={displayCurrency === "KRW" ? "default" : "ghost"}
              size="sm"
              onClick={() => onDisplayCurrencyChange("KRW")}
            >
              KRW
            </Button>
            <Button
              variant={displayCurrency === "USD" ? "default" : "ghost"}
              size="sm"
              onClick={() => onDisplayCurrencyChange("USD")}
            >
              USD
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>서비스명</TableHead>
              <TableHead>금액</TableHead>
              <TableHead>원래 통화</TableHead>
              <TableHead>청구 간격</TableHead>
              <TableHead>다음 청구일</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="text-right">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((subscription) => (
              <TableRow key={subscription.id}>
                <TableCell className="font-medium">{subscription.serviceName}</TableCell>
                <TableCell className="font-mono">
                  {formatDisplayAmount(subscription.amount, subscription.currency)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{subscription.currency}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getIntervalBadgeVariant(subscription.billingInterval)}>
                    {subscription.billingInterval}
                  </Badge>
                </TableCell>
                <TableCell>{formatNextBillingDate(subscription.nextBillingDate)}</TableCell>
                <TableCell>
                  <Badge variant={subscription.isActive ? "default" : "secondary"}>
                    {subscription.isActive ? "활성" : "비활성"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEditSubscription(subscription)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDeleteSubscription(subscription.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {subscriptions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            구독을 찾을 수 없습니다. 첫 구독을 추가하여 시작하세요.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
