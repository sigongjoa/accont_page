import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import logger from '@/lib/logger';

interface Paper {
  id: string;
  paper_id: string;
  external_id: string | null;
  platform: string;
  title: string;
  abstract: string;
  authors: any[]; 
  categories: any[]; 
  pdf_url: string | null;
  published_date: string;
  updated_date: string;
  year: number | null;
  references_ids: any[]; 
  cited_by_ids: any[]; 
  animation_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface PaperTableProps {
  papers: Paper[];
}

export function PaperTable({ papers }: PaperTableProps) {
  logger.debug('PaperTable rendering');
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">논문 목록</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="table-header">
            <tr>
              <th className="px-6 py-3" scope="col">제목</th>
              <th className="px-6 py-3" scope="col">저자</th>
              <th className="px-6 py-3" scope="col">요약</th>
              <th className="px-6 py-3" scope="col">카테고리</th>
              <th className="px-6 py-3" scope="col">플랫폼</th>
              <th className="px-6 py-3" scope="col">발행일</th>
              <th className="px-6 py-3" scope="col">PDF</th>
              <th className="px-6 py-3" scope="col">애니메이션</th>
            </tr>
          </thead>
          <tbody>
            {papers.length === 0 ? (
              <tr className="table-row">
                <td className="table-cell text-center py-8 text-muted-foreground" colSpan={8}>
                  논문 데이터가 없습니다. Supabase에 데이터를 추가해주세요.
                </td>
              </tr>
            ) : (
              papers.map((paper) => (
                <tr key={paper.id} className="table-row">
                  <td className="table-cell table-cell-font-medium">{paper.title}</td>
                  <td className="table-cell">{paper.authors.map((author: any) => author.name).join(', ')}</td>
                  <td className="table-cell w-[300px]">{paper.abstract}</td>
                  <td className="table-cell">{paper.categories.join(', ')}</td>
                  <td className="table-cell">{paper.platform}</td>
                  <td className="table-cell">{new Date(paper.published_date).toLocaleDateString()}</td>
                  <td className="table-cell">
                    {paper.pdf_url && (
                      <a href={paper.pdf_url} target="_blank" rel="noopener noreferrer" className="table-link">
                        PDF 보기
                      </a>
                    )}
                  </td>
                  <td className="table-cell">
                    {paper.animation_url && (
                      <a href={paper.animation_url} target="_blank" rel="noopener noreferrer" className="table-link">
                        애니메이션 보기
                      </a>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 