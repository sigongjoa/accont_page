"use client"

import { useState, useEffect, useCallback } from "react"
import PageTitle from "@/components/PageTitle"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { AiModelTable } from "@/components/ai-model-table"
import type { AiModel } from "@/types/ai_model"
import logger from '@/lib/logger';

export default function ModelsPage() {
  logger.debug('ModelsPage component rendered');

  const [aiModels, setAiModels] = useState<AiModel[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchAiModels = useCallback(async () => {
    logger.debug('fetchAiModels function called');
    try {
      setLoading(true)
      const response = await fetch("/api/ai_models")
      if (!response.ok) {
        logger.debug(`Failed to fetch AI models: ${response.statusText}`);
        throw new Error("Failed to fetch AI models")
      }
      const data: AiModel[] = await response.json()
      setAiModels(data)
      logger.debug('AI Models fetched successfully', { data });
    } catch (error: any) {
      console.error("Error fetching AI models:", error)
      toast({
        title: "오류",
        description: `AI 모델 데이터를 불러오는데 실패했습니다: ${error.message}`,
        variant: "destructive",
      })
      logger.debug('Error fetching AI models', { error });
    } finally {
      setLoading(false)
      logger.debug('fetchAiModels function finished');
    }
  }, [toast])

  useEffect(() => {
    logger.debug('useEffect: fetchAiModels call');
    fetchAiModels()
  }, [fetchAiModels])

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col p-6">
        <PageTitle title="AI 모델" icon="smart_toy" />
        {loading ? (
          <div>로딩 중...</div>
        ) : (
          <AiModelTable
            aiModels={aiModels}
          />
        )}
        <Toaster />
      </main>
    </div>
  )
} 