"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Site } from "@/types/site"
import { Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SiteTableProps {
  sites: Site[];
  onEdit: (site: Site) => void;
  onDelete: (id: string) => void;
}

export function SiteTable({ sites, onEdit, onDelete }: SiteTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>사이트 목록</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>사이트명</TableHead>
              <TableHead>사이트 설명</TableHead>
              <TableHead>카테고리</TableHead>
              <TableHead>구독 여부</TableHead>
              <TableHead>현재 사용량</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sites.length > 0 ? (
              sites.map((site) => (
                <TableRow key={site.id}>
                  <TableCell className="font-medium">{site.name}</TableCell>
                  <TableCell>{site.description}</TableCell>
                  <TableCell>{site.category}</TableCell>
                  <TableCell>
                    <Badge variant={site.isSubscribed ? "default" : "secondary"}>
                      {site.isSubscribed ? "구독 중" : "미구독"}
                    </Badge>
                  </TableCell>
                  <TableCell>{site.usage}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(site)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(site.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  사이트 목록이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
