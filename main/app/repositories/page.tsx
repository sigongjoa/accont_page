'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageTitle from '@/components/PageTitle';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Repository {
  id: string;
  name: string;
  owner: string;
  language: string;
  stars: number;
  description: string;
  url: string;
  last_activity: string;
}

export default function RepositoriesPage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const handleCardClick = (repo: Repository) => {
    setSelectedRepo(repo);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRepo(null);
  };

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const response = await fetch('/api/repositories');
        if (!response.ok) {
          throw new Error('Failed to fetch repositories');
        }
        const data = await response.json();
        setRepositories(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, []);

  const uniqueLanguages = Array.from(new Set(repositories.map(repo => repo.language)));

  const filteredRepositories = repositories.filter(repo => {
    const matchesSearchTerm = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              repo.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = selectedLanguage === 'All' || repo.language === selectedLanguage;
    return matchesSearchTerm && matchesLanguage;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <PageTitle title="GitHub Library Curation" />

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search repositories..."
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setSelectedLanguage('All')}
              variant={selectedLanguage === 'All' ? 'default' : 'outline'}
            >
              All
            </Button>
            {uniqueLanguages.map((language) => (
              <Button
                key={language}
                onClick={() => setSelectedLanguage(language)}
                variant={selectedLanguage === language ? 'default' : 'outline'}
              >
                {language}
              </Button>
            ))}
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
          {filteredRepositories.map((repo) => (
            <Card key={repo.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCardClick(repo)}>
              <CardHeader>
                <CardTitle>{repo.name}</CardTitle>
                <p className="text-sm text-gray-500">by {repo.owner}</p>
              </CardHeader>
              <CardContent>
                <p className="mb-2">{repo.description}</p>
                <p className="text-sm">Language: {repo.language}</p>
                <p className="text-sm">Stars: {repo.stars}</p>
                <p className="text-sm">Last Activity: {new Date(repo.last_activity).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Stars</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Last Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRepositories.map((repo) => (
                <TableRow key={repo.id} className="cursor-pointer hover:bg-gray-100" onClick={() => handleCardClick(repo)}>
                  <TableCell className="font-medium"><Link href={repo.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{repo.name}</Link></TableCell>
                  <TableCell>{repo.owner}</TableCell>
                  <TableCell>{repo.language}</TableCell>
                  <TableCell>⭐ {repo.stars}</TableCell>
                  <TableCell>{repo.description}</TableCell>
                  <TableCell>{new Date(repo.last_activity).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedRepo && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedRepo.name}</DialogTitle>
              <DialogDescription>by {selectedRepo.owner}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <p className="text-sm">{selectedRepo.description}</p>
              <p className="text-sm">Language: {selectedRepo.language}</p>
              <p className="text-sm">Stars: {selectedRepo.stars}</p>
              <p className="text-sm">Last Activity: {new Date(selectedRepo.last_activity).toLocaleDateString()}</p>
              <p className="text-sm font-semibold">Installation Command (Example):</p>
              <pre className="bg-gray-100 p-2 rounded-md text-xs overflow-x-auto">npm install {selectedRepo.name}</pre>
              <p className="text-sm font-semibold">License: MIT (Example)</p>
              <Link href={selectedRepo.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mt-2 block">
                View on GitHub
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
