/**
 * NFT Service
 * 
 * Handles NFT project, layer, trait, and generation management.
 */

import { BaseService } from './base';

export interface NFTProject {
  id: string;
  name: string;
  description?: string;
  collection_config: Record<string, any>;
  generation_config?: Record<string, any>;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  thumbnail_url?: string;
  layers?: NFTLayer[];
  layer_count?: number;
  generations?: NFTGeneration[];
  generation_count?: number;
}

export interface NFTLayer {
  id: string;
  name: string;
  order_index: number;
  is_required: boolean;
  blend_mode: string;
  opacity: number;
  layer_rarity_weight?: number;
  layer_rarity_mode?: string;
  traits?: NFTLayerTrait[];
  trait_count?: number;
}

export interface NFTLayerTrait {
  id: string;
  name: string;
  display_value?: string;
  rarity_weight: number;
  rarity_locked: boolean;
  vfs_node_id: string;
  created_at: string;
}

export interface NFTGeneration {
  id: string;
  project_id: string;
  total_pieces: number;
  status: 'pending' | 'queued' | 'processing' | 'completed' | 'failed';
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  vfs_build_folder_id?: string;
  vfs_images_folder_id?: string;
  vfs_metadata_folder_id?: string;
}

export interface NFTLimits {
  tier: 'free' | 'creator' | 'pro';
  limits: {
    max_projects?: number;
    max_generations_per_project?: number;
    allowed_formats: string[];
    max_resolution: number;
  };
  usage: {
    projects: number;
    max_projects?: number;
  };
}

export interface CreateProjectOptions {
  name: string;
  collection_config: Record<string, any>;
  description?: string;
  generation_config?: Record<string, any>;
  layers?: Array<{
    name: string;
    order_index?: number;
    is_required?: boolean;
    blend_mode?: string;
    opacity?: number;
  }>;
}

export interface CreateLayerOptions {
  name: string;
  order_index?: number;
  is_required?: boolean;
  blend_mode?: string;
  opacity?: number;
}

export interface CreateGenerationOptions {
  total_pieces: number;
  config_overrides?: Record<string, any>;
}

export class NFTService extends BaseService {
  /**
   * List all NFT projects
   */
  async listProjects(includeArchived: boolean = false): Promise<NFTProject[]> {
    const response = await this.client.get('/api/v2/nft/projects', {
      include_archived: includeArchived
    });
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to list projects');
    }
    return response.data.projects;
  }

  /**
   * Get details for a specific NFT project
   */
  async getProject(projectId: string): Promise<NFTProject> {
    const response = await this.client.get(`/api/v2/nft/projects/${projectId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to get project');
    }
    return response.data.project;
  }

  /**
   * Create a new NFT project
   */
  async createProject(options: CreateProjectOptions): Promise<NFTProject> {
    const response = await this.client.post('/api/v2/nft/projects', options);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to create project');
    }
    return response.data.project;
  }

  /**
   * Update an NFT project
   */
  async updateProject(
    projectId: string,
    updates: {
      name?: string;
      description?: string;
      collection_config?: Record<string, any>;
      generation_config?: Record<string, any>;
      is_archived?: boolean;
    }
  ): Promise<NFTProject> {
    const response = await this.client.patch(`/api/v2/nft/projects/${projectId}`, updates);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to update project');
    }
    return response.data.project;
  }

  /**
   * Delete or archive an NFT project
   */
  async deleteProject(projectId: string, permanent: boolean = false): Promise<void> {
    const response = await this.client.delete(`/api/v2/nft/projects/${projectId}?permanent=${permanent}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete project');
    }
  }

  /**
   * List layers for an NFT project
   */
  async listLayers(projectId: string, includeTraits: boolean = true): Promise<NFTLayer[]> {
    const response = await this.client.get(`/api/v2/nft/projects/${projectId}/layers`, {
      include_traits: includeTraits
    });
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to list layers');
    }
    return response.data.layers;
  }

  /**
   * Create a new layer in an NFT project
   */
  async createLayer(projectId: string, options: CreateLayerOptions): Promise<NFTLayer> {
    const response = await this.client.post(`/api/v2/nft/projects/${projectId}/layers`, options);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to create layer');
    }
    return response.data.layer;
  }

  /**
   * Create a new NFT generation
   */
  async createGeneration(projectId: string, options: CreateGenerationOptions): Promise<NFTGeneration> {
    const response = await this.client.post(`/api/v2/nft/projects/${projectId}/generate`, options);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to create generation');
    }
    return response.data.generation;
  }

  /**
   * Get NFT generation status
   */
  async getGeneration(generationId: string): Promise<NFTGeneration> {
    const response = await this.client.get(`/api/v2/nft/generations/${generationId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to get generation');
    }
    return response.data.generation;
  }

  /**
   * List all generations for an NFT project
   */
  async listGenerations(projectId: string): Promise<NFTGeneration[]> {
    const response = await this.client.get(`/api/v2/nft/projects/${projectId}/generations`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to list generations');
    }
    return response.data.generations;
  }

  /**
   * Get user's NFT tier and limits
   */
  async getLimits(): Promise<NFTLimits> {
    const response = await this.client.get('/api/v2/nft/limits');
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to get limits');
    }
    return {
      tier: response.data.tier,
      limits: response.data.limits,
      usage: response.data.usage
    };
  }
}
