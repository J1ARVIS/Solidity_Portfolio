// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Voting {
    address immutable owner;
    bool isActive;
    
    bool isEventMultiple;
    bool isDisclosureAllowed;

    struct Voter {
        bool voted;
        bool vote;
    }
    mapping(address => Voter) voters;
    address[12] votedVoters;

    uint8 totalVotes = 0;
    uint8 inFavor = 0;
    uint8 against = 0;

    uint8 constant MAX_VOTES = 12;

    constructor(bool _isEventMultiple, bool _isDisclosureAllowed) {
        owner = tx.origin;
        isActive = true;
        isEventMultiple = _isEventMultiple;
        isDisclosureAllowed = _isDisclosureAllowed;
    }

    function getOwner() public view returns(address) {
        return owner;
    }

    function getIsActive() public view returns(bool) {
        return isActive;
    }

    function getIsEventMultiple() public view returns(bool) {
        return isEventMultiple;
    }

    function getIsDisclosureAllowed() public view returns(bool) {
        return isDisclosureAllowed;
    }

    function getVoter(address voter) public view onlyActive returns(Voter memory) {
        require(isDisclosureAllowed == true, "Votes disclosure is not allowed.");
        return voters[voter];
    }

    function getTotalVotes() public view returns(uint8) {
        return totalVotes;
    }

    function getInFavor() public view onlyOwner returns(uint8) {
        return inFavor;
    }

    function getAgainst() public view onlyOwner returns(uint8) {
        return against;
    }

    function getResults() public view onlyOwner returns (uint8, uint8) {
        return (inFavor, against);
    }

    function getMaxVotes() public pure returns (uint8) {
        return MAX_VOTES;
    }

    function vote(bool _vote) public onlyActive {
        require(totalVotes < MAX_VOTES, "Maximum number of votes reached.");
        require(!voters[msg.sender].voted, "Already voted.");

        voters[msg.sender].voted = true;
        voters[msg.sender].vote = _vote;
        votedVoters[totalVotes] = msg.sender;
        totalVotes++;
        
        if(_vote) {
            inFavor++;
        }else {
            against++;
        }
    }

    function finishVoting() public onlyOwner onlyActive {
        require(totalVotes == MAX_VOTES, "Needed amount of votes is not reached.");

        if(isEventMultiple) {
            for(uint8 i = 0; i < votedVoters.length; i++) {
                voters[votedVoters[i]].voted = false;
            }

            totalVotes = 0;
            inFavor = 0;
            against = 0;
        } else {
            isActive = false;
        }
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    modifier onlyActive() {
        require(isActive, "Contract is deactivated");
        _;
    }
}

contract VotingBuilder {
    Voting private voting;

    bool isEventMultiple = false;
    bool isDisclosureAllowed = false;

    function getIsEventMultiple() public view returns(bool) {
        return isEventMultiple;
    }

    function getIsDisclosureAllowed() public view returns(bool) {
        return isDisclosureAllowed;
    }

    function toggleIsEventMultiple() public {
        isEventMultiple = !isEventMultiple;
    }

    function toggleIsDisclosureAllowed() public {
        isDisclosureAllowed = !isDisclosureAllowed;
    }

    function createVoting() public {
        voting = new Voting(isEventMultiple, isDisclosureAllowed);
    }

    function getVoting() public view returns (Voting) {
        return voting;
    }
}