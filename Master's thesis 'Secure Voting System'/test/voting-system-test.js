const { expect } = require("chai");

let signers;
let votingbuilder;

beforeEach(async function () {
    votingbuilder = await ethers.deployContract("VotingBuilder");
    await votingbuilder.waitForDeployment();

    signers = await ethers.getSigners();
});

describe("1. Voting Builder", function () {
    it("101: check VotingParameters structure", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        let params = await votingbuilder.getVotingParams();

        expect(params.isRepeated).to.be.a("boolean");
        expect(params.isVoterDisclosed).to.be.a("boolean");
        expect(params.isVotePowered).to.be.a("boolean");
        expect(params.isVotersLimited).to.be.a("boolean");
        expect(params.isPrivate).to.be.a("boolean");
        expect(params.isResultPartial).to.be.a("boolean");
        expect(params.isResultVetoed).to.be.a("boolean");
        expect(params.isMultiChoiced).to.be.a("boolean");
        expect(params.isFunded).to.be.a("boolean");

        expect(params.fundingUsersLimit).to.be.a("bigint");
        expect(params.votersLimit).to.be.a("bigint");
        expect(params.votesPercentageToWin).to.be.a("bigint");

        expect(params.votersPrivate).to.be.an("array");
        expect(params.voterPowers).to.be.an("array");
        expect(params.choices).to.be.an("array");
    });
    
    it("102: check VotingParameters default values", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        let params = await votingbuilder.getVotingParams();

        expect(params.isRepeated).to.equal(false);
        expect(params.isVoterDisclosed).to.equal(false);
        expect(params.isVotePowered).to.equal(false);
        expect(params.isVotersLimited).to.equal(false);
        expect(params.isPrivate).to.equal(false);
        expect(params.isResultPartial).to.equal(false);
        expect(params.isResultVetoed).to.equal(false);
        expect(params.isMultiChoiced).to.equal(false);
        expect(params.isFunded).to.equal(false);

        expect(params.fundingUsersLimit).to.equal(0n);
        expect(params.votersLimit).to.equal(0n);
        expect(params.votesPercentageToWin).to.equal(0n);

        expect(params.votersPrivate).to.have.lengthOf(0);
        expect(params.voterPowers).to.have.lengthOf(0);
        expect(params.choices).to.have.lengthOf(0);
    });

    it("103: getVoting() returns 0-address before deploy", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        let defaultAddr = await votingbuilder.getVoting();

        expect(defaultAddr).to.equal("0x0000000000000000000000000000000000000000");
    });

    it("104: toggleIsVotersLimited() works properly (on/off)", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        let limitValue = 100;
        let params;

        await votingbuilder.toggleIsVotersLimited(limitValue);
        
        params = await votingbuilder.getVotingParams();

        expect(params.votersLimit).to.equal(limitValue);
        expect(params.isVotersLimited).to.equal(true);

        await votingbuilder.toggleIsVotersLimited(0);

        params = await votingbuilder.getVotingParams();

        expect(params.votersLimit).to.equal(0);
        expect(params.isVotersLimited).to.equal(false);
    });

    it("105: toggleIsVotersLimited() false disables isFunded, isVotePowered, isPrivate", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);

        await votingbuilder.toggleIsVotersLimited(100);
        await votingbuilder.toggleIsVotersLimited(0);

        let params = await votingbuilder.getVotingParams();

        expect(params.isFunded).to.equal(false);
        expect(params.isVotePowered).to.equal(false);
        expect(params.isPrivate).to.equal(false);
    });

    it("106: toggleIsVoterDisclosed() works properly (on/off)", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);

        await votingbuilder.toggleIsVoterDisclosed();
        let params = await votingbuilder.getVotingParams();

        expect(params.isVoterDisclosed).to.equal(true);

        await votingbuilder.toggleIsVoterDisclosed();
        params = await votingbuilder.getVotingParams();

        expect(params.isVoterDisclosed).to.equal(false);
    });

    it("107: toggleIsVotePowered() works properly (on/off)", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        let voterPowers = [2, 3, 4];

        await votingbuilder.toggleIsVotersLimited(100);
        await votingbuilder.toggleIsPrivate([signers[0], signers[1], signers[2]]);

        await votingbuilder.toggleIsVotePowered(voterPowers);
        let params = await votingbuilder.getVotingParams();

        expect(params.isVotePowered).to.equal(true);
        expect(params.voterPowers.map(Number)).to.eql(voterPowers);

        await votingbuilder.toggleIsVotePowered([]);
        params = await votingbuilder.getVotingParams();

        expect(params.isVotePowered).to.equal(false);
    });

    it("108: toggleIsVotePowered() false clears voterPowers[]", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        let voterPowers = [2, 3, 4];

        await votingbuilder.toggleIsVotersLimited(100);
        await votingbuilder.toggleIsPrivate([signers[0], signers[1], signers[2]]);

        await votingbuilder.toggleIsVotePowered(voterPowers);
        await votingbuilder.toggleIsVotePowered([]);
        let params = await votingbuilder.getVotingParams();

        expect(params.voterPowers).to.eql([]);
    });

    it("109: toggleIsVotePowered() true requires isVotersLimited true", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        let voterPowers = [2, 3, 4];

        let message = "VotingBuilder: voting should has voters limit to grant power to voters";
        testError(async () => { return votingbuilder.toggleIsVotePowered(voterPowers); }, message);
        let params = await votingbuilder.getVotingParams();

        expect(params.isVotePowered).to.equal(false);
        expect(params.voterPowers).to.eql([]);
    });

    it("110: toggleIsVotePowered() true requires isPrivate true", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        let voterPowers = [2, 3, 4];
        await votingbuilder.toggleIsVotersLimited(100);

        let message = "VotingBuilder: voting should has private voters to grant power to voters";
        testError(async () => { return votingbuilder.toggleIsVotePowered(voterPowers); }, message);
        let params = await votingbuilder.getVotingParams();

        expect(params.isVotePowered).to.equal(false);
        expect(params.voterPowers).to.eql([]);
    });

    it("111: toggleIsVotePowered() true requires equal length powers-votersPrivate", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        let voterPowers = [2, 3, 4];

        await votingbuilder.toggleIsVotersLimited(100);
        await votingbuilder.toggleIsPrivate([signers[0], signers[1]]);
        
        let message = "VotingBuilder: voter Powers and allowed Private Voters arrays length mismatch";
        testError(async () => { return votingbuilder.toggleIsVotePowered(voterPowers); }, message);
        let params = await votingbuilder.getVotingParams();

        expect(params.isVotePowered).to.equal(false);
        expect(params.voterPowers).to.eql([]);
    });

    it("112: toggleIsVotePowered() true requires power >=1", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        let voterPowers = [1, 0, 4];

        await votingbuilder.toggleIsVotersLimited(100);
        await votingbuilder.toggleIsPrivate([signers[0], signers[1], signers[2]]);
        
        let message = "VotingBuilder: voter Power must be at least 1";
        testError(async () => { return votingbuilder.toggleIsVotePowered(voterPowers); }, message);
        let params = await votingbuilder.getVotingParams();

        expect(params.isVotePowered).to.equal(false);
        expect(params.voterPowers).to.eql([]);
    });

    it("113: toggleIsResultVetoed() works properly (on/off)", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);

        await votingbuilder.toggleIsResultVetoed();
        let params = await votingbuilder.getVotingParams();

        expect(params.isResultVetoed).to.equal(true);

        await votingbuilder.toggleIsResultVetoed();
        params = await votingbuilder.getVotingParams();

        expect(params.isResultVetoed).to.equal(false);
    });

    it("114: toggleIsResultPartial() true if % = 51-100", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        let percentages = [51, 75, 100];
        
        for (let i = 0; i < percentages.length; i++) {
            await votingbuilder.toggleIsResultPartial(percentages[i]);
            let params = await votingbuilder.getVotingParams();

            expect(params.isResultPartial).to.equal(true);
            expect(params.votesPercentageToWin).to.equal(percentages[i]);
        }
    });

    it("115: toggleIsResultPartial() false if % = 0-50", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        let percentages = [0, 25, 50];
        
        for (let i = 0; i < percentages.length; i++) {
            await votingbuilder.toggleIsResultPartial(percentages[i]);
            let params = await votingbuilder.getVotingParams();
            
            expect(params.isResultPartial).to.equal(false);
            expect(params.votesPercentageToWin).to.equal(0);
        }
    });

    it("116: toggleIsResultPartial() requires % = 0-100", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);

        let message = "VotingBuilder: voting winning Percentage must be between 0 and 100";
        testError(async () => { return votingbuilder.toggleIsResultPartial(111); }, message);
        let params = await votingbuilder.getVotingParams();

        expect(params.isResultPartial).to.equal(false);
        expect(params.votesPercentageToWin).to.equal(0);
    });

    it("117: toggleIsRepeated() works properly (on/off)", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsVotersLimited(100);

        await votingbuilder.toggleIsRepeated();
        let params = await votingbuilder.getVotingParams();

        expect(params.isRepeated).to.equal(true);

        await votingbuilder.toggleIsRepeated();
        params = await votingbuilder.getVotingParams();

        expect(params.isRepeated).to.equal(false);
    });

    it("118: toggleIsRepeated() true disables isFunded", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsVotersLimited(100);

        await votingbuilder.toggleIsRepeated();
        let params = await votingbuilder.getVotingParams();

        expect(params.isFunded).to.equal(false);
        expect(params.isRepeated).to.equal(true);
    });

    it("119: toggleIsRepeated() true requires isVotersLimited true", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);

        let message = "VotingBuilder: voting should has voters Limit to be Repeated";
        testError(async () => { return votingbuilder.toggleIsRepeated(); }, message);
        let params = await votingbuilder.getVotingParams();

        expect(params.isRepeated).to.equal(false);
    });

    it("120: toggleIsRepeated() true requires votersLimit <= 5000", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsVotersLimited(10000);

        let message = "VotingBuilder: Repeated voting supports 5000 voters maximum";
        testError(async () => { return votingbuilder.toggleIsRepeated(); }, message);
        let params = await votingbuilder.getVotingParams();

        expect(params.isRepeated).to.equal(false);
    });

    it("121: toggleIsPrivate() true requires voters <= 5000", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        let addresses = [];
        for (let i = 0; i < 5001; i++) {
            addresses.push(signers[0].address);
        }

        let message = "VotingBuilder: Private voting supports 5000 voters maximum";
        testError(async () => { return votingbuilder.toggleIsPrivate(addresses); }, message);
        let params = await votingbuilder.getVotingParams();

        expect(params.votersPrivate).to.eql([]);
        expect(params.isPrivate).to.equal(false);
    });

    it("122: toggleIsPrivate() true requires voters <= votersLimit if isVotersLimited true", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsVotersLimited(5);
        let addresses = [];
        for (let i = 0; i < 10; i++) {
            addresses.push(signers[0].address);
        }

        let message = "VotingBuilder: Private Voters amount cannot be higher than total voters limit";
        testError(async () => { return votingbuilder.toggleIsPrivate(addresses); }, message);
        let params = await votingbuilder.getVotingParams();

        expect(params.isPrivate).to.equal(false);
    });

    it("123: toggleIsPrivate() works properly (on/off)", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        let addresses = [];
        for (let i = 0; i < 10; i++) {
            addresses.push(signers[0].address);
        }

        await votingbuilder.toggleIsPrivate(addresses);
        let params = await votingbuilder.getVotingParams();

        expect(params.isPrivate).to.equal(true);
        expect(params.votersPrivate).to.eql(addresses);

        await votingbuilder.toggleIsPrivate([]);
        params = await votingbuilder.getVotingParams();

        expect(params.isPrivate).to.equal(false);
    });

    it("124: toggleIsPrivate() false disables isFunded, isVotePowered", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);

        await votingbuilder.toggleIsPrivate([signers[0].address]);
        await votingbuilder.toggleIsPrivate([]);
        let params = await votingbuilder.getVotingParams();

        expect(params.isFunded).to.equal(false);
        expect(params.isVotePowered).to.equal(false);
        expect(params.isPrivate).to.equal(false);
    });

    it("125: toggleIsPrivate() false clears votersPrivate[]", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);

        await votingbuilder.toggleIsPrivate([signers[0].address]);
        await votingbuilder.toggleIsPrivate([]);
        let params = await votingbuilder.getVotingParams();

        expect(params.votersPrivate).to.eql([]);
        expect(params.isPrivate).to.equal(false);
    });

    it("126: toggleIsMultiChoiced() requires choices <= 20", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        let choices = [];
        for (let i = 0; i < 25; i++) {
            choices.push("choice #" + i);
        }

        let message = "VotingBuilder: Max choices amount is 20";
        testError(async () => { return votingbuilder.toggleIsMultiChoiced(choices); }, message);
        let params = await votingbuilder.getVotingParams();

        expect(params.choices).to.eql([]);
    });

    it("127: toggleIsMultiChoiced() false and sets yes/no if choices <= 1", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);

        await votingbuilder.toggleIsMultiChoiced([]);
        let params = await votingbuilder.getVotingParams();

        expect(params.choices).to.eql(["yes", "no"]);
        expect(params.isMultiChoiced).to.equal(false);
    });

    it("128: toggleIsMultiChoiced() true and sets input choices if choices 2-20", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        let choices = [];
        for (let i = 0; i < 10; i++) {
            choices.push("choice #" + i);
        }

        await votingbuilder.toggleIsMultiChoiced(choices);
        let params = await votingbuilder.getVotingParams();

        expect(params.choices).to.eql(choices);
        expect(params.isMultiChoiced).to.equal(true);
    });

    it("129: toggleIsFunded() true requires isVotersLimited true", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        
        let message = "VotingBuilder: voting should has voters limit to be able to fund voters";
        testError(async () => { return votingbuilder.toggleIsFunded(10); }, message);
        let params = await votingbuilder.getVotingParams();

        expect(params.fundingUsersLimit).to.equal(0);
        expect(params.isFunded).to.equal(false);
    });

    it("130: toggleIsFunded() true requires isPrivate true", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsVotersLimited(100);

        let message = "VotingBuilder: voting should has private voters to be able to fund voters";
        testError(async () => { return votingbuilder.toggleIsFunded(10); }, message);
        let params = await votingbuilder.getVotingParams();

        expect(params.fundingUsersLimit).to.equal(0);
        expect(params.isFunded).to.equal(false);
    });

    it("131: toggleIsFunded() true requires usersAmount >= votersLimit", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsVotersLimited(100);
        let addresses = [];
        for (let i = 0; i < 100; i++) {
            addresses.push(signers[0].address);
        }
        await votingbuilder.toggleIsPrivate(addresses);

        let message = "VotingBuilder: Funding users limit cannot be lower than total voters limit";
        testError(async () => { return votingbuilder.toggleIsFunded(10); }, message);
        let params = await votingbuilder.getVotingParams();

        expect(params.fundingUsersLimit).to.equal(0);
        expect(params.isFunded).to.equal(false);
    });

    it("132: toggleIsFunded() true requires usersAmount = votersPrivate", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsVotersLimited(10);
        let addresses = [];
        for (let i = 0; i < 10; i++) {
            addresses.push(signers[0].address);
        }
        await votingbuilder.toggleIsPrivate(addresses);

        let message = "VotingBuilder: Funding users limit and Private Voters amount mismatch";
        testError(async () => { return votingbuilder.toggleIsFunded(15); }, message);
        let params = await votingbuilder.getVotingParams();

        expect(params.fundingUsersLimit).to.equal(0);
        expect(params.isFunded).to.equal(false);
    });

    it("133: toggleIsFunded() works properly (on/off)", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsVotersLimited(10);
        let usersAmount = 10;
        let addresses = [];
        for (let i = 0; i < 10; i++) {
            addresses.push(signers[0].address);
        }
        await votingbuilder.toggleIsPrivate(addresses);

        await votingbuilder.toggleIsFunded(usersAmount);
        let params = await votingbuilder.getVotingParams();

        expect(params.fundingUsersLimit).to.equal(usersAmount);
        expect(params.isFunded).to.equal(true);

        await votingbuilder.toggleIsFunded(0);
        params = await votingbuilder.getVotingParams();

        expect(params.isFunded).to.equal(false);
    });

    it("134: createVoting() requires choices > 1", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        
        let message = "VotingBuilder: Voting cannot be created without choices";
        testError(async () => { return votingbuilder.createVoting(); }, message);
        
        let addr = await votingbuilder.getVoting();
        expect(addr).to.equal("0x0000000000000000000000000000000000000000");
    });

    it("135: createVoting() requires msg.value > 0 if isFunded true", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        await votingbuilder.toggleIsVotersLimited(3);
        await votingbuilder.toggleIsPrivate([signers[1].address, signers[2].address, signers[3].address]);
        await votingbuilder.toggleIsFunded(3);

        let message = "VotingBuilder: No ether sent for funded voting";
        testError(async () => { return votingbuilder.createVoting(); }, message);
        
        let addr = await votingbuilder.getVoting();
        expect(addr).to.equal("0x0000000000000000000000000000000000000000");
    });

    it("136: createVoting() requires votersPrivate > 0 if isFunded true", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        await votingbuilder.toggleIsVotersLimited(0);
        await votingbuilder.toggleIsPrivate([]);
        await votingbuilder.toggleIsFunded(0);

        let message = "VotingBuilder: No addresses to distribute to";
        testError(async () => { return votingbuilder.createVoting(); }, message);
        
        let addr = await votingbuilder.getVoting();
        expect(addr).to.equal("0x0000000000000000000000000000000000000000");
    });

    it("137: createVoting() funds all votersPrivate if isFunded true", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        await votingbuilder.toggleIsVotersLimited(3);
        await votingbuilder.toggleIsPrivate([signers[1].address, signers[2].address, signers[3].address]);
        await votingbuilder.toggleIsFunded(3);

        let initialBalances = await Promise.all(
            [signers[1].address, signers[2].address, signers[3].address].map(async (address) => {
                return await ethers.provider.getBalance(address);
            })
        );

        await votingbuilder.createVoting({ value: ethers.parseEther("0.3") });

        let finalBalances = await Promise.all(
            [signers[1].address, signers[2].address, signers[3].address].map(async (address) => {
                return await ethers.provider.getBalance(address);
            })
        );

        for (let i = 0; i < initialBalances.length; i++) {
            expect(finalBalances[i]).to.be.gt(initialBalances[i]);
            expect(finalBalances[i] - initialBalances[i]).to.equal(ethers.parseEther("0.1"));
        }

        let addr = await votingbuilder.getVoting();
        expect(addr).to.not.equal("0x0000000000000000000000000000000000000000");
    });

    it("138: createVoting() requires msg.value = 0 if isFunded false", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);

        let message = "VotingBuilder: Funding is deactivated, TX value should be 0";
        testError(async () => { return votingbuilder.createVoting({ value: ethers.parseEther("0.3") }); }, message);
        
        let addr = await votingbuilder.getVoting();
        expect(addr).to.equal("0x0000000000000000000000000000000000000000");
    });

    it("139: createVoting() deploys voting properly", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);

        await votingbuilder.createVoting();

        let addr = await votingbuilder.getVoting();
        expect(addr).to.not.equal("0x0000000000000000000000000000000000000000");
    });
});

