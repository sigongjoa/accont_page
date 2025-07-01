import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const isActive = searchParams.get("isActive")
    const search = searchParams.get("search")

    let query = supabase.from("subscriptions").select("*").order("created_at", { ascending: false })

    if (category) {
      query = query.eq("category", category)
    }

    if (isActive !== null) {
      query = query.eq("is_active", isActive === "true")
    }

    if (search) {
      query = query.ilike("service_name", `%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching subscriptions:", error)
      return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
    }

    // Transform data to match frontend expectations
    const transformedData = data.map((subscription) => ({
      id: subscription.id,
      serviceName: subscription.service_name,
      amount: subscription.amount,
      currency: subscription.currency,
      billingInterval: subscription.billing_interval,
      startDate: subscription.start_date,
      category: subscription.category,
      isActive: subscription.is_active,
    }))

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("Error in subscriptions GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from("subscriptions")
      .insert({
        service_name: body.serviceName,
        amount: body.amount,
        currency: body.currency || "KRW",
        billing_interval: body.billingInterval,
        start_date: body.startDate,
        category: body.category,
        is_active: body.isActive !== undefined ? body.isActive : true,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating subscription:", error)
      return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 })
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

    return NextResponse.json(transformedData, { status: 201 })
  } catch (error) {
    console.error("Error in subscriptions POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 })
    }

    const { error } = await supabase.from("subscriptions").delete().eq("id", id)

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