'use client';

import { useEffect, useState, useCallback } from 'react';
import { PlusCircledIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import PageTitle from '@/components/PageTitle';
import SubscriptionTable from '@/components/subscription-table';
import { Subscription } from '@/types/subscription';
import SubscriptionFormModal from '@/components/subscription-form-modal';
import { useToast } from '@/components/ui/use-toast';
import { isOnline } from '@/lib/utils';
import logger from '@/lib/logger'; // assuming you have a logger utility

export default function SubscriptionsPage() {
  logger.debug('SubscriptionsPage: Component rendering');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
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
    } catch (error) {
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
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: 'DELETE',
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
    } catch (error) {
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
    const url = subscription.id ? `/api/subscriptions/${subscription.id}` : '/api/subscriptions';

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
    } catch (error) {
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

  if (loading) {
    logger.debug('Rendering: Loading state');
    return (
      <div className="flex flex-col gap-5 w-full">
        <PageTitle title="구독" />
        <p>구독을 로드 중...</p>
      </div>
    );
  }

  logger.debug('Rendering: Subscriptions content');
  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex justify-between items-center">
        <PageTitle title="구독" />
        <Button onClick={handleAddSubscription} className="flex items-center gap-2">
          <PlusCircledIcon className="h-4 w-4" />
          <span>새 구독</span>
        </Button>
      </div>

      <SubscriptionTable
        subscriptions={subscriptions}
        onEdit={handleEditSubscription}
        onDelete={handleDeleteSubscription}
      />

      <SubscriptionFormModal
        isOpen={isModalOpen}
        onClose={() => {
          logger.debug('SubscriptionFormModal: onClose called');
          setIsModalOpen(false);
          setCurrentSubscription(null);
        }}
        onSubmit={handleSubmitSubscription}
        initialData={currentSubscription}
      />
    </div>
  );
} 