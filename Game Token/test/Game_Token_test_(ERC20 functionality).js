let GMT = artifacts.require("GameToken");

let gmt = null;

contract("Game Token (ERC20 functionality)", async(accounts)=>{

    beforeEach(async () => {
        gmt = await GMT.new("Game Token", "GMT");
    });

    it("transfer() works properly", async()=>{
        let decimals = parseInt(await getDecimals());
        await mint(accounts[0], 150);

        let action = "transfer";
        let amount = 5 * 10 ** decimals;
        //console.log("------------------------------------------------------");
        //console.log(`Transferring amount - ${amount / 10 ** decimals} GMT`);

        let senderBalanceBefore = await showBalance("Sender", false, action, accounts[0]);
        let recipientBalanceBefore = await showBalance("Recipient", false, action, accounts[1]);
        await testTransfer(accounts[1], (amount).toString());
        let senderBalanceAfter = await showBalance("Sender", true, action, accounts[0]);
        let recipientBalanceAfter = await showBalance("Recipient", true, action, accounts[1]);
        //console.log("------------------------------------------------------");

        assert.equal(senderBalanceAfter, senderBalanceBefore-amount, "The sender's balance was not decreased correctly");
        assert.equal(recipientBalanceAfter, recipientBalanceBefore+amount, "The recipient's balance was not increased correctly");
    });

    it("transfer() throws 'to the zero' properly", async()=>{
        let decimals = parseInt(await getDecimals());
        await mint(accounts[0], 150);

        let zeroAddress = '0x0000000000000000000000000000000000000000';
        let action = "transfer";
        let amount = 5 * 10 ** decimals;
        //console.log("------------------------------------------------------");
        //console.log(`Transferring amount - ${amount / 10 ** decimals} GMT`);

        let senderBalanceBefore = await showBalance("Sender", false, action, accounts[0]);
        try {
            await gmt.transfer(zeroAddress, (amount).toString());
            assert.fail("The transaction should have thrown an error. Transfer to the zero address");
        } catch (error) {
            assert.include(error.message, "to the zero", "Wrong error, should include 'to the zero'");
        }
        let senderBalanceAfter = await showBalance("Sender", true, action, accounts[0]);
        //console.log("------------------------------------------------------");

        assert.equal(senderBalanceBefore, senderBalanceAfter, "Sender balance should remain unchanged");
    });

    it("transfer() throws 'exceeds balance' properly", async()=>{
        let decimals = parseInt(await getDecimals());
        await mint(accounts[0], 15);

        let action = "transfer";
        let amount = 20 * 10 ** decimals;
        //console.log("------------------------------------------------------");
        //console.log(`Transferring amount - ${amount / 10 ** decimals} GMT`);

        let senderBalanceBefore = await showBalance("Sender", false, action, accounts[0]);
        let recipientBalanceBefore = await showBalance("Recipient", false, action, accounts[1]);
        try {
            await gmt.transfer(accounts[1], (amount).toString());
            assert.fail("The transaction should have thrown an error. Transfer amount exceeds balance");
        } catch (error) {
            assert.include(error.message, "exceeds balance", "Wrong error, should include 'exceeds balance'");
        }
        let senderBalanceAfter = await showBalance("Sender", true, action, accounts[0]);
        let recipientBalanceAfter = await showBalance("Recipient", true, action, accounts[1]);
        //console.log("------------------------------------------------------");

        assert.equal(senderBalanceBefore, senderBalanceAfter, "Sender balance should remain unchanged");
        assert.equal(recipientBalanceBefore, recipientBalanceAfter, "Recipient balance should remain unchanged");
    });

    it("approve() works properly", async()=>{
        let decimals = parseInt(await getDecimals());
        let action = "approval";
        let amount = 5 * 10 ** decimals;
        //console.log("------------------------------------------------------");
        //console.log(`Approval amount - ${amount / 10 ** decimals} GMT`);

        let allowanceBefore = await showAllowance(false, action, accounts[0], accounts[1]);
        await testApproval(accounts[1], amount);
        let allowanceAfter = await showAllowance(true, action, accounts[0], accounts[1]);
        //console.log("------------------------------------------------------");

        assert.equal(allowanceAfter, allowanceBefore+amount, "The spender's Allowance was not increased correctly");
    });

    it("approve() throws 'to the zero' properly", async()=>{
        let decimals = parseInt(await getDecimals());
        let zeroAddress = '0x0000000000000000000000000000000000000000';
        let action = "approval";
        let amount = 5 * 10 ** decimals;
        //console.log("------------------------------------------------------");
        //console.log(`Approval amount - ${amount / 10 ** decimals} GMT`);

        let allowanceBefore = await showAllowance(false, action, accounts[0], zeroAddress);
        try {
            await gmt.approve(zeroAddress, amount);
            assert.fail("The transaction should have thrown an error. Approve to the zero address");
        } catch (error) {
            assert.include(error.message, "to the zero", "Wrong error, should include 'to the zero'");
        }
        let allowanceAfter = await showAllowance(true, action, accounts[0], zeroAddress);
        //console.log("------------------------------------------------------");

        assert.equal(allowanceBefore, allowanceAfter, "The Allowance should remain unchanged");
    });

    it("transferFrom() works properly", async()=>{
        let decimals = parseInt(await getDecimals());
        await mint(accounts[0], 15);

        let action = "TransferFrom";
        let amount = 5 * 10 ** decimals;
        //console.log("------------------------------------------------------");
        //console.log(`TransferFrom amount - ${amount/(10**decimals)} GMT`);

        await gmt.approve(accounts[1], amount);
        let allowanceBefore = await showAllowance(false, action, accounts[0], accounts[1]);
        let senderBalanceBefore = await showBalance("Sender", false, action, accounts[0]);
        let recipientBalanceBefore = await showBalance("Recipient", false, action, accounts[2]);
        await testTransferFrom(accounts[1], accounts[0], accounts[2], amount);
        let allowanceAfter = await showAllowance(true, action, accounts[0], accounts[1]);
        let senderBalanceAfter = await showBalance("Sender", true, action, accounts[0]);
        let recipientBalanceAfter = await showBalance("Recipient", true, action, accounts[2]);
        //console.log("------------------------------------------------------");

        assert.equal(allowanceAfter, allowanceBefore-amount, "The spender's Allowance was not decreased correctly");
        assert.equal(senderBalanceAfter, senderBalanceBefore-amount, "The owner's balance was not decreased correctly");
        assert.equal(recipientBalanceAfter, recipientBalanceBefore+amount, "The recipient's balance was not increased correctly");
    });

    it("transferFrom() throws 'insufficient allowance' properly", async()=>{
        let decimals = parseInt(await getDecimals());
        await mint(accounts[0], 15);

        let action = "TransferFrom";
        let amount = 5 * 10 ** decimals;
        //console.log("------------------------------------------------------");
        //console.log(`TransferFrom amount - ${amount/(10**decimals)} GMT`);

        await gmt.approve(accounts[1], 2 * 10 ** decimals);
        let allowanceBefore = await showAllowance(false, action, accounts[0], accounts[1]);
        let senderBalanceBefore = await showBalance("Sender", false, action, accounts[0]);
        let recipientBalanceBefore = await showBalance("Recipient", false, action, accounts[2]);
        try {
            await gmt.transferFrom(accounts[0], accounts[2], amount, {from: accounts[1]});
            assert.fail("The transaction should have thrown an error. Insufficient allowance");
        } catch (error) {
            assert.include(error.message, "insufficient allowance", "Wrong error, should include 'insufficient allowance'");
        }
        let allowanceAfter = await showAllowance(true, action, accounts[0], accounts[1]);
        let senderBalanceAfter = await showBalance("Sender", true, action, accounts[0]);
        let recipientBalanceAfter = await showBalance("Recipient", true, action, accounts[2]);
        //console.log("------------------------------------------------------");

        assert.equal(allowanceBefore, allowanceAfter, "The Allowance should remain unchanged");
        assert.equal(senderBalanceBefore, senderBalanceAfter, "Sender balance should remain unchanged");
        assert.equal(recipientBalanceBefore, recipientBalanceAfter, "Recipient balance should remain unchanged");
    });

    it("decreaseAllowance() throws 'allowance below zero' properly", async()=>{
        let decimals = parseInt(await getDecimals());
        let action = "DecreaseAllowance";
        let amount = 5 * 10 ** decimals;
        //console.log("------------------------------------------------------");
        //console.log(`DecreaseAllowance amount - ${amount/(10**decimals)} GMT`);

        await gmt.approve(accounts[1], 2 * 10 ** decimals);
        let allowanceBefore = await showAllowance(false, action, accounts[0], accounts[1]);
        try {
            await gmt.decreaseAllowance(accounts[1], amount);
            assert.fail("The transaction should have thrown an error. Decreased allowance below zero");
        } catch (error) {
            assert.include(error.message, "allowance below zero", "Wrong error, should include 'allowance below zero'");
        }
        let allowanceAfter = await showAllowance(true, action, accounts[0], accounts[1]);
        //console.log("------------------------------------------------------");

        assert.equal(allowanceBefore, allowanceAfter, "The Allowance should remain unchanged");
    });
})

