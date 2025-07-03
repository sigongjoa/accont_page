"use client";

import { useState, useEffect, useCallback } from 'react';
import PageTitle from '@/components/PageTitle';
import { SubscriptionTable } from '@/components/subscription-table';
import { Subscription, SubscriptionFilters, Currency } from '@/types/subscription';
import { SubscriptionFilters as SubscriptionFiltersComponent } from '@/components/subscription-filters';
import { useToast } from '@/components/ui/use-toast';
import { isOnline } from '@/lib/utils';
import logger from '@/lib/logger';

export default function SubscriptionsPage() {
  logger.debug('SubscriptionsPage: Component rendering');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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
      <main className="flex flex-1 flex-col p-6">
        <PageTitle title="구독" icon="subscriptions" />
        <SubscriptionFiltersComponent
          filters={filters}
          onFilterChange={handleFilterChange}
          displayCurrency={displayCurrency}
          onDisplayCurrencyChange={handleDisplayCurrencyChange}
        />
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">구독 목록</h3>
          </div>
          <div className="overflow-x-auto">
            <SubscriptionTable
              subscriptions={filteredSubscriptions}
              displayCurrency={displayCurrency}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
