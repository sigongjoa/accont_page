import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    let query = supabase.from("expenses").select("*").order("date", { ascending: false })

    if (category) {
      query = query.eq("category", category)
    }

    if (status) {
      query = query.eq("status", status)
    }

    if (search) {
      query = query.ilike("item", `%${search}%`)
    }

    

    if (dateFrom) {
      query = query.gte("date", dateFrom)
    }

    if (dateTo) {
      query = query.lte("date", dateTo)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching expenses:", error)
      return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 })
    }

    // Transform data to match frontend expectations
    const transformedData = data.map((expense) => ({
      id: expense.id,
      date: expense.date,
      item: expense.item,
      category: expense.category,
      amount: expense.amount,
      paymentMethod: expense.payment_method,
      status: expense.status,
      currency: expense.currency,
    }))

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("Error in expenses GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from("expenses")
      .insert({
        date: body.date,
        item: body.item,
        category: body.category,
        amount: body.amount,
        payment_method: body.paymentMethod,
        status: body.status,
        currency: body.currency || "KRW",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating expense:", error)
      return NextResponse.json({ error: "Failed to create expense" }, { status: 500 })
    }

    // Transform data to match frontend expectations
    const transformedData = {
      id: data.id,
      date: data.date,
      item: data.item,
      category: data.category,
      amount: data.amount,
      paymentMethod: data.payment_method,
      status: data.status,
      currency: data.currency,
    }

    return NextResponse.json(transformedData, { status: 201 })
  } catch (error) {
    console.error("Error in expenses POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
