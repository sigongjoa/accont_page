"use client"

import { useState, useEffect, useCallback } from "react"
import PageTitle from "@/components/PageTitle"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { SiteTable } from "@/components/site-table"
import type { Site } from "@/types/site"

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchSites = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/sites")
      if (!response.ok) {
        throw new Error("Failed to fetch sites")
      }
      const data: Site[] = await response.json()
      setSites(data)
    } catch (error) {
      console.error("Error fetching sites:", error)
      toast({
        title: "오류",
        description: "사이트 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [setLoading, setSites, toast])

  useEffect(() => {
    fetchSites()
  }, [fetchSites])

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1 p-6">
        <PageTitle title="사이트 모음" icon="description" badgeText="온라인" />
        {loading ? (
          <p>로딩 중...</p>
        ) : (
          <SiteTable
            sites={sites}
          />
        )}
        <Toaster />
      </main>
    </div>
  )
}
