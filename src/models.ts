/**
 * Zetsubou.life SDK Data Models
 * 
 * TypeScript interfaces and classes representing API responses and entities.
 */

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  input_type: string;
  output_type: string;
  required_tier: string;
  accessible: boolean;
  options: Record<string, any>;
}

export interface Job {
  id: string;
  tool_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  updated_at?: string;
  completed_at?: string;
  progress: number;
  error?: string;
  inputs: string[];
  outputs: string[];
  options: Record<string, any>;
}

export interface VFSNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size_bytes: number;
  mime_type?: string;
  created_at: string;
  updated_at: string;
  parent_id?: string;
  is_encrypted: boolean;
  download_url?: string;
}

export interface ChatMessage {
  id: number;
  uuid?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface ChatConversation {
  id?: number;
  uuid: string;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message?: ChatMessage;
}

export interface Webhook {
  id: number;
  url: string;
  events: string[];
  enabled: boolean;
  success_count: number;
  failure_count: number;
  last_delivery_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  user_id: number;
  username: string;
  email: string;
  tier: string;
  created_at: string;
  subscription: {
    status: string;
    expires_at?: string;
  };
  usage: {
    storage_quota_bytes: number;
    storage_used_bytes: number;
    storage_used_percent: string;
  };
  features: {
    max_concurrent_jobs: number;
    rate_limit_per_minute: number;
    tools: string[];
  };
}

export interface StorageQuota {
  tier: string;
  quota_bytes: number;
  used_bytes: number;
  available_bytes: number;
  usage_percent: number;
  file_count: number;
  folder_count: number;
  breakdown: {
    images: { bytes: number; count: number };
    videos: { bytes: number; count: number };
    other: { bytes: number; count: number };
  };
  largest_files: Array<{
    name: string;
    node_id: string;
    size_bytes: number;
  }>;
}

export interface ToolOptions {
  [key: string]: any;
}

export interface JobListParams {
  status?: string;
  tool_id?: string;
  limit?: number;
  offset?: number;
}

export interface VFSListParams {
  parent_id?: string;
  type?: 'file' | 'folder';
  limit?: number;
  offset?: number;
}

export interface ChatListParams {
  limit?: number;
  offset?: number;
}

export interface WebhookCreateParams {
  url: string;
  events: string[];
  secret?: string;
}

export interface WebhookUpdateParams {
  url?: string;
  events?: string[];
  secret?: string;
  enabled?: boolean;
}

export interface ApiKeyCreateParams {
  name: string;
  scopes: string[];
  expires_at?: string;
  drive_bypass?: boolean;
}

export interface UsageStatsParams {
  period?: '7d' | '30d' | '90d' | '1y';
  tool_id?: string;
}

export interface WebhookStatsParams {
  days?: number;
}

export interface SharedFolder {
  id: string;
  name: string;
  path: string;
  size_bytes: number;
  created_at: string;
  updated_at: string;
  permission: 'viewer' | 'editor';
  share_id: string;
  owner: {
    id: number;
    username: string;
    email: string;
  };
  share_type: 'invite_only' | 'link_access';
}

export interface SharedFolderDetail {
  folder: VFSNode;
  permission: 'owner' | 'viewer' | 'editor';
  is_shared: boolean;
  owner: {
    id: number;
    username: string;
  };
  files: VFSNode[];
}

export interface Shortcut {
  id: string;
  name: string;
  type: string;
  path: string;
  target_folder_id: string;
  created_at: string;
}