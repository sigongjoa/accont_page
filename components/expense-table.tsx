import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Expense } from "@/types/expense";
import logger from '@/lib/logger';

interface ExpenseTableProps {
  expenses: Expense[];
}

export function ExpenseTable({ expenses }: ExpenseTableProps) {
  logger.debug('ExpenseTable rendering');
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">지출 목록</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="table-header">
            <tr>
              <th className="px-6 py-3" scope="col">날짜</th>
              <th className="px-6 py-3" scope="col">항목</th>
              <th className="px-6 py-3" scope="col">카테고리</th>
              <th className="px-6 py-3 text-right" scope="col">금액</th>
              <th className="px-6 py-3" scope="col">통화</th>
              <th className="px-6 py-3" scope="col">결제 수단</th>
              <th className="px-6 py-3" scope="col">상태</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr className="table-row">
                <td className="table-cell text-center py-8 text-muted-foreground" colSpan={7}>
                  지출 내역이 없습니다.
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id} className="table-row">
                  <td className="table-cell table-cell-font-medium">{expense.date}</td>
                  <td className="table-cell">{expense.item}</td>
                  <td className="table-cell">{expense.category}</td>
                  <td className="table-cell text-right">{expense.amount}</td>
                  <td className="table-cell">{expense.currency}</td>
                  <td className="table-cell">{expense.paymentMethod}</td>
                  <td className="table-cell">{expense.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 