# Zetsubou.life JavaScript SDK

A comprehensive JavaScript/TypeScript SDK for the Zetsubou.life API v2, providing easy access to AI-powered tools, encrypted file storage, chat capabilities, and webhooks.

[![npm version](https://badge.fury.io/js/%40zetsubou-life%2Fsdk.svg)](https://badge.fury.io/js/%40zetsubou-life%2Fsdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🛠️ **AI Tools**: Execute 16+ AI-powered tools for image and video processing
- 🔒 **Encrypted Storage**: Zero-knowledge file storage with client-side encryption
- 💬 **Chat API**: Conversational AI with multiple models (Llama 3.2, Qwen 2.5 VL, etc.)
- 📊 **Job Management**: Track, monitor, and download job results
- 🪝 **Webhooks**: Real-time event notifications for jobs, files, and storage
- 🔑 **API Keys**: Secure authentication with scope-based permissions
- 📈 **Usage Tracking**: Monitor storage, API usage, and job statistics
- 🌐 **Browser & Node.js**: Works in both browser and Node.js environments
- 📱 **TypeScript**: Full TypeScript support with comprehensive type definitions

## Installation

```bash
npm install @zetsubou-life/sdk
```

Or with yarn:

```bash
yarn add @zetsubou-life/sdk
```

## Quick Start

```typescript
import { ZetsubouClient } from '@zetsubou-life/sdk';

// Initialize the client
const client = new ZetsubouClient({
  apiKey: 'ztb_live_your_api_key_here'
});

// List available tools
const tools = await client.tools.list();
console.log('Available tools:', tools.map(t => t.name));

// Get account info
const account = await client.account.getAccount();
console.log(`Tier: ${account.tier}, Username: ${account.username}`);

// Check storage quota
const quota = await client.account.getStorageQuota();
console.log(`Storage: ${quota.usage_percent}% used`);
```

## Core Features

### 🛠️ Tool Execution

Execute AI-powered tools with simple method calls:

```typescript
// Get tool metadata
const tool = await client.tools.get('remove_bg');
console.log(`Tool: ${tool.name} (Tier: ${tool.required_tier})`);
console.log(`Supports batch: ${tool.supports_batch}`);
console.log(`Supports audio: ${tool.supports_audio}`);

// Execute a tool (browser example with file input)
const fileInput = document.querySelector('input[type="file"]');
const job = await client.tools.execute(
  'remove_bg',
  [fileInput.files[0]],
  { model_name: 'isnet-general-use' }
);

// Wait for completion
const completedJob = await client.jobs.waitForCompletion(job.id);
console.log(`Job completed! Status: ${completed Job.status}`);

// Download results
const resultsBlob = await client.jobs.downloadResults(job.id);
const url = URL.createObjectURL(resultsBlob);
// Use url for download link
```

### 📋 Job Management

Track and manage asynchronous jobs:

```typescript
// List recent jobs
const jobs = await client.jobs.list({ limit: 10, status: 'completed' });
jobs.forEach(job => {
  console.log(`Job ${job.job_id}: ${job.tool} - ${job.status}`);
});

// Get specific job
const job = await client.jobs.get(jobId);
console.log(`Status: ${job.status}, Progress: ${job.progress}%`);

// Cancel a running job
await client.jobs.cancel(jobId);

// Retry a failed job
const retriedJob = await client.jobs.retry(jobId);

// Delete job and free storage
await client.jobs.delete(jobId);
```

### 🔒 File Storage (VFS)

Manage encrypted files with the Virtual File System:

```typescript
// Upload files (browser)
const fileInput = document.querySelector('input[type="file"]');
const node = await client.vfs.uploadFile(
  fileInput.files[0],
  null, // parent_id
  true  // encrypt
);
console.log(`Uploaded: ${node.name} (${node.size_bytes} bytes)`);

// List files
const files = await client.vfs.listNodes({ type: 'file', limit: 50 });
files.forEach(file => {
  console.log(`${file.name} - ${file.mime_type} - ${file.size_bytes} bytes`);
});

// Download files
const blob = await client.vfs.downloadFile(node.id);
const url = URL.createObjectURL(blob);

// Create folders
const folder = await client.vfs.createFolder('My Projects', null);

// Update node metadata
const updated = await client.vfs.updateNode(node.id, { name: 'New Name' });

// Delete node
await client.vfs.deleteNode(node.id);

// Search files by type
const images = await client.vfs.getImages(100);
const videos = await client.vfs.getVideos(100);
```

### 💬 Chat Integration

Create and manage AI conversations:

```typescript
// List conversations
const conversations = await client.chat.listConversations({ limit: 10 });

// Create a conversation
const conversation = await client.chat.createConversation(
  'AI Assistant',
  'llama3.2',
  'You are a helpful AI assistant.'
);

// Send messages
const message = await client.chat.sendMessage(
  conversation.id,
  'Hello! Can you help me process some images?'
);

// Get conversation history
const messages = await client.chat.getMessages(conversation.id, 50);
messages.forEach(msg => {
  console.log(`${msg.role}: ${msg.content}`);
});

// Delete conversation
await client.chat.deleteConversation(conversation.id);
```

### 🪝 Webhooks

Set up real-time event notifications:

```typescript
// Create a webhook
const webhook = await client.webhooks.create({
  url: 'https://your-app.com/webhooks/jobs',
  events: ['job.completed', 'job.failed'],
  secret: 'your_webhook_secret'
});

// List webhooks
const webhooks = await client.webhooks.list();

// Update webhook
const updated = await client.webhooks.update(webhook.id, {
  enabled: true
});

// Test a webhook
await client.webhooks.test(webhook.id);

// Delete webhook
await client.webhooks.delete(webhook.id);
```

### 📊 Account Management

Monitor usage and manage API keys:

```typescript
// Get account information
const account = await client.account.getAccount();
console.log(`Tier: ${account.tier}`);
console.log(`Username: ${account.username}`);
console.log(`Email: ${account.email}`);

// Check storage usage
const quota = await client.account.getStorageQuota();
console.log(`Used: ${parseInt(quota.used_bytes) / 1024 / 1024} MB`);
console.log(`Limit: ${parseInt(quota.quota_bytes) / 1024 / 1024} MB`);
console.log(`Usage: ${quota.usage_percent}%`);
console.log(`Files: ${quota.file_count}, Folders: ${quota.folder_count}`);

// Get storage breakdown
Object.entries(quota.breakdown).forEach(([category, data]) => {
  console.log(`${category}: ${data.bytes / 1024 / 1024} MB (${data.count} files)`);
});

// Get usage statistics
const usage = await client.account.getUsageStats({ period: '30d' });

// List API keys
const apiKeys = await client.account.listApiKeys();
apiKeys.forEach(key => {
  console.log(`${key.name}: ${key.scopes.join(', ')}`);
});

// Create API key
const apiKey = await client.account.createApiKey({
  name: 'My App Key',
  scopes: ['tools:execute', 'files:read', 'files:write'],
  expires_at: '2025-12-31T23:59:59Z',
  bypass_drive_lock: false
});
console.log(`New API key: ${apiKey.key}`);

// Delete API key
await client.account.deleteApiKey(keyId);
```

## Available Tools

The SDK provides access to 16 AI-powered tools across 3 tiers:

### Basic Tools (Free Tier)
- **Remove Background** (`remove_bg`): AI-powered background removal with 15 models
- **Polar Effect** (`polar_effect`): Create polaroid-style effects
- **P2Rotatooor** (`p2rotatooor`): Advanced polar effects with Node.js
- **The Process** (`the_process`): Image enhancement and processing
- **Batch Resize** (`batch_resize`): Resize multiple images at once

### Video Tools (Creator Tier)
- **Video Process** (`video_process`): Apply effects to videos
- **Video Background Remove** (`video_bgremove`): Remove backgrounds from videos
- **Video Batch Resize** (`video_batch_resize`): Resize multiple videos
- **Extract Frames** (`extract_frames`): Extract frames from videos
- **Clip Maker** (`clip_maker`): AI music video generator with audio support

### Advanced Tools (Pro Tier)
- **Datamosher** (`datamosher`): Glitch art video effects with audio
- **Datamelter** (`datamelter`): Melting video effects with audio
- **Orb Maker** (`orb_maker`): 3D orb generation
- **Background-Foreground Matcher** (`bgfg_matcher`): Match and composite images

Additional tools:
- **Swapperooni** (`swapperooni`): Advanced image manipulation
- **YOLOX Detector** (`yolox_detector`): Object detection

## Error Handling

Comprehensive error handling with custom exceptions:

```typescript
import {
  ZetsubouClient,
  ZetsubouError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  NotFoundError,
  ServerError
} from '@zetsubou/sdk';

try {
  const job = await client.tools.execute('invalid_tool', [file]);
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error(`Authentication failed: ${error.message}`);
    console.error(`Error code: ${error.code}`);
  } else if (error instanceof ValidationError) {
    console.error(`Validation error: ${error.message}`);
  } else if (error instanceof RateLimitError) {
    console.error(`Rate limited. Retry after ${error.retryAfter} seconds`);
  } else if (error instanceof NotFoundError) {
    console.error(`Resource not found: ${error.message}`);
  } else if (error instanceof ServerError) {
    console.error(`Server error: ${error.message}`);
  } else if (error instanceof ZetsubouError) {
    console.error(`SDK error: ${error.message}`);
  }
}
```

## Configuration

Configure the client with various options:

```typescript
const client = new ZetsubouClient({
  apiKey: 'ztb_live_your_key',
  baseURL: 'https://zetsubou.life',  // or custom endpoint
  timeout: 60000,  // Request timeout in milliseconds (default: 30000)
  retryAttempts: 5  // Number of retry attempts (default: 3)
});

// Custom axios instance (advanced)
import axios from 'axios';

const customAxios = axios.create({
  // custom configuration
});

const client = new ZetsubouClient({
  apiKey: 'your_key',
  axiosInstance: customAxios
});
```

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions:

```typescript
import {
  ZetsubouClient,
  Tool,
  Job,
  VFSNode,
  Account,
  StorageQuota,
  ChatConversation,
  ChatMessage
} from '@zetsubou/sdk';

// All methods are fully typed
const tools: Tool[] = await client.tools.list();
const job: Job = await client.jobs.get(jobId);
const account: Account = await client.account.getAccount();
```

## Examples

Check out the [examples directory](examples/) for complete working examples:

- **[basic-usage.js](examples/basic-usage.js)** - Get started with account info and tool listing
- **[tool-execution.js](examples/tool-execution.js)** - Execute tools and manage jobs
- **[file-management.js](examples/file-management.js)** - Upload, download, and manage VFS files
- **[storage-monitor.js](examples/storage-monitor.js)** - Monitor storage usage and quota

## API Reference

Full API documentation is available at [docs.zetsubou.life/sdk/javascript](https://docs.zetsubou.life/sdk/javascript).

## Requirements

- Node.js 14.0 or higher (for Node.js usage)
- Modern browser with ES6+ support (for browser usage)

## Dependencies

- `axios` >= 1.6.0
- `form-data` >= 4.0.0 (Node.js only)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: support@zetsubou.life
- 📖 Documentation: [docs.zetsubou.life](https://docs.zetsubou.life)
- 🐛 Issues: [GitHub Issues](https://github.com/zetsubou-life/javascript-sdk/issues)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.
