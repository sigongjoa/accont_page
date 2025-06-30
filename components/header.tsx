"use client"

import { Building2, User, Wifi, WifiOff } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface HeaderProps {
  title?: string
  selectedPeriod?: string
  onPeriodChange?: (period: string) => void
}

export function Header({ title, selectedPeriod, onPeriodChange }: HeaderProps) {
  const [isOnline, setIsOnline] = useState(true)

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
        </div>
      </div>
    </header>
  )
}
