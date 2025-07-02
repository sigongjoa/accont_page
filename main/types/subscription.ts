export type BillingInterval = "월간" | "연간" | "분기별"
export type Currency = "KRW" | "USD"

export interface Subscription {
  id: string
  serviceName: string
  amount: number
  currency: Currency
  billingInterval: BillingInterval
  startDate: string
  nextBillingDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  category: string
}

export interface SubscriptionFilters {
  currency?: Currency
  interval?: BillingInterval
  search?: string
}
