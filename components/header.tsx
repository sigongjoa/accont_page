"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"
import { useIsMobile } from "@/hooks/use-mobile"

interface HeaderProps {
  title?: string
  selectedPeriod?: string
  onPeriodChange?: (period: string) => void
  onAddExpense?: () => void
  onAddSite?: () => void
  onAddSubscription?: () => void
}

export function Header({
  title,
  selectedPeriod,
  onPeriodChange,
  onAddExpense,
  onAddSite,
  onAddSubscription,
}: HeaderProps) {
  const [isOnline, setIsOnline] = useState(true)
  const isMobile = useIsMobile()

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    setIsOnline(navigator.onLine)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return (
    <header className="bg-white border-b border-gray-200 flex items-center justify-between p-4">
      <div className="flex items-center">
        <button className="text-gray-500 mr-4 md:hidden">
          <span className="material-icons">menu</span>
        </button>
        <div className="flex items-center space-x-2">
          <a className="header-link" href="#">즐겨찾기 가이드</a>
          <span className="header-link-separator">/</span>
          <a className="header-link" href="#">View 1</a>
          <span className="header-link-separator">/</span>
          <a className="header-link" href="#">Todo</a>
          <span className="header-link-separator">/</span>
          <a className="header-link" href="#">ChatGPT</a>
          <span className="header-link-separator">/</span>
          <a className="header-link" href="#">큰 타이틀 / 모집...</a>
          <span className="header-link-separator">/</span>
          <a className="header-link" href="#">vercel_deploy_m...</a>
          <span className="header-link-separator">/</span>
          <a className="header-link" href="#">r7개발중</a>
          <span className="header-link-separator">/</span>
          <a className="header-link" href="#">구축 관리</a>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-gray-500 hover:text-gray-800">
          <span className="material-icons">search</span>
        </button>
        <button className="text-gray-500 hover:text-gray-800">
          <span className="material-icons">notifications</span>
        </button>
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
          <span className="material-icons text-white">person</span>
        </div>
      </div>
    </header>
  )
}
