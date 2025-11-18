/**
 * GraphQL Service
 * 
 * Handles GraphQL queries and mutations.
 */

import { BaseService } from './base';

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    extensions?: {
      code?: string;
      [key: string]: any;
    };
  }>;
}

export interface GraphQLOptions {
  variables?: Record<string, any>;
  operationName?: string;
}

export class GraphQLService extends BaseService {
  /**
   * Execute a GraphQL query
   * 
   * @example
   * ```typescript
   * const result = await client.graphql.query(`
   *   query {
   *     viewer {
   *       username
   *       tier
   *     }
   *   }
   * `);
   * console.log(result.data.viewer.username);
   * ```
   */
  async query<T = any>(
    query: string,
    options?: GraphQLOptions
  ): Promise<GraphQLResponse<T>> {
    const payload: any = { query };
    if (options?.variables) {
      payload.variables = options.variables;
    }
    if (options?.operationName) {
      payload.operationName = options.operationName;
    }

    const response = await this.client.post('/api/graphql', payload);
    const data = response.data as GraphQLResponse<T>;

    // Check for GraphQL errors
    if (data.errors && data.errors.length > 0) {
      const errorMessages = data.errors.map(e => e.message).join('; ');
      throw new Error(`GraphQL errors: ${errorMessages}`);
    }

    return data;
  }

  /**
   * Execute a GraphQL mutation
   * 
   * @example
   * ```typescript
   * const result = await client.graphql.mutate(`
   *   mutation {
   *     createNftProject(
   *       name: "My Project"
   *       collectionConfig: {...}
   *     ) {
   *       success
   *       project { id name }
   *     }
   *   }
   * `);
   * ```
   */
  async mutate<T = any>(
    mutation: string,
    options?: GraphQLOptions
  ): Promise<GraphQLResponse<T>> {
    return this.query<T>(mutation, options);
  }

  /**
   * Simple GraphQL health check
   */
  async healthCheck(): Promise<string> {
    const result = await this.query<{ health: string }>('{ health }');
    return result.data?.health || 'unknown';
  }
}

