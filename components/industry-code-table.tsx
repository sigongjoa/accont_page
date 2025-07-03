"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { IndustryCode } from "@/types/industry_code"
import logger from '@/lib/logger';

interface IndustryCodeTableProps {
  industryCodes: IndustryCode[];
}

export const IndustryCodeTable: React.FC<IndustryCodeTableProps> = ({ industryCodes }) => {
  logger.debug('IndustryCodeTable rendered', { industryCodes });

  const columns: ColumnDef<IndustryCode>[] = [
    {
      accessorKey: "code_category",
      header: "대분류 코드분류 기호",
    },
    {
      accessorKey: "category_name",
      header: "분류명",
    },
    {
      accessorKey: "code_range",
      header: "코드 범위",
    },
    {
      accessorKey: "kpi",
      header: "KPI",
    },
    {
      accessorKey: "progress",
      header: "진행 상황",
    },
    {
      accessorKey: "link",
      header: "링크",
      cell: ({ row }) => (
        <a href={row.original.link || '#'} target="_blank" rel="noopener noreferrer" className="table-link">
          {row.original.link ? "링크" : "-"}
        </a>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">업종분류코드 목록</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="table-header">
            <tr>
              {columns.map((column, index) => (
                <th key={index} className="px-6 py-3" scope="col">{column.header as React.ReactNode}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {industryCodes.length ? (
              industryCodes.map((industryCode) => (
                <tr key={industryCode.id} className="table-row">
                  <td className="table-cell table-cell-font-medium">
                    {typeof columns[0].cell === 'function' ? columns[0].cell({ row: { original: industryCode, getValue: (key: string) => (industryCode as any)[key] } } as any) : (industryCode as any)[columns[0].accessorKey as keyof IndustryCode]}
                  </td>
                  <td className="table-cell">
                    {typeof columns[1].cell === 'function' ? columns[1].cell({ row: { original: industryCode, getValue: (key: string) => (industryCode as any)[key] } } as any) : (industryCode as any)[columns[1].accessorKey as keyof IndustryCode]}
                  </td>
                  <td className="table-cell">
                    {typeof columns[2].cell === 'function' ? columns[2].cell({ row: { original: industryCode, getValue: (key: string) => (industryCode as any)[key] } } as any) : (industryCode as any)[columns[2].accessorKey as keyof IndustryCode]}
                  </td>
                  <td className="table-cell">
                    {typeof columns[3].cell === 'function' ? columns[3].cell({ row: { original: industryCode, getValue: (key: string) => (industryCode as any)[key] } } as any) : (industryCode as any)[columns[3].accessorKey as keyof IndustryCode]}
                  </td>
                  <td className="table-cell">
                    {typeof columns[4].cell === 'function' ? columns[4].cell({ row: { original: industryCode, getValue: (key: string) => (industryCode as any)[key] } } as any) : (industryCode as any)[columns[4].accessorKey as keyof IndustryCode]}
                  </td>
                  <td className="table-cell">
                    {typeof columns[5].cell === 'function' ? columns[5].cell({ row: { original: industryCode, getValue: (key: string) => (industryCode as any)[key] } } as any) : (industryCode as any)[columns[5].accessorKey as keyof IndustryCode]}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="table-row">
                <td className="table-cell text-center py-8 text-muted-foreground" colSpan={columns.length}>
                  데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};