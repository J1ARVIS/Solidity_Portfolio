import { useState } from 'react';

export function NetworkState() {

    const [activeNetwork, setNetwork] = useState('Please choose a network');
    const [nativeCoin, setNativeCoin] = useState('');

    return { activeNetwork, nativeCoin, setNetwork, setNativeCoin };
}

export function BalanceState() {

    const [nativeBalance, setNativeBalance] = useState();

    return { nativeBalance, setNativeBalance };
}

export function AddressState() {

    const [currentAddress, setCurrentAddress] = useState('No accounts yet');

    return { currentAddress, setCurrentAddress };
}

export function AccountsState() {

    const [accounts, setAccounts] = useState([]);

    return { accounts, setAccounts };
}
