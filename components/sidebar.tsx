"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const pathname = usePathname()

  const navCategories = [
    {
      title: "재무 관리",
      items: [
        {
          name: "지출",
          href: "/expenses",
          icon: "account_balance_wallet",
        },
        {
          name: "구독",
          href: "/subscriptions",
          icon: "subscriptions",
        },
      ],
    },
    {
      title: "분석 & 자료",
      items: [
        {
          name: "사이트",
          href: "/sites",
          icon: "language",
        },
        {
          name: "서비스",
          href: "/services",
          icon: "list_alt",
        },
        {
          name: "논문",
          href: "/papers",
          icon: "article",
        },
      ],
    },
    {
      title: "AI & 개발",
      items: [
        {
          name: "AI 모델",
          href: "/models",
          icon: "smart_toy",
        },
        {
          name: "MCP",
          href: "/mcp",
          icon: "cloud",
        },
        {
          name: "GitHub 리포",
          href: "/repositories",
          icon: "code",
        },
      ],
    },
    {
      title: "실전 개발",
      items: [
        {
          name: "업종분류코드",
          href: "/industry_codes",
          icon: "inventory_2",
        },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Account Tracker</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navCategories.map((category) => (
          <div key={category.title} className="mb-4">
            <h3 className="mb-2 px-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">
              {category.title}
            </h3>
            <div className="grid gap-1">
              {category.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100",
                      isActive && "bg-blue-50 text-blue-600 font-semibold"
                    )}
                  >
                    <span className="material-icons mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold mr-3">
            N
          </div>
          <div>
            <p className="font-semibold text-gray-800">nagahama2001</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
