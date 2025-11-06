/**
 * Base Service Class
 *
 * Abstract base class for all service modules.
 */

import { ZetsubouClient } from '../client';

export abstract class BaseService {
  protected client: ZetsubouClient;

  constructor(client: ZetsubouClient) {
    this.client = client;
  }
}
