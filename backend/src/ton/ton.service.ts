import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class TonService {
  private http: AxiosInstance;
  private base: string;
  private key?: string;

  constructor(private readonly cfg: ConfigService) {
    this.base = this.cfg.get<string>('TONAPI_BASE') || 'https://testnet.tonapi.io';
    this.key = this.cfg.get<string>('TONAPI_KEY');
    this.http = axios.create({
      baseURL: this.base,
      headers: this.key ? { Authorization: `Bearer ${this.key}` } : undefined,
      timeout: 15000,
    });
  }

  async getAccount(address: string) {
    const { data } = await this.http.get(`/v2/accounts/${address}`);
    return data;
  }

  async getTxs(address: string, limit = 10) {
    const { data } = await this.http.get(`/v2/blockchain/accounts/${address}/transactions`, {
      params: { limit },
    });
    return data;
  }

  async getTx(hash: string) {
    const { data } = await this.http.get(`/v2/blockchain/transactions/${hash}`);
    return data;
  }

  async gasReportByAddress(address: string) {
    const txs = await this.getTxs(address, 20);
    return txs.transactions?.map((t: any) => ({
      hash: t.hash,
      fee: t.total_fees ?? t.total_fees_nanoton ?? t.fee,
      in_msg_value: t.in_msg?.value,
      out_msgs: t.out_msgs?.length,
      now: t.now,
    }));
  }
}
