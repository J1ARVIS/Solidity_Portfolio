import { validateAddress as validateAddressETH } from '../core/blockchain/eth/EthLib';
import { validateAddress as validateAddressERC } from '../core/blockchain/erc20/ERC20Lib';
import { validateAddress as validateAddressBTC } from '../core/blockchain/btc/BtcLib';
import { validateAddress as validateAddressBNB } from '../core/blockchain/bnb/BnbLib';
import { validateAddress as validateAddressLTC } from '../core/blockchain/ltc/LtcLib';

export function validateInputs(network, address, amount) {

    if (!address || !amount) {
        alert("Please fill in all fields.");
        return false;
    }

    if (!validateAmountInput(amount) || !validateAddressInput(network, address)) {
        return false;
    }

    return true;
};

function validateAmountInput(amount) {

    if (Number(amount) <= 0) {
        alert("Please enter a positive amount.");
        return false;
    }

    return true;
};

function validateAddressInput(network, address) {
    switch (network) {
        case "Bitcoin":
            if (!validateAddressBTC(address)) {
                alert("Please enter a valid Bitcoin-Test3 address.");
                return false;
            }
            return true;
        case "Ethereum":
            if (!validateAddressETH(address)) {
                alert("Please enter a valid Ethereum address.");
                return false;
            }
            return true;
        case "ERC20":
            if (!validateAddressERC(address)) {
                alert("Please enter a valid Ethereum address.");
                return false;
            }
            return true;
        case "BNB Chain":
            if (!validateAddressBNB(address)) {
                alert("Please enter a valid BNB Chain address.");
                return false;
            }
            return true;
        case "Litecoin":
            if (!validateAddressLTC(address)) {
                alert("Please enter a valid Litecoin address.");
                return false;
            }
            return true;
        default:
            console.log("Something went wrong, 'validateAddressInput' switch");
    }
}