async function getDecimals() {
    let decimals = await gmt.decimals();
    return await decimals.toString(); 
}
async function getBalance(account) {
    let balance = await gmt.balanceOf(account);
    return await balance.toString();
}
async function getAllowance(owner, spender) {
    let allowance = await gmt.allowance(owner, spender);
    return await allowance.toString();
}

async function mint(to, amount) {
    let decimals = parseInt(await getDecimals());
    await gmt.addRewards(to, amount * 10 ** decimals);
    await gmt.claimRewards({ from: to });
    let balance = parseInt(await getBalance(to));
    //console.log("------------------------------------------------------");
    //console.log(`Minted amount - ${balance/10**decimals} GMT`);
}

async function testTransfer(to, amount) {
    let errIndex = 0;
    try{
        await gmt.transfer(to, amount);
    }catch(err) {
        console.log(err.message);
        if(err.message.indexOf("from the zero")>=0){
            errIndex = 1;
        }
        if(err.message.indexOf("to the zero")>=0){
            errIndex = 2;
        }
        if(err.message.indexOf("exceeds")>=0){
            errIndex = 3;
        }
    }
    assert.notEqual(errIndex, 1, "The transfer can't be made from the zero address");
    assert.notEqual(errIndex, 2, "The transfer can't be made to the zero address");
    assert.notEqual(errIndex, 3, "The sender has not enough balance");
}

