import { Address, toNano } from '@ton/core';
import { PaymentChannel } from '../wrappers/PaymentChannel';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();
    const addrA = await ui.inputAddress('Enter participant A address');
    const addrB = await ui.inputAddress('Enter participant B address');

    const code = await compile('PaymentChannel');
    const paymentChannel = provider.open(
        PaymentChannel.createFromConfig({ addrA: Address.parse(addrA.toString()), addrB: Address.parse(addrB.toString()) }, code)
    );

    await paymentChannel.sendDeploy(provider.sender(), toNano('0.05'));
    await provider.waitForDeploy(paymentChannel.address);

    const state = await paymentChannel.getState();
    ui.write(`Deployed at: ${paymentChannel.address.toString()}`);
    ui.write(`State: nonce=${state.nonce} closed=${state.closed}`);
}
