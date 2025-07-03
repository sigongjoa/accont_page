'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageTitle from '@/components/PageTitle';
import ReactFlow, { Controls, Background, MiniMap, useNodesState, useEdgesState, addEdge, Connection, Edge, Node } from 'reactflow';
import 'reactflow/dist/style.css';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import logger from '@/lib/logger';
import { ServiceCompatibilityMatrix } from '@/components/ServiceCompatibilityMatrix';

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  pricing: string;
  url: string;
  connections?: string[];
}

const nodeColor = (node: Node) => {
  switch (node.data.category) {
    case 'Deployment':
      return '#FFCC00'; // Yellow
    case 'DB':
    case 'Database': // For consistency with form select
      return '#007AFF'; // Blue
    case 'CI/CD':
      return '#5856D6'; // Indigo
    case 'Monitoring':
      return '#34C759'; // Green
    case 'Other':
      return '#8E8E93'; // Gray
    default:
      return '#8E8E93'; // Gray
  }
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'card' | 'network' | 'graph'>('card');
  const { toast } = useToast();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback((params: Connection | Edge) => {
    logger.debug('onConnect called', { params });
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  const fetchServices = useCallback(async () => {
    logger.debug('fetchServices called');
    setLoading(true);
    try {
      const response = await fetch('/api/services');
      if (!response.ok) {
        logger.debug(`Failed to fetch services: ${response.statusText}`);
        throw new Error('Failed to fetch services');
      }
      const data: Service[] = await response.json();
      setServices(data);

      // Generate nodes and edges for React Flow
      const initialNodes: Node[] = data.map((service: Service, index: number) => ({
        id: service.id,
        position: { x: (index % 4) * 200, y: Math.floor(index / 4) * 100 }, // Simple layout
        data: { label: service.name, category: service.category },
        style: { backgroundColor: nodeColor({ data: { category: service.category } } as Node), color: 'white' },
      }));

      const initialEdges: Edge[] = [];
      data.forEach((service: Service) => {
        service.connections?.forEach(connectionId => {
          if (data.some((s: Service) => s.id === connectionId)) {
            initialEdges.push({
              id: `e-${service.id}-${connectionId}`,
              source: service.id,
              target: connectionId,
              animated: true,
            });
          }
        });
      });

      setNodes(initialNodes);
      setEdges(initialEdges);

    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error',
        description: `Failed to load services: ${err.message}`,
        variant: 'destructive',
      });
      logger.debug('Error in fetchServices', { error: err.message });
    } finally {
      setLoading(false);
      logger.debug('fetchServices finished');
    }
  }, [toast]);

  useEffect(() => {
    logger.debug('useEffect in ServicesPage: fetching services');
    fetchServices();
  }, [fetchServices]);

  const uniqueCategories = Array.from(new Set(services.map(service => service.category))).sort();

  const filteredServices = selectedCategory === 'All'
    ? services
    : services.filter(service => service.category === selectedCategory);

  if (loading) {
    logger.debug('ServicesPage is loading');
    return <div>Loading services...</div>;
  }

  if (error) {
    logger.debug('ServicesPage encountered an error', { error });
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col p-6">
        <PageTitle title="Services" icon="list_alt" />
      <div className="mb-6 flex justify-between items-center">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSelectedCategory('All');
              logger.debug('Category changed to All');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              selectedCategory === 'All' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            All
          </button>
          {uniqueCategories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                logger.debug(`Category changed to ${category}`);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => {
            setViewMode('card');
            logger.debug('View mode changed to Card View');
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            viewMode === 'card' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Card View
        </button>
        <button
          onClick={() => {
            setViewMode('network');
            logger.debug('View mode changed to Network View');
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            viewMode === 'network' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Network View
        </button>
        <button
          onClick={() => {
            setViewMode('graph');
            logger.debug('View mode changed to Graph View');
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            viewMode === 'graph' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Graph View
        </button>
      </div>

      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <CardTitle>{service.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">{service.category}</p>
                <p className="mt-2">{service.description}</p>
                <p className="mt-2 text-sm text-gray-600">Pricing: {service.pricing}</p>
                <p className="mt-2 text-sm text-blue-500"><a href={service.url} target="_blank" rel="noopener noreferrer">Learn more</a></p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewMode === 'network' && (
        <div style={{ width: '100%', height: '500px' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <Controls />
            <MiniMap nodeColor={nodeColor} />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </div>
      )}

      {viewMode === 'graph' && (
        <div className="w-full">
          <ServiceCompatibilityMatrix services={filteredServices} />
        </div>
      )}
    </div>
  );
}