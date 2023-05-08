import { provideAddress as getAddressETH, providePrivateKey as getPrivateKeyETH } from './protocols/ETH';
import { provideAddress as getAddressERC, providePrivateKey as getPrivateKeyERC } from './protocols/ERC20';
import { provideAddress as getAddressBTC, providePrivateKey as getPrivateKeyBTC } from './protocols/BTC';
import { provideAddress as getAddressLTC, providePrivateKey as getPrivateKeyLTC } from './protocols/LTC';
import { provideAddress as getAddressBNB, providePrivateKey as getPrivateKeyBNB } from './protocols/BNB';

export async function getAddress(network, queue, mnemonic) {
    let address;

    switch (network) {
        case "Bitcoin":
            address = await getAddressBTC(queue, mnemonic);
            break;
        case "Ethereum":
            address = await getAddressETH(queue, mnemonic);
            break;
        case "ERC20":
            address = await getAddressERC(queue, mnemonic);
            break;
        case "BNB Chain":
            address = await getAddressBNB(queue, mnemonic);
            break;
        case "Litecoin":
            address = await getAddressLTC(queue, mnemonic);
            break;
        default:
            console.log("Something went wrong, 'getAddress' switch");
    }

    return address;
}

export async function getPrivateKey(network, queue, mnemonic) {
    let privateKey;

    switch (network) {
        case "Bitcoin":
            privateKey = await getPrivateKeyBTC(queue, mnemonic);
            break;
        case "Ethereum":
            privateKey = await getPrivateKeyETH(queue, mnemonic);
            break;
        case "ERC20":
            privateKey = await getPrivateKeyERC(queue, mnemonic);
            break;
        case "BNB Chain":
            privateKey = await getPrivateKeyBNB(queue, mnemonic);
            break;
        case "Litecoin":
            privateKey = await getPrivateKeyLTC(queue, mnemonic);
            break;
        default:
            console.log("Something went wrong, 'getPrivateKey' switch");
    }

    return privateKey;
}