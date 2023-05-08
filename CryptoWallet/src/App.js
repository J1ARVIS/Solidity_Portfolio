import React, { useEffect, useState } from 'react';

import { getAccounts, Send, getBalance, addAccount } from './core/blockchain/BlockchainService';
import { validateInputs } from './helpers/Validation';
import { generateMnemonic } from './core/blockchain/credentials/MnemonicGenerator'
import { getAddress, getPrivateKey } from './core/blockchain/credentials/CredentialService';

import './styles/NavBar.css';
import './styles/App.css';
import './styles/Accounts.css';
import './styles/Send.css';

function App() {

  const [activeNetwork, setNetwork] = useState('Please choose a network');
  const [nativeCoin, setNativeCoin] = useState('');
  const [nativeBalance, setNativeBalance] = useState();
  const [currentAddress, setCurrentAddress] = useState('No accounts yet');
  const [accounts, setAccounts] = useState([]);
  const [mnemonic, setMnemonic] = useState('');
  const [newAddress, setNewAddress] = useState('');

  useEffect(() => {
    const updateAccounts = () => {
      setAccounts(getAccounts(activeNetwork));
    };
    updateAccounts();
  }, [activeNetwork, newAddress]);

  useEffect(() => {
    if (accounts.length > 0) {
      setCurrentAddress(accounts[0]);
    } else {
      setCurrentAddress('No accounts yet');
    }
  }, [accounts, newAddress]);

  useEffect(() => {
    const updateBalance = async () => {
      if (currentAddress !== 'No accounts yet') {
        setNativeBalance(await getBalance(activeNetwork, currentAddress));
      }else {setNativeBalance();}
    };
    updateBalance();
  }, [currentAddress, activeNetwork]);

  function Navigation() {

    const handleNetworkClick = (network, coin) => {
      setCurrentAddress('No accounts yet');
      setNetwork(network);
      setNativeCoin(coin);
    };

    return (
      <nav className="navigation">
        <ul>
          <li className={activeNetwork === 'Bitcoin' ? 'active' : ''} onClick={() => handleNetworkClick('Bitcoin', 'BTC')}>
            <a href="#">Bitcoin</a>
          </li>
          <li className={activeNetwork === 'Ethereum' ? 'active' : ''} onClick={() => handleNetworkClick('Ethereum', 'ETH')}>
            <a href="#">Ethereum</a>
          </li>
          <li className={activeNetwork === 'ERC20' ? 'active' : ''} onClick={() => handleNetworkClick('ERC20', 'ERC20')}>
            <a href="#">ERC20</a>
          </li>
          <li className={activeNetwork === 'BNB Chain' ? 'active' : ''} onClick={() => handleNetworkClick('BNB Chain', 'BNB')}>
            <a href="#">BNB Chain</a>
          </li>
          <li className={activeNetwork === 'Litecoin' ? 'active' : ''} onClick={() => handleNetworkClick('Litecoin', 'LTC')}>
            <a href="#">Litecoin</a>
          </li>
        </ul>
      </nav>
    );
  };

  function CurrentNetworkBalance() {
    return (
      <div className="network-balance">
        <p>
          <b>Network:</b> {activeNetwork} <br />
          <b>Balance:</b> {nativeBalance} {nativeCoin}
        </p>
      </div>
    );
  }

  function Accounts() {

    const [mnemonicInput, setMnemonicInput] = useState('');

    const handleAccountChange = async (event) => {
      const newAddress = event.target.value;
      setCurrentAddress(newAddress);
    };

    function handleGenerate() {
      const newMnemonic = generateMnemonic();
      console.log(`Please save your mnemonic: \n${newMnemonic}`);
      alert(`Please save your mnemonic: \n${newMnemonic}`);
      setMnemonic(newMnemonic);
    };

    async function handleGenerateAddress() {
      if (activeNetwork !== 'Please choose a network') {
        if (mnemonic !== '') {
          let queue = accounts.length;
          let response = await getAddress(activeNetwork, queue, mnemonic);
          setNewAddress(response);
          addAccount(activeNetwork, response);
          alert(`Generated new address ${response} for ${activeNetwork} network`);
        } else alert("Please generate or import a mnemonic");
      } else alert("Please choose a network");
    };

    function handleImportClick() {
      setMnemonic(mnemonicInput);
      console.log(`Mnemonic imported: \n${mnemonicInput}`);
      alert(`Mnemonic imported: \n${mnemonicInput}`);
      setMnemonicInput('');
    }

    return (
      <div className="accounts-block">
        <div className="current-address">
          <span><b>Current Address: </b></span>
          <span><i>{currentAddress}</i></span>
          <button className="copy-button" onClick={() => navigator.clipboard.writeText(currentAddress)}>
            Copy
          </button>
        </div>
        <div className="accounts-choices">
          <span><b>Select Account: </b></span>
          <select key={accounts.length} className="account-selector" value={currentAddress} onChange={handleAccountChange}>
            {accounts.map((address) => (
              <option key={address} value={address}>
                {address}
              </option>
            ))}
          </select>
          <button className="getAddress-button" onClick={handleGenerateAddress}>
            Get new address
          </button>
        </div>
        <div>
          <button className="generate-button" onClick={handleGenerate}>
            Generate new mnemonic
          </button>
          <br />
          <label className="import-label">
            Import mnemonic:
            <textarea
              className="import-input"
              value={mnemonicInput}
              onChange={(e) => setMnemonicInput(e.target.value)}
            />
          </label>
          <br />
          <button className="import-button" onClick={handleImportClick}>
            Import
          </button>
        </div>
      </div>
    );
  }

  function SendBlock() {

    const [destinationAddress, setDestinationAddress] = useState("");
    const [amountSend, setAmountSend] = useState("");

    const handleSend = async () => {
      if (validateInputs(activeNetwork, destinationAddress, amountSend)) {
        let queue;
        for (let i = 0; i < accounts.length; i++) {
          if (currentAddress === accounts[i]) {
            queue = i;
            break;
          }
        }

        let privateKey = await getPrivateKey(activeNetwork, queue, mnemonic);

        let hash = await Send(activeNetwork, privateKey, currentAddress, destinationAddress, amountSend);
        console.log("Transaction hash:", hash);
        alert(`Transaction hash: ${hash}`);
      }
      setDestinationAddress("");
      setAmountSend("");
      setNativeBalance(await getBalance(activeNetwork, currentAddress));
    };

    return (
      <form className="send-block">
        <label>
          <b>Destination Address:</b>
          <input
            className="send-input"
            type="text"
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
          />
        </label>
        <br />
        <label>
          <b>Amount:</b>
          <input
            className="send-input"
            type="number"
            value={amountSend}
            onChange={(e) => setAmountSend(e.target.value)}
          />
        </label>
        <br />
        <button className="send-button" onClick={handleSend}>Send</button>
      </form>
    );
  }

  return (
    <>
      <Navigation />
      <div className="box">
        <CurrentNetworkBalance />
        <hr className="hr" />
        <Accounts />
        <br />
        <hr className="hr" />
        <br />
        <SendBlock />
      </div>
    </>
  );
}

export default App;
