"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { SiteTable } from "@/components/site-table"
import { SiteFormModal } from "@/components/site-form-modal"
import type { Site } from "@/types/site"

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSite, setEditingSite] = useState<Site | null>(null)
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

  const handleAddSite = () => {
    setEditingSite(null)
    setIsModalOpen(true)
  }

  const handleEditSite = (site: Site) => {
    setEditingSite(site)
    setIsModalOpen(true)
  }

  const handleDeleteSite = async (id: string) => {
    if (!confirm("이 사이트를 삭제하시겠습니까?")) return

    try {
      const response = await fetch("/api/sites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (response.ok) {
        toast({
          title: "성공",
          description: "사이트가 삭제되었습니다.",
        })
        fetchSites()
      } else {
        throw new Error("사이트 삭제 실패")
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "사이트 삭제에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleSubmitSite = async (siteData: Partial<Site>) => {
    try {
      const url = editingSite ? `/api/sites` : "/api/sites"
      const method = editingSite ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteData),
      })

      if (response.ok) {
        toast({
          title: "성공",
          description: `사이트가 ${editingSite ? "수정" : "추가"}되었습니다.`,
        })
        fetchSites()
      } else {
        throw new Error(`사이트 ${editingSite ? "수정" : "추가"} 실패`)
      }
    } catch (error) {
      toast({
        title: "오류",
        description: `사이트 ${editingSite ? "수정" : "추가"}에 실패했습니다.`,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header title="사이트 모음" onAddSite={handleAddSite} />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        {loading ? (
          <p>로딩 중...</p>
        ) : (
          <SiteTable
            sites={sites}
            onEdit={handleEditSite}
            onDelete={handleDeleteSite}
          />
        )}
        <SiteFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmitSite}
          editingSite={editingSite}
        />
        <Toaster />
      </main>
    </div>
  )
} 