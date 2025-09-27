// IPFS utilities for decentralized storage
import { create } from 'ipfs-http-client';

// IPFS configuration
const IPFS_GATEWAY = import.meta.env.VITE_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';
const PINATA_API_KEY = import.meta.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = import.meta.env.PINATA_SECRET_KEY;

// Initialize IPFS client (using Pinata as example)
export class IPFSService {
  private client: any;

  constructor() {
    // Initialize IPFS client - you can use different providers
    if (PINATA_API_KEY && PINATA_SECRET_KEY) {
      this.client = create({
        host: 'api.pinata.cloud',
        port: 443,
        protocol: 'https',
        headers: {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY
        }
      });
    }
  }

  async uploadFile(file: File): Promise<string> {
    try {
      if (!this.client) {
        throw new Error('IPFS client not configured');
      }

      const result = await this.client.add(file);
      return `${IPFS_GATEWAY}${result.path}`;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  }

  async uploadJSON(data: any): Promise<string> {
    try {
      if (!this.client) {
        throw new Error('IPFS client not configured');
      }

      const jsonString = JSON.stringify(data);
      const result = await this.client.add(jsonString);
      return `${IPFS_GATEWAY}${result.path}`;
    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error);
      throw new Error('Failed to upload JSON to IPFS');
    }
  }

  // Fallback method for when IPFS is not configured
  async uploadToFallback(file: File): Promise<string> {
    // In a real implementation, you might upload to a traditional cloud service
    // For now, return a placeholder URL
    console.warn('IPFS not configured, using fallback URL');
    return 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg';
  }

  isConfigured(): boolean {
    return !!this.client;
  }
}

export const ipfsService = new IPFSService();