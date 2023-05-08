import { payments, networks } from 'bitcoinjs-lib';
import { mnemonicToSeed } from "bip39";

import { BIP32Factory } from "bip32";
const ecc = require('tiny-secp256k1');
const bip32 = BIP32Factory(ecc);

//import { bip32 } from 'bitcoinjs-lib';

const NETWORK = networks.testnet;

export async function provideAddress(queue, mnemonic) {
    const seed = await mnemonicToSeed(mnemonic);
    const root = bip32.fromSeed(seed, NETWORK);
    const child = root.derivePath(`m/44'/1'/0'/0/${queue}`);
    const { address } = payments.p2pkh({ pubkey: child.publicKey, network: NETWORK });
    return address;
}

export async function providePrivateKey(queue, mnemonic) {
    const seed = await mnemonicToSeed(mnemonic);
    const root = bip32.fromSeed(seed, NETWORK);
    const child = root.derivePath(`m/44'/1'/0'/0/${queue}`);
    const privateKey = child.toWIF();
    return privateKey;
}