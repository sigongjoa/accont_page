'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageTitle from '@/components/PageTitle';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import logger from '@/lib/logger';

interface Model {
  id: string;
  name: string;
  author: string;
  tags: string[];
  parameters: string;
  inference_speed: string;
  license: string;
  stars: number;
  description: string;
}

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  useEffect(() => {
    logger.debug('ModelsPage: useEffect - fetching models');
    const fetchModels = async () => {
      try {
        const response = await fetch('/api/models');
        if (!response.ok) {
          throw new Error('Failed to fetch models');
        }
        const data = await response.json();
        setModels(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  const uniqueTags = Array.from(new Set(models.flatMap(model => model.tags)));

  const filteredModels = models.filter(model => {
    const matchesSearchTerm = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              model.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => model.tags.includes(tag));
    return matchesSearchTerm && matchesTags;
  });

  const handleTagClick = (tag: string) => {
    logger.debug(`ModelsPage: handleTagClick - tag: ${tag}`);
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <PageTitle title="Hugging Face AI Models" />
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search models..."
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {uniqueTags.slice(0, 10).map(tag => (
              <Button
                key={tag}
                onClick={() => handleTagClick(tag)}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                className="rounded-full"
              >
                {tag}
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
        <h3 className="text-lg font-semibold mb-2">Recommendation Presets</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              setSelectedTags(['text-generation']);
              logger.debug('ModelsPage: Text Generation preset clicked');
            }}
            variant={selectedTags.includes('text-generation') && selectedTags.length === 1 ? 'default' : 'outline'}
          >
            Text Generation
          </Button>
          <Button
            onClick={() => {
              setSelectedTags(['korean']);
              logger.debug('ModelsPage: Korean Only preset clicked');
            }}
            variant={selectedTags.includes('korean') && selectedTags.length === 1 ? 'default' : 'outline'}
          >
            Korean Only
          </Button>
          <Button
            onClick={() => {
              setSelectedTags([]);
              logger.debug('ModelsPage: Clear Presets clicked');
            }}
            variant={selectedTags.length === 0 ? 'default' : 'outline'}
          >
            Clear Presets
          </Button>
        </div>
      </div>
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model) => (
            <Link href={`/models/${model.id}`} key={model.id}>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{model.name}</CardTitle>
                  <p className="text-sm text-gray-500">by {model.author}</p>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">{model.description}</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {model.tags.map(tag => (
                      <span key={tag} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm">Parameters: {model.parameters}</p>
                  <p className="text-sm">Inference Speed: {model.inference_speed}</p>
                  <p className="text-sm">License: {model.license}</p>
                  <p className="text-sm">Stars: {model.stars}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Parameters</TableHead>
                <TableHead>Inference Speed</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Stars</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModels.map((model) => (
                <TableRow key={model.id} className="cursor-pointer hover:bg-gray-100">
                  <TableCell className="font-medium">
                    <Link href={`/models/${model.id}`} className="text-blue-600 hover:underline">
                      {model.name}
                    </Link>
                  </TableCell>
                  <TableCell>{model.author}</TableCell>
                  <TableCell>{model.description}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {model.tags.map(tag => (
                        <span key={tag} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{model.parameters}</TableCell>
                  <TableCell>{model.inference_speed}</TableCell>
                  <TableCell>{model.license}</TableCell>
                  <TableCell>⭐ {model.stars}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
