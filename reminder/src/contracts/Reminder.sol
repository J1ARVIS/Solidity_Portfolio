// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

contract Reminder {
    address immutable _owner;
    
    struct Record {
        uint16 year;
        uint8 month;
        uint8 day;
        string message;
    }
    Record[10] records;
    uint8 nextIndex = 0;
    uint256 totalRecordsAdded = 0;

    constructor() {
        _owner = msg.sender;
    }

    function getOwner() view public returns(address) {
        return _owner;
    }

    function getRecords() view public OnlyOwner returns(Record[10] memory) {
        return records;
    }

    function getNextIndex() view public OnlyOwner returns(uint8) {
        return nextIndex;
    }

    function getRecordsMaxAmount() public pure returns(uint8) {
        return 10;
    }

    function getTotalRecordsAdded() public view returns(uint256) {
        return totalRecordsAdded;
    }

    function addRecord(string memory _record, uint16 _year, uint8 _month, uint8 _day) public OnlyOwner {
        records[nextIndex] = Record(_year, _month,_day, _record);
        emit NewRecord(_record, _year, _month, _day);

        nextIndex = (nextIndex + 1) % 10;
        totalRecordsAdded++;

        if(totalRecordsAdded == 10) {
            emit Notification("The array contains 10 records and is full now. Each new record overrides the oldest one.");
        }
    }

    function getRecord(uint8 index) public view OnlyOwner returns(Record memory) {
        require(index < 10, "Index exceeds max records amount");
        
        uint8 actualIndex;
        if(totalRecordsAdded > 10) {
            actualIndex = (nextIndex + index) % 10;
        }else {
            actualIndex = index;
        }
        
        return records[actualIndex];
    }

    modifier OnlyOwner() {
        require(
            msg.sender == _owner,
            "Signer should be the owner of the contract"
        );
        _;
    }

    event NewRecord(string record, uint16 year, uint8 month, uint8 day);
    event Notification(string message);
}
