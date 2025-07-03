"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Site } from "@/types/site"
import logger from '@/lib/logger';

interface SiteTableProps {
  sites: Site[];
}

export function SiteTable({ sites }: SiteTableProps) {
  logger.debug('SiteTable rendering');
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">사이트 목록</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="table-header">
            <tr>
              <th className="px-6 py-3" scope="col">사이트명</th>
              <th className="px-6 py-3" scope="col">사이트 설명</th>
              <th className="px-6 py-3" scope="col">URL</th>
              <th className="px-6 py-3" scope="col">카테고리</th>
              <th className="px-6 py-3" scope="col">서브 카테고리</th>
              <th className="px-6 py-3" scope="col">구독 여부</th>
              <th className="px-6 py-3" scope="col">리뷰 여부</th>
              <th className="px-6 py-3" scope="col">벤치마크 여부</th>
              <th className="px-6 py-3" scope="col">현재 사용 플랜</th>
            </tr>
          </thead>
          <tbody>
            {sites.length > 0 ? (
              sites.map((site) => (
                <tr key={site.id} className="table-row">
                  <td className="table-cell table-cell-font-medium">{site.name}</td>
                  <td className="table-cell">{site.description}</td>
                  <td className="table-cell"><a href={site.url} target="_blank" rel="noopener noreferrer" className="table-link">{site.url}</a></td>
                  <td className="table-cell">{site.category}</td>
                  <td className="table-cell">{site.sub_category || '-'}</td>
                  <td className="table-cell">
                    <span className={site.isSubscribed ? "status-badge-subscribed" : "status-badge-unsubscribed"}>
                      {site.isSubscribed ? "구독" : "미구독"}
                    </span>
                  </td>
                  <td className="table-cell">{site.is_review ? '예' : '아니오'}</td>
                  <td className="table-cell">{site.is_benckmark ? '예' : '아니오'}</td>
                  <td className="table-cell">{site.usage}</td>
                </tr>
              ))
            ) : (
              <tr className="table-row">
                <td className="table-cell text-center py-8 text-muted-foreground" colSpan={9}>
                  사이트 목록이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
