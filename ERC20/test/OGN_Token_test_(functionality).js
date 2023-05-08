let OGN = artifacts.require("Own_Token");

let ogn = null;

contract("OGN Token (functionality)", async(accounts)=>{
    it("mint() works properly from Owner", async()=>{
        ogn = await OGN.deployed();

        let action = "mint";
        let amount = 8*(10**14);
        console.log("------------------------------------------------------");
        console.log(`Minted amount - ${amount/(10**14)} OGN`);
        
        let totalSupplyBefore = await showSupply(false, action);
        let recipientBalanceBefore = await showBalance("Recipient", false, action, accounts[0]);
        await testMintOwner(accounts[0], accounts[0], amount.toString());
        let totalSupplyAfter = await showSupply(true, action);
        let recipientBalanceAfter = await showBalance("Recipient", true, action, accounts[0]);
        console.log("------------------------------------------------------");
        
        assert.equal(totalSupplyAfter, totalSupplyBefore+amount, "Total Supply was not increased correctly");
        assert.equal(recipientBalanceAfter, recipientBalanceBefore+amount, "Tokens were not minted to the recipient correctly");
    });

    it("mint() does not work not from Owner", async()=>{
        ogn = await OGN.deployed();

        let action = "mint";
        let amount = 111*(10**14);
        console.log("------------------------------------------------------");
        console.log(`Minted amount - ${amount/(10**14)} OGN`);
        
        let totalSupplyBefore = await showSupply(false, action);
        let recipientBalanceBefore = await showBalance("Recipient", false, action, accounts[1]);
        await testMintNOTOwner(accounts[1], accounts[1], amount.toString());
        let totalSupplyAfter = await showSupply(true, action);
        let recipientBalanceAfter = await showBalance("Recipient", true, action, accounts[1]);
        console.log("------------------------------------------------------");
        
        assert.equal(totalSupplyAfter, totalSupplyBefore, "Total Supply should not be increased");
        assert.equal(recipientBalanceAfter, recipientBalanceBefore, "Tokens should not be minted");
    });

    it("mint() does not work in case of minting over Maximum possible supply", async()=>{
        ogn = await OGN.deployed();

        let action = "mint";
        let amount = parseInt("930000100000000000000");
        console.log("------------------------------------------------------");
        console.log(`Minted amount - ${amount/(10**14)} OGN`);
        
        let totalSupplyBefore = await showSupply(false, action);
        let recipientBalanceBefore = await showBalance("Recipient", false, action, accounts[0]);
        await testMintOverCap(accounts[0], accounts[0], amount.toString());
        let totalSupplyAfter = await showSupply(true, action);
        let recipientBalanceAfter = await showBalance("Recipient", true, action, accounts[0]);
        console.log("------------------------------------------------------");
        
        assert.equal(totalSupplyAfter, totalSupplyBefore, "Total Supply should not be increased");
        assert.equal(recipientBalanceAfter, recipientBalanceBefore, "Tokens should not be minted");
    });

    it("transfer() works properly", async()=>{
        ogn = await OGN.deployed();

        let action = "transfer";
        let amount = 2*(10**14);
        console.log("------------------------------------------------------");
        console.log(`Transferred amount - ${amount/(10**14)} OGN`);

        let senderBalanceBefore = await showBalance("Sender", false, action, accounts[0]);
        let recipientBalanceBefore = await showBalance("Recipient", false, action, accounts[1]);
        await testTransfer(accounts[1], amount.toString());
        let senderBalanceAfter = await showBalance("Sender", true, action, accounts[0]);
        let recipientBalanceAfter = await showBalance("Recipient", true, action, accounts[1]);
        console.log("------------------------------------------------------");

        assert.equal(senderBalanceAfter, senderBalanceBefore-amount, "The sender's balance was not decreased correctly");
        assert.equal(recipientBalanceAfter, recipientBalanceBefore+amount, "The recipient's balance was not increased correctly");
    });
    
    it("approve() works properly", async()=>{
        ogn = await OGN.deployed();
        
        let action = "approval";
        let amount = 1.5*(10**14);
        console.log("------------------------------------------------------");
        console.log(`Approval amount - ${amount/(10**14)} OGN`);

        let allowanceBefore = await showAllowance(false, action, accounts[0], accounts[1]);
        await testApproval(accounts[1], amount);
        let allowanceAfter = await showAllowance(true, action, accounts[0], accounts[1]);
        console.log("------------------------------------------------------");

        assert.equal(allowanceAfter, allowanceBefore+amount, "The spender's Allowance was not increased correctly");
    });

    it("transferFrom() works properly with Allowance", async()=>{
        ogn = await OGN.deployed();
        
        let action = "TransferFrom";
        let amount = 1.2*(10**14);
        console.log("------------------------------------------------------");
        console.log(`TransferFrom amount - ${amount/(10**14)} OGN`);

        let allowanceBefore = await showAllowance(false, action, accounts[0], accounts[1]);
        let senderBalanceBefore = await showBalance("Sender", false, action, accounts[0]);
        let recipientBalanceBefore = await showBalance("Recipient", false, action, accounts[2]);
        await testTransferFrom_WithAllowance(accounts[1], accounts[0], accounts[2], amount);
        let allowanceAfter = await showAllowance(true, action, accounts[0], accounts[1]);
        let senderBalanceAfter = await showBalance("Sender", true, action, accounts[0]);
        let recipientBalanceAfter = await showBalance("Recipient", true, action, accounts[2]);
        console.log("------------------------------------------------------");

        assert.equal(allowanceAfter, allowanceBefore-amount, "The spender's Allowance was not decreased correctly");
        assert.equal(senderBalanceAfter, senderBalanceBefore-amount, "The owner's balance was not decreased correctly");
        assert.equal(recipientBalanceAfter, recipientBalanceBefore+amount, "The recipient's balance was not increased correctly");
    });

    it("transferFrom() does not work without Allowance", async()=>{
        ogn = await OGN.deployed();
        
        let action = "TransferFrom";
        let amount = 1.1*(10**14);
        console.log("------------------------------------------------------");
        console.log(`TransferFrom amount - ${amount/(10**14)} OGN`);

        let allowanceBefore = await showAllowance(false, action, accounts[0], accounts[1]);
        let senderBalanceBefore = await showBalance("Sender", false, action, accounts[0]);
        let recipientBalanceBefore = await showBalance("Recipient", false, action, accounts[2]);
        await testTransferFrom_WithoutAllowance(accounts[1], accounts[0], accounts[2], amount);
        let allowanceAfter = await showAllowance(true, action, accounts[0], accounts[1]);
        let senderBalanceAfter = await showBalance("Sender", true, action, accounts[0]);
        let recipientBalanceAfter = await showBalance("Recipient", true, action, accounts[2]);
        console.log("------------------------------------------------------");

        assert.equal(allowanceAfter, allowanceBefore, "The spender's Allowance should not be changed");
        assert.equal(senderBalanceAfter, senderBalanceBefore, "The owner's balance should not be changed");
        assert.equal(recipientBalanceAfter, recipientBalanceBefore, "The recipient's balance should not be changed");
    });

    it("burn() works properly", async()=>{
        ogn = await OGN.deployed();

        let action = "burn";
        let amount = 0.5*(10**14);
        console.log("------------------------------------------------------");
        console.log(`Burned amount - ${amount/(10**14)} OGN`);
        
        let totalSupplyBefore = await showSupply(false, action);
        let senderBalanceBefore = await showBalance("Sender", false, action, accounts[0]);
        await testBurn(amount.toString());
        let totalSupplyAfter = await showSupply(true, action);
        let senderBalanceAfter = await showBalance("Sender", true, action, accounts[0]);
        console.log("------------------------------------------------------");
        
        assert.equal(totalSupplyAfter, totalSupplyBefore-amount, "Total Supply was not decreased correctly");
        assert.equal(senderBalanceAfter, senderBalanceBefore-amount, "Tokens were not burned from the sender correctly");
    });
})

