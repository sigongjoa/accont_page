import PageTitle from "@/components/PageTitle";
import { Toaster } from "@/components/ui/toaster";
import { McpTable } from "@/components/mcp-table";
import type { Mcp } from "@/types/mcp";
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

async function getMcpData(): Promise<Mcp[]> {
  logger.debug('Fetching MCP data from API');
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/mcp`, { cache: 'no-store' });
    if (!res.ok) {
      logger.debug(`Failed to fetch MCP data: ${res.statusText}`);
      throw new Error(`Failed to fetch MCP data: ${res.statusText}`);
    }
    const mcpData = await res.json();
    logger.debug(`Successfully fetched ${mcpData.length} MCP entries`);
    return mcpData;
  } catch (error: any) {
    logger.debug(`Error in getMcpData: ${error.message}`);
    console.error('Error fetching MCP data:', error);
    return [];
  }
}

export default async function McpPage() {
  logger.debug('Rendering McpPage function entry');
  const mcpData = await getMcpData();
  logger.debug(`MCP data received: ${mcpData.length}`);

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col p-6">
        <PageTitle title="MCP 관리" icon="cloud" />
        <McpTable mcpData={mcpData} />
      </main>
      <Toaster />
    </div>
  );
}