"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { categories, expenseStatuses } from "@/lib/constants"
import type { ExpenseFilters } from "@/types/expense"

interface ExpenseFiltersProps {
  filters: ExpenseFilters;
  setFilters: (filters: ExpenseFilters) => void;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
}

export function ExpenseFilters({ filters, setFilters, selectedPeriod, setSelectedPeriod }: ExpenseFiltersProps) {
  const handleFilterChange = (key: keyof ExpenseFilters, value: string | undefined) => {
    setFilters({
      ...filters,
      [key]: value === "all" ? undefined : value,
    });
  };

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
  };

  const generatePeriodOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) { // Generate options for the last 12 months
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      options.push(`${year}-${month}`);
    }
    return options;
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Period Filter */}
      <div>
        <h3 className="text-sm font-medium">기간</h3>
        <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="기간 선택" />
          </SelectTrigger>
          <SelectContent>
            {generatePeriodOptions().map((period) => (
              <SelectItem key={period} value={period}>
                {period.replace('-', '년 ') + '월'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category Filter */}
      <div>
        <h3 className="text-sm font-medium">카테고리</h3>
        <Select value={filters.category || "all"} onValueChange={(value) => handleFilterChange("category", value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="모두" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모두</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status Filter */}
      <div>
        <h3 className="text-sm font-medium">상태</h3>
        <Select value={filters.status || "all"} onValueChange={(value) => handleFilterChange("status", value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="모두" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모두</SelectItem>
            {expenseStatuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Search Input */}
      <div>
        <h3 className="text-sm font-medium">검색</h3>
        <Input
          placeholder="항목 검색..."
          value={filters.search || ""}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="w-[180px]"
        />
      </div>

      {/* Clear Filters Button */}
      <Button
        variant="outline"
        onClick={() => {
          setFilters({});
          const now = new Date();
          const year = now.getFullYear();
          const month = (now.getMonth() + 1).toString().padStart(2, '0');
          setSelectedPeriod(`${year}-${month}`);
        }}
      >
        필터 초기화
      </Button>
    </div>
  );
}