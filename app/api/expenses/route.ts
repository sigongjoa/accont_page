import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  logger.debug('GET /api/expenses function entry');
  try {
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const category = searchParams.get("category")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    let query = supabase.from("expenses").select("*").order("date", { ascending: false })

    if (dateFrom && dateTo) {
      logger.debug(`Filtering by date range: ${dateFrom} to ${dateTo}`);
      query = query.gte("date", dateFrom).lte("date", dateTo)
    }

    if (category) {
      logger.debug(`Filtering by category: ${category}`);
      query = query.eq("category", category)
    }

    if (status) {
      logger.debug(`Filtering by status: ${status}`);
      query = query.eq("status", status)
    }

    if (search) {
      logger.debug(`Filtering by search term: ${search}`);
      query = query.ilike("item", `%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      logger.debug(`Error fetching expenses: ${error.message}`);
      console.error("Error fetching expenses:", error)
      return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 })
    }

    // Transform data to match frontend expectations
    const transformedData = data.map((expense) => ({
      id: expense.id,
      date: expense.date,
      item: expense.item,
      amount: expense.amount,
      currency: expense.currency,
      category: expense.category,
      paymentMethod: expense.payment_method,
      status: expense.status,
    }))

    logger.debug(`Successfully fetched ${transformedData.length} expenses`);
    return NextResponse.json(transformedData)
  } catch (error) {
    logger.debug(`Error in GET /api/expenses: ${error.message}`);
    console.error("Error in expenses GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
