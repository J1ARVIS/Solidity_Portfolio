import { validateAddress as validateAddressETH } from '../eth/EthLib';

import Web3 from 'web3';
import { Transaction } from 'ethereumjs-tx';
import Common from 'ethereumjs-common';

let GAS_LIMIT = 300000;

const PROVIDER_URL = process.env.REACT_APP_ETH_PROVIDER_URL;
const CONTRACT_ADDRESS = process.env.REACT_APP_ERC20_CONTRACT_ADDRESS;
const ERC20_ABI = require("./ERC20_ABI").default;

let web3 = new Web3(new Web3.providers.HttpProvider(PROVIDER_URL));

export function validateAddress(address) {
    return validateAddressETH(address);
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

export function getContract() {
    return new web3.eth.Contract(ERC20_ABI, CONTRACT_ADDRESS);
}

export async function getBalance(address) {
    let balance = await getContract().methods.balanceOf(address).call();
    let decimals = await getContract().methods.decimals().call();

    return balance / (10 ** decimals);
}

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
        const PRIVATE_KEY = privKey;
        let decimals = await getContract().methods.decimals().call();
        let value = (amount * (10 ** decimals)).toString();
        value = web3.utils.toHex(value);

        const gasPrice = (await web3.eth.getGasPrice()).toString();

        const txData = {
            from: from,
            to: CONTRACT_ADDRESS,
            gasLimit: web3.utils.toHex(GAS_LIMIT),
            gasPrice: web3.utils.toHex(gasPrice),
            nonce: web3.utils.toHex(nonce),
            data: getContract().methods.transfer(to, value).encodeABI()
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