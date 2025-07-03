
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageTitle from '@/components/PageTitle';
import { useRouter } from 'next/navigation';

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

export default function ModelDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchModel = async () => {
      try {
        const response = await fetch('/api/models'); // Fetch all models for now, filter on client
        if (!response.ok) {
          throw new Error('Failed to fetch models');
        }
        const data: Model[] = await response.json();
        const foundModel = data.find(m => m.id === id);
        if (foundModel) {
          setModel(foundModel);
        } else {
          setError('Model not found');
        }
      } catch (err) {
        setError(err.message);
      }
 finally {
        setLoading(false);
      }
    };

    fetchModel();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!model) {
    return <div>Model not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <PageTitle title={model.name} />
      <Card>
        <CardHeader>
          <CardTitle>{model.name}</CardTitle>
          <p className="text-sm text-gray-500">by {model.author}</p>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{model.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
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

          <h3 className="text-lg font-semibold mt-6 mb-2">Demo Inference (Example)</h3>
          <div className="bg-gray-100 p-4 rounded-md mb-4">
            <p className="text-sm text-gray-700">Input: "The quick brown fox jumps over the lazy dog."</p>
            <p className="text-sm text-gray-700">Output: (Simulated) "The quick brown fox jumps over the lazy dog. It was a beautiful day..."</p>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-2">GitHub Code Snippet (Example)</h3>
          <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto text-sm">
            <code>
{`from transformers import pipeline

# Example for text generation
generator = pipeline('text-generation', model='${model.name}')
result = generator("Hello, I am a", max_length=30, num_return_sequences=1)
print(result)

# Example for image classification
# classifier = pipeline('image-classification', model='${model.name}')
# result = classifier('path/to/your/image.jpg')
# print(result)
`}
            </code>
          </pre>

          <button
            onClick={() => router.back()}
            className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Back to Models
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
