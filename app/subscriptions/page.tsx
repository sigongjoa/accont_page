'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/header';
import { PlusCircledIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { SubscriptionTable } from '@/components/subscription-table';
import { Subscription, SubscriptionFilters, Currency } from '@/types/subscription';
import { SubscriptionFormModal } from '@/components/subscription-form-modal';
import { SubscriptionFilters as SubscriptionFiltersComponent } from '@/components/subscription-filters';
import { useToast } from '@/components/ui/use-toast';
import { isOnline } from '@/lib/utils';
import logger from '@/lib/logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SubscriptionsPage() {
  logger.debug('SubscriptionsPage: Component rendering');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [filters, setFilters] = useState<SubscriptionFilters>({ search: "", currency: undefined, interval: undefined });
  const [displayCurrency, setDisplayCurrency] = useState<Currency>("KRW");
  const { toast } = useToast();

  const fetchSubscriptions = useCallback(async () => {
    logger.debug('fetchSubscriptions: Enter');
    if (!isOnline()) {
      logger.debug('fetchSubscriptions: Offline, attempting to load from localStorage');
      const storedSubscriptions = localStorage.getItem('subscriptions');
      if (storedSubscriptions) {
        setSubscriptions(JSON.parse(storedSubscriptions));
        toast({
          title: '오프라인',
          description: '로컬 저장소에서 구독을 로드했습니다.',
        });
      }
      setLoading(false);
      logger.debug('fetchSubscriptions: Exit (offline)');
      return;
    }

    try {
      logger.debug('fetchSubscriptions: Fetching from API');
      const response = await fetch('/api/subscriptions');
      if (!response.ok) {
        logger.debug(`fetchSubscriptions: API error, status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      logger.debug('fetchSubscriptions: Data fetched successfully', { data });
      setSubscriptions(data);
      localStorage.setItem('subscriptions', JSON.stringify(data));
      toast({
        title: '성공',
        description: '구독이 성공적으로 로드되었습니다.',
      });
    } catch (error: any) {
      logger.debug('fetchSubscriptions: Error fetching subscriptions', { error: error.message });
      console.error('Error fetching subscriptions:', error);
      toast({
        title: '오류',
        description: `구독을 불러오는 데 실패했습니다: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      logger.debug('fetchSubscriptions: Exit');
    }
  }, [toast]);

  useEffect(() => {
    logger.debug('useEffect: fetchSubscriptions call');
    fetchSubscriptions();

    const handleOnline = () => {
      logger.debug('handleOnline: Online event detected, refetching subscriptions');
      fetchSubscriptions();
    };
    window.addEventListener('online', handleOnline);
    return () => {
      logger.debug('useEffect: Cleanup, removing online event listener');
      window.removeEventListener('online', handleOnline);
    };
  }, [fetchSubscriptions]);

  const handleAddSubscription = () => {
    logger.debug('handleAddSubscription: Enter');
    setCurrentSubscription(null);
    setIsModalOpen(true);
    logger.debug('handleAddSubscription: Exit');
  };

  const handleEditSubscription = (subscription: Subscription) => {
    logger.debug('handleEditSubscription: Enter', { subscription });
    setCurrentSubscription(subscription);
    setIsModalOpen(true);
    logger.debug('handleEditSubscription: Exit');
  };

  const handleDeleteSubscription = async (id: string) => {
    logger.debug('handleDeleteSubscription: Enter', { id });
    if (!isOnline()) {
      logger.debug('handleDeleteSubscription: Offline, cannot delete');
      toast({
        title: '오프라인',
        description: '오프라인 상태에서는 구독을 삭제할 수 없습니다.',
        variant: 'destructive',
      });
      logger.debug('handleDeleteSubscription: Exit (offline)');
      return;
    }

    if (!window.confirm('정말로 이 구독을 삭제하시겠습니까?')) {
      logger.debug('handleDeleteSubscription: Delete cancelled by user');
      logger.debug('handleDeleteSubscription: Exit (cancelled)');
      return;
    }

    try {
      logger.debug('handleDeleteSubscription: Deleting from API', { id });
      const response = await fetch(`/api/subscriptions`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        logger.debug(`handleDeleteSubscription: API error, status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      logger.debug('handleDeleteSubscription: Delete successful');
      toast({
        title: '성공',
        description: '구독이 성공적으로 삭제되었습니다.',
      });
      fetchSubscriptions(); // Refresh the list
    } catch (error: any) {
      logger.debug('handleDeleteSubscription: Error deleting subscription', { error: error.message });
      console.error('Error deleting subscription:', error);
      toast({
        title: '오류',
        description: `구독 삭제에 실패했습니다: ${error.message}`,
        variant: 'destructive',
      });
    }
    logger.debug('handleDeleteSubscription: Exit');
  };

  const handleSubmitSubscription = async (subscription: Subscription) => {
    logger.debug('handleSubmitSubscription: Enter', { subscription });
    if (!isOnline()) {
      logger.debug('handleSubmitSubscription: Offline, cannot submit');
      toast({
        title: '오프라인',
        description: '오프라인 상태에서는 구독을 추가/업데이트할 수 없습니다.',
        variant: 'destructive',
      });
      logger.debug('handleSubmitSubscription: Exit (offline)');
      return;
    }

    const method = subscription.id ? 'PUT' : 'POST';
    const url = '/api/subscriptions'; // Always POST/PUT to /api/subscriptions as ID is in body

    try {
      logger.debug(`handleSubmitSubscription: Sending ${method} request to ${url}`, { subscription });
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      if (!response.ok) {
        logger.debug(`handleSubmitSubscription: API error, status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      logger.debug('handleSubmitSubscription: Submission successful');
      toast({
        title: '성공',
        description: `구독이 성공적으로 ${subscription.id ? '업데이트' : '추가'}되었습니다.`,
      });
      setIsModalOpen(false);
      fetchSubscriptions(); // Refresh the list after successful operation
    } catch (error: any) {
      logger.debug('handleSubmitSubscription: Error submitting subscription', { error: error.message });
      console.error('Error submitting subscription:', error);
      toast({
        title: '오류',
        description: `구독 ${subscription.id ? '업데이트' : '추가'}에 실패했습니다: ${error.message}`,
        variant: 'destructive',
      });
    }
    logger.debug('handleSubmitSubscription: Exit');
  };

  const handleFilterChange = useCallback((key: keyof SubscriptionFilters, value: string | undefined) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [key]: value === "all" ? undefined : value
    }));
  }, []);

  const handleDisplayCurrencyChange = useCallback((currency: Currency) => {
    setDisplayCurrency(currency);
  }, []);

  // Apply filters to subscriptions before passing to table
  const filteredSubscriptions = subscriptions.filter(subscription => {
    if (filters.search && !subscription.serviceName.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.currency && subscription.currency !== filters.currency) {
      return false;
    }
    if (filters.interval && subscription.billingInterval !== filters.interval) {
      return false;
    }
    return true;
  });

  if (loading) {
    logger.debug('Rendering: Loading state');
    return (
      <div className="flex flex-col gap-5 w-full">
        <p>구독을 로드 중...</p>
      </div>
    );
  }

  logger.debug('Rendering: Subscriptions content');
  return (
    <div className="flex flex-1 flex-col">
      <Header title="구독" onAddSite={handleAddSubscription} />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <SubscriptionFiltersComponent
          filters={filters}
          onFilterChange={handleFilterChange}
          displayCurrency={displayCurrency}
          onDisplayCurrencyChange={handleDisplayCurrencyChange}
        />
        <Card>
          <CardContent>
            <SubscriptionTable
              subscriptions={filteredSubscriptions}
              onEditSubscription={handleEditSubscription}
              onDeleteSubscription={handleDeleteSubscription}
              displayCurrency={displayCurrency}
            />
          </CardContent>
        </Card>
        <SubscriptionFormModal
          isOpen={isModalOpen}
          onClose={() => {
            logger.debug("SubscriptionFormModal: onClose called")
            setIsModalOpen(false)
            setCurrentSubscription(null)
          }}
          onSubmit={handleSubmitSubscription}
          subscription={currentSubscription}
        />
      </main>
    </div>
  );
} 