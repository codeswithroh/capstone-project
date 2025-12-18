import { Injectable } from '@nestjs/common';

export type ChannelState = {
  address: string;
  addrA: string;
  addrB: string;
  nonce: number;
  balanceA: string; // nanoTON string
  balanceB: string; // nanoTON string
  closed: boolean;
};

@Injectable()
export class ChannelService {
  private channels = new Map<string, ChannelState>();

  openChannel(params: { address: string; addrA: string; addrB: string; balanceA?: string; balanceB?: string }) {
    const state: ChannelState = {
      address: params.address,
      addrA: params.addrA,
      addrB: params.addrB,
      nonce: 0,
      balanceA: params.balanceA ?? '0',
      balanceB: params.balanceB ?? '0',
      closed: false,
    };
    this.channels.set(state.address, state);
    return state;
  }

  getState(address: string) {
    return this.channels.get(address);
  }

  finalize(address: string, payload: { finalNonce: number; amountA: string; amountB: string }) {
    const st = this.channels.get(address);
    if (!st) return undefined;
    st.nonce = payload.finalNonce;
    st.balanceA = payload.amountA;
    st.balanceB = payload.amountB;
    st.closed = true;
    return st;
  }
}
