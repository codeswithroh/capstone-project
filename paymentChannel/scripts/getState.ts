import { Address } from '@ton/core';
import { PaymentChannel } from '../wrappers/PaymentChannel';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();
    const contractAddr = await ui.inputAddress('Enter PaymentChannel address');
    const pc = provider.open(PaymentChannel.createFromAddress(Address.parse(contractAddr.toString())));
    const state = await pc.getState();
    ui.write(`State: nonce=${state.nonce} closed=${state.closed}`);
}
