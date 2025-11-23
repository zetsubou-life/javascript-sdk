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
  async getConversation(conversationUuid: string): Promise<ChatConversation> {
    const response = await this.client.get(`/api/v2/chat/conversations/${conversationUuid}`);
    return response.data;
  }

  /**
   * Delete a chat conversation
   */
  async deleteConversation(conversationUuid: string): Promise<boolean> {
    const response = await this.client.delete(`/api/v2/chat/conversations/${conversationUuid}`);
    return response.data.success;
  }

  /**
   * Get all messages for a conversation
   */
  async getMessages(conversationUuid: string): Promise<ChatMessage[]> {
    const response = await this.client.get(`/api/v2/chat/conversations/${conversationUuid}/messages`);
    return response.data.messages;
  }

  /**
   * Send a message to a conversation
   */
  async sendMessage(conversationUuid: string, content: string): Promise<ChatMessage> {
    const response = await this.client.post(`/api/v2/chat/conversations/${conversationUuid}/messages`, {
      content
    });
    return response.data.message;
  }

  /**
   * Export a conversation in various formats (json, md, html, pdf)
   */
  async exportConversation(
    conversationUuid: string,
    format: 'json' | 'md' | 'html' | 'pdf' = 'json'
  ): Promise<any> {
    const response = await this.client.get(`/api/v2/chat/conversations/${conversationUuid}/export`, {
      params: { format },
      responseType: format === 'pdf' ? 'blob' : format === 'html' ? 'text' : 'json'
    });

    if (format === 'json') {
      return response.data;
    } else if (format === 'md' || format === 'html') {
      return response.data;
    } else if (format === 'pdf') {
      return response.data; // Blob
    }
    
    return response.data;
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
    const message = await this.sendMessage(conversation.uuid, content);
    return { conversation, message };
  }

  /**
   * Get conversation history with pagination
   */
  async getConversationHistory(
    conversationUuid: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{
    messages: ChatMessage[];
    total: number;
    hasMore: boolean;
  }> {
    const messages = await this.getMessages(conversationUuid);
    
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