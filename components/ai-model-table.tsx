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
import type { AiModel } from "@/types/ai_model"
import logger from '@/lib/logger';

interface AiModelTableProps {
  aiModels: AiModel[];
}

export const AiModelTable: React.FC<AiModelTableProps> = ({ aiModels }) => {
  logger.debug('AiModelTable rendered', { aiModels });

  const columns: ColumnDef<AiModel>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "created_at",
      header: "생성일",
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"))
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: "desc",
      header: "설명",
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
    {
      accessorKey: "use",
      header: "사용",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">AI 모델 목록</h3>
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
            {aiModels.length ? (
              aiModels.map((aiModel) => (
                <tr key={aiModel.id} className="table-row">
                  <td className="table-cell table-cell-font-medium">
                    {typeof columns[0].cell === 'function' ? columns[0].cell({ row: { original: aiModel, getValue: (key: string) => (aiModel as any)[key] } } as any) : (aiModel as any)[columns[0].accessorKey as keyof AiModel]}
                  </td>
                  <td className="table-cell">
                    {typeof columns[1].cell === 'function' ? columns[1].cell({ row: { original: aiModel, getValue: (key: string) => (aiModel as any)[key] } } as any) : (aiModel as any)[columns[1].accessorKey as keyof AiModel]}
                  </td>
                  <td className="table-cell">
                    {typeof columns[2].cell === 'function' ? columns[2].cell({ row: { original: aiModel, getValue: (key: string) => (aiModel as any)[key] } } as any) : (aiModel as any)[columns[2].accessorKey as keyof AiModel]}
                  </td>
                  <td className="table-cell">
                    {typeof columns[3].cell === 'function' ? columns[3].cell({ row: { original: aiModel, getValue: (key: string) => (aiModel as any)[key] } } as any) : (aiModel as any)[columns[3].accessorKey as keyof AiModel]}
                  </td>
                  <td className="table-cell">
                    {typeof columns[4].cell === 'function' ? columns[4].cell({ row: { original: aiModel, getValue: (key: string) => (aiModel as any)[key] } } as any) : (aiModel as any)[columns[4].accessorKey as keyof AiModel]}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="table-row">
                <td className="table-cell text-center py-8 text-muted-foreground" colSpan={columns.length}>
                  AI 모델이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 