describe("2. Voting", function () {
    it("201: check VotingParameters structure is equal to VotingBuilder", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        let instance = await deployVoting();

        await instance.grantRoleAdmin(signers[0].address);
        let params = await instance.getVotingParams();

        expect(params.isRepeated).to.be.a("boolean");
        expect(params.isVoterDisclosed).to.be.a("boolean");
        expect(params.isVotePowered).to.be.a("boolean");
        expect(params.isVotersLimited).to.be.a("boolean");
        expect(params.isPrivate).to.be.a("boolean");
        expect(params.isResultPartial).to.be.a("boolean");
        expect(params.isResultVetoed).to.be.a("boolean");
        expect(params.isMultiChoiced).to.be.a("boolean");
        expect(params.isFunded).to.be.a("boolean");

        expect(params.fundingUsersLimit).to.be.a("bigint");
        expect(params.votersLimit).to.be.a("bigint");
        expect(params.votesPercentageToWin).to.be.a("bigint");

        expect(params.votersPrivate).to.be.an("array");
        expect(params.voterPowers).to.be.an("array");
        expect(params.choices).to.be.an("array");
    });

    it("202: votingParams accepts params from VotingBuilder properly", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsVotersLimited(100);
        await votingbuilder.toggleIsPrivate([signers[1], signers[2], signers[3]]);
        await votingbuilder.toggleIsVotePowered([2, 3, 4]);
        await votingbuilder.toggleIsRepeated();
        await votingbuilder.toggleIsMultiChoiced([]);

        let instance = await deployVoting();
        await instance.grantRoleAdmin(signers[0].address);

        let paramsBuilder = await votingbuilder.getVotingParams();
        let paramsVoting = await instance.getVotingParams();

        expect(paramsVoting.isRepeated).to.equal(paramsBuilder.isRepeated);
        expect(paramsVoting.isVoterDisclosed).to.equal(paramsBuilder.isVoterDisclosed);
        expect(paramsVoting.isVotePowered).to.equal(paramsBuilder.isVotePowered);
        expect(paramsVoting.isVotersLimited).to.equal(paramsBuilder.isVotersLimited);
        expect(paramsVoting.isPrivate).to.equal(paramsBuilder.isPrivate);
        expect(paramsVoting.isResultPartial).to.equal(paramsBuilder.isResultPartial);
        expect(paramsVoting.isResultVetoed).to.equal(paramsBuilder.isResultVetoed);
        expect(paramsVoting.isMultiChoiced).to.equal(paramsBuilder.isMultiChoiced);
        expect(paramsVoting.isFunded).to.equal(paramsBuilder.isFunded);

        expect(paramsVoting.votersLimit).to.equal(paramsBuilder.votersLimit);
        expect(paramsVoting.votersPrivate).to.eql(paramsBuilder.votersPrivate);
        expect(paramsVoting.voterPowers).to.eql(paramsBuilder.voterPowers);
        expect(paramsVoting.choices).to.eql(paramsBuilder.choices);
    });

    it("203: check VotingResult structure", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        let instance = await deployVoting();

        await instance.grantRoleAdmin(signers[0].address);
        let result = await instance.getVotingResult();

        expect(result.choices).to.be.an("array");
        expect(result.votesReceived).to.be.an("array");
        expect(result.totalVotes).to.be.a("bigint");
        expect(result.winningChoice).to.be.a("string");
        expect(result.winningVotes).to.be.a("bigint");
    });

    it("204: check VotingResult default values", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        let instance = await deployVoting();

        await instance.grantRoleAdmin(signers[0].address);
        let result = await instance.getVotingResult();

        expect(result.votesReceived).to.deep.equal([BigInt(0), BigInt(0)]);
        expect(result.totalVotes).to.equal(0);
        expect(result.winningChoice).to.equal("");
        expect(result.winningVotes).to.equal(0);
    });

    it("205: votingResult accepts choices from votingParams", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        let instance = await deployVoting();

        await instance.grantRoleAdmin(signers[0].address);
        let params = await instance.getVotingParams();
        let result = await instance.getVotingResult();

        expect(result.choices).to.eql(params.choices);
    });

    it("206: check Voter structure", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        await votingbuilder.toggleIsVoterDisclosed();
        let instance = await deployVoting();

        await instance.grantRoleOperator(signers[0].address);
        let voter = await instance.getVoter(signers[0].address);

        expect(voter.voted).to.be.a("boolean");
        expect(voter.power).to.be.a("bigint");
        expect(voter.vote).to.be.a("string");
        expect(voter.isPrivate).to.be.a("boolean");
    });

    it("207: check Voter default values", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        await votingbuilder.toggleIsVoterDisclosed();
        let instance = await deployVoting();

        await instance.grantRoleOperator(signers[0].address);
        let voter = await instance.getVoter(signers[0].address);

        expect(voter.voted).to.equal(false);
        expect(voter.vote).to.equal("");
        expect(voter.power).to.equal(0);
        expect(voter.isPrivate).to.equal(false);
    });

    it("208: voters accepts votersPrivate from votingParams", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        await votingbuilder.toggleIsVoterDisclosed();
        await votingbuilder.toggleIsPrivate([signers[1], signers[2], signers[3]]);
        let instance = await deployVoting();

        await instance.grantRoleOperator(signers[0].address);
        let voter1 = await instance.getVoter(signers[1].address);
        let voter2 = await instance.getVoter(signers[2].address);
        let voter3 = await instance.getVoter(signers[3].address);

        expect(voter1.isPrivate).to.equal(true);
        expect(voter2.isPrivate).to.equal(true);
        expect(voter3.isPrivate).to.equal(true);
    });

    it("209: voters accepts voterPowers from votingParams if isVotePowered true", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        await votingbuilder.toggleIsVoterDisclosed();
        await votingbuilder.toggleIsVotersLimited(100);
        await votingbuilder.toggleIsPrivate([signers[1], signers[2], signers[3]]);
        await votingbuilder.toggleIsVotePowered([2, 3, 4]);
        let instance = await deployVoting();

        await instance.grantRoleOperator(signers[0].address);
        let voter1 = await instance.getVoter(signers[1].address);
        let voter2 = await instance.getVoter(signers[2].address);
        let voter3 = await instance.getVoter(signers[3].address);

        expect(voter1.power).to.equal(2);
        expect(voter2.power).to.equal(3);
        expect(voter3.power).to.equal(4);
    });

    it("210: getVoter() requires isVoterDisclosed true", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        let instance = await deployVoting();

        await instance.grantRoleOperator(signers[0].address);
        let message = "Voting: Votes disclosure is not allowed";
        let voter = undefined;
        voter = await testError(async () => { return instance.getVoter(signers[1].address); }, message);

        expect(voter).to.equal(undefined);
    });

    it("211: isActive false by default", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        let instance = await deployVoting();

        await instance.grantRoleOperator(signers[0].address);
        let isActive = await instance.getIsActive();

        expect(isActive).to.equal(false);
    });

    it("212: vote() requires onlyActive", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        let instance = await deployVoting();

        let message = "Voting: Voting is deactivated";
        await testError(async () => { return instance.vote(0); }, message);
        
        await instance.grantRoleOperator(signers[0].address);
        let result = await instance.getVotingResult();

        expect(result.votesReceived).to.deep.equal([BigInt(0), BigInt(0)]);
    });

    it("213: vote() restricts double-voting", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        let instance = await deployVoting();

        await instance.grantRoleOperator(signers[0].address);
        await instance.start();
        await instance.vote(0);

        let message = "Voting: Already voted";
        await testError(async () => { return instance.vote(1); }, message);
        
        let result = await instance.getVotingResult();
        expect(result.votesReceived[0]).to.equal(1);
        expect(result.votesReceived[1]).to.equal(0);
    });

    it("214: vote() requires the selected choice to exist", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        let instance = await deployVoting();

        await instance.grantRoleOperator(signers[0].address);
        await instance.start();

        let message = "Voting: the selected Choice does not exist";
        await testError(async () => { return instance.vote(2); }, message);
        
        let result = await instance.getVotingResult();
        expect(result.votesReceived[0]).to.equal(0);
        expect(result.votesReceived[1]).to.equal(0);
    });

    it("215: vote() checks the votersLimit reached if isVotersLimited true", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        await votingbuilder.toggleIsVotersLimited(1);
        let instance = await deployVoting();

        await instance.grantRoleOperator(signers[0].address);
        await instance.start();
        await instance.vote(0);

        let message = "Voting: Voters Limit already reached";
        await testError(async () => { return instance.connect(signers[1]).vote(1); }, message);
        
        let result = await instance.getVotingResult();
        expect(result.votesReceived[0]).to.equal(1);
        expect(result.votesReceived[1]).to.equal(0);
    });

    it("216: vote() requires voter to be white-listed if isPrivate true", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        await votingbuilder.toggleIsPrivate([signers[0].address]);
        let instance = await deployVoting();

        await instance.grantRoleOperator(signers[0].address);
        await instance.start();

        let message = "Voting: You are not among the allowed Private Voters";
        await testError(async () => { return instance.connect(signers[1]).vote(0); }, message);
        
        let result = await instance.getVotingResult();
        expect(result.votesReceived[0]).to.equal(0);
    });

    it("217: vote() works properly (vote, voted, totalVotes, votesReceived)", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        await votingbuilder.toggleIsVoterDisclosed();
        let instance = await deployVoting();

        await instance.grantRoleOperator(signers[0].address);
        await instance.start();

        await instance.connect(signers[1]).vote(0);
        await instance.connect(signers[2]).vote(1);
        await instance.connect(signers[3]).vote(0);
        
        let voter1 = await instance.getVoter(signers[1].address);
        let voter2 = await instance.getVoter(signers[2].address);
        let voter3 = await instance.getVoter(signers[3].address);
        let result = await instance.getVotingResult();

        expect(voter1.voted).to.equal(true);
        expect(voter2.voted).to.equal(true);
        expect(voter3.voted).to.equal(true);
        expect(voter1.vote).to.equal("yes");
        expect(voter2.vote).to.equal("no");
        expect(voter3.vote).to.equal("yes");
        expect(result.totalVotes).to.equal(3);
        expect(result.votesReceived).to.deep.equal([BigInt(2), BigInt(1)]);
    });

    it("218: vote() counts power if isVotePowered true", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        await votingbuilder.toggleIsVoterDisclosed();
        await votingbuilder.toggleIsVotersLimited(100);
        await votingbuilder.toggleIsPrivate([signers[1], signers[2], signers[3]]);
        await votingbuilder.toggleIsVotePowered([2, 3, 4]);
        let instance = await deployVoting();

        await instance.grantRoleOperator(signers[0].address);
        await instance.start();

        await instance.connect(signers[1]).vote(0);
        await instance.connect(signers[2]).vote(1);
        await instance.connect(signers[3]).vote(0);

        let result = await instance.getVotingResult();
        expect(result.totalVotes).to.equal(9);
        expect(result.votesReceived).to.deep.equal([BigInt(6), BigInt(3)]);
    });

    it("219: start() requires isActive false", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        await votingbuilder.toggleIsVotersLimited(100);
        await votingbuilder.toggleIsRepeated();
        let instance = await deployVoting();

        await instance.grantRoleOperator(signers[0].address);
        await instance.start();
        await instance.vote(0);

        let message = "Voting: Voting already started";
        await testError(async () => { return instance.start(); }, message);
        
        let result = await instance.getVotingResult();
        expect(result.totalVotes).to.equal(1);
    });

    it("220: start() clears voted, votesReceived, totalVotes, winningChoice, winningVotes if isRepeated true", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        await votingbuilder.toggleIsVotersLimited(100);
        await votingbuilder.toggleIsRepeated();
        await votingbuilder.toggleIsVoterDisclosed();
        let instance = await deployVoting();

        await instance.grantRoleOperator(signers[0].address);
        await instance.start();
        await instance.connect(signers[1]).vote(0);
        await instance.connect(signers[2]).vote(1);
        await instance.connect(signers[3]).vote(0);
        await instance.finishVoting();
        await instance.start();
        
        let voter1 = await instance.getVoter(signers[1].address);
        let voter2 = await instance.getVoter(signers[2].address);
        let voter3 = await instance.getVoter(signers[3].address);
        let result = await instance.getVotingResult();
        let isActive = await instance.getIsActive();

        expect(voter1.voted).to.equal(false);
        expect(voter2.voted).to.equal(false);
        expect(voter3.voted).to.equal(false);
        expect(result.totalVotes).to.equal(0);
        expect(result.winningChoice).to.equal("");
        expect(result.winningVotes).to.equal(0);
        expect(result.votesReceived).to.deep.equal([BigInt(0), BigInt(0)]);
        expect(isActive).to.equal(true);
    });

    it("221: start() requires totalVotes = 0 (not repeated)", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        let instance = await deployVoting();

        await instance.grantRoleOperator(signers[0].address);
        await instance.start();
        await instance.connect(signers[1]).vote(0);
        await instance.connect(signers[2]).vote(1);
        await instance.connect(signers[3]).vote(0);
        await instance.finishVoting();
        
        let message = "Voting: Voting is already finished and is not repeated";
        await testError(async () => { return instance.start(); }, message);

        let isActive = await instance.getIsActive();
        let result = await instance.getVotingResult();
        expect(result.totalVotes).to.equal(3);
        expect(result.winningChoice).to.equal("yes");
        expect(result.winningVotes).to.equal(2);
        expect(result.votesReceived).to.deep.equal([BigInt(2), BigInt(1)]);
        expect(isActive).to.equal(false);
    });

    it("222: start() enables voting properly", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        let instance = await deployVoting();

        await instance.grantRoleOperator(signers[0].address);
        await instance.start();

        let isActive = await instance.getIsActive();
        expect(isActive).to.equal(true);
    });

    it("223: finishVoting() requires onlyActive", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        let instance = await deployVoting();

        await instance.grantRoleOperator(signers[0].address);
        let message = "Voting: Voting is deactivated";
        await testError(async () => { return instance.finishVoting(); }, message);
        
        let result = await instance.getVotingResult();
        expect(result.winningChoice).to.equal("");
    });

    it("224: finishVoting() returns no winner if no votes made", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        let instance = await deployVoting();

        await instance.grantRoleOperator(signers[0].address);
        await instance.start();
        await instance.finishVoting()
        
        let result = await instance.getVotingResult();
        let isActive = await instance.getIsActive();
        expect(isActive).to.equal(false);
        expect(result.winningChoice).to.equal("No winner: no votes or two winners");
        expect(result.winningVotes).to.equal(0);
    });

    it("225: finishVoting() returns no winner if two winners", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        let instance = await deployVoting();

        await instance.grantRoleOperator(signers[0].address);
        await instance.start();
        await instance.connect(signers[1]).vote(0);
        await instance.connect(signers[2]).vote(1);
        await instance.finishVoting()
        
        let result = await instance.getVotingResult();
        let isActive = await instance.getIsActive();
        expect(isActive).to.equal(false);
        expect(result.winningChoice).to.equal("No winner: no votes or two winners");
        expect(result.winningVotes).to.equal(1);
    });

    it("226: finishVoting() returns no winner if result was vetoed", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        await votingbuilder.toggleIsResultVetoed();
        let instance = await deployVoting();

        await instance.grantRoleOperator(signers[0].address);
        await instance.start();
        await instance.connect(signers[1]).vote(0);
        await instance.connect(signers[2]).vote(0);
        await instance.connect(signers[3]).vote(1);
        await instance.finishVoting()
        
        let result = await instance.getVotingResult();
        let isActive = await instance.getIsActive();
        expect(isActive).to.equal(false);
        expect(result.winningChoice).to.equal("No winner: voting result was Votoed");
        expect(result.winningVotes).to.equal(2);
    });

    it("227: finishVoting() returns no winner if no choice reached needed % of votes", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        await votingbuilder.toggleIsResultPartial(75);
        let instance = await deployVoting();

        await instance.grantRoleOperator(signers[0].address);
        await instance.start();
        await instance.connect(signers[1]).vote(0);
        await instance.connect(signers[2]).vote(0);
        await instance.connect(signers[3]).vote(0);
        await instance.connect(signers[4]).vote(1);
        await instance.connect(signers[5]).vote(1);
        await instance.finishVoting()
        
        let result = await instance.getVotingResult();
        let isActive = await instance.getIsActive();
        expect(isActive).to.equal(false);
        expect(result.winningChoice).to.equal("No winner: No choice reached the required Votes Percentage To Win");
        expect(result.winningVotes).to.equal(3);
    });

    it("228: finishVoting() returns winning votes, choice properly if isResultVetoed true", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        await votingbuilder.toggleIsResultVetoed();
        let instance = await deployVoting();

        await instance.grantRoleOperator(signers[0].address);
        await instance.start();
        await instance.connect(signers[1]).vote(0);
        await instance.connect(signers[2]).vote(0);
        await instance.connect(signers[3]).vote(0);
        await instance.finishVoting()
        
        let result = await instance.getVotingResult();
        let isActive = await instance.getIsActive();
        expect(isActive).to.equal(false);
        expect(result.winningChoice).to.equal("yes");
        expect(result.winningVotes).to.equal(3);
    });

    it("229: finishVoting() returns winning votes, choice properly if isResultPartial true", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        await votingbuilder.toggleIsResultPartial(60);
        let instance = await deployVoting();

        await instance.grantRoleOperator(signers[0].address);
        await instance.start();
        await instance.connect(signers[1]).vote(0);
        await instance.connect(signers[2]).vote(0);
        await instance.connect(signers[3]).vote(0);
        await instance.connect(signers[4]).vote(1);
        await instance.connect(signers[5]).vote(1);
        await instance.finishVoting()
        
        let result = await instance.getVotingResult();
        let isActive = await instance.getIsActive();
        expect(isActive).to.equal(false);
        expect(result.winningChoice).to.equal("yes");
        expect(result.winningVotes).to.equal(3);
    });

    it("230: finishVoting() returns winning votes, choice properly for two choices", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        let instance = await deployVoting();

        await instance.grantRoleOperator(signers[0].address);
        await instance.start();
        await instance.connect(signers[1]).vote(0);
        await instance.connect(signers[2]).vote(0);
        await instance.connect(signers[3]).vote(1);
        await instance.connect(signers[4]).vote(1);
        await instance.connect(signers[5]).vote(1);
        await instance.finishVoting()
        
        let result = await instance.getVotingResult();
        let isActive = await instance.getIsActive();
        expect(isActive).to.equal(false);
        expect(result.winningChoice).to.equal("no");
        expect(result.winningVotes).to.equal(3);
    });

    it("231: finishVoting() returns winning votes, choice properly for multiple choices", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced(["BTC", "ETH", "BNB"]);
        let instance = await deployVoting();

        await instance.grantRoleOperator(signers[0].address);
        await instance.start();
        await instance.connect(signers[1]).vote(0);
        await instance.connect(signers[2]).vote(0);
        await instance.connect(signers[3]).vote(1);
        await instance.connect(signers[4]).vote(1);
        await instance.connect(signers[5]).vote(2);
        await instance.connect(signers[6]).vote(1);
        await instance.finishVoting()
        
        let result = await instance.getVotingResult();
        let isActive = await instance.getIsActive();
        expect(isActive).to.equal(false);
        expect(result.winningChoice).to.equal("ETH");
        expect(result.winningVotes).to.equal(3);
    });

    it("232: finishVoting() disables voting", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await votingbuilder.toggleIsMultiChoiced([]);
        let instance = await deployVoting();

        await instance.grantRoleOperator(signers[0].address);
        await instance.start();
        await instance.finishVoting()
        
        let isActive = await instance.getIsActive();
        expect(isActive).to.equal(false);
    });
});

