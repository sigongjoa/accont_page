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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import logger from '@/lib/logger';

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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceFormData | null>(null);
  const { toast } = useToast();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback((params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const fetchServices = useCallback(async () => {
    logger.debug('ServicesPage: fetchServices - fetching data');
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
      logger.error(`ServicesPage: fetchServices - error: ${err.message}`);
    } finally {
      setLoading(false);
      logger.debug('ServicesPage: fetchServices - loading finished');
    }
  }, [toast]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleSaveService = async (formData: ServiceFormData) => {
    logger.debug(`ServicesPage: handleSaveService - saving service: ${formData.name}`);
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
      logger.info(`ServicePage: Service ${editingService ? 'updated' : 'created'} successfully.`);
      setIsModalOpen(false);
      setEditingService(null);
      fetchServices(); // Refresh the list
    } catch (err: any) {
      toast({
        title: 'Error',
        description: `Failed to ${editingService ? 'update' : 'create'} service: ${err.message}`,
        variant: 'destructive',
      });
      logger.error(`ServicePage: Failed to ${editingService ? 'update' : 'create'} service: ${err.message}`);
    }
  };

  const handleDeleteService = async (id: string) => {
    logger.debug(`ServicesPage: handleDeleteService - deleting service: ${id}`);
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
      logger.info('ServicePage: Service deleted successfully.');
      fetchServices(); // Refresh the list
    } catch (err: any) {
      toast({
        title: 'Error',
        description: `Failed to delete service: ${err.message}`,
        variant: 'destructive',
      });
      logger.error(`ServicePage: Failed to delete service: ${err.message}`);
    }
  };

  const uniqueCategories = Array.from(new Set(services.map(service => service.category)));

  const filteredServices = services.filter(service => {
    const matchesSearchTerm = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    return matchesSearchTerm && matchesCategory;
  });

  if (loading) {
    return <div>Loading services...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <PageTitle title="Services Comparison" />
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search services by name or description..."
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setSelectedCategory('All')}
              variant={selectedCategory === 'All' ? 'default' : 'outline'}
            >
              All
            </Button>
            {uniqueCategories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? 'default' : 'outline'}
              >
                {category}
              </Button>
            ))}
          </div>
          <Button onClick={() => { setEditingService(null); setIsModalOpen(true); logger.debug('ServicesPage: Add New Service button clicked'); }}>Add New Service</Button>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
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

      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground py-8">No services found.</p>
          ) : (
            filteredServices.map((service) => (
              <Card key={service.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => { setEditingService(service); setIsModalOpen(true); logger.debug(`ServicesPage: Card clicked for service: ${service.id}`); }}>
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
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setEditingService(service); setIsModalOpen(true); logger.debug(`ServicesPage: Edit button clicked for service: ${service.id}`); }}>Edit</Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); logger.debug(`ServicesPage: Delete button clicked for service: ${service.id}`); }}>Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your service and remove its data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={(e) => { e.stopPropagation(); }}>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={(e) => { e.stopPropagation(); handleDeleteService(service.id); }}>Continue</AlertDialogAction>
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No services found.</TableCell>
                </TableRow>
              ) : (
                filteredServices.map((service) => (
                  <TableRow key={service.id} className="cursor-pointer hover:bg-gray-100" onClick={() => { setEditingService(service); setIsModalOpen(true); logger.debug(`ServicesPage: Table row clicked for service: ${service.id}`); }}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{service.category}</TableCell>
                    <TableCell className="line-clamp-2">{service.description}</TableCell>
                    <TableCell>{service.pricing}</TableCell>
                    <TableCell>
                      <a href={service.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        Link
                      </a>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setEditingService(service); setIsModalOpen(true); logger.debug(`ServicesPage: Edit button clicked from table for service: ${service.id}`); }}>Edit</Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); logger.debug(`ServicesPage: Delete button clicked from table for service: ${service.id}`); }}>Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your service and remove its data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={(e) => { e.stopPropagation(); }}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={(e) => { e.stopPropagation(); handleDeleteService(service.id); }}>Continue</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <ServiceFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingService(null); logger.debug('ServicesPage: ServiceFormModal closed'); }}
        onSave={handleSaveService}
        initialData={editingService}
      />
    </div>
  );
}