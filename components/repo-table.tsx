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
import type { Repo } from "@/types/repo"
import logger from '@/lib/logger';

interface RepoTableProps {
  repos: Repo[];
}

export const RepoTable: React.FC<RepoTableProps> = ({ repos }) => {
  logger.debug('RepoTable rendered', { repos });

  const columns: ColumnDef<Repo>[] = [
    {
      accessorKey: "reop_id",
      header: "리포지토리 ID",
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
      accessorKey: "when_use",
      header: "사용 시점",
    },
    {
      accessorKey: "env",
      header: "환경",
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
        <h3 className="text-lg font-semibold text-gray-800">리포지토리 목록</h3>
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
            {repos.length ? (
              repos.map((repo) => (
                <tr key={repo.reop_id} className="table-row">
                  <td className="table-cell table-cell-font-medium">
                    {typeof columns[0].cell === 'function' ? columns[0].cell({ row: { original: repo, getValue: (key: string) => (repo as any)[key] } } as any) : (repo as any)[columns[0].accessorKey as keyof Repo]}
                  </td>
                  <td className="table-cell">
                    {typeof columns[1].cell === 'function' ? columns[1].cell({ row: { original: repo, getValue: (key: string) => (repo as any)[key] } } as any) : (repo as any)[columns[1].accessorKey as keyof Repo]}
                  </td>
                  <td className="table-cell">
                    {typeof columns[2].cell === 'function' ? columns[2].cell({ row: { original: repo, getValue: (key: string) => (repo as any)[key] } } as any) : (repo as any)[columns[2].accessorKey as keyof Repo]}
                  </td>
                  <td className="table-cell">
                    {typeof columns[3].cell === 'function' ? columns[3].cell({ row: { original: repo, getValue: (key: string) => (repo as any)[key] } } as any) : (repo as any)[columns[3].accessorKey as keyof Repo]}
                  </td>
                  <td className="table-cell">
                    {typeof columns[4].cell === 'function' ? columns[4].cell({ row: { original: repo, getValue: (key: string) => (repo as any)[key] } } as any) : (repo as any)[columns[4].accessorKey as keyof Repo]}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="table-row">
                <td className="table-cell text-center py-8 text-muted-foreground" colSpan={columns.length}>
                  리포지토리가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 