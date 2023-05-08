import { provideAddress as provideAddressETH, providePrivateKey as providePrivateKeyETH } from './ETH';

export async function provideAddress(queue, mnemonic) {
    return await provideAddressETH(queue, mnemonic);
}

export async function providePrivateKey(queue, mnemonic) {
    return await providePrivateKeyETH(queue, mnemonic);
}