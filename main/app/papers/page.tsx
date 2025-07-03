'use client';

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import PageTitle from '@/components/PageTitle';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import logger from '@/lib/logger';

interface Paper {
  id: string;
  paper_id: string;
  external_id: string | null;
  platform: string;
  title: string;
  abstract: string;
  authors: string[];
  categories: string[];
  pdf_url: string | null;
  embedding: number[] | null;
  published_date: string;
  updated_date: string;
  year: number | null;
  references_ids: string[];
  cited_by_ids: string[];
  animation_url: string | null;
}

export default function PapersPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  useEffect(() => {
    logger.debug('PapersPage: useEffect - fetching papers');
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    logger.debug('PapersPage: fetchPapers - fetching data from /api/papers');
    try {
      setLoading(true);
      const response = await fetch('/api/papers');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Paper[] = await response.json();
      setPapers(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaperClick = (paper: Paper) => {
    logger.debug(`PapersPage: handlePaperClick - paper selected: ${paper.id}`);
    setSelectedPaper(paper);
  };

  const uniqueCategories = Array.from(new Set(papers.flatMap(paper => paper.categories)));

  const filteredPapers = papers.filter(paper => {
    const matchesSearchTerm = paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              paper.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              paper.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategories = selectedCategories.length === 0 || selectedCategories.every(category => paper.categories.includes(category));
    return matchesSearchTerm && matchesCategories;
  });

  const handleCategoryClick = (category: string) => {
    logger.debug(`PapersPage: handleCategoryClick - category clicked: ${category}`);
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  if (loading) return <div className="p-4">Loading papers...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <PageTitle title="Research Papers" />
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search papers by title, abstract, or author..."
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {uniqueCategories.map(category => (
              <Button
                key={category}
                onClick={() => handleCategoryClick(category)}
                variant={selectedCategories.includes(category) ? 'default' : 'outline'}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
            <Button
              onClick={() => setSelectedCategories([])}
              variant={selectedCategories.length === 0 ? 'default' : 'outline'}
              className="rounded-full"
            >
              All Categories
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setViewMode('card')}
              variant={viewMode === 'card' ? 'default' : 'outline'}
            >
              Card View
            </Button>
            <Button
              onClick={() => setViewMode('table')}
              variant={viewMode === 'table' ? 'default' : 'outline'}
            >
              Table View
            </Button>
          </div>
        </div>
      </div>
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.map((paper) => (
            <Card key={paper.id} className="flex flex-col cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handlePaperClick(paper)}>
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">{paper.title}</CardTitle>
                <p className="text-sm text-gray-500">by {paper.authors.join(', ')}</p>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-gray-600 mb-2">
                  Platform: {paper.platform} | Published: {new Date(paper.published_date).toLocaleDateString()}
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {paper.categories.map(category => (
                    <span key={category} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {category}
                    </span>
                  ))}
                </div>
                <p className="text-sm line-clamp-3">{paper.abstract}</p>
              </CardContent>
              <div className="p-4 pt-0 flex justify-end">
                <Button onClick={() => handlePaperClick(paper)}>View Details</Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Authors</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Published Date</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Abstract</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPapers.map((paper) => (
                <TableRow key={paper.id} className="cursor-pointer hover:bg-gray-100" onClick={() => handlePaperClick(paper)}>
                  <TableCell className="font-medium line-clamp-2">{paper.title}</TableCell>
                  <TableCell>{paper.authors.join(', ')}</TableCell>
                  <TableCell>{paper.platform}</TableCell>
                  <TableCell>{new Date(paper.published_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {paper.categories.map(category => (
                        <span key={category} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {category}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="line-clamp-3">{paper.abstract}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedPaper && (
        <Dialog open={!!selectedPaper} onOpenChange={() => setSelectedPaper(null)}>
          <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedPaper.title}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-grow pr-4">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Authors: {selectedPaper.authors.join(', ')}
                </p>
                <p className="text-sm text-gray-600">
                  Platform: {selectedPaper.platform} | Published: {new Date(selectedPaper.published_date).toLocaleDateString()}
                </p>
                <p className="text-base">{selectedPaper.abstract}</p>
                {selectedPaper.pdf_url && (
                  <Button asChild>
                    <a href={selectedPaper.pdf_url} target="_blank" rel="noopener noreferrer">
                      View PDF
                    </a>
                  </Button>
                )}
                {selectedPaper.animation_url && (
                  <div>
                    <h3 className="text-xl font-semibold mt-4 mb-2">Animation</h3>
                    <video controls src={selectedPaper.animation_url} className="w-full h-auto max-h-[500px] bg-black" />
                  </div>
                )}
                <div className="mt-4">
                  <h3 className="text-xl font-semibold mb-2">Related Papers</h3>
                  {selectedPaper.references_ids.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium">References:</h4>
                      <ul className="list-disc pl-5">
                        {selectedPaper.references_ids.map((refId, index) => (
                          <li key={index} className="text-sm">{refId}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedPaper.cited_by_ids.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-lg font-medium">Cited By:</h4>
                      <ul className="list-disc pl-5">
                        {selectedPaper.cited_by_ids.map((citeId, index) => (
                          <li key={index} className="text-sm">{citeId}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(selectedPaper.references_ids.length === 0 && selectedPaper.cited_by_ids.length === 0) && (
                    <p className="text-sm text-gray-500">No related papers found.</p>
                  )}
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
