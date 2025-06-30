"use client"

import { Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Subscription } from "@/types/subscription"
import { formatSubscriptionCurrency, convertCurrency } from "@/lib/subscription-utils"

interface SubscriptionTableProps {
  subscriptions: Subscription[]
  onEditSubscription: (subscription: Subscription) => void
  onDeleteSubscription: (id: string) => void
  displayCurrency: "KRW" | "USD"
}

export function SubscriptionTable({
  subscriptions,
  onEditSubscription,
  onDeleteSubscription,
  displayCurrency,
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
