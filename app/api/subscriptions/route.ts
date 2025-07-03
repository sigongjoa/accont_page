import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  logger.debug('GET /api/subscriptions function entry');
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const isActive = searchParams.get("isActive")
    const search = searchParams.get("search")

    let query = supabase.from("subscriptions").select("*").order("created_at", { ascending: false })

    if (category) {
      logger.debug(`Filtering by category: ${category}`);
      query = query.eq("category", category)
    }

    if (isActive !== null) {
      logger.debug(`Filtering by isActive: ${isActive}`);
      query = query.eq("is_active", isActive === "true")
    }

    if (search) {
      logger.debug(`Filtering by search term: ${search}`);
      query = query.ilike("service_name", `%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      logger.debug(`Error fetching subscriptions: ${error.message}`);
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
      nextBillingDate: subscription.next_billing_date,
      category: subscription.category,
      isActive: subscription.is_active,
    }))

    logger.debug(`Successfully fetched ${transformedData.length} subscriptions`);
    return NextResponse.json(transformedData)
  } catch (error) {
    logger.debug(`Error in GET /api/subscriptions: ${error.message}`);
    console.error("Error in subscriptions GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}