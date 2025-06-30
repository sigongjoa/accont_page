import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ExpenseSummary } from "@/types/expense"
import { formatCurrency } from "@/lib/utils"
import type { Subscription } from "@/types/subscription"
import { getSubscriptionTotalInKRW } from "@/lib/subscription-utils"

interface ExpenseSummaryCardProps {
  summary: ExpenseSummary
  period: string
  subscriptions?: Subscription[]
}

export function ExpenseSummaryCard({ summary, period, subscriptions = [] }: ExpenseSummaryCardProps) {
  const periodName = new Date(period + "-01").toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
  })

  const subscriptionTotal = getSubscriptionTotalInKRW(subscriptions)
  const totalWithSubscriptions = summary.totalAmount + subscriptionTotal

  return (
    <Card>
      <CardHeader>
        <CardTitle>총 지출 요약</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">{periodName} 총 지출</p>
            <p className="text-3xl font-bold">{formatCurrency(summary.totalAmount)}</p>
            {subscriptionTotal > 0 && (
              <div className="mt-2 text-sm text-muted-foreground">
                <p>+ 월간 구독료: {formatCurrency(subscriptionTotal)}</p>
                <p className="font-semibold">합계: {formatCurrency(totalWithSubscriptions)}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">고정비</span>
                <span className="text-sm font-medium">{summary.fixedPercentage.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded">
                <div className="h-2 bg-blue-500 rounded" style={{ width: `${summary.fixedPercentage}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">변동비</span>
                <span className="text-sm font-medium">{summary.variablePercentage.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded">
                <div className="h-2 bg-green-500 rounded" style={{ width: `${summary.variablePercentage}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">프로젝트</span>
                <span className="text-sm font-medium">{summary.projectPercentage.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded">
                <div className="h-2 bg-purple-500 rounded" style={{ width: `${summary.projectPercentage}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">기타</span>
                <span className="text-sm font-medium">{summary.otherPercentage.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded">
                <div className="h-2 bg-orange-500 rounded" style={{ width: `${summary.otherPercentage}%` }} />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
