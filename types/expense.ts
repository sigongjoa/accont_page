export type ExpenseCategory = "고정비" | "변동비" | "프로젝트" | "기타"
export type ExpenseStatus = "대기중" | "지불완료" | "취소됨"
export type PaymentMethod = "계좌이체" | "카드" | "현금" | "기타"

export interface Expense {
  id: string
  date: string
  item: string
  category: ExpenseCategory
  amount: number
  currency: string
  paymentMethod: PaymentMethod
  status: ExpenseStatus
  receiptUrl?: string
  projectId?: string
  createdAt: string
  updatedAt: string
}

export interface ExpenseSummary {
  totalAmount: number
  fixedPercentage: number
  variablePercentage: number
  projectPercentage: number
  otherPercentage: number
}

export interface ExpenseFilters {
  dateFrom?: string
  dateTo?: string
  category?: ExpenseCategory
  status?: ExpenseStatus
  search?: string
}
