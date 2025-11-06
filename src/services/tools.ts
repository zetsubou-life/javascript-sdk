/**
 * Tools Service
 * 
 * Handles tool execution, listing, and management.
 */

import { BaseService } from './base';
import { Tool, Job, ToolOptions } from '../models';
import { ZetsubouClient } from '../client';

export class ToolsService extends BaseService {
  constructor(client: ZetsubouClient) {
    super(client);
  }

  /**
   * List all available tools
   */
  async list(): Promise<Tool[]> {
    const response = await this.client.get('/api/v2/tools');
    return response.data.tools;
  }

  /**
   * Get details for a specific tool
   */
  async get(toolId: string): Promise<Tool> {
    const response = await this.client.get(`/api/v2/tools/${toolId}`);
    return response.data;
  }

  /**
   * Execute a tool with files and options
   */
  async execute(
    toolId: string,
    files: File[] | string[],
    options?: ToolOptions,
    audioFiles?: File[] | string[]
  ): Promise<Job> {
    const formData = new FormData();

    // Add files
    files.forEach((file, index) => {
      if (typeof file === 'string') {
        // File path - this would need to be handled differently in browser
        throw new Error('File paths not supported in browser environment. Use File objects instead.');
      } else {
        formData.append(`file_${index}`, file);
      }
    });

    // Add audio files if provided
    if (audioFiles) {
      audioFiles.forEach((file, index) => {
        if (typeof file === 'string') {
          throw new Error('File paths not supported in browser environment. Use File objects instead.');
        } else {
          formData.append(`audio_${index}`, file);
        }
      });
    }

    // Add options
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await this.client.post(`/api/v2/tools/${toolId}/execute`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data.job;
  }

  /**
   * Execute a tool in batch mode on multiple files
   */
  async batchExecute(
    toolId: string,
    files: File[] | string[],
    options?: ToolOptions,
    audioFiles?: File[] | string[]
  ): Promise<Job> {
    const formData = new FormData();

    // Add files
    files.forEach((file, index) => {
      if (typeof file === 'string') {
        throw new Error('File paths not supported in browser environment. Use File objects instead.');
      } else {
        formData.append(`file_${index}`, file);
      }
    });

    // Add audio files if provided
    if (audioFiles) {
      audioFiles.forEach((file, index) => {
        if (typeof file === 'string') {
          throw new Error('File paths not supported in browser environment. Use File objects instead.');
        } else {
          formData.append(`audio_${index}`, file);
        }
      });
    }

    // Add options
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await this.client.post(`/api/v2/tools/${toolId}/batch`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data.job;
  }

  /**
   * Create a tool chain for automated processing
   */
  async createChain(
    name: string,
    steps: Array<{ tool_id: string; options?: ToolOptions }>,
    description?: string
  ): Promise<any> {
    const data = {
      name,
      steps,
      ...(description && { description })
    };

    const response = await this.client.post('/api/v2/chains', data);
    return response.data;
  }

  /**
   * List all tool chains
   */
  async listChains(): Promise<any[]> {
    const response = await this.client.get('/api/v2/chains');
    return response.data.chains;
  }

  /**
   * Get details for a specific chain
   */
  async getChain(chainId: number): Promise<any> {
    const response = await this.client.get(`/api/v2/chains/${chainId}`);
    return response.data;
  }
}