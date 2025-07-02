"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { SiteTable } from "@/components/site-table"
import { SiteFormModal } from "@/components/site-form-modal"
import type { Site } from "@/types/site"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageTitle from '@/components/PageTitle';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import logger from '@/lib/logger';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { PlusCircledIcon } from "@radix-ui/react-icons";

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSite, setEditingSite] = useState<Site | null>(null)
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');

  const fetchSites = useCallback(async () => {
    logger.debug('SitesPage: fetchSites - fetching data');
    try {
      setLoading(true)
      const response = await fetch("/api/sites")
      if (!response.ok) {
        logger.debug(`SitesPage: fetchSites - API error, status: ${response.status}`);
        throw new Error("Failed to fetch sites")
      }
      const data: Site[] = await response.json()
      setSites(data)
    } catch (error: any) {
      logger.error("SitesPage: Error fetching sites:", error.message);
      toast({
        title: "오류",
        description: "사이트 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      logger.debug('SitesPage: fetchSites - loading finished');
    }
  }, [setLoading, setSites, toast])

  useEffect(() => {
    fetchSites()
  }, [fetchSites])

  const handleAddSite = () => {
    logger.debug('SitesPage: handleAddSite - Enter');
    setEditingSite(null)
    setIsModalOpen(true)
    logger.debug('SitesPage: handleAddSite - Exit');
  }

  const handleEditSite = (site: Site) => {
    logger.debug('SitesPage: handleEditSite - Enter', { siteId: site.id });
    setEditingSite(site)
    setIsModalOpen(true)
    logger.debug('SitesPage: handleEditSite - Exit');
  }

  const handleDeleteSite = async (id: string) => {
    logger.debug('SitesPage: handleDeleteSite - deleting site', { siteId: id });
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
        logger.info(`SitesPage: Site ${id} deleted successfully.`);
        fetchSites()
      } else {
        logger.debug(`SitesPage: handleDeleteSite - API error, status: ${response.status}`);
        throw new Error("사이트 삭제 실패")
      }
    } catch (error: any) {
      logger.error("SitesPage: Error deleting site:", error.message);
      toast({
        title: "오류",
        description: "사이트 삭제에 실패했습니다.",
        variant: "destructive",
      })
    }
    logger.debug('SitesPage: handleDeleteSite - Exit');
  }

  const handleSubmitSite = async (siteData: Partial<Site>) => {
    logger.debug(`SitesPage: handleSubmitSite - saving site: ${siteData.name}`);
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
        logger.info(`SitesPage: Site ${siteData.id || siteData.name} ${editingSite ? 'updated' : 'added'} successfully.`);
        fetchSites()
      } else {
        logger.debug(`SitesPage: handleSubmitSite - API error, status: ${response.status}`);
        throw new Error(`사이트 ${editingSite ? "수정" : "추가"} 실패`)
      }
    } catch (error: any) {
      logger.error("SitesPage: Error submitting site:", error.message);
      toast({
        title: "오류",
        description: `사이트 ${editingSite ? "수정" : "추가"}에 실패했습니다.`,
        variant: "destructive",
      })
    }
    logger.debug('SitesPage: handleSubmitSite - Exit');
  }

  const filteredSites = sites.filter(site =>
    site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <PageTitle title="사이트 모음" />
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Input
            type="text"
            placeholder="Search sites by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={handleAddSite}>
            <PlusCircledIcon className="mr-2 h-4 w-4" />
            새 사이트 추가
          </Button>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        <Button
          onClick={() => { setViewMode('card'); logger.debug('SitesPage: Card View button clicked'); }}
          variant={viewMode === 'card' ? 'default' : 'outline'}
        >
          카드 보기
        </Button>
        <Button
          onClick={() => { setViewMode('table'); logger.debug('SitesPage: Table View button clicked'); }}
          variant={viewMode === 'table' ? 'default' : 'outline'}
        >
          테이블 보기
        </Button>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground py-8">로딩 중...</p>
      ) : filteredSites.length === 0 ? (
        <p className="col-span-full text-center text-muted-foreground py-8">사이트를 찾을 수 없습니다.</p>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSites.map((site) => (
            <Card key={site.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => { handleEditSite(site); logger.debug(`SitesPage: Card clicked for site: ${site.id}`); }}>
              <CardHeader>
                <CardTitle>{site.name}</CardTitle>
                <p className="text-sm text-gray-500">{site.isSubscribed ? '구독 중' : '구독 안 함'}</p>
              </CardHeader>
              <CardContent>
                <p className="mb-2">{site.description}</p>
                <p className="text-sm">URL: <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{site.url}</a></p>
                <p className="text-sm">사용량: {site.usage}</p>
                <p className="text-sm">카테고리: {site.category}</p>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleEditSite(site); logger.debug(`SitesPage: Edit button clicked for site: ${site.id}`); }}>Edit</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); logger.debug(`SitesPage: Delete button clicked for site: ${site.id}`); }}>Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>정말로 이 사이트를 삭제하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                          이 작업은 되돌릴 수 없습니다. 이 사이트는 영구적으로 삭제되며 데이터는 서버에서 제거됩니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={(e) => { e.stopPropagation(); }}>취소</AlertDialogCancel>
                        <AlertDialogAction onClick={(e) => { e.stopPropagation(); handleDeleteSite(site.id); }}>삭제</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent>
            <SiteTable
              sites={filteredSites}
              onEdit={handleEditSite}
              onDelete={handleDeleteSite}
            />
          </CardContent>
        </Card>
      )}
      
      <SiteFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingSite(null); logger.debug('SitesPage: SiteFormModal closed'); }}
        onSubmit={handleSubmitSite}
        editingSite={editingSite}
      />
      <Toaster />
    </div>
  )
}