async function getSupply() {
    let supply = await ogn.totalSupply();
    return await supply.toString(); 
}
async function getBalance(account) {
    let balance = await ogn.balanceOf(account);
    return await balance.toString();
}
async function getAllowance(owner, spender) {
    let allowance = await ogn.allowance(owner, spender);
    return await allowance.toString();
}

async function testMint(minter, to, amount) {
    let errIndex = 0;
    try{
        await ogn.mint(to, amount, {from: minter});
    }catch(err) {
        console.log(err.message);
        if(err.message.indexOf("not the owner")>=0){
            errIndex = 1;
        }
        if(err.message.indexOf("cap exceeded")>=0){
            errIndex = 2;
        }
        if(err.message.indexOf("to the zero")>=0){
            errIndex = 3;
        }
    }
    return errIndex;
}

async function testMintOwner(minter, to, amount) {
    let errIndex = await testMint(minter, to, amount);
    assert.notEqual(errIndex, 1, "The mint() caller is not the owner of the contract");
    assert.notEqual(errIndex, 2, "The maximum possible total supply is exceeded in case of mint");
    assert.notEqual(errIndex, 3, "The mint can't be made to the zero address");
}

async function testMintNOTOwner(minter, to, amount) {
    let errIndex = await testMint(minter, to, amount);
    assert.equal(errIndex, 1, "The mint() caller should be only the owner of the contract");
    assert.notEqual(errIndex, 2, "The maximum possible total supply is exceeded in case of mint");
    assert.notEqual(errIndex, 3, "The mint can't be made to the zero address");
}

