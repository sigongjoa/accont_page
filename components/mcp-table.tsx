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
import type { Mcp } from "@/types/mcp"
import logger from '@/lib/logger';

interface McpTableProps {
  mcpData: Mcp[];
}

export const McpTable: React.FC<McpTableProps> = ({ mcpData }) => {
  logger.debug('McpTable rendered', { mcpData });

  const columns: ColumnDef<Mcp>[] = [
    {
      accessorKey: "name",
      header: "이름",
    },
    {
      accessorKey: "provider",
      header: "제공자",
    },
    {
      accessorKey: "region",
      header: "지역",
    },
    {
      accessorKey: "status",
      header: "상태",
    },
    {
      accessorKey: "description",
      header: "설명",
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
      accessorKey: "updated_at",
      header: "업데이트일",
      cell: ({ row }) => {
        const date = new Date(row.getValue("updated_at"))
        return date.toLocaleDateString();
      },
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">MCP 목록</h3>
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
            {mcpData.length ? (
              mcpData.map((mcpEntry) => (
                <tr key={mcpEntry.id} className="table-row">
                  <td className="table-cell table-cell-font-medium">
                    {typeof columns[0].cell === 'function' ? columns[0].cell({ row: { original: mcpEntry, getValue: (key: string) => (mcpEntry as any)[key] } } as any) : (mcpEntry as any)[columns[0].accessorKey as keyof Mcp]}
                  </td>
                  <td className="table-cell">
                    {typeof columns[1].cell === 'function' ? columns[1].cell({ row: { original: mcpEntry, getValue: (key: string) => (mcpEntry as any)[key] } } as any) : (mcpEntry as any)[columns[1].accessorKey as keyof Mcp]}
                  </td>
                  <td className="table-cell">
                    {typeof columns[2].cell === 'function' ? columns[2].cell({ row: { original: mcpEntry, getValue: (key: string) => (mcpEntry as any)[key] } } as any) : (mcpEntry as any)[columns[2].accessorKey as keyof Mcp]}
                  </td>
                  <td className="table-cell">
                    {typeof columns[3].cell === 'function' ? columns[3].cell({ row: { original: mcpEntry, getValue: (key: string) => (mcpEntry as any)[key] } } as any) : (mcpEntry as any)[columns[3].accessorKey as keyof Mcp]}
                  </td>
                  <td className="table-cell">
                    {typeof columns[4].cell === 'function' ? columns[4].cell({ row: { original: mcpEntry, getValue: (key: string) => (mcpEntry as any)[key] } } as any) : (mcpEntry as any)[columns[4].accessorKey as keyof Mcp]}
                  </td>
                  <td className="table-cell">
                    {typeof columns[5].cell === 'function' ? columns[5].cell({ row: { original: mcpEntry, getValue: (key: string) => (mcpEntry as any)[key] } } as any) : (mcpEntry as any)[columns[5].accessorKey as keyof Mcp]}
                  </td>
                  <td className="table-cell">
                    {typeof columns[6].cell === 'function' ? columns[6].cell({ row: { original: mcpEntry, getValue: (key: string) => (mcpEntry as any)[key] } } as any) : (mcpEntry as any)[columns[6].accessorKey as keyof Mcp]}
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