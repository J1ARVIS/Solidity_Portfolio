// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract VotingRoleModel {
    mapping(address => bool) roleAdmin;
    mapping(address => bool) roleOperator;

    address owner;

    constructor() {
        owner = tx.origin;
    }

    function getOwner() public view returns(address) {
        return owner;
    }
    
    function checkAdmin(address _address) public view returns(bool) {
        return roleAdmin[_address];
    }

    function checkOperator(address _address) public view returns(bool) {
        return roleOperator[_address];
    }

    function grantRoleAdmin(address _address) public onlyOwner {
        require(!roleAdmin[_address], "VotingRoleModel: Role already granted to this address");

        roleAdmin[_address] = true;
    }
    
    function grantRoleOperator(address _address) public onlyOwner {
        require(!roleOperator[_address], "VotingRoleModel: Role already granted to this address");

        roleOperator[_address] = true;
    }

    function revokeRoleAdmin(address _address) public onlyOwner {
        require(roleAdmin[_address], "VotingRoleModel: Role is not granted to this address");

        roleAdmin[_address] = false;
    }
    
    function revokeRoleOperator(address _address) public onlyOwner {
        require(roleOperator[_address], "VotingRoleModel: Role is not granted to this address");

        roleOperator[_address] = false;
    }
    
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != owner, "VotingRoleModel: cannot transfer Ownership to himself");

        owner = newOwner;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyAdmin() {
        require(roleAdmin[msg.sender], "Only Admin can perform this action");
        _;
    }

    modifier onlyOperator() {
        require(roleOperator[msg.sender], "Only Operator can perform this action");
        _;
    }
}

contract Voting is VotingRoleModel {
    VotingBuilder.VotingParameters votingParams;

    bool isActive = false;

    struct Voter {
        bool voted;
        string vote;
        uint256 power;
        bool isPrivate;
    }
    mapping(address => Voter) voters;
    address[] votedVoters;

    struct VotingResult {
        string[] choices;
        uint256[] votesReceived;
        uint256 totalVotes;
        string winningChoice;
        uint256 winningVotes;
    }
    VotingResult votingResult;

    constructor(VotingBuilder.VotingParameters memory _votingParams) {
        votingParams = _votingParams;
        votingResult.choices = _votingParams.choices;

        for (uint256 i = 0; i < _votingParams.choices.length; i++) {
            votingResult.votesReceived.push(0);
        }

        for(uint256 i = 0; i < _votingParams.votersPrivate.length; i++) {
            voters[_votingParams.votersPrivate[i]].isPrivate = true;

            if(_votingParams.isVotePowered) {
                voters[_votingParams.votersPrivate[i]].power = _votingParams.voterPowers[i];
            }
        }
    }

    function getVotingParams() public view onlyAdmin returns (VotingBuilder.VotingParameters memory) {
        return votingParams;
    }

    function getIsActive() public view onlyOperator returns (bool) {
        return isActive;
    }

    function getVoter(address voter) public view onlyOperator returns (Voter memory) {
        require(votingParams.isVoterDisclosed, "Voting: Votes disclosure is not allowed");
        return voters[voter];
    }

    function getVotingResult() public view returns (VotingResult memory) {
        return votingResult;
    }

    function start() public onlyOperator {
        require(!isActive, "Voting: Voting already started");

        if (votingParams.isRepeated) {
            for (uint256 i = 0; i < votedVoters.length; i++) {
                voters[votedVoters[i]].voted = false;
            }

            delete votedVoters;
            votingResult.totalVotes = 0;
            votingResult.winningChoice = "";
            votingResult.winningVotes = 0;
            for (uint256 i = 0; i < votingParams.choices.length; i++) {
                votingResult.votesReceived[i] = 0;
            }
        }

        require(votingResult.totalVotes == 0, "Voting: Voting is already finished and is not repeated");

        isActive = true;
    }

    function vote(uint256 choiceIndex) public onlyActive {
        require(!voters[msg.sender].voted, "Voting: Already voted");
        require(choiceIndex < votingResult.choices.length, "Voting: the selected Choice does not exist");

        if(votingParams.isVotersLimited) {
            require(votedVoters.length < votingParams.votersLimit, "Voting: Voters Limit already reached");
        }

        if(votingParams.isPrivate) {
            require(voters[msg.sender].isPrivate, "Voting: You are not among the allowed Private Voters");
        }

        voters[msg.sender].voted = true;
        voters[msg.sender].vote = votingResult.choices[choiceIndex];
        votedVoters.push(msg.sender);

        if(votingParams.isVotePowered) {
            votingResult.totalVotes += voters[msg.sender].power;
            votingResult.votesReceived[choiceIndex] += voters[msg.sender].power;
        } else {
            votingResult.totalVotes++;
            votingResult.votesReceived[choiceIndex]++;
        }
    }

    function finishVoting() public onlyActive onlyOperator {
        uint256 maxVotes = 0;
        uint256 maxIndex = 0;
        bool doubleWinner = false;

        for (uint256 i = 0; i < votingResult.votesReceived.length; i++) {
            if (votingResult.votesReceived[i] >= maxVotes) {
                if(votingResult.votesReceived[i] == maxVotes) {
                    doubleWinner = true;
                    break;
                }

                maxVotes = votingResult.votesReceived[i];
                maxIndex = i;
            }
        }

        if(maxVotes == 0 || doubleWinner == true) {
            votingResult.winningChoice = "No winner: no votes or two winners";
            votingResult.winningVotes = maxVotes;
            isActive = false;
            return;
        }

        if(votingParams.isResultVetoed && 100 * maxVotes / votingResult.totalVotes != 100) {
            votingResult.winningChoice = "No winner: voting result was Votoed";
            votingResult.winningVotes = maxVotes;
            isActive = false;
            return;
        }

        if(votingParams.isResultPartial && 100 * maxVotes / votingResult.totalVotes < votingParams.votesPercentageToWin) {
            votingResult.winningChoice = "No winner: No choice reached the required Votes Percentage To Win";
            votingResult.winningVotes = maxVotes;
        } else {
            votingResult.winningChoice = votingResult.choices[maxIndex];
            votingResult.winningVotes = maxVotes;
        }

        isActive = false;
    }

    modifier onlyActive() {
        require(isActive, "Voting: Voting is deactivated");
        _;
    }
}

