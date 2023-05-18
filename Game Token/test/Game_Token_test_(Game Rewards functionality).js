let GMT = artifacts.require("GameToken");

let gmt = null;

contract("Game Token (Game Rewards functionality)", async(accounts)=>{

    beforeEach(async () => {
        gmt = await GMT.new("Game Token", "GMT");
    });

    it("Modifier OnlyOwner() works properly", async () => {
        let decimals = parseInt(await getDecimals());
        let amount = 5 * 10 ** decimals;

        let rewardsBefore = parseInt(await getRewards(accounts[1]));
        try {
            await gmt.addRewards(accounts[1], amount, { from: accounts[1] });
            assert.fail("The transaction should have thrown an error. Signer is not the contract Owner");
        } catch (error) {
            assert.include(error.message, "Caller is not the owner", "Wrong error, should include 'Caller is not the owner'");
        }
        let rewardsAfter = parseInt(await getRewards(accounts[1]));

        assert.equal(rewardsBefore, rewardsAfter, "Rewards balance should remain unchanged");
    });

    it("Events work properly", async () => {
        let decimals = parseInt(await getDecimals());
        let amount = 5 * 10 ** decimals;

        await gmt.addRewards(accounts[0], amount);
        let tx = await gmt.claimRewards();

        assert.equal(tx.logs.length, 2, "There should be 1 event emitted after rewards claimed");
    });

    it("addRewards() works properly", async () => {
        let decimals = parseInt(await getDecimals());
        let amount = 15 * 10 ** decimals;

        let rewardsBefore = parseInt(await getRewards(accounts[1]));
        await gmt.addRewards(accounts[1], amount);
        let rewardsAfter = parseInt(await getRewards(accounts[1]));

        assert.equal(rewardsAfter, rewardsBefore+amount, "The rewards balance was not increased correctly");
    });

    it("claimRewards() works properly", async () => {
        let decimals = parseInt(await getDecimals());
        let amount = 15 * 10 ** decimals;

        let balanceBefore = parseInt(await getBalance(accounts[1]));
        await gmt.addRewards(accounts[1], amount);
        let rewardsBefore = parseInt(await getRewards(accounts[1]));
        await gmt.claimRewards({ from: accounts[1] });
        let rewardsAfter = parseInt(await getRewards(accounts[1]));
        let balanceAfter = parseInt(await getBalance(accounts[1]));

        assert.equal(rewardsAfter, rewardsBefore-amount, "The rewards balance was not decreased correctly");
        assert.equal(rewardsAfter, 0, "The rewards balance is not zero after claim");
        assert.equal(balanceAfter, balanceBefore+amount, "The user's balance was not increased correctly");
    });

    it("claimRewards() throws 'No rewards' properly", async () => {
        let balanceBefore = parseInt(await getBalance(accounts[1]));
        try{
            await gmt.claimRewards({ from: accounts[1] });
            assert.fail("The transaction should have thrown an error. No rewards to claim");
        }catch(error) {
            assert.include(error.message, "No rewards", "Wrong error, should include 'No rewards'");
        }
        let balanceAfter = parseInt(await getBalance(accounts[1]));

        assert.equal(balanceAfter, balanceBefore, "The user's balance should remain unchanged");
    });

    it("deductRewards() works properly", async () => {
        let decimals = parseInt(await getDecimals());
        let amount = 15 * 10 ** decimals;
        let deductAmount = 3 * 10 ** decimals;

        await gmt.addRewards(accounts[1], amount);
        let rewardsBefore = parseInt(await getRewards(accounts[1]));
        await gmt.deductRewards(accounts[1], deductAmount);
        let rewardsAfter = parseInt(await getRewards(accounts[1]));

        assert.equal(rewardsAfter, rewardsBefore-deductAmount, "The rewards balance was not decreased correctly");
    });

    it("deductRewards() throws 'Insufficient rewards' properly", async () => {
        let decimals = parseInt(await getDecimals());
        let amount = 15 * 10 ** decimals;
        let deductAmount = 30 * 10 ** decimals;

        let rewardsBefore;
        try{
            await gmt.addRewards(accounts[1], amount);
            rewardsBefore = parseInt(await getRewards(accounts[1]));
            await gmt.deductRewards(accounts[1], deductAmount);
            assert.fail("The transaction should have thrown an error. Insufficient rewards balance");
        }catch(error) {
            assert.include(error.message, "Insufficient rewards", "Wrong error, should include 'Insufficient rewards'");
        }
        let rewardsAfter = parseInt(await getRewards(accounts[1]));

        assert.equal(rewardsAfter, rewardsBefore, "The rewards balance should remain unchanged");
    });
})

async function getDecimals() {
    let decimals = await gmt.decimals();
    return await decimals.toString(); 
}
async function getRewards(address) {
    let rewards = await gmt.getRewards({ from: address });
    return await rewards.toString();
}
async function getBalance(account) {
    let balance = await gmt.balanceOf(account);
    return await balance.toString();
}
