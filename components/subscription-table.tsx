"use client"

import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Subscription } from "@/types/subscription"
import { formatSubscriptionCurrency, convertCurrency } from "@/lib/subscription-utils"
import logger from '@/lib/logger';

interface SubscriptionTableProps {
  subscriptions: Subscription[]
  displayCurrency: "KRW" | "USD"
}

export function SubscriptionTable({
  subscriptions,
  displayCurrency,
}: SubscriptionTableProps) {
  logger.debug('SubscriptionTable rendering');
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
    logger.debug('formatDisplayAmount called', { amount, originalCurrency, displayCurrency });
    if (originalCurrency === displayCurrency) {
      return formatSubscriptionCurrency(amount, displayCurrency)
    }
    const convertedAmount = convertCurrency(amount, originalCurrency, displayCurrency)
    return formatSubscriptionCurrency(convertedAmount, displayCurrency)
  }

  const formatNextBillingDate = (dateString: string) => {
    logger.debug('formatNextBillingDate called', { dateString });
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
    <table className="w-full text-sm text-left text-gray-500">
      <thead className="table-header">
        <tr>
          <th className="px-6 py-3" scope="col">서비스명</th>
          <th className="px-6 py-3" scope="col">금액</th>
          <th className="px-6 py-3" scope="col">원래 통화</th>
          <th className="px-6 py-3" scope="col">청구 간격</th>
          <th className="px-6 py-3" scope="col">다음 청구일</th>
          <th className="px-6 py-3" scope="col">상태</th>
        </tr>
      </thead>
      <tbody>
        {subscriptions.length === 0 ? (
          <tr className="table-row">
            <td className="table-cell text-center py-8 text-muted-foreground" colSpan={6}>
              구독을 찾을 수 없습니다. 첫 구독을 추가하여 시작하세요.
            </td>
          </tr>
        ) : (
          subscriptions.map((subscription) => (
            <tr key={subscription.id} className="table-row">
              <td className="table-cell table-cell-font-medium">{subscription.serviceName}</td>
              <td className="table-cell font-mono">
                {formatDisplayAmount(subscription.amount, subscription.currency)}
              </td>
              <td className="table-cell">
                <Badge variant="outline">{subscription.currency}</Badge>
              </td>
              <td className="table-cell">
                <Badge variant={getIntervalBadgeVariant(subscription.billingInterval)}>
                  {subscription.billingInterval}
                </Badge>
              </td>
              <td className="table-cell">{formatNextBillingDate(subscription.nextBillingDate)}</td>
              <td className="table-cell">
                <span className={subscription.isActive ? "status-badge-subscribed" : "status-badge-unsubscribed"}>
                  {subscription.isActive ? "활성" : "비활성"}
                </span>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}
