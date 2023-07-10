import React, { useEffect, useState } from 'react';
import Web3 from 'web3';

import calculatorABI from './contracts/Calculator.json';

import './styles/App.css';
import './styles/Wallet.css';
import './styles/Calculator.css';

function App() {
  const web3 = new Web3(window.ethereum);

  const [isMetamaskConnected, setIsMetamaskConnected] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState('Please connect Metamask');
  const [calculatorcontract, setCalculatorContract] = useState(null);

  function WalletAddress() {

    async function checkMetamaskConnection() {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setIsMetamaskConnected(true);
          setConnectedAddress(accounts[0]);
        } catch (error) {
          console.log(error);
          setIsMetamaskConnected(false);
          setConnectedAddress('Please connect Metamask');
        }
      } else {
        setIsMetamaskConnected(false);
        setConnectedAddress('Please connect Metamask');
      }
    };

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setIsMetamaskConnected(true);
        setConnectedAddress(accounts[0]);
      } else {
        setIsMetamaskConnected(false);
        setConnectedAddress('Please connect Metamask');
      }
    };

    useEffect(() => {
      checkMetamaskConnection();
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }, []);

    return (
      <div className="wallet-block">
        <p>Connected address: {connectedAddress}</p>
      </div>
    )
  }

  function Calculator() {
    const [numberA, setNumberA] = useState();
    const [numberB, setNumberB] = useState();
    const [selectedOperation, setSelectedOperation] = useState('+');
    const [result, setResult] = useState();
    const [usagesNumber, setUsagesNumber] = useState();

    const contractAddress = '0x1851ffBce02A134eFd9ddBC91920b0c6DCEfB6f5';

    useEffect(() => {
      const initializeContract = async () => {
        try {
          const contractInstance = new web3.eth.Contract(calculatorABI, contractAddress);
          setCalculatorContract(contractInstance);
        } catch (error) {
          console.error('Error initializing contract:', error);
        }
      };

      if (calculatorcontract == null) {
        initializeContract();
      }
    }, []);

    useEffect(() => {
      if (calculatorcontract != null) {
        fetchUsageCount();
      }
    }, []);

    const fetchUsageCount = async () => {
      try {
        const usageCount = await calculatorcontract.methods.usageCount().call();
        setUsagesNumber(usageCount);
      } catch (error) {
        console.error('Error fetching usageCount:', error);
      }
    };

    const handleOperationChange = (event) => {
      setSelectedOperation(event.target.value);
    };

    const handleCalculate = async () => {
      if (numberA == undefined || numberB == undefined) {
        alert("Please fill in both number fields");
        return;
      }

      let hashTX;
      let calculatedResult;
      try {
        switch (selectedOperation) {
          case '+':
            const addEvent = await calculatorcontract.methods.add(numberA, numberB).send({ from: connectedAddress, gas: 3000000 });
            hashTX = addEvent.transactionHash;
            break;
          case '-':
            const subtractEvent = await calculatorcontract.methods.subtract(numberA, numberB).send({ from: connectedAddress, gas: 3000000 });
            hashTX = subtractEvent.transactionHash;
            break;
          case '*':
            const multiplyEvent = await calculatorcontract.methods.multiply(numberA, numberB).send({ from: connectedAddress, gas: 3000000 });
            hashTX = multiplyEvent.transactionHash;
            break;
          case '/':
            const divideEvent = await calculatorcontract.methods.divide(numberA, numberB).send({ from: connectedAddress, gas: 3000000 });
            hashTX = divideEvent.transactionHash;
            break;
          default:
            console.error('Invalid operation');
            return;
        }

        const receipt = await web3.eth.getTransactionReceipt(hashTX);
        const event = receipt.logs.find(log => log.topics[0] === web3.utils.keccak256('Result(string,uint256,uint256,uint256)'));
        if (event) {
          const decodedData = web3.eth.abi.decodeLog(
            [{
              type: 'string',
              name: 'operation',
              indexed: true
            }, {
              type: 'uint256',
              name: 'a',
              indexed: true
            }, {
              type: 'uint256',
              name: 'b',
              indexed: true
            }, {
              type: 'uint256',
              name: 'result',
              indexed: false
            }],
            event.data,
            event.topics.slice(1)
          );
          calculatedResult = decodedData.result;
        } else {
          console.error('Result event not found');
        }

        alert(`Result: ${calculatedResult}\nTransaction Hash: ${hashTX}`);
        setResult(Number(calculatedResult));
        fetchUsageCount();
      } catch (error) {
        console.error('Error calculating:', error);
      }
    };

    return (
      <div className="calculate-block">
        <input
          className="number-input"
          type="number"
          placeholder="number a"
          value={numberA}
          onChange={(e) => setNumberA(parseInt(e.target.value))}
        />
        <div className="operation-choice">
          <span>Select Operation: </span>
          <select className="operation-selector" value={selectedOperation} onChange={handleOperationChange}>
            <option value="+">+</option>
            <option value="-">-</option>
            <option value="*">*</option>
            <option value="/">/</option>
          </select>
        </div>
        <input
          className="number-input"
          type="number"
          placeholder="number b"
          value={numberB}
          onChange={(e) => setNumberB(parseInt(e.target.value))}
        />
        <input
          className="number-input"
          type="number"
          placeholder="result"
          value={result}
          readOnly
        />
        <button
          disabled={!isMetamaskConnected}
          className={`calculate-button ${!isMetamaskConnected ? 'disabled' : ''}`}
          onClick={handleCalculate}
        >
          Calculate
        </button>
        {isMetamaskConnected && <p>Calculator used: {Number(usagesNumber)} times</p>}
      </div>
    )
  }

  return (
    <>
      <div className="box">
        <WalletAddress />
        <hr className="hr" />
        <Calculator />
      </div>
    </>
  );
}

export default App;
