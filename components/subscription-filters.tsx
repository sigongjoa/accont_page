"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import type { SubscriptionFilters, Currency, BillingInterval } from "@/types/subscription"

interface SubscriptionFiltersProps {
  filters: SubscriptionFilters;
  onFilterChange: (key: keyof SubscriptionFilters, value: string | undefined) => void;
  displayCurrency: Currency;
  onDisplayCurrencyChange: (currency: Currency) => void;
}

export function SubscriptionFilters({
  filters,
  onFilterChange,
  displayCurrency,
  onDisplayCurrencyChange,
}: SubscriptionFiltersProps) {
  return (
    <div className="flex gap-4 flex-wrap items-center mb-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4" />
        <Input
          placeholder="구독 검색..."
          value={filters.search || ""}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="w-64"
        />
      </div>

      <Select
        value={filters.currency ?? "all"}
        onValueChange={(value) =>
          onFilterChange("currency", value)
        }
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="통화" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">모두</SelectItem>
          <SelectItem value="KRW">KRW</SelectItem>
          <SelectItem value="USD">USD</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.interval ?? "all"}
        onValueChange={(value) =>
          onFilterChange("interval", value)
        }
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="간격" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">모든 간격</SelectItem>
          <SelectItem value="monthly">매월</SelectItem>
          <SelectItem value="quarterly">분기별</SelectItem>
          <SelectItem value="yearly">매년</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
        <span className="text-sm">표시 통화:</span>
        <Button
          variant={displayCurrency === "KRW" ? "default" : "ghost"}
          size="sm"
          onClick={() => onDisplayCurrencyChange("KRW")}
        >
          KRW
        </Button>
        <Button
          variant={displayCurrency === "USD" ? "default" : "ghost"}
          size="sm"
          onClick={() => onDisplayCurrencyChange("USD")}
        >
          USD
        </Button>
      </div>
    </div>
  );
}
