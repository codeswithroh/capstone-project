import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, Cell, toNano } from '@ton/core';
import { PaymentChannel } from '../wrappers/PaymentChannel';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('PaymentChannel', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('PaymentChannel');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let partyA: SandboxContract<TreasuryContract>;
    let partyB: SandboxContract<TreasuryContract>;
    let paymentChannel: SandboxContract<PaymentChannel>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        deployer = await blockchain.treasury('deployer');
        partyA = await blockchain.treasury('partyA');
        partyB = await blockchain.treasury('partyB');

        paymentChannel = blockchain.openContract(
            PaymentChannel.createFromConfig({ addrA: partyA.address as Address, addrB: partyB.address as Address }, code)
        );

        const deployResult = await paymentChannel.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: paymentChannel.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and paymentChannel are ready to use
    });

    it('should close channel and update state', async () => {
        const closeTx = await paymentChannel.sendClose(deployer.getSender(), {
            value: toNano('0.05'),
            finalNonce: 1n,
            amountA: 0n,
            amountB: 0n,
        });

        expect(closeTx.transactions).toHaveTransaction({
            from: deployer.address,
            to: paymentChannel.address,
            success: true,
        });

        const state = await paymentChannel.getState();
        expect(state.nonce).toEqual(1n);
        expect(state.closed).toEqual(true);
    });
});
