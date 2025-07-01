'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageTitle from '@/components/PageTitle';
import ReactFlow, { Controls, Background, MiniMap, useNodesState, useEdgesState, addEdge, Connection, Edge, Node } from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { ServiceFormModal, ServiceFormData } from '@/components/service-form-modal';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

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
  const [viewMode, setViewMode] = useState<'card' | 'network'>('card');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceFormData | null>(null);
  const { toast } = useToast();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback((params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/services');
      if (!response.ok) {
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
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleSaveService = async (formData: ServiceFormData) => {
    try {
      let response;
      if (editingService?.id) {
        response = await fetch(`/api/services/${editingService.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to ${editingService ? 'update' : 'create'} service`);
      }

      toast({
        title: 'Success',
        description: `Service ${editingService ? 'updated' : 'created'} successfully.`, 
      });
      setIsModalOpen(false);
      setEditingService(null);
      fetchServices(); // Refresh the list
    } catch (err: any) {
      toast({
        title: 'Error',
        description: `Failed to ${editingService ? 'update' : 'create'} service: ${err.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete service');
      }

      toast({
        title: 'Success',
        description: 'Service deleted successfully.',
      });
      fetchServices(); // Refresh the list
    } catch (err: any) {
      toast({
        title: 'Error',
        description: `Failed to delete service: ${err.message}`,
        variant: 'destructive',
      });
    }
  };

  const uniqueCategories = Array.from(new Set(services.map(service => service.category)));

  const filteredServices = selectedCategory === 'All'
    ? services
    : services.filter(service => service.category === selectedCategory);

  if (loading) {
    return <div>Loading services...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <PageTitle title="Services Comparison" />
      <div className="mb-6 flex justify-between items-center">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              selectedCategory === 'All' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            All
          </button>
          {uniqueCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <Button onClick={() => { setEditingService(null); setIsModalOpen(true); }}>Add New Service</Button>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setViewMode('card')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            viewMode === 'card' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Card View
        </button>
        <button
          onClick={() => setViewMode('network')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            viewMode === 'network' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Network View
        </button>
      </div>

      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground py-8">No services found.</p>
          ) : (
            filteredServices.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <CardTitle>{service.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-2">{service.category}</p>
                  <p className="mb-4">{service.description}</p>
                  <p className="font-semibold">{service.pricing}</p>
                  <a href={service.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mt-4 block">
                    Learn More
                  </a>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => { setEditingService(service); setIsModalOpen(true); }}>Edit</Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your service
                            and remove its data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteService(service.id)}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div style={{ width: '100%', height: '500px' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <MiniMap nodeColor={nodeColor} />
            <Controls />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </div>
      )}
      <ServiceFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveService}
        initialData={editingService}
      />
    </div>
  );
}