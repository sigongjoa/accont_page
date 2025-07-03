"use client"

import { useState, useEffect, useCallback } from "react"
import PageTitle from "@/components/PageTitle"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { RepoTable } from "@/components/repo-table"
import type { Repo } from "@/types/repo"
import logger from '@/lib/logger';

export default function RepositoriesPage() {
  logger.debug('RepositoriesPage component rendered');

  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchRepos = useCallback(async () => {
    logger.debug('fetchRepos function called');
    try {
      setLoading(true)
      const response = await fetch("/api/repositories")
      if (!response.ok) {
        logger.debug(`Failed to fetch repositories: ${response.statusText}`);
        throw new Error("Failed to fetch repositories")
      }
      const data: Repo[] = await response.json()
      setRepos(data)
      logger.debug('Repos fetched successfully', { data });
    } catch (error: any) {
      console.error("Error fetching repositories:", error)
      toast({
        title: "오류",
        description: `리포지토리 데이터를 불러오는데 실패했습니다: ${error.message}`,
        variant: "destructive",
      })
      logger.debug('Error fetching repos', { error });
    } finally {
      setLoading(false)
      logger.debug('fetchRepos function finished');
    }
  }, [toast])

  useEffect(() => {
    logger.debug('useEffect: fetchRepos call');
    fetchRepos()
  }, [fetchRepos])

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col p-6">
        <PageTitle title="리포지토리" icon="code" />
        {loading ? (
          <div>로딩 중...</div>
        ) : (
          <RepoTable
            repos={repos}
          />
        )}
        <Toaster />
      </main>
    </div>
  )
} 