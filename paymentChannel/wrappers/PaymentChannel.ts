import {
    Address,
    beginCell,
    Cell,
    Contract,
    ContractABI,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode
} from '@ton/core';

export type PaymentChannelConfig = {
    addrA: Address;
    addrB: Address;
};

export function paymentChannelConfigToCell(config: PaymentChannelConfig): Cell {
    // Mirrors TOLK Storage layout: addr_a, addr_b, nonce:uint64 (0), closed:bit(0)
    return beginCell()
        .storeAddress(config.addrA)
        .storeAddress(config.addrB)
        .storeUint(0n, 64)
        .storeBit(0)
        .endCell();
}

export class PaymentChannel implements Contract {
    abi: ContractABI = { name: 'PaymentChannel' }

    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new PaymentChannel(address);
    }

    static createFromConfig(config: PaymentChannelConfig, code: Cell, workchain = 0) {
        const data = paymentChannelConfigToCell(config);
        const init = { code, data };
        return new PaymentChannel(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getState(provider: ContractProvider): Promise<{ nonce: bigint; closed: boolean }> {
        const nonceRes = await provider.get('get_nonce', []);
        const nonce = nonceRes.stack.readBigNumber();
        const closedRes = await provider.get('get_closed', []);
        const closedNum = closedRes.stack.readNumber();
        return { nonce, closed: BigInt(closedNum) !== 0n };
    }

    async getParticipants(provider: ContractProvider): Promise<{ addrA: Address; addrB: Address }> {
        const resA = await provider.get('get_addr_a', []);
        const addrA = resA.stack.readAddress();
        const resB = await provider.get('get_addr_b', []);
        const addrB = resB.stack.readAddress();
        return { addrA, addrB };
    }

    async getNonce(provider: ContractProvider): Promise<bigint> {
        const res = await provider.get('get_nonce', []);
        return res.stack.readBigNumber();
    }

    async sendClose(provider: ContractProvider, via: Sender, opts: { value: bigint; finalNonce: bigint; amountA: bigint; amountB: bigint; queryId?: bigint }) {
        const body = beginCell()
            .storeUint(0x0C10E5En, 32) // op: close (arbitrary constant)
            .storeUint(opts.queryId ?? 0n, 64)
            .storeUint(opts.finalNonce, 64)
            .storeCoins(opts.amountA)
            .storeCoins(opts.amountB)
            .endCell();

        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body,
        });
    }
}
