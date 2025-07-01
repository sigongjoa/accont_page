"use client"

import { Building2, User, Wifi, WifiOff } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PlusCircle } from "lucide-react"
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
    <header className="border-b bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-8 w-8 text-blue-600" />
          <h1 className="text-xl font-semibold">{title || "지출 관리 시스템"}</h1>
          <Badge variant={isOnline ? "default" : "destructive"} className="ml-2">
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                온라인
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                오프라인
              </>
            )}
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          {selectedPeriod && onPeriodChange && (
            <Select value={selectedPeriod} onValueChange={onPeriodChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025-01">2025년 1월</SelectItem>
                <SelectItem value="2024-12">2024년 12월</SelectItem>
                <SelectItem value="2024-11">2024년 11월</SelectItem>
                <SelectItem value="2024-10">2024년 10월</SelectItem>
              </SelectContent>
            </Select>
          )}

          {onAddExpense && !isMobile && (
            <Button
              onClick={() => {
                console.log("Header: '지출 추가' 버튼 클릭됨");
                if (onAddExpense) onAddExpense();
              }}
              size="sm"
              className="h-8 gap-1"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">지출 추가</span>
            </Button>
          )}

          {onAddSite && !isMobile && (
            <Button onClick={onAddSite} size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">사이트 추가</span>
            </Button>
          )}

          {onAddSubscription && !isMobile && (
            <Button onClick={onAddSubscription} size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">구독 추가</span>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>프로필</DropdownMenuItem>
              <DropdownMenuItem>설정</DropdownMenuItem>
              <DropdownMenuItem>로그아웃</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Building2 className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <Sidebar />
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  )
}
