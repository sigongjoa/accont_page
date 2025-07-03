import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  logger.debug('GET /api/sites function entry');
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const isSubscribed = searchParams.get("isSubscribed")
    const search = searchParams.get("search")

    let query = supabase.from("sites").select("*").order("created_at", { ascending: false })

    if (category) {
      logger.debug(`Filtering by category: ${category}`);
      query = query.eq("category", category)
    }

    if (isSubscribed !== null) {
      logger.debug(`Filtering by isSubscribed: ${isSubscribed}`);
      query = query.eq("is_subscribed", isSubscribed === "true")
    }

    if (search) {
      logger.debug(`Filtering by search term: ${search}`);
      query = query.ilike("name", `%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      logger.debug(`Error fetching sites: ${error.message}`);
      console.error("Error fetching sites:", error)
      return NextResponse.json({ error: "Failed to fetch sites" }, { status: 500 })
    }

    // Transform data to match frontend expectations
    const transformedData = data.map((site) => ({
      id: site.id,
      name: site.name,
      description: site.description,
      url: site.url,
      category: site.category,
      isSubscribed: site.is_subscribed,
      usage: site.usage,
    }))

    logger.debug(`Successfully fetched ${transformedData.length} sites`);
    return NextResponse.json(transformedData)
  } catch (error) {
    logger.debug(`Error in GET /api/sites: ${error.message}`);
    console.error("Error in sites GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}