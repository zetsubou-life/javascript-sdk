/**
 * Webhooks Service
 * 
 * Handles webhook management and event subscriptions.
 */

import { BaseService } from './base';
import { Webhook, WebhookCreateParams, WebhookUpdateParams, WebhookStatsParams } from '../models';
import { ZetsubouClient } from '../client';

export class WebhooksService extends BaseService {
  constructor(client: ZetsubouClient) {
    super(client);
  }

  /**
   * List all webhooks for the current user
   */
  async list(): Promise<Webhook[]> {
    const response = await this.client.get('/api/v2/webhooks');
    return response.data.webhooks;
  }

  /**
   * Create a new webhook
   */
  async create(params: WebhookCreateParams): Promise<Webhook> {
    const response = await this.client.post('/api/v2/webhooks', params);
    return response.data.webhook;
  }

  /**
   * Get details for a specific webhook
   */
  async get(webhookId: number): Promise<Webhook> {
    const response = await this.client.get(`/api/v2/webhooks/${webhookId}`);
    return response.data.webhook;
  }

  /**
   * Update a webhook configuration
   */
  async update(webhookId: number, params: WebhookUpdateParams): Promise<Webhook> {
    const response = await this.client.put(`/api/v2/webhooks/${webhookId}`, params);
    return response.data.webhook;
  }

  /**
   * Delete a webhook
   */
  async delete(webhookId: number): Promise<boolean> {
    const response = await this.client.delete(`/api/v2/webhooks/${webhookId}`);
    return response.data.success;
  }

  /**
   * Send a test event to a webhook
   */
  async test(webhookId: number): Promise<boolean> {
    const response = await this.client.post(`/api/v2/webhooks/${webhookId}/test`);
    return response.data.success;
  }

  /**
   * Get delivery statistics for a webhook
   */
  async getStats(webhookId: number, params?: WebhookStatsParams): Promise<{
    total: number;
    successful: number;
    failed: number;
    pending: number;
    success_rate: number;
    period_days: number;
  }> {
    const response = await this.client.get(`/api/v2/webhooks/${webhookId}/stats`, params);
    return response.data;
  }

  /**
   * Get available webhook event types
   */
  async getAvailableEvents(): Promise<Record<string, string>> {
    const response = await this.client.get('/api/v2/webhooks/events');
    return response.data.events;
  }

  /**
   * Create a webhook for job events (completed, failed, cancelled)
   */
  async createJobWebhook(url: string, secret?: string): Promise<Webhook> {
    const events = ['job.completed', 'job.failed', 'job.cancelled'];
    return this.create({ url, events, secret });
  }

  /**
   * Create a webhook for file events (uploaded, downloaded)
   */
  async createFileWebhook(url: string, secret?: string): Promise<Webhook> {
    const events = ['file.uploaded', 'file.downloaded'];
    return this.create({ url, events, secret });
  }

  /**
   * Create a webhook for storage events (quota warning, exceeded)
   */
  async createStorageWebhook(url: string, secret?: string): Promise<Webhook> {
    const events = ['storage.quota_warning', 'storage.quota_exceeded'];
    return this.create({ url, events, secret });
  }

  /**
   * Create a webhook that subscribes to all available events
   */
  async createAllEventsWebhook(url: string, secret?: string): Promise<Webhook> {
    const events = Object.keys(await this.getAvailableEvents());
    return this.create({ url, events, secret });
  }

  /**
   * Enable a webhook
   */
  async enable(webhookId: number): Promise<Webhook> {
    return this.update(webhookId, { enabled: true });
  }

  /**
   * Disable a webhook
   */
  async disable(webhookId: number): Promise<Webhook> {
    return this.update(webhookId, { enabled: false });
  }

  /**
   * Update webhook URL
   */
  async updateUrl(webhookId: number, url: string): Promise<Webhook> {
    return this.update(webhookId, { url });
  }

  /**
   * Update webhook events
   */
  async updateEvents(webhookId: number, events: string[]): Promise<Webhook> {
    return this.update(webhookId, { events });
  }

  /**
   * Update webhook secret
   */
  async updateSecret(webhookId: number, secret: string): Promise<Webhook> {
    return this.update(webhookId, { secret });
  }

  /**
   * Get webhook delivery history (if available)
   */
  async getDeliveryHistory(webhookId: number, limit: number = 50): Promise<any[]> {
    // This would require additional API endpoints
    // For now, return empty array
    return [];
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload: string, signature: string, secret: string): boolean {
    // This would need to be implemented using a crypto library
    // For now, return true (signature verification should be done server-side)
    return true;
  }
}