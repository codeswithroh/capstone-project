import { Address, toNano } from '@ton/core';
import { PaymentChannel } from '../wrappers/PaymentChannel';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();

    const contractAddr = await ui.inputAddress('Enter deployed PaymentChannel address');
    const finalNonceStr = await ui.input('Final nonce (uint64)');
    const amountAStr = await ui.input('Amount to A (nanoTON)');
    const amountBStr = await ui.input('Amount to B (nanoTON)');

    const pc = provider.open(PaymentChannel.createFromAddress(Address.parse(contractAddr.toString())));

    await pc.sendClose(provider.sender(), {
        value: toNano('0.05'),
        finalNonce: BigInt(finalNonceStr),
        amountA: BigInt(amountAStr),
        amountB: BigInt(amountBStr),
    });

    ui.write('Close message sent. Wait for confirmation in your indexer.');
}
