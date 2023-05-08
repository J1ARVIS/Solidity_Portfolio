import { getBalance as getBalanceETH, Send as SendETH} from './eth/EthLib';
import { Accounts as AccountsETH } from './eth/EthLib';

import { getBalance as getBalanceERC, Send as SendERC } from './erc20/ERC20Lib';
import { Accounts as AccountsERC } from './erc20/ERC20Lib';

import { getBalance as getBalanceBTC, Send as SendBTC } from './btc/BtcLib';
import { Accounts as AccountsBTC } from './btc/BtcLib';

import { getBalance as getBalanceLTC, Send as SendLTC } from './ltc/LtcLib';
import { Accounts as AccountsLTC } from './ltc/LtcLib';

import { getBalance as getBalanceBNB, Send as SendBNB} from './bnb/BnbLib';
import { Accounts as AccountsBNB } from './bnb/BnbLib';

const ethAccounts = AccountsETH();
const ercAccounts = AccountsERC();
const btcAccounts = AccountsBTC();
const ltcAccounts = AccountsLTC();
const bnbAccounts = AccountsBNB();

export async function getBalance(network, address) {
    let balance;

    switch (network) {
        case "Bitcoin":
            balance = await getBalanceBTC(address);
            break;
        case "Ethereum":
            balance = await getBalanceETH(address);
            break;
        case "ERC20":
            balance = await getBalanceERC(address);
            break;
        case "BNB Chain":
            balance = await getBalanceBNB(address);
            break;
        case "Litecoin":
            balance = await getBalanceLTC(address);
            break;
        default:
            console.log("Something went wrong, 'getBalance' switch");
    }

    return balance;
}

export async function Send(network, privateKey, from, to, amount) {
    let hash;

    switch (network) {
        case "Bitcoin":
            hash = await SendBTC(privateKey, from, to, amount);
            break;
        case "Ethereum":
            hash = await SendETH(privateKey, from, to, amount);
            break;
        case "ERC20":
            hash = await SendERC(privateKey, from, to, amount);
            break;
        case "BNB Chain":
            hash = await SendBNB(privateKey, from, to, amount);
            break;
        case "Litecoin":
            hash = await SendLTC(privateKey, from, to, amount);
            break;
        default:
            console.log("Something went wrong, 'Send' switch");
    }

    return hash;
}

export function getAccounts(network) {
    let accounts = [];

    switch (network) {
        case "Bitcoin":
            accounts = btcAccounts.getAccounts();
            break;
        case "Ethereum":
            accounts = ethAccounts.getAccounts();
            break;
        case "ERC20":
            accounts = ercAccounts.getAccounts();
            break;
        case "BNB Chain":
            accounts = bnbAccounts.getAccounts();
            break;
        case "Litecoin":
            accounts = ltcAccounts.getAccounts();
            break;
        default:
            console.log("Something went wrong, 'getAccounts' switch");
    }

    return accounts;
}

export function addAccount(network, address) {
    switch (network) {
        case "Bitcoin":
            btcAccounts.addAccount(address);
            break;
        case "Ethereum":
            ethAccounts.addAccount(address);
            break;
        case "ERC20":
            ercAccounts.addAccount(address);
            break;
        case "BNB Chain":
            bnbAccounts.addAccount(address);
            break;
        case "Litecoin":
            ltcAccounts.addAccount(address);
            break;
        default:
            console.log("Something went wrong, 'addAccount' switch");
    }
}
