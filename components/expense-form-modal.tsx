"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Expense, ExpenseCategory, ExpenseStatus, PaymentMethod } from "@/types/expense"
import logger from "@/lib/logger"

const formSchema = z.object({
  date: z.string().min(1, { message: "날짜를 선택해주세요." }),
  item: z.string().min(2, { message: "항목 설명은 2자 이상이어야 합니다." }).max(100, { message: "항목 설명은 100자 이내여야 합니다." }),
  category: z.enum(["고정비", "변동비", "프로젝트", "기타"], { message: "카테고리를 선택해주세요." }),
  amount: z.string().min(1, { message: "금액을 입력해주세요." }).refine((val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) > 0, { message: "유효한 금액을 입력해주세요." }),
  paymentMethod: z.enum(["계좌이체", "카드", "현금", "기타"], { message: "결제방법을 선택해주세요." }),
  status: z.enum(["대기중", "지불완료", "취소됨"], { message: "상태를 선택해주세요." }),
  currency: z.enum(["KRW", "USD"]).default("KRW"),
})

interface ExpenseFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (expense: Partial<Expense>) => Promise<void>
  expense?: Expense | null
}

export function ExpenseFormModal({ isOpen, onClose, onSubmit, expense }: ExpenseFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      item: "",
      category: "기타",
      amount: "",
      paymentMethod: "카드",
      status: "대기중",
      currency: "KRW",
    },
  })

  useEffect(() => {
    logger.debug("ExpenseFormModal useEffect: isOpen changed", { isOpen })
    if (expense) {
      form.reset({
        date: expense.date,
        item: expense.item,
        category: expense.category as ExpenseCategory,
        amount: expense.amount.toString(),
        paymentMethod: expense.paymentMethod as PaymentMethod,
        status: expense.status as ExpenseStatus,
        currency: expense.currency as "KRW" | "USD",
      })
    } else {
      form.reset({
        date: new Date().toISOString().split("T")[0],
        item: "",
        category: "기타",
        amount: "",
        paymentMethod: "카드",
        status: "대기중",
        currency: "KRW",
      })
    }
  }, [expense, form])

  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit({ ...expense, ...values, amount: Number.parseFloat(values.amount) })
    onClose()
    form.reset()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{expense ? "지출 수정" : "새 지출 추가"}</DialogTitle>
          <DialogDescription>
            {expense ? "지출 정보를 수정하세요." : "새로운 지출 정보를 입력하세요."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>날짜</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="item"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>항목 설명</FormLabel>
                  <FormControl>
                    <Input placeholder="지출 내용을 입력하세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>카테고리</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="고정비">고정비</SelectItem>
                      <SelectItem value="변동비">변동비</SelectItem>
                      <SelectItem value="프로젝트">프로젝트</SelectItem>
                      <SelectItem value="기타">기타</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>금액</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>통화</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="KRW">KRW (₩)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>결제방법</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="결제방법 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="계좌이체">계좌이체</SelectItem>
                      <SelectItem value="카드">카드</SelectItem>
                      <SelectItem value="현금">현금</SelectItem>
                      <SelectItem value="기타">기타</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>상태</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="상태 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="대기중">대기중</SelectItem>
                      <SelectItem value="지불완료">지불완료</SelectItem>
                      <SelectItem value="취소됨">취소됨</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {expense ? "저장" : "추가"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                취소
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}