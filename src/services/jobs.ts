/**
 * Jobs Service
 * 
 * Handles job management, status checking, and result retrieval.
 */

import { BaseService } from './base';
import { Job, JobListParams } from '../models';
import { ZetsubouClient } from '../client';

export class JobsService extends BaseService {
  constructor(client: ZetsubouClient) {
    super(client);
  }

  /**
   * List jobs with optional filtering
   */
  async list(params?: JobListParams): Promise<Job[]> {
    const response = await this.client.get('/api/v2/jobs', params);
    return response.data.jobs;
  }

  /**
   * Get details for a specific job
   */
  async get(jobId: string): Promise<Job> {
    const response = await this.client.get(`/api/v2/jobs/${jobId}`);
    return response.data.job;
  }

  /**
   * Wait for a job to complete with polling
   */
  async waitForCompletion(
    jobId: string,
    timeout: number = 3600000, // 1 hour in milliseconds
    pollInterval: number = 5000 // 5 seconds
  ): Promise<Job> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const job = await this.get(jobId);

      if (job.status === 'completed') {
        return job;
      } else if (job.status === 'failed') {
        throw new Error(`Job ${jobId} failed: ${job.error}`);
      } else if (job.status === 'cancelled') {
        throw new Error(`Job ${jobId} was cancelled`);
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Job ${jobId} timed out after ${timeout}ms`);
  }

  /**
   * Cancel a running job
   */
  async cancel(jobId: string): Promise<boolean> {
    const response = await this.client.post(`/api/v2/jobs/${jobId}/cancel`);
    return response.data.success;
  }

  /**
   * Retry a failed job
   */
  async retry(jobId: string): Promise<Job> {
    const response = await this.client.post(`/api/v2/jobs/${jobId}/retry`);
    return response.data.job;
  }

  /**
   * Delete a job and free its storage
   */
  async delete(jobId: string): Promise<boolean> {
    const response = await this.client.delete(`/api/v2/jobs/${jobId}`);
    return response.data.success;
  }

  /**
   * Download job results as a Blob
   */
  async downloadResults(jobId: string): Promise<Blob> {
    const response = await this.client.get(`/api/v2/jobs/${jobId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }

  /**
   * Download job results and save to a file (Node.js only)
   */
  async downloadResultsToFile(_jobId: string, _filePath: string): Promise<void> {
    // This would need to be implemented differently for Node.js
    // For now, we'll just return the blob
    await this.downloadResults(_jobId);
    
    // In a real implementation, you'd use fs to write the blob to file
    throw new Error('downloadResultsToFile not implemented for browser environment');
  }

  /**
   * Get job progress information
   */
  async getProgress(jobId: string): Promise<{
    status: string;
    progress: number;
    error: string | undefined;
    created_at: string;
    updated_at: string | undefined;
    completed_at: string | undefined;
  }> {
    const job = await this.get(jobId);
    return {
      status: job.status,
      progress: job.progress,
      error: job.error ?? undefined,
      created_at: job.created_at,
      updated_at: job.updated_at ?? undefined,
      completed_at: job.completed_at ?? undefined
    };
  }
}