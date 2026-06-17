import { logger } from '../lib/logger.js';

interface WebhookPayload {
  event: 'click';
  shortCode: string;
  originalUrl: string;
  timestamp: string;
  referrer: string | null;
  userAgent: string | null;
  ip: string | null;
}

export async function fireWebhook(webhookUrl: string, payload: WebhookPayload): Promise<void> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      logger.warn({ webhookUrl, status: res.status }, 'Webhook returned non-200');
    }
  } catch (err) {
    logger.warn({ err, webhookUrl }, 'Webhook delivery failed');
  }
}
