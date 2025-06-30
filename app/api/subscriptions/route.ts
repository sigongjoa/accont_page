import { NextResponse } from 'next/server';
import logger from '@/lib/logger';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const filePath = path.join(process.cwd(), 'data', 'subscriptions.json');

// Ensure the directory exists
const ensureDirectoryExists = async (dirPath: string) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    logger.error('Error ensuring directory exists', { error });
  }
};

const initializeFile = async () => {
  await ensureDirectoryExists(path.dirname(filePath));
  try {
    await fs.access(filePath);
  } catch (error) {
    logger.debug('subscriptions.json does not exist, creating with initial data.');
    const initialSubscriptions = [
      { id: '1', name: 'Netflix', amount: 15000, currency: 'KRW', recurrence: 'monthly', nextPaymentDate: '2024-07-01', category: 'Entertainment', status: 'Active' },
      { id: '2', name: 'Spotify', amount: 10000, currency: 'KRW', recurrence: 'monthly', nextPaymentDate: '2024-07-05', category: 'Music', status: 'Active' },
    ];
    await fs.writeFile(filePath, JSON.stringify(initialSubscriptions, null, 2));
  }
};

const readSubscriptions = async () => {
  await initializeFile(); // Ensure file exists before reading
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
};

const writeSubscriptions = async (subscriptions: any[]) => {
  await ensureDirectoryExists(path.dirname(filePath));
  await fs.writeFile(filePath, JSON.stringify(subscriptions, null, 2));
};

export async function GET() {
  logger.debug('GET /api/subscriptions: Enter');
  try {
    const subscriptions = await readSubscriptions();
    logger.debug('GET /api/subscriptions: Returning all subscriptions', { count: subscriptions.length });
    return NextResponse.json(subscriptions);
  } catch (error) {
    logger.error('GET /api/subscriptions: Error fetching subscriptions', { error: error.message });
    return new NextResponse('Internal Server Error', { status: 500 });
  } finally {
    logger.debug('GET /api/subscriptions: Exit');
  }
}

export async function POST(request: Request) {
  logger.debug('POST /api/subscriptions: Enter');
  try {
    const data = await request.json();
    logger.debug('POST /api/subscriptions: Received data', { data });
    const subscriptions = await readSubscriptions();
    const newSubscription = { id: (subscriptions.length > 0 ? Math.max(...subscriptions.map((s: any) => parseInt(s.id))) + 1 : 1).toString(), ...data };
    subscriptions.push(newSubscription);
    await writeSubscriptions(subscriptions);
    logger.debug('POST /api/subscriptions: New subscription added', { newSubscription });
    return NextResponse.json(newSubscription, { status: 201 });
  } catch (error) {
    logger.error('POST /api/subscriptions: Error adding subscription', { error: error.message });
    return new NextResponse('Internal Server Error', { status: 500 });
  } finally {
    logger.debug('POST /api/subscriptions: Exit');
  }
}

export async function PUT(request: Request) {
  logger.debug('PUT /api/subscriptions: Enter');
  try {
    const { id, ...updatedData } = await request.json();
    logger.debug('PUT /api/subscriptions: Received data', { id, updatedData });
    let subscriptions = await readSubscriptions();
    let updated = false;
    subscriptions = subscriptions.map((sub: any) => {
      if (sub.id === id) {
        updated = true;
        return { ...sub, ...updatedData };
      }
      return sub;
    });
    if (!updated) {
      logger.warn('PUT /api/subscriptions: Subscription not found for update', { id });
      return new NextResponse('Subscription not found', { status: 404 });
    }
    await writeSubscriptions(subscriptions);
    const updatedSubscription = subscriptions.find((sub: any) => sub.id === id);
    logger.debug('PUT /api/subscriptions: Subscription updated', { updatedSubscription });
    return NextResponse.json(updatedSubscription);
  } catch (error) {
    logger.error('PUT /api/subscriptions: Error updating subscription', { error: error.message });
    return new NextResponse('Internal Server Error', { status: 500 });
  } finally {
    logger.debug('PUT /api/subscriptions: Exit');
  }
}

export async function DELETE(request: Request) {
  logger.debug('DELETE /api/subscriptions: Enter');
  try {
    const { id } = await request.json(); // Assuming ID is sent in the request body for DELETE
    logger.debug('DELETE /api/subscriptions: Received ID', { id });
    let subscriptions = await readSubscriptions();
    const initialLength = subscriptions.length;
    subscriptions = subscriptions.filter((sub: any) => sub.id !== id);
    if (subscriptions.length === initialLength) {
      logger.warn('DELETE /api/subscriptions: Subscription not found for deletion', { id });
      return new NextResponse('Subscription not found', { status: 404 });
    }
    await writeSubscriptions(subscriptions);
    logger.debug('DELETE /api/subscriptions: Subscription deleted', { id });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    logger.error('DELETE /api/subscriptions: Error deleting subscription', { error: error.message });
    return new NextResponse('Internal Server Error', { status: 500 });
  } finally {
    logger.debug('DELETE /api/subscriptions: Exit');
  }
} 