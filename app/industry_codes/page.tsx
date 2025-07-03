import PageTitle from "@/components/PageTitle";
import { Toaster } from "@/components/ui/toaster";
import { IndustryCodeTable } from "@/components/industry-code-table";
import type { IndustryCode } from "@/types/industry_code";
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

async function getIndustryCodes(): Promise<IndustryCode[]> {
  logger.debug('Fetching industry codes from API');
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/industry_codes`, { cache: 'no-store' });
    if (!res.ok) {
      logger.debug(`Failed to fetch industry codes: ${res.statusText}`);
      throw new Error(`Failed to fetch industry codes: ${res.statusText}`);
    }
    const industryCodes = await res.json();
    logger.debug(`Successfully fetched ${industryCodes.length} industry codes`);
    return industryCodes;
  } catch (error: any) {
    logger.debug(`Error in getIndustryCodes: ${error.message}`);
    console.error('Error fetching industry codes:', error);
    return [];
  }
}

export default async function IndustryCodesPage() {
  logger.debug('Rendering IndustryCodesPage function entry');
  const industryCodes = await getIndustryCodes();
  logger.debug(`Industry codes data received: ${industryCodes.length}`);

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col p-6">
        <PageTitle title="업종분류코드" icon="inventory_2" />
        <IndustryCodeTable industryCodes={industryCodes} />
      </main>
      <Toaster />
    </div>
  );
}