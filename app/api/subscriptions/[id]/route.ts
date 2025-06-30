import { type NextRequest, NextResponse } from "next/server"
import type { Subscription } from "@/types/subscription"
import { calculateNextBillingDate } from "@/lib/subscription-utils"

// Mock data - same as above
const subscriptions: Subscription[] = [
  {
    id: "1",
    serviceName: "AWS Cloud Services",
    amount: 150000,
    currency: "KRW",
    billingInterval: "monthly",
    startDate: "2024-01-01",
    nextBillingDate: "2025-02-01",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    serviceName: "Adobe Creative Suite",
    amount: 52.99,
    currency: "USD",
    billingInterval: "monthly",
    startDate: "2024-06-15",
    nextBillingDate: "2025-02-15",
    isActive: true,
    createdAt: "2024-06-15T00:00:00Z",
    updatedAt: "2024-06-15T00:00:00Z",
  },
  {
    id: "3",
    serviceName: "Office 365",
    amount: 120,
    currency: "USD",
    billingInterval: "yearly",
    startDate: "2024-03-01",
    nextBillingDate: "2025-03-01",
    isActive: true,
    createdAt: "2024-03-01T00:00:00Z",
    updatedAt: "2024-03-01T00:00:00Z",
  },
]

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const body = await request.json()

  const subscriptionIndex = subscriptions.findIndex((sub) => sub.id === id)
  if (subscriptionIndex === -1) {
    return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
  }

  const nextBillingDate = calculateNextBillingDate(body.startDate, body.billingInterval)

  subscriptions[subscriptionIndex] = {
    ...subscriptions[subscriptionIndex],
    ...body,
    nextBillingDate,
    updatedAt: new Date().toISOString(),
  }

  return NextResponse.json(subscriptions[subscriptionIndex])
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params

  const subscriptionIndex = subscriptions.findIndex((sub) => sub.id === id)
  if (subscriptionIndex === -1) {
    return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
  }

  subscriptions.splice(subscriptionIndex, 1)
  return NextResponse.json({ message: "Subscription deleted successfully" })
}