describe("3. Role Model in Voting Builder", function () {
    let onlyAdmin = "Only Admin can perform this action";
    let onlyOwner = "Only owner can perform this action";

    it("301: getVotingParams() requires onlyAdmin", async function () {
        let params = await testError(async () => { return votingbuilder.getVotingParams(); }, onlyAdmin);
        expect(params).to.equal(undefined);
    });

    it("302: getVoting() requires onlyAdmin", async function () {
        let addr = await testError(async () => { return votingbuilder.getVoting(); }, onlyAdmin);
        expect(addr).to.equal(undefined);
    });

    it("303: owner was set properly", async function () {
        let owner = await votingbuilder.getOwner();
        expect(owner).to.equal(signers[0].address);
    });

    it("304: owner is not operator by default", async function () {
        let ifOperator = await votingbuilder.checkOperator(signers[0].address);
        expect(ifOperator).to.equal(false);
    });

    it("305: owner is not admin by default", async function () {
        let ifAdmin = await votingbuilder.checkAdmin(signers[0].address);
        expect(ifAdmin).to.equal(false);
    });

    it("306: owner cannot transfer Ownership to himself", async function () {
        let message = "VotingRoleModel: cannot transfer Ownership to himself";
        await testError(async () => { return votingbuilder.transferOwnership(signers[0].address); }, message);
    });

    it("307: transferOwnership() requires onlyOwner", async function () {
        await testError(async () => { return votingbuilder.connect(signers[1]).transferOwnership(signers[1].address); }, onlyOwner);
        let owner = await votingbuilder.getOwner();
        expect(owner).to.equal(signers[0].address);
    });

    it("308: transferOwnership() works properly", async function () {
        await votingbuilder.transferOwnership(signers[1].address);
        let owner = await votingbuilder.getOwner();
        expect(owner).to.equal(signers[1].address);
    });

    it("309: toggleIsVotersLimited() requires onlyAdmin", async function () {
        await testError(async () => { return votingbuilder.toggleIsVotersLimited(100); }, onlyAdmin);

        await votingbuilder.grantRoleAdmin(signers[0].address);
        let params = await votingbuilder.getVotingParams();
        expect(params.isVotersLimited).to.equal(false);
    });

    it("310: toggleIsVoterDisclosed() requires onlyAdmin", async function () {
        await testError(async () => { return votingbuilder.toggleIsVoterDisclosed(); }, onlyAdmin);

        await votingbuilder.grantRoleAdmin(signers[0].address);
        let params = await votingbuilder.getVotingParams();
        expect(params.isVoterDisclosed).to.equal(false);
    });

    it("311: toggleIsVotePowered() requires onlyAdmin", async function () {
        await testError(async () => { return votingbuilder.toggleIsVotePowered([1, 2, 3]); }, onlyAdmin);

        await votingbuilder.grantRoleAdmin(signers[0].address);
        let params = await votingbuilder.getVotingParams();
        expect(params.isVotePowered).to.equal(false);
    });

    it("312: toggleIsResultVetoed() requires onlyAdmin", async function () {
        await testError(async () => { return votingbuilder.toggleIsResultVetoed(); }, onlyAdmin);

        await votingbuilder.grantRoleAdmin(signers[0].address);
        let params = await votingbuilder.getVotingParams();
        expect(params.isResultVetoed).to.equal(false);
    });

    it("313: toggleIsResultPartial() requires onlyAdmin", async function () {
        await testError(async () => { return votingbuilder.toggleIsResultPartial(75); }, onlyAdmin);

        await votingbuilder.grantRoleAdmin(signers[0].address);
        let params = await votingbuilder.getVotingParams();
        expect(params.isResultPartial).to.equal(false);
    });

    it("314: toggleIsRepeated() requires onlyAdmin", async function () {
        await testError(async () => { return votingbuilder.toggleIsRepeated(); }, onlyAdmin);

        await votingbuilder.grantRoleAdmin(signers[0].address);
        let params = await votingbuilder.getVotingParams();
        expect(params.isRepeated).to.equal(false);
    });

    it("315: toggleIsPrivate() requires onlyAdmin", async function () {
        await testError(async () => { return votingbuilder.toggleIsPrivate([signers[0].address]); }, onlyAdmin);

        await votingbuilder.grantRoleAdmin(signers[0].address);
        let params = await votingbuilder.getVotingParams();
        expect(params.isPrivate).to.equal(false);
    });

    it("316: toggleIsMultiChoiced() requires onlyAdmin", async function () {
        await testError(async () => { return votingbuilder.toggleIsMultiChoiced([]); }, onlyAdmin);

        await votingbuilder.grantRoleAdmin(signers[0].address);
        let params = await votingbuilder.getVotingParams();
        expect(params.isMultiChoiced).to.equal(false);
    });

    it("317: toggleIsFunded() requires onlyAdmin", async function () {
        await testError(async () => { return votingbuilder.toggleIsFunded(10); }, onlyAdmin);

        await votingbuilder.grantRoleAdmin(signers[0].address);
        let params = await votingbuilder.getVotingParams();
        expect(params.isFunded).to.equal(false);
    });

    it("318: grantRoleAdmin() requires onlyOwner", async function () {
        await testError(async () => { return votingbuilder.connect(signers[1]).grantRoleAdmin(signers[1].address); }, onlyOwner);

        let ifAdmin = await votingbuilder.checkAdmin(signers[1].address);
        expect(ifAdmin).to.equal(false);
    });

    it("319: grantRoleAdmin() requires address is not admin", async function () {
        await votingbuilder.grantRoleAdmin(signers[1].address);

        let message = "VotingRoleModel: Role already granted to this address"
        await testError(async () => { return votingbuilder.grantRoleAdmin(signers[1].address); }, message);
    });

    it("320: grantRoleOperator() requires onlyOwner", async function () {
        await testError(async () => { return votingbuilder.connect(signers[1]).grantRoleOperator(signers[1].address); }, onlyOwner);

        let ifOperator = await votingbuilder.checkOperator(signers[1].address);
        expect(ifOperator).to.equal(false);
    });

    it("321: grantRoleOperator() requires address is not operator", async function () {
        await votingbuilder.grantRoleOperator(signers[1].address);

        let message = "VotingRoleModel: Role already granted to this address"
        await testError(async () => { return votingbuilder.grantRoleOperator(signers[1].address); }, message);
    });

    it("322: revokeRoleAdmin() requires onlyOwner", async function () {
        await votingbuilder.grantRoleAdmin(signers[0].address);
        await testError(async () => { return votingbuilder.connect(signers[1]).revokeRoleAdmin(signers[0].address); }, onlyOwner);

        let ifAdmin = await votingbuilder.checkAdmin(signers[0].address);
        expect(ifAdmin).to.equal(true);
    });

    it("323: revokeRoleAdmin() requires address is admin", async function () {
        let message = "VotingRoleModel: Role is not granted to this address"
        await testError(async () => { return votingbuilder.revokeRoleAdmin(signers[1].address); }, message);
    });

    it("324: revokeRoleOperator() requires onlyOwner", async function () {
        await votingbuilder.grantRoleOperator(signers[0].address);
        await testError(async () => { return votingbuilder.connect(signers[1]).revokeRoleOperator(signers[0].address); }, onlyOwner);

        let ifOperator = await votingbuilder.checkOperator(signers[0].address);
        expect(ifOperator).to.equal(true);
    });

    it("325: revokeRoleOperator() requires address is operator", async function () {
        let message = "VotingRoleModel: Role is not granted to this address"
        await testError(async () => { return votingbuilder.revokeRoleOperator(signers[1].address); }, message);
    });

    it("326: createVoting() requires onlyAdmin", async function () {
        await testError(async () => { return votingbuilder.createVoting(); }, onlyAdmin);

        await votingbuilder.grantRoleAdmin(signers[0].address);
        let addr = await votingbuilder.getVoting();
        expect(addr).to.equal("0x0000000000000000000000000000000000000000");
    });
});

