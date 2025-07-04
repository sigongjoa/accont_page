"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Wallet, Repeat, Globe, FileText } from "lucide-react"
import { Settings, Brain, Github } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    {
      name: "구독",
      href: "/subscriptions",
      icon: Repeat,
    },
    {
      name: "사이트",
      href: "/sites",
      icon: Globe,
    },
    {
      name: "Services",
      href: "/services",
      icon: Settings,
    },
    {
      name: "AI Models",
      href: "/models",
      icon: Brain,
    },
    {
      name: "GitHub Repos",
      href: "/repositories",
      icon: Github,
    },
    {
      name: "Research Papers",
      href: "/papers",
      icon: FileText,
    },
  ]

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span>Account Tracker</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    isActive && "bg-muted text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
