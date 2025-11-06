/**
 * Zetsubou.life API Client
 * 
 * Main client class that provides access to all API v2 functionality.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  ToolsService,
  JobsService,
  VFSService,
  ChatService,
  WebhooksService,
  AccountService
} from './services';
import {
  ZetsubouError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  NotFoundError,
  ServerError
} from './exceptions';
import { VERSION } from './constants';

export interface ZetsubouClientConfig {
  /** API key for authentication */
  apiKey: string;
  /** Base URL for the API (default: https://zetsubou.life) */
  baseURL?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Number of retry attempts for failed requests (default: 3) */
  retryAttempts?: number;
  /** Custom axios instance */
  axiosInstance?: AxiosInstance;
}

export class ZetsubouClient {
  private axios: AxiosInstance;
  private retryAttempts: number;

  public readonly tools: ToolsService;
  public readonly jobs: JobsService;
  public readonly vfs: VFSService;
  public readonly chat: ChatService;
  public readonly webhooks: WebhooksService;
  public readonly account: AccountService;

  constructor(config: ZetsubouClientConfig) {
    this.retryAttempts = config.retryAttempts || 3;

    // Initialize axios instance
    this.axios = config.axiosInstance || axios.create({
      baseURL: config.baseURL || 'https://zetsubou.life',
      timeout: config.timeout || 30000,
      headers: {
        'X-API-Key': config.apiKey,
        'User-Agent': `zetsubou-sdk-javascript/${VERSION}`,
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor for retry logic
    this.axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;
        
        if (!config || !config.retry) {
          config.retry = 0;
        }

        if (config.retry >= this.retryAttempts) {
          return Promise.reject(this.handleError(error));
        }

        config.retry += 1;
        
        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, config.retry) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));

        return this.axios(config);
      }
    );

    // Initialize services
    this.tools = new ToolsService(this);
    this.jobs = new JobsService(this);
    this.vfs = new VFSService(this);
    this.chat = new ChatService(this);
    this.webhooks = new WebhooksService(this);
    this.account = new AccountService(this);
  }

  /**
   * Make an HTTP request with error handling
   */
  async request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await this.axios.request<T>(config);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Make a GET request
   */
  async get<T = any>(url: string, params?: any): Promise<AxiosResponse<T>> {
    return this.request<T>({ method: 'GET', url, params });
  }

  /**
   * Make a POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ method: 'POST', url, data, ...config });
  }

  /**
   * Make a PUT request
   */
  async put<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.request<T>({ method: 'PUT', url, data });
  }

  /**
   * Make a PATCH request
   */
  async patch<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.request<T>({ method: 'PATCH', url, data });
  }

  /**
   * Make a DELETE request
   */
  async delete<T = any>(url: string): Promise<AxiosResponse<T>> {
    return this.request<T>({ method: 'DELETE', url });
  }

  /**
   * Check API health status
   */
  async healthCheck(): Promise<any> {
    const response = await this.get('/health');
    return response.data;
  }

  /**
   * Handle API errors and convert to appropriate exception types
   */
  private handleError(error: any): ZetsubouError {
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || `HTTP ${status}`;
      const errorData = data || {};

      switch (status) {
        case 400:
          return new ValidationError(message, errorData);
        case 401:
          return new AuthenticationError(message, errorData);
        case 404:
          return new NotFoundError(message, errorData);
        case 429:
          const retryAfter = parseInt(error.response.headers['retry-after'] || '60');
          return new RateLimitError(message, errorData, retryAfter);
        case 500:
        case 502:
        case 503:
        case 504:
          return new ServerError(message, errorData);
        default:
          return new ZetsubouError(message, errorData);
      }
    } else if (error.request) {
      return new ZetsubouError('Network error: Unable to reach the API');
    } else {
      return new ZetsubouError(`Request error: ${error.message}`);
    }
  }
}