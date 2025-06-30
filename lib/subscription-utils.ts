import type { Subscription, BillingInterval } from "@/types/subscription"

export function calculateNextBillingDate(startDate: string, interval: BillingInterval): string {
  const start = new Date(startDate)
  const now = new Date()
  const next = new Date(start)

  // Calculate the next billing date based on interval
  while (next <= now) {
    switch (interval) {
      case "월간":
        next.setMonth(next.getMonth() + 1)
        break
      case "분기별":
        next.setMonth(next.getMonth() + 3)
        break
      case "연간":
        next.setFullYear(next.getFullYear() + 1)
        break
    }
  }

  return next.toISOString().split("T")[0]
}

export function formatSubscriptionCurrency(amount: number, currency: "KRW" | "USD"): string {
  return new Intl.NumberFormat(currency === "KRW" ? "ko-KR" : "en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: currency === "KRW" ? 0 : 2,
    maximumFractionDigits: currency === "KRW" ? 0 : 2,
  }).format(amount)
}

export function convertCurrency(amount: number, fromCurrency: "KRW" | "USD", toCurrency: "KRW" | "USD"): number {
  // Fixed conversion rate for demo purposes
  const USD_TO_KRW = 1300

  if (fromCurrency === toCurrency) return amount

  if (fromCurrency === "USD" && toCurrency === "KRW") {
    return amount * USD_TO_KRW
  } else if (fromCurrency === "KRW" && toCurrency === "USD") {
    return amount / USD_TO_KRW
  }

  return amount
}

export function getSubscriptionTotalInKRW(subscriptions: Subscription[]): number {
  return subscriptions.reduce((total, sub) => {
    const monthlyAmount =
      sub.billingInterval === "연간" ? sub.amount / 12 : sub.billingInterval === "분기별" ? sub.amount / 3 : sub.amount

    const amountInKRW = convertCurrency(monthlyAmount, sub.currency, "KRW")
    return total + amountInKRW
  }, 0)
}