contract VotingBuilder is VotingRoleModel {
    Voting private voting;

    struct VotingParameters {
        bool isRepeated;
        bool isVoterDisclosed;
        bool isVotePowered;
        bool isVotersLimited;
        bool isPrivate;
        bool isResultPartial;
        bool isResultVetoed;
        bool isMultiChoiced;
        bool isFunded;

        uint256 fundingUsersLimit;
        uint256 votersLimit;
        uint256 votesPercentageToWin;

        address[] votersPrivate;
        uint256[] voterPowers;
        string[] choices;
    }

    VotingParameters votingParams;

    function getVotingParams() public view onlyAdmin returns (VotingParameters memory) {
        return votingParams;
    }

    function toggleIsFunded(uint256 usersAmount) public onlyAdmin {
        if (!votingParams.isFunded) {
            require(votingParams.isVotersLimited == true,"VotingBuilder: voting should has voters limit to be able to fund voters");
            require(votingParams.isPrivate == true,"VotingBuilder: voting should has private voters to be able to fund voters");
            
            require(usersAmount >= votingParams.votersLimit,"VotingBuilder: Funding users limit cannot be lower than total voters limit");
            require(usersAmount == votingParams.votersPrivate.length,"VotingBuilder: Funding users limit and Private Voters amount mismatch");
            
            votingParams.fundingUsersLimit = usersAmount;
            votingParams.isFunded = true;
        } else {
            votingParams.isFunded = false;
        }
    }

    function toggleIsRepeated() public onlyAdmin {
        if (!votingParams.isRepeated) {
            require(votingParams.isVotersLimited == true,"VotingBuilder: voting should has voters Limit to be Repeated");
            require(votingParams.votersLimit <= 5000,"VotingBuilder: Repeated voting supports 5000 voters maximum ");

            votingParams.isFunded = false;
            votingParams.isRepeated = true;
        } else {
            votingParams.isRepeated = false;
        }
    }

    function toggleIsVoterDisclosed() public onlyAdmin {
        votingParams.isVoterDisclosed = !votingParams.isVoterDisclosed;
    }

    function toggleIsVotePowered(uint256[] memory powers) public onlyAdmin {
        if (!votingParams.isVotePowered) {
            require(votingParams.isVotersLimited == true,"VotingBuilder: voting should has voters limit to grant power to voters");
            require(votingParams.isPrivate == true,"VotingBuilder: voting should has private voters to grant power to voters");
            require(powers.length == votingParams.votersPrivate.length,"VotingBuilder: voter Powers and allowed Private Voters arrays length mismatch");
            
            for (uint256 i = 0; i < powers.length; i++) {
                require(powers[i] >= 1,"VotingBuilder: voter Power must be at least 1");
                votingParams.voterPowers.push(powers[i]);
            }
            votingParams.isVotePowered = true;
        } else {
            delete votingParams.voterPowers;
            votingParams.isVotePowered = false;
        }
    }

    function toggleIsVotersLimited(uint256 _votersLimit) public onlyAdmin {
        if (!votingParams.isVotersLimited) {
            votingParams.votersLimit = _votersLimit;
            votingParams.isVotersLimited = true;
        } else {
            votingParams.isFunded = false;
            votingParams.isVotePowered = false;
            votingParams.isPrivate = false;
            votingParams.votersLimit = 0;
            votingParams.isVotersLimited = false;
        }
    }

    function toggleIsPrivate(address[] memory voters) public onlyAdmin {
        if (!votingParams.isPrivate) {
            require(voters.length <= 5000,"VotingBuilder: Private voting supports 5000 voters maximum ");

            if(votingParams.isVotersLimited) {
                require(voters.length <= votingParams.votersLimit,"VotingBuilder: Private Voters amount cannot be higher than total voters limit");
            }
            
            votingParams.votersPrivate = voters;
            votingParams.isPrivate = true;
        } else {
            delete votingParams.votersPrivate;
            votingParams.isFunded = false;
            votingParams.isVotePowered = false;
            votingParams.isPrivate = false;
        }
    }

    function toggleIsResultPartial(uint256 _percentage) public onlyAdmin {
        require(_percentage >= 0 && _percentage <= 100, "VotingBuilder: voting winning Percentage must be between 0 and 100");

        if (_percentage >= 0 && _percentage <= 50) {
            votingParams.votesPercentageToWin = 0;
            votingParams.isResultPartial = false;
        } else {
            votingParams.votesPercentageToWin = _percentage;
            votingParams.isResultPartial = true;
        }
    }

    function toggleIsResultVetoed() public onlyAdmin {
        votingParams.isResultVetoed = !votingParams.isResultVetoed;
    }

    function toggleIsMultiChoiced(string[] memory _choices) public onlyAdmin {
        require(_choices.length <= 20 , "VotingBuilder: Max choices amount is 20");

        delete votingParams.choices;

        if(_choices.length <= 1) {
            votingParams.choices.push("yes");
            votingParams.choices.push("no");

            votingParams.isMultiChoiced = false;
        } else {
            votingParams.choices = _choices;
            votingParams.isMultiChoiced = true;
        }
    }

    function createVoting() public payable onlyAdmin noReentrancy {
        require(votingParams.choices.length > 1, "VotingBuilder: Voting cannot be created without choices");

        if(votingParams.isFunded) {
            require(msg.value > 0, "VotingBuilder: No ether sent for funded voting");

            uint256 numAddresses = votingParams.votersPrivate.length;
            
            require(numAddresses > 0, "VotingBuilder: No addresses to distribute to");

            uint256 amountPerAddress = msg.value / numAddresses;

            bool success;
            for (uint256 i = 0; i < numAddresses; i++) {
                address payable recipient = payable(votingParams.votersPrivate[i]);
                (success, ) = recipient.call{value: amountPerAddress}("");
                require(success, string(abi.encodePacked("VotingBuilder: ether funding failed for voter ", address(recipient))));
            }
        } else {
            require(msg.value == 0, "VotingBuilder: Funding is deactivated, TX value should be 0");
        }

        VotingParameters memory params = votingParams;
        voting = new Voting(params);
    }

    function getVoting() public view onlyAdmin returns (Voting) {
        return voting;
    }

    bool private locked;
    modifier noReentrancy() {
        require(!locked, "VotingBuilder: Reentrant call");
        locked = true;
        _;
        locked = false;
    }
}