async function testApproval(to, amount) {
    let errIndex = 0;
    try{
        await gmt.approve(to, amount);
    }catch(err) {
        console.log(err.message);
        if(err.message.indexOf("from the zero")>=0){
            errIndex = 1;
        }
        if(err.message.indexOf("to the zero")>=0){
            errIndex = 2;
        }
    }
    assert.notEqual(errIndex, 1, "The Approval can't be made from the zero address");
    assert.notEqual(errIndex, 2, "The Approval can't be made to the zero address");
}

async function testTransferFrom(spender, from, to, amount) {
    let errIndex = 0;
    try{
        await gmt.transferFrom(from, to, amount, {from: spender});
    }catch(err) {
        console.log(`The transaction reverted with the next error: ${err.message}`);
        if(err.message.indexOf("insufficient allowance")>=0 || err.message.indexOf("underflow")>=0){
            errIndex = 1;
        }
        if(err.message.indexOf("exceeds")>=0){
            errIndex = 2;
        }
    }
    assert.notEqual(errIndex, 1, "The spender has not enough allowance");
    assert.notEqual(errIndex, 2, "The transferFrom amount exceeds owner balance");
}

async function showBalance(role, queue, action, address) {
    let decimals = parseInt(await getDecimals());
    let Balance = parseInt(await getBalance(address));
    let turn = "";
    if(queue) {turn = "after"} else {turn = "before"}
    //console.log(`${role} balance ${turn} ${action} - ${Balance/(10**decimals)} GMT`);
    return Balance;
}

async function showAllowance(queue, action, acc1, acc2) {
    let decimals = parseInt(await getDecimals());
    let Allowance = parseInt(await getAllowance(acc1, acc2));
    let turn = "";
    if(queue) {turn = "after"} else {turn = "before"}
    //console.log(`Allowance ${turn} ${action} - ${Allowance/(10**decimals)} GMT`);
    return Allowance;
}