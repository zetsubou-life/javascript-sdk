/**
 * Chat Service
 * 
 * Handles chat conversations and message management.
 */

import { BaseService } from './base';
import { ChatConversation, ChatMessage, ChatListParams } from '../models';
import { ZetsubouClient } from '../client';

export class ChatService extends BaseService {
  constructor(client: ZetsubouClient) {
    super(client);
  }

  /**
   * List all chat conversations
   */
  async listConversations(params?: ChatListParams): Promise<ChatConversation[]> {
    const response = await this.client.get('/api/v2/chat/conversations', params);
    return response.data.conversations;
  }

  /**
   * Create a new chat conversation
   */
  async createConversation(
    title: string,
    model: string = 'llama3.2',
    systemPrompt?: string
  ): Promise<ChatConversation> {
    const data: any = { title, model };
    if (systemPrompt) {
      data.system_prompt = systemPrompt;
    }

    const response = await this.client.post('/api/v2/chat/conversations', data);
    return response.data.conversation;
  }

  /**
   * Get details for a specific conversation
   */
  async getConversation(conversationId: number): Promise<ChatConversation> {
    // Note: This endpoint might not exist in the current API
    // We'll implement it as a placeholder for future use
    const conversations = await this.listConversations({ limit: 1000 });
    const conversation = conversations.find(conv => conv.id === conversationId);
    
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }
    
    return conversation;
  }

  /**
   * Delete a chat conversation
   */
  async deleteConversation(conversationId: number): Promise<boolean> {
    const response = await this.client.delete(`/api/v2/chat/conversations/${conversationId}`);
    return response.data.success;
  }

  /**
   * Get all messages for a conversation
   */
  async getMessages(conversationId: number): Promise<ChatMessage[]> {
    const response = await this.client.get(`/api/v2/chat/conversations/${conversationId}/messages`);
    return response.data.messages;
  }

  /**
   * Send a message to a conversation
   */
  async sendMessage(conversationId: number, content: string): Promise<ChatMessage> {
    const response = await this.client.post(`/api/v2/chat/conversations/${conversationId}/messages`, {
      content
    });
    return response.data.message;
  }

  /**
   * Export a conversation in JSON or Markdown format
   */
  async exportConversation(
    conversationId: number,
    format: 'json' | 'md' = 'json'
  ): Promise<any> {
    const response = await this.client.get(`/api/v2/chat/conversations/${conversationId}/export`, {
      params: { format }
    });

    if (format === 'json') {
      return response.data;
    } else {
      return response.data;
    }
  }

  /**
   * Get list of available AI models
   */
  getAvailableModels(): string[] {
    // Note: This would require a separate API endpoint
    // For now, return common models
    return [
      'llama3.2',
      'qwen2.5-vl',
      'glm-4.6:cloud',
      'auto'
    ];
  }

  /**
   * Create a new conversation and send the first message
   */
  async createAndSendMessage(
    title: string,
    content: string,
    model: string = 'llama3.2',
    systemPrompt?: string
  ): Promise<{ conversation: ChatConversation; message: ChatMessage }> {
    const conversation = await this.createConversation(title, model, systemPrompt);
    const message = await this.sendMessage(conversation.id, content);
    return { conversation, message };
  }

  /**
   * Get conversation history with pagination
   */
  async getConversationHistory(
    conversationId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<{
    messages: ChatMessage[];
    total: number;
    hasMore: boolean;
  }> {
    const messages = await this.getMessages(conversationId);
    
    // Simple pagination (in a real implementation, this would be server-side)
    const paginatedMessages = messages.slice(offset, offset + limit);
    const hasMore = offset + limit < messages.length;
    
    return {
      messages: paginatedMessages,
      total: messages.length,
      hasMore
    };
  }

  /**
   * Search conversations by title or content
   */
  async searchConversations(query: string): Promise<ChatConversation[]> {
    const conversations = await this.listConversations({ limit: 1000 });
    
    return conversations.filter(conv => 
      conv.title.toLowerCase().includes(query.toLowerCase()) ||
      (conv.last_message && conv.last_message.content.toLowerCase().includes(query.toLowerCase()))
    );
  }
}