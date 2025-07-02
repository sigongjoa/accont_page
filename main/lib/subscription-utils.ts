import type { Subscription, BillingInterval } from "@/types/subscription"
import type { Expense } from "@/types/expense"

export function calculateNextBillingDate(startDate: string, interval: BillingInterval): string {
  const start = new Date(startDate);
  const now = new Date();
  let next = new Date(start);

  // If the start date is in the future, that's the next billing date
  if (start > now) {
    return start.toISOString().split("T")[0];
  }

  // Calculate the next billing date based on interval, ensuring it's in the future
  while (next <= now) {
    switch (interval) {
      case "월간":
        next.setMonth(next.getMonth() + 1);
        break;
      case "분기별":
        next.setMonth(next.getMonth() + 3);
        break;
      case "연간":
        next.setFullYear(next.getFullYear() + 1);
        break;
      default:
        // Should not happen with proper type checking
        console.warn("Unknown billing interval:", interval);
        return ""; // Return empty string or throw error for unknown interval
    }
    // Prevent infinite loop for very old dates or invalid intervals
    if (next.getFullYear() > now.getFullYear() + 10) { 
      console.warn("Potential infinite loop detected in calculateNextBillingDate");
      return "";
    }
  }

  return next.toISOString().split("T")[0];
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

export function convertSubscriptionsToExpenses(subscriptions: Subscription[], year: number, month: number): Expense[] {
  const expenses: Expense[] = []
  const targetDate = new Date(year, month - 1, 1) // Month is 0-indexed

  subscriptions.forEach(sub => {
    if (!sub.isActive) return;

    let currentBillingDate = new Date(sub.startDate);
    let nextBillingDate = new Date(sub.startDate);

    // Find the first billing date that is on or before the target month
    while (nextBillingDate < targetDate) {
      currentBillingDate = new Date(nextBillingDate);
      switch (sub.billingInterval) {
        case "월간":
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
          break;
        case "분기별":
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
          break;
        case "연간":
          nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
          break;
        default:
          break;
      }
      // Prevent infinite loop for invalid intervals or very old dates
      if (nextBillingDate.getFullYear() > year + 5) break; 
    }

    // Check if the current billing date falls within the target month
    if (currentBillingDate.getFullYear() === year && currentBillingDate.getMonth() === month - 1) {
      expenses.push({
        id: `sub-${sub.id}-${year}-${month}`,
        date: currentBillingDate.toISOString().split('T')[0],
        item: `구독: ${sub.serviceName}`,
        category: sub.category,
        amount: sub.amount,
        paymentMethod: "자동이체", // Default for subscriptions
        status: "지불완료", // Default for subscriptions
        currency: sub.currency,
      });
    }
  });

  return expenses;
}