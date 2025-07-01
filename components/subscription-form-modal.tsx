"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Subscription, BillingInterval, Currency } from "@/types/subscription";
import { categories } from "@/lib/constants";

interface SubscriptionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (subscription: Partial<Subscription>) => Promise<void>; // onSubmit이 Promise를 반환함을 명시
  subscription?: Subscription | null;
}

export function SubscriptionFormModal({ isOpen, onClose, onSubmit, subscription }: SubscriptionFormModalProps) {
  const [formData, setFormData] = useState({
    serviceName: "",
    amount: "",
    currency: "KRW" as Currency,
    billingInterval: "monthly" as BillingInterval,
    startDate: "",
    category: "" as string,
  });

  useEffect(() => {
    if (subscription) {
      setFormData({
        serviceName: subscription.serviceName,
        amount: subscription.amount.toString(),
        currency: subscription.currency,
        billingInterval: subscription.billingInterval,
        startDate: subscription.startDate,
        category: subscription.category,
      });
    } else {
      setFormData({
        serviceName: "",
        amount: "",
        currency: "KRW",
        billingInterval: "monthly",
        startDate: new Date().toISOString().split("T")[0],
        category: "기타",
      });
    }
  }, [subscription, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('SubscriptionFormModal: handleSubmit called');
    // onSubmit 비동기 함수가 완료될 때까지 기다립니다.
    await onSubmit({
      ...formData,
      amount: Number.parseFloat(formData.amount),
    });
    // 비동기 작업 완료 후 모달을 닫습니다.
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{subscription ? "구독 수정" : "새 구독 추가"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="serviceName">서비스명</Label>
            <Input
              id="serviceName"
              value={formData.serviceName}
              onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
              placeholder="예: 넷플릭스, AWS, Office 365"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">금액</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="currency">통화</Label>
              <Select
                value={formData.currency}
                onValueChange={(value: Currency) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KRW">KRW (₩)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="category">카테고리</Label>
            <Select
              value={formData.category}
              onValueChange={(value: string) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="billingInterval">청구 간격</Label>
            <Select
              value={formData.billingInterval}
              onValueChange={(value: BillingInterval) => setFormData({ ...formData, billingInterval: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">매월</SelectItem>
                <SelectItem value="quarterly">분기별</SelectItem>
                <SelectItem value="yearly">매년</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="startDate">시작일</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit">{subscription ? "구독 업데이트" : "구독 추가"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 