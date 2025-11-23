/**
 * Account Service
 * 
 * Handles account information, usage statistics, and API key management.
 */

import { BaseService } from './base';
import { Account, StorageQuota, ApiKeyCreateParams, UsageStatsParams } from '../models';
import { ZetsubouClient } from '../client';

export class AccountService extends BaseService {
  constructor(client: ZetsubouClient) {
    super(client);
  }

  /**
   * Get current account information
   */
  async getAccount(): Promise<Account> {
    const response = await this.client.get('/api/v2/account');
    return response.data;
  }

  /**
   * Get detailed storage quota information
   */
  async getStorageQuota(): Promise<StorageQuota> {
    const response = await this.client.get('/api/v2/storage/quota');
    return response.data;
  }

  /**
   * Get usage statistics for the account
   */
  async getUsageStats(params?: UsageStatsParams): Promise<{
    total_jobs: number;
    total_files: number;
    total_storage_used: number;
    jobs_by_tool: Record<string, number>;
    jobs_by_period: Record<string, number>;
  }> {
    const response = await this.client.get('/api/v2/account/usage', params);
    return response.data;
  }

  /**
   * List all API keys for the account
   */
  async listApiKeys(): Promise<Array<{
    id: number;
    name: string;
    scopes: string[];
    created_at: string;
    expires_at?: string;
    last_used_at?: string;
    drive_bypass: boolean;
  }>> {
    const response = await this.client.get('/api/v2/account/api-keys');
    return response.data.api_keys;
  }

  /**
   * Create a new API key
   */
  async createApiKey(params: ApiKeyCreateParams): Promise<{
    id: number;
    key: string;
    name: string;
    scopes: string[];
    expires_at?: string;
    drive_bypass: boolean;
    created_at: string;
  }> {
    const response = await this.client.post('/api/v2/account/api-keys', params);
    return response.data;
  }

  /**
   * Delete an API key
   */
  async deleteApiKey(keyId: number): Promise<boolean> {
    const response = await this.client.delete(`/api/v2/account/api-keys/${keyId}`);
    return response.data.success;
  }

  /**
   * Get information about the current subscription tier
   */
  async getTierInfo(): Promise<{
    tier: string;
    subscription: {
      status: string;
      expires_at?: string;
    };
    features: {
      max_concurrent_jobs: number;
      rate_limit_per_minute: number;
      tools: string[];
    };
  }> {
    const account = await this.getAccount();
    return {
      tier: account.tier,
      subscription: account.subscription,
      features: account.features
    };
  }

  /**
   * Get list of tools available to the current tier
   */
  async getAvailableTools(): Promise<string[]> {
    const account = await this.getAccount();
    return account.features.tools;
  }

  /**
   * Get rate limit information for the current tier
   */
  async getRateLimits(): Promise<{
    max_concurrent_jobs: number;
    rate_limit_per_minute: number;
  }> {
    const account = await this.getAccount();
    return {
      max_concurrent_jobs: account.features.max_concurrent_jobs,
      rate_limit_per_minute: account.features.rate_limit_per_minute
    };
  }

  /**
   * Get current storage usage as a percentage
   */
  async getStorageUsagePercentage(): Promise<number> {
    const quota = await this.getStorageQuota();
    return quota.usage_percent;
  }

  /**
   * Check if storage usage is above the warning threshold
   */
  async isStorageQuotaWarning(threshold: number = 80): Promise<boolean> {
    const usagePercent = await this.getStorageUsagePercentage();
    return usagePercent >= threshold;
  }

  /**
   * Get the largest files in storage
   */
  async getLargestFiles(limit: number = 10): Promise<Array<{
    name: string;
    node_id: string;
    size_bytes: number;
  }>> {
    const quota = await this.getStorageQuota();
    return quota.largest_files.slice(0, limit);
  }

  /**
   * Get storage breakdown by file type
   */
  async getStorageBreakdown(): Promise<{
    images: { bytes: number; count: number };
    videos: { bytes: number; count: number };
    other: { bytes: number; count: number };
  }> {
    const quota = await this.getStorageQuota();
    return quota.breakdown;
  }

  /**
   * Get account summary with key metrics
   */
  async getAccountSummary(): Promise<{
    account: Account;
    quota: StorageQuota;
    usage: any;
    tier_info: any;
    rate_limits: any;
  }> {
    const [account, quota, usage, tierInfo, rateLimits] = await Promise.all([
      this.getAccount(),
      this.getStorageQuota(),
      this.getUsageStats(),
      this.getTierInfo(),
      this.getRateLimits()
    ]);

    return {
      account,
      quota,
      usage,
      tier_info: tierInfo,
      rate_limits: rateLimits
    };
  }

  /**
   * Check if account has access to a specific tool
   */
  async hasToolAccess(toolId: string): Promise<boolean> {
    const availableTools = await this.getAvailableTools();
    return availableTools.includes(toolId);
  }

  /**
   * Get account health status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check storage usage
    const usagePercent = await this.getStorageUsagePercentage();
    if (usagePercent >= 90) {
      issues.push('Storage quota nearly exceeded');
      recommendations.push('Consider upgrading your plan or cleaning up old files');
    } else if (usagePercent >= 80) {
      issues.push('Storage quota warning');
      recommendations.push('Monitor your storage usage');
    }

    // Check API key expiration
    const apiKeys = await this.listApiKeys();
    const expiringKeys = apiKeys.filter(key => {
      if (!key.expires_at) return false;
      const expirationDate = new Date(key.expires_at);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expirationDate <= thirtyDaysFromNow;
    });

    if (expiringKeys.length > 0) {
      issues.push(`${expiringKeys.length} API key(s) expiring soon`);
      recommendations.push('Renew or create new API keys');
    }

    // Determine overall status
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (issues.length > 0) {
      status = usagePercent >= 95 ? 'critical' : 'warning';
    }

    return {
      status,
      issues,
      recommendations
    };
  }

  /**
   * Get wallet information including SOL and USDC balances
   */
  async getWalletInfo(): Promise<{
    success: boolean;
    deposit_address: string;
    balance: number;
    sol_balance: number;
    credits_remaining: number;
    current_overdraft: number;
    paug_enabled: boolean;
    max_monthly_spend: number;
    tier: string;
    two_factor_enabled: boolean;
  }> {
    const response = await this.client.get('/api/billing/wallet/info');
    return response.data;
  }
}