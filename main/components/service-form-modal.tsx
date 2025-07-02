'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import logger from '@/lib/logger';

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: ServiceFormData) => void;
  initialData?: ServiceFormData | null;
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'Service name must be at least 2 characters.' }),
  category: z.string().min(1, { message: 'Category is required.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  pricing: z.string().min(2, { message: 'Pricing information is required.' }),
  url: z.string().url({ message: 'Invalid URL format.' }),
  connections: z.string().optional(), // Comma-separated IDs
});

export type ServiceFormData = z.infer<typeof formSchema>;

export function ServiceFormModal({ isOpen, onClose, onSave, initialData }: ServiceFormModalProps) {
  const { toast } = useToast();
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      category: '',
      description: '',
      pricing: '',
      url: '',
      connections: '',
    },
  });

  useEffect(() => {
    logger.debug('ServiceFormModal: useEffect - initialData changed', { initialData });
    if (initialData) {
      form.reset({
        ...initialData,
        connections: initialData.connections ? initialData.connections.join(', ') : '',
      });
    } else {
      form.reset();
    }
  }, [initialData, form]);

  const onSubmit = async (values: ServiceFormData) => {
    logger.debug('ServiceFormModal: onSubmit - form submitted', { values });
    try {
      const serviceToSave = {
        ...values,
        connections: values.connections ? values.connections.split(',').map(s => s.trim()) : [],
      };
      onSave(serviceToSave);
      form.reset();
      onClose();
      logger.info(`ServiceFormModal: Service ${serviceToSave.name} saved successfully.`);
    } catch (error) {
      logger.error('ServiceFormModal: Error saving service', { error });
      toast({
        title: 'Error',
        description: 'Failed to save service.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Service' : 'Add New Service'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Vercel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Deployment">Deployment</SelectItem>
                      <SelectItem value="DB">Database</SelectItem>
                      <SelectItem value="CI/CD">CI/CD</SelectItem>
                      <SelectItem value="Monitoring">Monitoring</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A brief description of the service." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pricing"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pricing</FormLabel>
                  <FormControl>
                    <Input placeholder="Free tier, $X/month" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="connections"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Connections (comma-separated IDs)</FormLabel>
                  <FormControl>
                    <Input placeholder="supabase, github-actions" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" onClick={() => logger.debug('ServiceFormModal: Submit button clicked')}>{initialData ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
