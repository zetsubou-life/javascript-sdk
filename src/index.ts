/**
 * Zetsubou.life JavaScript SDK
 * 
 * A comprehensive JavaScript/TypeScript SDK for the Zetsubou.life API v2.
 * Provides easy access to AI tools, encrypted file storage, chat, and webhooks.
 * 
 * @example
 * ```typescript
 * import { ZetsubouClient } from '@zetsubou/sdk';
 * 
 * const client = new ZetsubouClient('ztb_live_your_api_key_here');
 * 
 * // List available tools
 * const tools = await client.tools.list();
 * 
 * // Execute a tool
 * const job = await client.tools.execute('remove_bg', ['image.jpg']);
 * 
 * // Wait for completion
 * const completedJob = await client.jobs.waitForCompletion(job.id);
 * ```
 */

export { ZetsubouClient } from './client';
export { ZetsubouError, AuthenticationError, RateLimitError, ValidationError, NotFoundError, ServerError } from './exceptions';
export {
  Tool,
  Job,
  VFSNode,
  ChatConversation,
  ChatMessage,
  Webhook,
  Account,
  StorageQuota,
  SharedFolder,
  SharedFolderDetail,
  Shortcut
} from './models';

// Re-export services for advanced usage
export { ToolsService } from './services/tools';
export { JobsService } from './services/jobs';
export { VFSService } from './services/vfs';
export { ChatService } from './services/chat';
export { WebhooksService } from './services/webhooks';
export { AccountService } from './services/account';
export { NFTService } from './services/nft';
export type {
  NFTProject,
  NFTLayer,
  NFTLayerTrait,
  NFTGeneration,
  NFTLimits,
  CreateProjectOptions,
  CreateLayerOptions,
  CreateGenerationOptions
} from './services/nft';
export { GraphQLService } from './services/graphql';
export type {
  GraphQLResponse,
  GraphQLOptions
} from './services/graphql';

// Version
export { VERSION } from './constants';