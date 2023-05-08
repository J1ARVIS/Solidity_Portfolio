// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./IERC20.sol";

contract TokenVesting{
    event Released(uint256 amount);

    uint256 private _released;
    address private immutable _token;
    address private immutable _beneficiary;
    uint64 private immutable _start;
    uint64 private immutable _duration;
    uint256 private immutable _periods;

    constructor(address tokenAddress, address beneficiaryAddress, uint64 startTimestamp, uint64 durationSeconds, uint256 periodsAmount) payable {
        require(beneficiaryAddress != address(0), "TokenVesting: beneficiary is zero address");
        require(tokenAddress != address(0), "TokenVesting: token address is zero address");
        require(periodsAmount > 0, "TokenVesting: periods amount is lower than 1");
        _token = tokenAddress;
        _beneficiary = beneficiaryAddress;
        _start = startTimestamp;
        _duration = durationSeconds;
        _periods = periodsAmount;
    }

    function token() public view virtual returns (address) {
        return _token;
    }
    function beneficiary() public view virtual returns (address) {
        return _beneficiary;
    }
    function start() public view virtual returns (uint256) {
        return _start;
    }
    function duration() public view virtual returns (uint256) {
        return _duration;
    }
    function released() public view virtual returns (uint256) {
        return _released;
    }
    function periods() public view virtual returns (uint256) {
        return _periods;
    }
    function allocation() public view virtual returns (uint256) {
        return IERC20(token()).balanceOf(address(this)) + released();
    }

    function releasable() public view virtual returns (uint256) {
        return vestedAmount(uint64(block.timestamp)) - released();
    }

    function release() public virtual {
        uint256 amount = releasable();
        _released += amount;
        emit Released(amount);
        IERC20(token()).transfer(beneficiary(), amount);
    }

    function vestedAmount(uint64 timestamp) public view virtual returns (uint256) {
        if (timestamp < start()) {
            return 0;
        } else if (timestamp > start() + duration()) {
            return allocation();
        } else {
            return _vestingSchedule(timestamp);
        }
    }

    function _vestingSchedule(uint64 timestamp) internal view virtual returns (uint256) {
        uint256 currentPart = (allocation() * (timestamp - start())) / duration();
        uint256 partValue = allocation() / periods();
        bool set = false;
        for(uint i = periods(); i > 0; i--) {
            if(currentPart >= partValue * i) {
                currentPart = partValue * i;
                set = true;
                break;
            }
        }
        if(!set) currentPart = 0;
        return currentPart;
    }
}