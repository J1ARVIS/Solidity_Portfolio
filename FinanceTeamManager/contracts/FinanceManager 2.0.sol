// SPDX-License-Identifier: MIT.

pragma solidity ^0.8.17;

import "./BokkyPooBahsDateTimeLibrary.sol";

contract TeamDB {

    address _owner;
    uint256 constant birthdayBonus = 100000000000000000;

    struct Teammates {
        address account;
        string name;
        uint salary;
        uint256 birthday;
        bool todayBirthdayPaid;
    }
    Teammates[] _teammates;
    
    constructor (){
        _owner = msg.sender;
    }

    function addTeammate(address account, string memory name, uint salary, uint256 bthday_year, uint256 bthday_month, uint256 bthday_day) public OnlyOwner {
        require(msg.sender != account, "Can't add oneself !");
        uint256 birthday = BokkyPooBahsDateTimeLibrary.timestampFromDate(bthday_year, bthday_month, bthday_day);
        Teammates memory newTeammate = Teammates(account, name, salary, birthday, false);
        _teammates.push(newTeammate);
        emit NewContact(account, name, salary, birthday);
    }
    function getTeammate(uint256 index) view public returns(Teammates memory){
        return _teammates[index];
    }

    function deposit() public payable{

    }
    function changeSalary(uint256 index, uint256 salary) public OnlyOwner{
        _teammates[index].salary = salary;
    }
    function sendSalaryAuto() public OnlyOwner{
        require(_teammates.length > 0, "No teammates yet.");
        uint256 salarySum = 0;
        for (uint256 i=0; i<_teammates.length; i++){
            salarySum += _teammates[i].salary;
        }
        require(address(this).balance >= salarySum, "Not enough funds on the contract.");
        for (uint256 i=0; i<_teammates.length; i++){
            payable(_teammates[i].account).transfer(_teammates[i].salary);
            emit SalaryPaid(_teammates[i].account, _teammates[i].name, _teammates[i].salary);
        }
    }

    function getDate(uint256 timestamp) pure internal returns(uint256 year, uint256 month, uint256 day){
        (year, month, day) = BokkyPooBahsDateTimeLibrary.timestampToDate(timestamp); 
    }
    function checkBirthday(uint256 index) view public returns(bool){
        (, uint256 bthday_month, uint256 bthday_day) = getDate(_teammates[index].birthday);
        (, uint256 today_month, uint256 today_day) = getDate(block.timestamp);
        if (bthday_month == today_month && bthday_day == today_day) {
            return true; 
        } 
        return false;
    }
    function sendBirthdayBonus() public OnlyOwner{
        require(_teammates.length > 0, "No teammates yet.");
        for (uint256 i=0; i<_teammates.length; i++) {
            if(checkBirthday(i)) {
                if(_teammates[i].todayBirthdayPaid == false) {
                    require(address(this).balance >= birthdayBonus, "Not enough funds on the contract.");
                    payable(_teammates[i].account).transfer(birthdayBonus);
                    _teammates[i].todayBirthdayPaid = true;
                    emit HappyBirthday(_teammates[i].name, _teammates[i].account, _teammates[i].birthday, _teammates[i].todayBirthdayPaid);
                }
            }
            else if (_teammates[i].todayBirthdayPaid) _teammates[i].todayBirthdayPaid = false;
            // if it's not the teammate's birthday today - we reset his 'bonus sent' status so he will be able to get the bonus next year
        }
    }

    modifier OnlyOwner{
        require(msg.sender == _owner, "Sender should be the owner of the contract");
        _;
    }

    event NewContact(address account, string name, uint256 salary, uint256 birthday);
    event HappyBirthday(string name, address account, uint256 birthday, bool bonusPaid);
    event SalaryPaid(address account, string name, uint256 salary);
}