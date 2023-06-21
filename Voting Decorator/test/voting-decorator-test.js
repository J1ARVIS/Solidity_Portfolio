const { expect } = require("chai");

let votingbuilder;
beforeEach(async function () {
    votingbuilder = await ethers.deployContract("VotingBuilder");
    await votingbuilder.waitForDeployment();
});

describe("Voting Builder", function () {
    it("toggleIstMultiple() works properly", async function () {
        let before = await votingbuilder.getIstMultiple();
        await votingbuilder.toggleIstMultiple();
        let after = await votingbuilder.getIstMultiple();

        expect(after).to.equal(!before);
    });

    it("toggleIsClosed() works properly", async function () {
        let before = await votingbuilder.getIsClosed();
        await votingbuilder.toggleIsClosed();
        let after = await votingbuilder.getIsClosed();

        expect(after).to.equal(!before);
    });

    it("getVoting() returns zero-address before createVoting() is called", async function () {
        let instance = await votingbuilder.getVoting();

        expect(instance).to.equal("0x0000000000000000000000000000000000000000");
    });

    it("createVoting() works properly", async function () {
        await votingbuilder.createVoting();
        let instance = await votingbuilder.getVoting();

        expect(instance).to.not.equal("0x0000000000000000000000000000000000000000");
    });
});

describe("Voting", function () {
    it("Contract has correct owner", async function () {
        const { instance, signers } = await deployVoting("Voting");
        let owner = await instance.getOwner();

        expect(owner).to.equal(signers[0].address);
    });

    it("False isClosed variation works properly", async function () {
        const { instance, signers } = await deployVoting("Voting");

        const voterInfo = await instance.getVoter(signers[0].address);
        expect(voterInfo.voted).to.equal(false);
        expect(voterInfo.vote).to.equal(false);
    });

    it("vote() works properly", async function () {
        const { instance, signers } = await deployVoting("Voting");

        await instance.vote(true);

        const voterInfo = await instance.getVoter(signers[0].address);
        const totalVotes = await instance.getTotalVotes();
        const vote = await instance.getInFavor();

        expect(voterInfo.voted).to.equal(true);
        expect(voterInfo.vote).to.equal(true);
        expect(totalVotes).to.equal(1);
        expect(vote).to.equal(1);
    });

    it("vote() throws 'Maximum number of votes reached' properly", async function () {
        const { instance, signers } = await deployVoting("Voting");
        const maxVotes = await instance.getMaxVotes();

        await voteLoop(instance, signers, maxVotes);

        let message = "Maximum number of votes reached.";
        testError(async () => { return instance.connect(signers[maxVotes]).vote(true); }, message);
    });

    it("vote() throws 'Already voted' properly", async function () {
        const { instance, signers } = await deployVoting("Voting");

        await instance.vote(true);
        const voterInfo = await instance.getVoter(signers[0].address);
        expect(voterInfo.voted).to.equal(true);

        let message = "Already voted.";
        const totalVotesBefore = await instance.getTotalVotes();
        testError(async () => { return instance.vote(false); }, message);
        const totalVotesAfter = await instance.getTotalVotes();
        expect(totalVotesAfter).to.equal(totalVotesBefore);
    });

    it("False isMultiple variation works properly", async function () {
        const { instance, signers } = await deployVoting("Voting");

        const maxVotes = await instance.getMaxVotes();
        await voteLoop(instance, signers, maxVotes);

        await instance.finishVoting();
        expect(await instance.getIsActive()).to.equal(false);
        expect(await instance.getTotalVotes()).to.equal(maxVotes);
    });

    it("finishVoting() throws 'Needed amount of votes is not reached' properly", async function () {
        const { instance } = await deployVoting("Voting");
        await instance.vote(true);

        let message = "Needed amount of votes is not reached.";
        testError(async () => { return instance.finishVoting(); }, message);

        expect(await instance.getIsActive()).to.equal(true);
    });

    it("onlyOwner works properly", async function () {
        const { instance, signers } = await deployVoting("Voting");
        let inFavor = undefined;

        let message = "Caller is not the owner";
        inFavor = await testError(async () => { return instance.connect(signers[1]).getInFavor(); }, message);
        expect(inFavor).to.equal(undefined);
    });

    it("onlyActive works properly", async function () {
        const { instance, signers } = await deployVoting("Voting");
        const maxVotes = await instance.getMaxVotes();
        await voteLoop(instance, signers, maxVotes);
        await instance.finishVoting();

        let message = "Contract is deactivated";
        testError(async () => { return instance.finishVoting(); }, message);
    });
});

describe("Closed-Voting Decorator", function () {
    it("True isClosed variation works properly", async function () {
        await votingbuilder.toggleIsClosed();
        const { instance, signers } = await deployVoting("ClosedVotingDecorator");

        let message = "Votes disclosure is not allowed.";
        testError(async () => { return instance.getVoter(signers[0].address); }, message);
    });
});

describe("Multiple-Voting Decorator", function () {
    it("True isMultiple variation works properly", async function () {
        await votingbuilder.toggleIstMultiple();
        const { instance, signers } = await deployVoting("MultipleVotingDecorator");

        const maxVotes = await instance.getMaxVotes();
        await voteLoop(instance, signers, maxVotes);

        await instance.finishVoting();
        expect(await instance.getIsActive()).to.equal(true);
        expect(await instance.getTotalVotes()).to.equal(0);
        expect(await instance.getInFavor()).to.equal(0);
        expect(await instance.getAgainst()).to.equal(0);

        let voterInfo;
        for (let i = 0; i < maxVotes; i++) {
            voterInfo = await instance.getVoter(signers[i].address);
            expect(voterInfo.voted).to.equal(false);
        }
    });

    it("finishVoting() throws 'Needed amount of votes is not reached' properly", async function () {
        const { instance } = await deployVoting("Voting");
        await instance.vote(true);

        let message = "Needed amount of votes is not reached.";
        testError(async () => { return instance.finishVoting(); }, message);

        expect(await instance.getIsActive()).to.equal(true);
    });
});

async function deployVoting(variation) {
    const signers = await ethers.getSigners();
    await votingbuilder.createVoting();
    const votingAddress = await votingbuilder.getVoting();
    const instance = await ethers.getContractAt(variation, votingAddress);
    return { instance, signers };
}
async function testError(method, message) {
    let errorOccurred = false;
    try {
        await method();
    } catch (error) {
        errorOccurred = true;
        expect(error.message).to.include(message);
    }
    expect(errorOccurred).to.equal(true);
}
async function voteLoop(instance, signers, limit) {
    for (let i = 0; i < limit; i++) {
        await instance.connect(signers[i]).vote(true);
    }
}