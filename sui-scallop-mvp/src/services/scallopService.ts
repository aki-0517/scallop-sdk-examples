import { Scallop } from '@scallop-io/sui-scallop-sdk';
// @ts-ignore
import { SuiKit } from '@scallop-io/sui-kit';

class ScallopService {
  private static instance: ScallopService;
  private scallopSDK: Scallop | null = null;
  private suiKit: any | null = null;
  private initialized = false;

  static getInstance(): ScallopService {
    if (!ScallopService.instance) {
      ScallopService.instance = new ScallopService();
    }
    return ScallopService.instance;
  }

  async initialize(secretKey?: string) {
    if (this.initialized && this.scallopSDK) return this.scallopSDK;

    try {
      // Initialize SuiKit first
      if (secretKey) {
        this.suiKit = new SuiKit({
          secretKey,
          networkType: import.meta.env.VITE_NETWORK_TYPE || 'mainnet',
        });
      }

      // Initialize Scallop SDK
      const config: any = {
        addressId: import.meta.env.VITE_SCALLOP_ADDRESS_ID || '67c44a103fe1b8c454eb9699',
        networkType: import.meta.env.VITE_NETWORK_TYPE || 'mainnet',
      };

      if (secretKey) {
        config.secretKey = secretKey;
      }

      if (this.suiKit) {
        config.suiKit = this.suiKit;
      }

      console.log('Initializing Scallop SDK with config:', config);
      
      this.scallopSDK = new Scallop(config);
      await this.scallopSDK.init();
      this.initialized = true;
      
      console.log('Scallop SDK initialized successfully');
      return this.scallopSDK;
    } catch (error) {
      console.error('Failed to initialize Scallop SDK:', error);
      this.initialized = false;
      throw error;
    }
  }

  async initializeWithWallet(address: string) {
    try {
      // For read-only operations with wallet address
      const config: any = {
        addressId: import.meta.env.VITE_SCALLOP_ADDRESS_ID || '67c44a103fe1b8c454eb9699',
        networkType: import.meta.env.VITE_NETWORK_TYPE || 'mainnet',
      };

      console.log('Initializing Scallop SDK for wallet:', address);
      
      this.scallopSDK = new Scallop(config);
      await this.scallopSDK.init();
      this.initialized = true;
      
      console.log('Scallop SDK initialized for wallet successfully');
      return this.scallopSDK;
    } catch (error) {
      console.error('Failed to initialize Scallop SDK for wallet:', error);
      this.initialized = false;
      throw error;
    }
  }

  getSDK(): Scallop | null {
    return this.scallopSDK;
  }

  getSuiKit(): any | null {
    return this.suiKit;
  }

  async getClient() {
    if (!this.scallopSDK) {
      throw new Error('Scallop SDK not initialized');
    }
    return this.scallopSDK.client;
  }

  async getQuery() {
    if (!this.scallopSDK) {
      throw new Error('Scallop SDK not initialized');
    }
    return this.scallopSDK.client.query;
  }

  async getBuilder() {
    if (!this.scallopSDK) {
      throw new Error('Scallop SDK not initialized');
    }
    return this.scallopSDK.client.builder;
  }

  async getUtils() {
    if (!this.scallopSDK) {
      throw new Error('Scallop SDK not initialized');
    }
    return this.scallopSDK.client.utils;
  }

  isInitialized(): boolean {
    return this.initialized && this.scallopSDK !== null;
  }

  reset() {
    this.scallopSDK = null;
    this.suiKit = null;
    this.initialized = false;
  }
}

export default ScallopService;