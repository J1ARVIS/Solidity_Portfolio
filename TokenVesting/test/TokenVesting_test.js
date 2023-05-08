let Vesting = artifacts.require("TokenVesting");
let OGN = artifacts.require("Own_Token");

let ogn = null;
let vesting = null;

contract("Token Vesting (view)", async(accounts)=>{
    it("Vesting works with the correct token", async()=>{
        ogn = await OGN.deployed();
        vesting = await Vesting.deployed();
        let token = ogn.address;
        let result = await vesting.token();
        assert.equal(result, token, "TokenVesting works with the wrong token");
    });
    it("Vesting works with the correct beneficiary", async()=>{
        vesting = await Vesting.deployed();
        let beneficiary = accounts[1].toString();
        let result = await vesting.beneficiary();
        assert.equal(result, beneficiary, "TokenVesting works with the wrong beneficiary");
    });
    it("Vesting has correct duration", async()=>{
        vesting = await Vesting.deployed();
        let duration = 5270400*23;
        let result = await vesting.duration();
        assert.equal(result, duration, "TokenVesting has wrong duration");
    });
    it("Vesting has correct periods amount", async()=>{
        vesting = await Vesting.deployed();
        let periods = 23;
        let result = await vesting.periods();
        assert.equal(result, periods, "TokenVesting has wrong periods amount");
    });
    it("Vesting has correct allocation", async()=>{
        ogn = await OGN.deployed();
        vesting = await Vesting.deployed();
        let allocation = ((await ogn.cap())*0.04).toString();
        let result = await vesting.allocation();
        assert.equal(result, allocation, "TokenVesting has wrong allocation");
    });
})

contract("Token Vesting (functionality)", async(accounts)=>{
    it("release() does not throw errors", async()=>{
        vesting = await Vesting.deployed();
        let sender = await (vesting.address).toString();
        let recipient = await (await vesting.beneficiary()).toString();

        let action = "release";
        let amount = await vesting.releasable();
        console.log("------------------------------------------------------");
        console.log(`Released amount - ${amount/(10**14)} tokens`);

        let vestingBalanceBefore = await showBalance("Vesting", false, action, sender);
        let beneficiaryBalanceBefore = await showBalance("Beneficiary", false, action, recipient);
        await vesting.release();
        let vestingBalanceAfter = await showBalance("Vesting", true, action, sender);
        let beneficiaryBalanceAfter = await showBalance("Beneficiary", true, action, recipient);
        console.log("------------------------------------------------------");

        assert.equal(vestingBalanceAfter, vestingBalanceBefore-amount, "The TokenVestings's balance was not decreased correctly");
        assert.equal(beneficiaryBalanceAfter, beneficiaryBalanceBefore+amount, "The beneficiary's balance was not increased correctly");
    });
    
    it("Vested amount is 0 before the start", async()=>{
        vesting = await Vesting.deployed();
        let amount = "0";
        let timestamp = (await vesting.start()) - 1;
        console.log(`Start timestamp - ${await vesting.start()} seconds`);

        let result = await getVestedAmount(timestamp);
        console.log(`Vested amount before the start - ${result/(10**14)} tokens`);

        assert.equal(result, amount, "Vested amount should be 0");
    });

    it("Vested amount is correct after 1 period (2 months)", async()=>{
        vesting = await Vesting.deployed();

        let amount = (await vesting.allocation()) / (await vesting.periods());
        console.log(`Theoretical vested amount after 1 period - ${amount/(10**14)} tokens`);

        let start = parseInt(await vesting.start());
        let duration = parseInt(await vesting.duration());
        let periods = parseInt(await vesting.periods());
        let timestamp = start + duration/periods;
        console.log(`Timestamp after 1 period - ${timestamp} seconds`);

        let result = await getVestedAmount(timestamp);
        console.log(`Vested amount after 1 period - ${result/(10**14)} tokens`);

        assert.equal(result, amount, "Vested amount isn't correct");
    });

    it("Vested amount is correct after 3 periods (6 months)", async()=>{
        vesting = await Vesting.deployed();

        let amount = ((await vesting.allocation()) / (await vesting.periods())) * 3;
        console.log(`Theoretical vested amount after 3 periods - ${amount/(10**14)} tokens`);

        let start = parseInt(await vesting.start());
        let duration = parseInt(await vesting.duration());
        let periods = parseInt(await vesting.periods());
        let timestamp = start + (duration/periods)*3;
        console.log(`Timestamp after 3 periods - ${timestamp} seconds`);

        let result = await getVestedAmount(timestamp);
        console.log(`Vested amount after 3 periods - ${result/(10**14)} tokens`);

        assert.equal(result, amount, "Vested amount isn't correct");
    });

    it("Vested amount equals allocation after the duration", async()=>{
        vesting = await Vesting.deployed();
        let amount = await vesting.allocation();
        console.log(`Theoretical vested amount after duration - ${amount/(10**14)} tokens`);

        let start = parseInt(await vesting.start());
        let duration = parseInt(await vesting.duration());
        let timestamp = start + duration + 1;
        console.log(`Finish timestamp - ${start + duration} seconds`);

        let result = await getVestedAmount(timestamp);
        console.log(`Vested amount after the duration - ${result/(10**14)} tokens`);

        assert.equal(result, amount, "Vested amount should equals allocation");
    });
})

async function getBalance(account) {
    let balance = await ogn.balanceOf(account);
    return await balance.toString();
}
async function showBalance(role, queue, action, address) {
    let Balance = parseInt(await getBalance(address));
    let turn = "";
    if(queue) {turn = "after"} else {turn = "before"}
    console.log(`${role} balance ${turn} ${action} - ${Balance/(10**14)} tokens`);
    return Balance;
}
async function getVestedAmount(timestamp) {
    timestamp.toString();
    let result = await vesting.vestedAmount(timestamp);
    return result.toString();
}