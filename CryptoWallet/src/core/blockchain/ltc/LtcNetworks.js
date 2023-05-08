module.exports = {
    "main" : {
        bech32:"ltc1",
        messagePrefix: '\x19Litecoin Signed Message:\n',
        bip32: {
            public: 0x0488b21e,
            private: 0x0488ade4,
        },
        pubKeyHash: 0x30,
        scriptHash: 0x32,
        wif: 0xb0
    }
}