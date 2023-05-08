import Web3 from 'web3';
import { Transaction } from 'ethereumjs-tx';
import Common from 'ethereumjs-common';

let GAS_LIMIT = 21000;

const PROVIDER_URL = process.env.REACT_APP_ETH_PROVIDER_URL;

let web3 = new Web3(new Web3.providers.HttpProvider(PROVIDER_URL));

export function validateAddress(address) {
    if (!web3.utils.isAddress(address)) {
        return false;
    }
    return true;
}

export async function getBalance(address) {
    let balance = await web3.eth.getBalance(address);
    return balance / (10 ** 18);
}

function Accounts() {
    let accounts = [];

    function getAccounts() {
        return accounts;
    }

    function addAccount(address) {
        accounts.push(address);
    }

    return {
        getAccounts,
        addAccount,
    };
}
export { Accounts };

export async function Send(privKey, from, to, amount) {

    const customCommon = Common.forCustomChain(
        'mainnet',
        {
            name: 'sepolia',
            networkId: 11155111,
            chainId: 11155111,
        },
        'petersburg',
    );

    try {
        const nonce = await web3.eth.getTransactionCount(from);
        const value = web3.utils.toWei(amount.toString(), 'ether');
        const gasPrice = (await web3.eth.getGasPrice()).toString();
        const PRIVATE_KEY = privKey;

        const txData = {
            from: from,
            to: to,
            value: web3.utils.toHex(value),
            gasLimit: web3.utils.toHex(GAS_LIMIT),
            gasPrice: web3.utils.toHex(gasPrice),
            nonce: web3.utils.toHex(nonce),
        };

        const privateKey = new Uint8Array(Buffer.from(PRIVATE_KEY, 'hex'));
        const tx = new Transaction(txData, { common: customCommon });
        tx.sign(privateKey);

        alert(`Transaction hash: pending...`);

        const serializedTx = tx.serialize();
        const rawTx = '0x' + serializedTx.toString('hex');
        const txReceipt = await web3.eth.sendSignedTransaction(rawTx);

        const hash = txReceipt.transactionHash;

        return hash;
    } catch (err) {
        console.error(err);
        alert(`${err}`);
    }

}
