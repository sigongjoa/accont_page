"use client"

import { useEffect, useState } from "react"
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
import { siteCategories } from "@/lib/constants"
import logger from '@/lib/logger'

const formSchema = z.object({
  name: z.string().min(2, { message: "사이트명은 2자 이상이어야 합니다." }).max(50, { message: "사이트명은 50자 이내여야 합니다." }),
  description: z.string().min(5, { message: "설명은 5자 이상이어야 합니다." }).max(500, { message: "설명은 500자 이내여야 합니다." }),
  url: z.string().url({ message: "유효한 URL을 입력해주세요." }), // New URL field
  category: z.string().min(1, { message: "카테고리를 선택해주세요." }),
  isSubscribed: z.boolean(),
  usage: z.string().regex(/^(\d+(\.\d+)?\/\d+(\.\d+)?)((\d+(\.\d+)?)*)?$/, { message: "사용량은 'n/m' 또는 'n/m/k' 형식이어야 합니다." }).optional().or(z.literal("")),
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
      url: "", // New default value
      category: "",
      isSubscribed: false,
      usage: "",
    },
  })

  const [selectedMainCategory, setSelectedMainCategory] = useState<string | undefined>(undefined);

  useEffect(() => {
    logger.debug('SiteFormModal: useEffect - initialData changed', { editingSite });
    if (editingSite) {
      const mainCat = siteCategories.find(cat => cat.value === editingSite.category || cat.subcategories?.some(sub => sub.value === editingSite.category));
      setSelectedMainCategory(mainCat?.value);
      form.setValue('category', editingSite.category);
      form.reset({
        name: editingSite.name,
        description: editingSite.description,
        url: editingSite.url, // New field
        category: editingSite.category,
        isSubscribed: editingSite.isSubscribed,
        usage: editingSite.usage,
      })
    } else {
      setSelectedMainCategory(undefined);
      form.setValue('category', "");
      form.reset({
        name: "",
        description: "",
        url: "", // New field
        category: "",
        isSubscribed: false,
        usage: "",
      })
    }
  }, [editingSite, form])

  function handleSubmit(values: z.infer<typeof formSchema>) {
    logger.debug('SiteFormModal: handleSubmit - form submitted', { values });
    onSubmit({ ...editingSite, ...values })
    onClose()
    logger.info(`SiteFormModal: Site ${values.name} saved successfully.`);
  }

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
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>사이트 주소</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
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
                  <Select
                    onValueChange={(value) => {
                      setSelectedMainCategory(value);
                      const mainCat = siteCategories.find(cat => cat.value === value);
                      if (!mainCat?.subcategories) {
                        field.onChange(value); // If no subcategories, set directly
                      } else {
                        field.onChange(""); // Reset subcategory if main category has subcategories
                      }
                    }}
                    value={selectedMainCategory || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="주요 카테고리 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {siteCategories.map((cat) => (
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

            {selectedMainCategory && siteCategories.find(cat => cat.value === selectedMainCategory)?.subcategories && (
              <FormField
                control={form.control}
                name="category" // Still using the same form field for the final category value
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>세부 카테고리</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value} // Use field.value for the actual selected subcategory
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="세부 카테고리 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {siteCategories.find(cat => cat.value === selectedMainCategory)?.subcategories?.map((subCat) => (
                          <SelectItem key={subCat.value} value={subCat.value}>
                            {subCat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="usage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>현재 사용량</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 100/1000 (단위는 자유)" {...field} />
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
              <Button type="submit" onClick={() => logger.debug('SiteFormModal: Submit button clicked')}>{editingSite ? "저장" : "추가"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}