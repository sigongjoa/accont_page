import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from("subscriptions")
      .update({
        service_name: body.serviceName,
        amount: body.amount,
        currency: body.currency || "KRW",
        billing_interval: body.billingInterval,
        start_date: body.startDate,
        category: body.category,
        is_active: body.isActive !== undefined ? body.isActive : true,
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating subscription:", error)
      return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 })
    }

    // Transform data to match frontend expectations
    const transformedData = {
      id: data.id,
      serviceName: data.service_name,
      amount: data.amount,
      currency: data.currency,
      billingInterval: data.billing_interval,
      startDate: data.start_date,
      category: data.category,
      isActive: data.is_active,
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("Error in subscription PUT:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase.from("subscriptions").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting subscription:", error)
      return NextResponse.json({ error: "Failed to delete subscription" }, { status: 500 })
    }

    return NextResponse.json({ message: "Subscription deleted successfully" })
  } catch (error) {
    console.error("Error in subscription DELETE:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
