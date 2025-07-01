import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const isSubscribed = searchParams.get("isSubscribed")
    const search = searchParams.get("search")

    let query = supabase.from("sites").select("*").order("created_at", { ascending: false })

    if (category) {
      query = query.eq("category", category)
    }

    if (isSubscribed !== null) {
      query = query.eq("is_subscribed", isSubscribed === "true")
    }

    if (search) {
      query = query.ilike("name", `%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching sites:", error)
      return NextResponse.json({ error: "Failed to fetch sites" }, { status: 500 })
    }

    // Transform data to match frontend expectations
    const transformedData = data.map((site) => ({
      id: site.id,
      name: site.name,
      description: site.description,
      category: site.category,
      isSubscribed: site.is_subscribed,
      usage: site.usage,
    }))

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("Error in sites GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from("sites")
      .insert({
        name: body.name,
        description: body.description,
        category: body.category,
        is_subscribed: body.isSubscribed || false,
        usage: body.usage,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating site:", error)
      return NextResponse.json({ error: "Failed to create site" }, { status: 500 })
    }

    // Transform data to match frontend expectations
    const transformedData = {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      isSubscribed: data.is_subscribed,
      usage: data.usage,
    }

    return NextResponse.json(transformedData, { status: 201 })
  } catch (error) {
    console.error("Error in sites POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from("sites")
      .update({
        name: body.name,
        description: body.description,
        category: body.category,
        is_subscribed: body.isSubscribed,
        usage: body.usage,
      })
      .eq("id", body.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating site:", error)
      return NextResponse.json({ error: "Failed to update site" }, { status: 500 })
    }

    // Transform data to match frontend expectations
    const transformedData = {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      isSubscribed: data.is_subscribed,
      usage: data.usage,
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("Error in site PUT:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: "Site ID is required" }, { status: 400 })
    }

    const { error } = await supabase.from("sites").delete().eq("id", id)

    if (error) {
      console.error("Error deleting site:", error)
      return NextResponse.json({ error: "Failed to delete site" }, { status: 500 })
    }

    return NextResponse.json({ message: "Site deleted successfully" })
  } catch (error) {
    console.error("Error in site DELETE:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}