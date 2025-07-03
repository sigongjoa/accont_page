"use client"

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import logger from '@/lib/logger';
import { ExpenseFilters } from '@/types/expense';
import { useState, useEffect } from 'react';

interface ExpenseFiltersProps {
  initialFilters: ExpenseFilters; // Initial filters from parent
  initialSelectedPeriod: string; // Initial period from parent
  onApplyFilters: (filters: ExpenseFilters, period: string) => void; // Callback to apply filters
  onClearFilters: () => void; // Callback to clear filters
}

export function ExpenseFilters({ initialFilters, initialSelectedPeriod, onApplyFilters, onClearFilters }: ExpenseFiltersProps) {
  logger.debug('ExpenseFilters rendering');
  const [itemSearch, setItemSearch] = useState(initialFilters.search || '');
  const [categoryFilter, setCategoryFilter] = useState(initialFilters.category || '');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState(initialFilters.paymentMethod || '');
  const [statusFilter, setStatusFilter] = useState(initialFilters.status || '');
  const [period, setPeriod] = useState(initialSelectedPeriod);

  useEffect(() => {
    logger.debug('ExpenseFilters useEffect: initialFilters or initialSelectedPeriod changed');
    setItemSearch(initialFilters.search || '');
    setCategoryFilter(initialFilters.category || '');
    setPaymentMethodFilter(initialFilters.paymentMethod || '');
    setStatusFilter(initialFilters.status || '');
    setPeriod(initialSelectedPeriod);
  }, [initialFilters, initialSelectedPeriod]);

  const handleApply = () => {
    logger.debug('ExpenseFilters handleApply called');
    const newFilters: ExpenseFilters = {
      search: itemSearch || undefined,
      category: categoryFilter || undefined,
      paymentMethod: paymentMethodFilter || undefined,
      status: statusFilter || undefined,
    };
    onApplyFilters(newFilters, period);
  };

  const handleClear = () => {
    logger.debug('ExpenseFilters handleClear called');
    setItemSearch('');
    setCategoryFilter('');
    setPaymentMethodFilter('');
    setStatusFilter('');
    // Do not clear period here, as it's typically managed by a separate period selector (e.g., in Header)
    // If period needs to be cleared, the parent component should handle it via onClearFilters callback if it passes period to clear
    onClearFilters();
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">지출 필터</h3>
      </div>
      <div className="p-4 flex flex-wrap items-center gap-4">
        <Input
          placeholder="항목 검색..."
          className="w-[180px]"
          value={itemSearch}
          onChange={(e) => setItemSearch(e.target.value)}
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="카테고리 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 카테고리</SelectItem>
            <SelectItem value="food">식비</SelectItem>
            <SelectItem value="transport">교통비</SelectItem>
            <SelectItem value="housing">주거비</SelectItem>
            {/* Add more categories as needed */}
          </SelectContent>
        </Select>
        <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="결제 수단 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 결제 수단</SelectItem>
            <SelectItem value="card">카드</SelectItem>
            <SelectItem value="cash">현금</SelectItem>
            <SelectItem value="bank_transfer">계좌 이체</SelectItem>
            {/* Add more payment methods as needed */}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="상태 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 상태</SelectItem>
            <SelectItem value="completed">완료</SelectItem>
            <SelectItem value="pending">대기 중</SelectItem>
            <SelectItem value="cancelled">취소됨</SelectItem>
            {/* Add more statuses as needed */}
          </SelectContent>
        </Select>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="기간 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2025-01">2025년 1월</SelectItem>
            <SelectItem value="2024-12">2024년 12월</SelectItem>
            <SelectItem value="2024-11">2024년 11월</SelectItem>
            <SelectItem value="2024-10">2024년 10월</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleApply}>필터 적용</Button>
        <Button variant="outline" onClick={handleClear}>필터 초기화</Button>
      </div>
    </div>
  );
} 