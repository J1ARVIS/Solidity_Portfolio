// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Voting {
    address immutable owner;
    bool isActive;

    struct Voter {
        bool voted;
        bool vote;
    }
    mapping(address => Voter) voters;

    uint8 totalVotes = 0;
    uint8 inFavor = 0;
    uint8 against = 0;

    uint8 constant MAX_VOTES = 12;

    constructor() {
        owner = tx.origin;
        isActive = true;
    }

    function getOwner() public view returns(address) {
        return owner;
    }

    function getIsActive() public view returns(bool) {
        return isActive;
    }

    function getVoter(address voter) public view virtual onlyActive returns(Voter memory) {
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

    function vote(bool _vote) public virtual onlyActive {
        require(totalVotes < MAX_VOTES, "Maximum number of votes reached.");
        require(!voters[msg.sender].voted, "Already voted.");

        voters[msg.sender].voted = true;
        voters[msg.sender].vote = _vote;
        totalVotes++;
        
        if(_vote) {
            inFavor++;
        }else {
            against++;
        }
    }

    function finishVoting() public virtual onlyOwner onlyActive {
        require(totalVotes == MAX_VOTES, "Needed amount of votes is not reached.");

        isActive = false;
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

contract ClosedVotingDecorator is Voting {
    function getVoter(address) public view virtual override returns (Voter memory) {
        revert("Votes disclosure is not allowed.");
    }
}

contract MultipleVotingDecorator is Voting {
    address[12] votedVoters;

    function vote(bool _vote) public override {
        super.vote(_vote);
        votedVoters[totalVotes-1] = msg.sender;
    }

    function finishVoting() public override onlyOwner onlyActive {
        require(totalVotes == MAX_VOTES, "Needed amount of votes is not reached.");

        for(uint8 i = 0; i < votedVoters.length; i++) {
            voters[votedVoters[i]].voted = false;
        }
        totalVotes = 0;
        inFavor = 0;
        against = 0;
    }
}

contract ClosedMultipleVotingDecorator is MultipleVotingDecorator{
    function getVoter(address) public view virtual override returns (Voter memory) {
        revert("Votes disclosure is not allowed.");
    }
}

contract VotingBuilder {
    Voting private voting;

    bool isMultiple = false;
    bool isClosed = false;

    function getIstMultiple() public view returns(bool) {
        return isMultiple;
    }

    function getIsClosed() public view returns(bool) {
        return isClosed;
    }

    function toggleIstMultiple() public {
        isMultiple = !isMultiple;
    }

    function toggleIsClosed() public {
        isClosed = !isClosed;
    }

    function createVoting() public {
        if (isClosed && isMultiple) {
            voting = new ClosedMultipleVotingDecorator();
        } else if (isClosed) {
            voting = new ClosedVotingDecorator();
        } else if (isMultiple) {
            voting = new MultipleVotingDecorator();
        } else {
            voting = new Voting();
        }
    }

    function getVoting() public view returns (Voting) {
        return voting;
    }
}
