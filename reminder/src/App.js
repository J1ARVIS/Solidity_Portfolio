import React, { useEffect, useState } from 'react';
import Web3 from 'web3';

import './styles/App.css';
import './styles/AllRecords.css';
import './styles/AddRecord.css';

import reminderABI from './build/contracts/Reminder.json';

function App() {
  const web3 = new Web3('http://127.0.0.1:7545');
  const reminderAddress = '0xBd43d40714E9f4F9b22E5a9D60340365D1332c91';

  const [contract, setContract] = useState(null);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const initializeContract = async () => {
      try {
        const contractInstance = new web3.eth.Contract(reminderABI.abi, reminderAddress);

        setContract(contractInstance);

      } catch (error) {
        console.error('Error initializing contract:', error);
      }
    };

    initializeContract();
  }, []);

  function AllRecords() {

    const getContractRecords = async () => {
      try {
        const result = await contract.methods.getRecords().call();

        setRecords(result);
      } catch (error) {
        console.error('Error calling getRecords():', error);
      }
    };

    return (
      <div className="allRecords-block">
        <label className="allRecords-label">
          <b>All Records:</b>
        </label>
        <button className="allRecords-button" onClick={getContractRecords}>Get Records</button>
        <div>
          {records.map((record, index) => (
            <div key={index}>
              <p>Record #{index + 1}: '{record.message}' on {Number(record.day)}.{Number(record.month)}.{Number(record.year)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  function AddRecord() {
    const [record, setRecord] = useState('');
    const [year, setYear] = useState();
    const [month, setMonth] = useState();
    const [day, setDay] = useState();

    const handleAddRecord = async () => {
      try {
        const accounts = await web3.eth.getAccounts();

        await contract.methods.addRecord(record, year, month, day).send({ from: accounts[0], gas: 3000000 });
        alert("New Record added!");

        setRecord('');
        setYear(0);
        setMonth(0);
        setDay(0);
      } catch (error) {
        console.error('Error calling addRecord function:', error);
      }
    };

    return (
      <div className="addRecord-block">
        <label className="addRecord-label">
          <b>Add Record:</b>
        </label>
        <input
          className="addRecord-input"
          type="text"
          placeholder="Record"
          value={record}
          onChange={(e) => setRecord(e.target.value)}
        />
        <input
          className="addRecord-input"
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
        />
        <input
          className="addRecord-input"
          type="number"
          placeholder="Month"
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
        />
        <input
          className="addRecord-input"
          type="number"
          placeholder="Day"
          value={day}
          onChange={(e) => setDay(parseInt(e.target.value))}
        />
        <button className="addRecord-button" onClick={handleAddRecord}>Add Record</button>
      </div>
    );
  }

  return (
    <>
      <div className="box">
        <AllRecords />
        <hr className="hr" />
        <AddRecord />
      </div>
    </>
  );
}

export default App;
