"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Expense, ExpenseCategory, ExpenseStatus, PaymentMethod } from "@/types/expense"

interface ExpenseFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (expense: Partial<Expense>) => void
  expense?: Expense | null
}

export function ExpenseFormModal({ isOpen, onClose, onSubmit, expense }: ExpenseFormModalProps) {
  const [formData, setFormData] = useState({
    date: "",
    item: "",
    category: "" as ExpenseCategory,
    amount: "",
    paymentMethod: "" as PaymentMethod,
    status: "" as ExpenseStatus,
    currency: "KRW",
  })

  useEffect(() => {
    if (expense) {
      setFormData({
        date: expense.date,
        item: expense.item,
        category: expense.category,
        amount: expense.amount.toString(),
        paymentMethod: expense.paymentMethod,
        status: expense.status,
        currency: expense.currency,
      })
    } else {
      setFormData({
        date: new Date().toISOString().split("T")[0],
        item: "",
        category: "" as ExpenseCategory,
        amount: "",
        paymentMethod: "" as PaymentMethod,
        status: "대기중",
        currency: "KRW",
      })
    }
  }, [expense, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      amount: Number.parseFloat(formData.amount),
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{expense ? "지출 수정" : "새 지출 추가"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">날짜</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="item">항목 설명</Label>
            <Input
              id="item"
              value={formData.item}
              onChange={(e) => setFormData({ ...formData, item: e.target.value })}
              placeholder="지출 내용을 입력하세요"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">카테고리</Label>
            <Select
              value={formData.category}
              onValueChange={(value: ExpenseCategory) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="고정비">고정비</SelectItem>
                <SelectItem value="변동비">변동비</SelectItem>
                <SelectItem value="프로젝트">프로젝트</SelectItem>
                <SelectItem value="기타">기타</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">금액</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0"
              required
            />
          </div>

          <div>
            <Label htmlFor="paymentMethod">결제방법</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value: PaymentMethod) => setFormData({ ...formData, paymentMethod: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="결제방법 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="계좌이체">계좌이체</SelectItem>
                <SelectItem value="카드">카드</SelectItem>
                <SelectItem value="현금">현금</SelectItem>
                <SelectItem value="기타">기타</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">상태</Label>
            <Select
              value={formData.status}
              onValueChange={(value: ExpenseStatus) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="대기중">대기중</SelectItem>
                <SelectItem value="지불완료">지불완료</SelectItem>
                <SelectItem value="취소됨">취소됨</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit">{expense ? "수정" : "추가"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