describe("4. Role Model in Voting", function () {
    let onlyAdmin = "Only Admin can perform this action";
    let onlyOwner = "Only owner can perform this action";
    let onlyOperator = "Only Operator can perform this action";

    it("401: getVotingParams() requires onlyAdmin", async function () {
        let instance = await deployPreparedVoting();
        let params = await testError(async () => { return instance.getVotingParams(); }, onlyAdmin);
        expect(params).to.equal(undefined);
    });

    it("402: getVoter() requires onlyOperator", async function () {
        let instance = await deployPreparedVoting();
        let voter = await testError(async () => { return instance.getVoter(signers[0].address); }, onlyOperator);
        expect(voter).to.equal(undefined);
    });

    it("403: owner was set properly", async function () {
        let instance = await deployPreparedVoting();
        let owner = await instance.getOwner();
        expect(owner).to.equal(signers[0].address);
    });

    it("404: getIsActive() requires onlyOperator", async function () {
        let instance = await deployPreparedVoting();
        let isActive = await testError(async () => { return instance.getIsActive(); }, onlyOperator);
        expect(isActive).to.equal(undefined);
    });

    it("405: owner is not admin by default", async function () {
        let instance = await deployPreparedVoting();
        let ifAdmin = await instance.checkAdmin(signers[0].address);
        expect(ifAdmin).to.equal(false);
    });

    it("406: owner is not operator by default", async function () {
        let instance = await deployPreparedVoting();
        let ifOperator = await instance.checkOperator(signers[0].address);
        expect(ifOperator).to.equal(false);
    });

    it("407: owner cannot transfer Ownership to himself", async function () {
        let instance = await deployPreparedVoting();
        let message = "VotingRoleModel: cannot transfer Ownership to himself";
        await testError(async () => { return instance.transferOwnership(signers[0].address); }, message);
    });

    it("408: transferOwnership() requires onlyOwner", async function () {
        let instance = await deployPreparedVoting();
        await testError(async () => { return instance.connect(signers[1]).transferOwnership(signers[1].address); }, onlyOwner);
        let owner = await instance.getOwner();
        expect(owner).to.equal(signers[0].address);
    });

    it("409: transferOwnership() works properly", async function () {
        let instance = await deployPreparedVoting();
        await instance.transferOwnership(signers[1].address);
        let owner = await instance.getOwner();
        expect(owner).to.equal(signers[1].address);
    });

    it("410: start() requires onlyOperator", async function () {
        let instance = await deployPreparedVoting();
        await testError(async () => { return instance.start(); }, onlyOperator);
        
        await instance.grantRoleOperator(signers[0].address);
        let isActive = await instance.getIsActive()
        expect(isActive).to.equal(false);
    });

    it("411: grantRoleAdmin() requires onlyOwner", async function () {
        let instance = await deployPreparedVoting();
        await testError(async () => { return instance.connect(signers[1]).grantRoleAdmin(signers[1].address); }, onlyOwner);

        let ifAdmin = await instance.checkAdmin(signers[1].address);
        expect(ifAdmin).to.equal(false);
    });

    it("412: grantRoleAdmin() requires address is not admin", async function () {
        let instance = await deployPreparedVoting();
        await instance.grantRoleAdmin(signers[1].address);

        let message = "VotingRoleModel: Role already granted to this address"
        await testError(async () => { return instance.grantRoleAdmin(signers[1].address); }, message);
    });

    it("413: grantRoleOperator() requires onlyOwner", async function () {
        let instance = await deployPreparedVoting();
        await testError(async () => { return instance.connect(signers[1]).grantRoleOperator(signers[1].address); }, onlyOwner);

        let ifOperator = await instance.checkOperator(signers[1].address);
        expect(ifOperator).to.equal(false);
    });

    it("414: grantRoleOperator() requires address is not operator", async function () {
        let instance = await deployPreparedVoting();
        await instance.grantRoleOperator(signers[1].address);

        let message = "VotingRoleModel: Role already granted to this address"
        await testError(async () => { return instance.grantRoleOperator(signers[1].address); }, message);
    });

    it("415: revokeRoleAdmin() requires onlyOwner", async function () {
        let instance = await deployPreparedVoting();
        await instance.grantRoleAdmin(signers[0].address);
        await testError(async () => { return instance.connect(signers[1]).revokeRoleAdmin(signers[0].address); }, onlyOwner);

        let ifAdmin = await instance.checkAdmin(signers[0].address);
        expect(ifAdmin).to.equal(true);
    });

    it("416: revokeRoleAdmin() requires address is admin", async function () {
        let instance = await deployPreparedVoting();
        let message = "VotingRoleModel: Role is not granted to this address"
        await testError(async () => { return instance.revokeRoleAdmin(signers[1].address); }, message);
    });

    it("417: revokeRoleOperator() requires onlyOwner", async function () {
        let instance = await deployPreparedVoting();
        await instance.grantRoleOperator(signers[0].address);
        await testError(async () => { return instance.connect(signers[1]).revokeRoleOperator(signers[0].address); }, onlyOwner);

        let ifOperator = await instance.checkOperator(signers[0].address);
        expect(ifOperator).to.equal(true);
    });

    it("418: revokeRoleOperator() requires address is operator", async function () {
        let instance = await deployPreparedVoting();
        let message = "VotingRoleModel: Role is not granted to this address"
        await testError(async () => { return instance.revokeRoleOperator(signers[1].address); }, message);
    });

    it("419: finishVoting() requires onlyOperator", async function () {
        let instance = await deployPreparedVoting();
        await instance.grantRoleOperator(signers[0].address);
        await instance.start();
        await instance.revokeRoleOperator(signers[0].address)

        await testError(async () => { return instance.finishVoting(); }, onlyOperator);
        
        await instance.grantRoleOperator(signers[0].address);
        let isActive = await instance.getIsActive()
        expect(isActive).to.equal(true);
    });
});

async function deployVoting() {
    await votingbuilder.createVoting();
    const votingAddress = await votingbuilder.getVoting();
    const instance = await ethers.getContractAt("Voting", votingAddress);
    return instance;
}

async function deployPreparedVoting() {
    await votingbuilder.grantRoleAdmin(signers[0].address);
    await votingbuilder.toggleIsMultiChoiced([]);
    let instance = await deployVoting();
    return instance;
}

async function testError(method, message) {
    await expect(method()).to.be.revertedWith(message);
}
