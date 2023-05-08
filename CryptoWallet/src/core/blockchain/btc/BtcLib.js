const bitcoin = require('bitcoinjs-lib');
const BTCNETWORK = bitcoin.networks.testnet;

const API_TOKEN = process.env.REACT_APP_BlockCypher_API_TOKEN;

const TXSIZE = 0.512; //in Kb

export async function getBalance(address) {
    const response = await fetch(`https://api.blockcypher.com/v1/btc/test3/addrs/${address}/balance`);
    const data = await response.json();
    return data.balance / (10 ** 8);
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

export function validateAddress(address) {
    const regex = /^[mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    return regex.test(address);
}

export async function Send(privKey, from, to, amount) {
    try {
        const WIF = privKey;

        const feeUrl = `https://api.blockcypher.com/v1/btc/test3?token=${API_TOKEN}`;
        const feeResponse = await fetch(feeUrl);
        const feeData = await feeResponse.json();
        const fee = Math.round(TXSIZE * feeData.medium_fee_per_kb);

        const value = Math.round(amount * (10 ** 8));

        let keyring = bitcoin.ECPair.fromWIF(WIF, BTCNETWORK);
        let txb = new bitcoin.TransactionBuilder(BTCNETWORK);

        let unspentUrl = `https://api.blockcypher.com/v1/btc/test3/addrs/${from}?unspentOnly=true&token=${API_TOKEN}`;
        let unspentData = await fetch(unspentUrl);
        let data = await unspentData.json();
        let allUtxo = data.txrefs;

        let tmpSum = 0;
        let utxos = [];

        for (let key in allUtxo) {
            if (tmpSum <= value + fee) {
                tmpSum += allUtxo[key].value;
                utxos.push({
                    txid: allUtxo[key].tx_hash,
                    vout: allUtxo[key].tx_output_n
                })
            } else {
                break;
            }
        }

        let change = tmpSum - value - fee;

        for (let key in utxos) {
            txb.addInput(utxos[key].txid, utxos[key].vout);
        }
        txb.addOutput(to, value);
        txb.addOutput(from, change);

        let i = 0;
        for (let key in utxos) {
            txb.sign(i, keyring)
            i++;
        }

        let rawTx = txb.build().toHex();

        const pushResponse = await fetch(`https://api.blockcypher.com/v1/btc/test3/txs/push?token=${API_TOKEN}`, {
            method: 'POST',
            body: JSON.stringify({ tx: rawTx }),
        });
        const pushData = await pushResponse.json();
        const txHash = pushData.tx.hash;

        return txHash;
    } catch (err) {
        console.error(err);
        alert(`${err}`);
    }
}
