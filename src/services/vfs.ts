/**
 * VFS Service
 * 
 * Handles Virtual File System operations including file upload, download, and management.
 */

import { BaseService } from './base';
import { VFSNode, VFSListParams, SharedFolder, SharedFolderDetail, Shortcut } from '../models';
import { ZetsubouClient } from '../client';

export class VFSService extends BaseService {
  constructor(client: ZetsubouClient) {
    super(client);
  }

  /**
   * List VFS nodes (files and folders)
   */
  async listNodes(params?: VFSListParams): Promise<VFSNode[]> {
    const response = await this.client.get('/api/v2/vfs/nodes', params);
    return response.data.nodes;
  }

  /**
   * Get details for a specific VFS node
   */
  async getNode(nodeId: string): Promise<VFSNode> {
    const response = await this.client.get(`/api/v2/vfs/nodes/${nodeId}`);
    return response.data.node;
  }

  /**
   * Upload a file to VFS
   */
  async uploadFile(
    file: File,
    parentId?: string,
    encrypt: boolean = false
  ): Promise<VFSNode> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('encrypt', encrypt.toString());

    if (parentId) {
      formData.append('parent_id', parentId);
    }

    const response = await this.client.post('/api/v2/vfs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data.node;
  }

  /**
   * Download a file from VFS
   */
  async downloadFile(nodeId: string): Promise<Blob> {
    const response = await this.client.get(`/api/v2/vfs/nodes/${nodeId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }

  /**
   * Create a new folder in VFS
   */
  async createFolder(name: string, parentId?: string): Promise<VFSNode> {
    const data: any = { name };
    if (parentId) {
      data.parent_id = parentId;
    }

    const response = await this.client.post('/api/v2/vfs/folders', data);
    return response.data.folder;
  }

  /**
   * Update a VFS node (rename or move)
   */
  async updateNode(
    nodeId: string,
    updates: { name?: string; parent_id?: string }
  ): Promise<VFSNode> {
    const response = await this.client.patch(`/api/v2/vfs/nodes/${nodeId}`, updates);
    return response.data.node;
  }

  /**
   * Delete a VFS node (soft delete)
   */
  async deleteNode(nodeId: string): Promise<boolean> {
    const response = await this.client.delete(`/api/v2/vfs/nodes/${nodeId}`);
    return response.data.success;
  }

  /**
   * Get contents of a specific folder
   */
  async getFolderContents(folderId: string): Promise<VFSNode[]> {
    return this.listNodes({ parent_id: folderId });
  }

  /**
   * Search for files by name pattern or MIME type
   */
  async searchFiles(params: {
    namePattern?: string;
    mimeType?: string;
    limit?: number;
  }): Promise<VFSNode[]> {
    // Note: This would require additional API endpoints for search
    // For now, we'll list all files and filter client-side
    const allNodes = await this.listNodes({ limit: params.limit || 100 });

    return allNodes.filter(node => {
      if (node.type !== 'file') return false;

      if (params.namePattern && !node.name.toLowerCase().includes(params.namePattern.toLowerCase())) {
        return false;
      }

      if (params.mimeType && node.mime_type !== params.mimeType) {
        return false;
      }

      return true;
    });
  }

  /**
   * Get files by MIME type
   */
  async getFilesByType(mimeType: string, limit?: number): Promise<VFSNode[]> {
    const params: { mimeType: string; limit?: number } = { mimeType };
    if (limit !== undefined) {
      params.limit = limit;
    }
    return this.searchFiles(params);
  }

  /**
   * Get images only
   */
  async getImages(limit?: number): Promise<VFSNode[]> {
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    const allFiles = await this.listNodes({ type: 'file', limit: limit || 100 });
    
    return allFiles.filter(file => 
      file.mime_type && imageTypes.includes(file.mime_type)
    );
  }

  /**
   * Get videos only
   */
  async getVideos(limit?: number): Promise<VFSNode[]> {
    const videoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/webm', 'video/mkv'];
    const allFiles = await this.listNodes({ type: 'file', limit: limit || 100 });
    
    return allFiles.filter(file => 
      file.mime_type && videoTypes.includes(file.mime_type)
    );
  }

  /**
   * List folders shared with the current user
   */
  async listSharedFolders(): Promise<SharedFolder[]> {
    const response = await this.client.get('/api/v2/shared-folders');
    return response.data.folders;
  }

  /**
   * Get shared folder details and contents
   */
  async getSharedFolder(folderId: string): Promise<SharedFolderDetail> {
    const response = await this.client.get(`/api/v2/shared-folders/${folderId}`);
    return response.data;
  }

  /**
   * Create a shortcut to a shared folder in user's drive
   */
  async createShortcut(
    folderId: string,
    name?: string,
    parentId?: string
  ): Promise<Shortcut> {
    const response = await this.client.post('/api/v2/shared-folders/' + folderId + '/shortcut', {
      name,
      parent_id: parentId
    });
    return response.data.shortcut;
  }
}