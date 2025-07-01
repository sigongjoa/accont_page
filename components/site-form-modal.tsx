"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Site } from "@/types/site"

const formSchema = z.object({
  name: z.string().min(2, { message: "사이트명은 2자 이상이어야 합니다." }).max(50, { message: "사이트명은 50자 이내여야 합니다." }),
  description: z.string().min(5, { message: "설명은 5자 이상이어야 합니다." }).max(500, { message: "설명은 500자 이내여야 합니다." }),
  category: z.string().min(1, { message: "카테고리를 선택해주세요." }),
  isSubscribed: z.boolean(),
  usage: z.string().min(2, { message: "사용량은 2자 이상이어야 합니다." }).max(100, { message: "사용량은 100자 이내여야 합니다." }),
})

interface SiteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (site: Partial<Site>) => void;
  editingSite: Site | null;
}

export function SiteFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingSite,
}: SiteFormModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      isSubscribed: false,
      usage: "",
    },
  })

  useEffect(() => {
    if (editingSite) {
      form.reset({
        name: editingSite.name,
        description: editingSite.description,
        category: editingSite.category,
        isSubscribed: editingSite.isSubscribed,
        usage: editingSite.usage,
      })
    } else {
      form.reset({
        name: "",
        description: "",
        category: "",
        isSubscribed: false,
        usage: "",
      })
    }
  }, [editingSite, form])

  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit({ ...editingSite, ...values })
    onClose()
  }

  const categories = [
    { value: "스트리밍", label: "스트리밍" },
    { value: "오디오", label: "오디오" },
    { value: "디자인", label: "디자인" },
    { value: "생산성", label: "생산성" },
    { value: "개발", label: "개발" },
    { value: "게임", label: "게임" },
    { value: "기타", label: "기타" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingSite ? "사이트 편집" : "새 사이트 추가"}</DialogTitle>
          <DialogDescription>
            {editingSite ? "사이트 정보를 편집합니다." : "새 사이트 정보를 입력합니다."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>사이트명</FormLabel>
                  <FormControl>
                    <Input placeholder="사이트명" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>사이트 설명</FormLabel>
                  <FormControl>
                    <Textarea placeholder="사이트 설명" {...field} />
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
                  <FormLabel>카테고리</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="usage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>현재 사용량</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 월 100시간 시청" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isSubscribed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">구독 여부</FormLabel>
                    <FormDescription>현재 이 사이트를 구독 중이신가요?</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{editingSite ? "저장" : "추가"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
