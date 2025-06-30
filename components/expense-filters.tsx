"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { categories } from "@/lib/constants"
import type { Category } from "@/lib/types"

interface ExpenseFiltersProps {
  category: Category | "all"
  setCategory: (category: Category | "all") => void
}

export function ExpenseFilters({ category, setCategory }: ExpenseFiltersProps) {
  return (
    <div className="flex items-center space-x-4">
      <div>
        <h3 className="text-sm font-medium">Category</h3>
        <Select value={category} onValueChange={setCategory} defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
