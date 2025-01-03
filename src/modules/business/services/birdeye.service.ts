import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { TransactionSignature } from '@solana/web3.js';

@Injectable()
export class BirdeyeService {
  private readonly headers: any;
  private readonly preUrl: string;
  constructor() {
    this.headers = {
      accept: 'application/json',
      'x-api-key': process.env.BIRD_EYE_API_KEY,
      'X-API-KEY': process.env.BIRD_EYE_API_KEY,
      'x-chain': 'solana',
    };
    this.preUrl = 'https://public-api.birdeye.so';
  }

  async getTokenInfoByAddress(address: string) {
    const url = `${this.preUrl}/defi/token_overview?address=${address}`;
    const headers = {
      ...this.headers,
    };

    try {
      const response = await axios.get(url, { headers: headers });
      return response.data?.data;
    } catch (error) {
      console.error('[BirdeyeService] [getTokenInfoByAddress] ', error);
      return null;
    }
  }

  async getWalletTransactions(
    walletAddress: string,
    limit: number,
    before?: TransactionSignature,
  ) {
    try {
      let apiUrl = `${this.preUrl}/v1/wallet/tx_list?wallet=${walletAddress}&limit=${limit}`;
      if (before) apiUrl += `&before=${before}`;
      const response = await axios.get(apiUrl, {
        headers: {
          ...this.headers,
        },
      });

      return response.data?.data?.solana;
    } catch (e) {
      console.log('Error fetching wallet transactions: ', e);
      return [];
    }
  }

  async getWalletTokens(walletAddress: string) {
    try {
      const response = await axios.get(
        `${this.preUrl}/v1/wallet/token_list`,
        {
          params: {
            wallet: walletAddress
          },
          headers: {
            ...this.headers
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet tokens from Birdeye:', error);
      throw error;
    }
  }

  async onApplicationBootstrap() {}
}
