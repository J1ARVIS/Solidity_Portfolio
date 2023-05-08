import privKeyToAddressETH from 'ethereum-private-key-to-address';
import { mnemonicToSeed } from "bip39";

import { BIP32Factory } from "bip32";
const ecc = require('tiny-secp256k1');
const bip32 = BIP32Factory(ecc);

//import { bip32 } from 'bitcoinjs-lib';

export async function provideAddress(queue, mnemonic) {
    const privateKey = await providePrivateKey(queue, mnemonic);
    const address = privKeyToAddressETH(privateKey);
    return address;
}

export async function providePrivateKey(queue, mnemonic) {
    //console.log("ETH providePrivateKey mneminic:", mnemonic);
    const seed = await mnemonicToSeed(mnemonic);
    //console.log("ETH providePrivateKey seed:", seed);
    const node = bip32.fromSeed(seed);
    const child = node.derivePath(`m/44'/60'/0'/0/${queue}`);
    const privateKey = child.privateKey.toString('hex');
    return privateKey;
}
