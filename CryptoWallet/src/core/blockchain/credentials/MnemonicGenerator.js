const bip39 = require("bip39");

export function generateMnemonic() {
    return bip39.generateMnemonic();
}