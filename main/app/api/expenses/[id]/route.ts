import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from("expenses")
      .update({
        date: body.date,
        item: body.item,
        category: body.category,
        amount: body.amount,
        payment_method: body.paymentMethod,
        status: body.status,
        currency: body.currency || "KRW",
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating expense:", error)
      return NextResponse.json({ error: "Failed to update expense" }, { status: 500 })
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

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("Error in expense PUT:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase.from("expenses").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting expense:", error)
      return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 })
    }

    return NextResponse.json({ message: "Expense deleted successfully" })
  } catch (error) {
    console.error("Error in expense DELETE:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