async function testMintOverCap(minter, to, amount) {
    let errIndex = await testMint(minter, to, amount);
    assert.notEqual(errIndex, 1, "The mint() caller should be only the owner of the contract");
    assert.equal(errIndex, 2, "The maximum possible total supply is exceeded in case of mint");
    assert.notEqual(errIndex, 3, "The mint can't be made to the zero address");
}

async function testBurn(amount) {
    let errIndex = 0;
    try{
        await ogn.burn(amount);
    }catch(err) {
        console.log(err.message);
        if(err.message.indexOf("from the zero")>=0){
            errIndex = 1;
        }
        if(err.message.indexOf("exceeds")>=0){
            errIndex = 2;
        }
    }
    assert.notEqual(errIndex, 1, "The burn can't be made from the zero address");
    assert.notEqual(errIndex, 2, "The sender has not the enough balance");
}

async function testTransfer(to, amount) {
    let errIndex = 0;
    try{
        await ogn.transfer(to, amount);
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
    assert.notEqual(errIndex, 3, "The sender has not the enough balance");
}

async function testApproval(to, amount) {
    let errIndex = 0;
    try{
        await ogn.approve(to, amount);
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
        await ogn.transferFrom(from, to, amount, {from: spender});
    }catch(err) {
        console.log(`The transaction reverted with the next error: ${err.message}`);
        if(err.message.indexOf("insufficient allowance")>=0 || err.message.indexOf("underflow")>=0){
            errIndex = 1;
        }
        if(err.message.indexOf("exceeds")>=0){
            errIndex = 2;
        }
    }
    
    return errIndex;
}

async function testTransferFrom_WithAllowance(spender, from, to, amount) {
    let errIndex = await testTransferFrom(spender, from, to, amount);

    assert.notEqual(errIndex, 1, "The spender has not the sufficient allowance to perfom the transferFrom");
    assert.notEqual(errIndex, 2, "The owner has not the enough balance for spender to perfom the transferFrom");
}

async function testTransferFrom_WithoutAllowance(spender, from, to, amount) {
    let errIndex = await testTransferFrom(spender, from, to, amount);
    
    assert.equal(errIndex, 1, "The spender should not be able to perfom the transferFrom without the sufficient allowance");
    assert.notEqual(errIndex, 2, "The owner has not the enough balance for spender to perfom the transferFrom");
}

async function showSupply(queue, action) {
    let totalSupply = parseInt(await getSupply());
    let turn = "";
    if(queue) {turn = "after"} else {turn = "before"}
    console.log(`Total Supply ${turn} ${action} - ${totalSupply/(10**14)} OGN`);
    return totalSupply;
}

async function showBalance(role, queue, action, address) {
    let Balance = parseInt(await getBalance(address));
    let turn = "";
    if(queue) {turn = "after"} else {turn = "before"}
    console.log(`${role} balance ${turn} ${action} - ${Balance/(10**14)} OGN`);
    return Balance;
}

async function showAllowance(queue, action, acc1, acc2) {
    let Allowance = parseInt(await getAllowance(acc1, acc2));
    let turn = "";
    if(queue) {turn = "after"} else {turn = "before"}
    console.log(`Allowance ${turn} ${action} - ${Allowance/(10**14)} OGN`);
    return Allowance;
}