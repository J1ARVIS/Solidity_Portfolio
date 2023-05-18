let GMT = artifacts.require("GameToken");

let gmt = null;

contract("Game Token (Game Goods functionality)", async(accounts)=>{

    beforeEach(async () => {
        gmt = await GMT.new("Game Token", "GMT");
    });

    it("addNewGoods() works properly", async () => {
        let decimals = parseInt(await getDecimals());
        let name = "bronze sword";
        let inStockAmount = 5000;
        let costPerItem = 25 * 10 ** decimals;

        await gmt.addNewGoods(name, costPerItem, inStockAmount);
        let goods = await gmt.getAllGoods();

        assert.equal(goods[0].name, name, "Goods name was not added correctly");
        assert.equal(goods[0].costPerItem, costPerItem, "Goods cost per item was not added correctly");
        assert.equal(goods[0].inStockAmount, inStockAmount, "Goods in-stock amount was not added correctly");
    });

    it("getExactGoods() works properly", async () => {
        let decimals = parseInt(await getDecimals());
        let name = "bronze sword";
        let inStockAmount = 5000;
        let costPerItem = 25 * 10 ** decimals;
        
        await gmt.addNewGoods(name, costPerItem, inStockAmount);
        let item = await gmt.getExactGoods(0);

        assert.equal(item.name, name, "Goods name was not returned correctly");
        assert.equal(item.costPerItem, costPerItem, "Goods cost-per-item was not returned correctly");
        assert.equal(item.inStockAmount, inStockAmount, "Goods in-stock amount was not returned correctly");
    });    

    it("getExactGoods() throws 'Invalid goods index' properly", async () => {
        let item = null;
        try{
            item = await gmt.getExactGoods(0);
            assert.fail("The transaction should have thrown an error. Invalid goods index");
        }catch(error) {
            assert.include(error.message, "Invalid goods index", "Wrong error, should include 'Invalid goods index'");
        }
        assert.equal(item, null, "getExactGoods() should not return anything");
    });

    it("changeGoodsAmount() works properly", async () => {
        let decimals = parseInt(await getDecimals());
        let name = "bronze sword";
        let inStockAmount = 5000;
        let costPerItem = 25 * 10 ** decimals;
        let newInStockAmount = 2000;

        await gmt.addNewGoods(name, costPerItem, inStockAmount);
        await gmt.changeGoodsAmount(0, newInStockAmount);
        let item = await gmt.getExactGoods(0);

        assert.equal(item.inStockAmount, newInStockAmount, "Goods in-stock amount was not changed correctly");
    });

    it("changeGoodsPrice() works properly", async () => {
        let decimals = parseInt(await getDecimals());
        let name = "bronze sword";
        let inStockAmount = 5000;
        let costPerItem = 25 * 10 ** decimals;
        let newCostPerItem = 55 * 10 ** decimals;

        await gmt.addNewGoods(name, costPerItem, inStockAmount);
        await gmt.changeGoodsPrice(0, newCostPerItem);
        let item = await gmt.getExactGoods(0);

        assert.equal(item.costPerItem, newCostPerItem, "Goods cost-per-item was not changed correctly");
    });

    it("buyGoods() works properly", async () => {
        let decimals = parseInt(await getDecimals());
        let name = "bronze sword";
        let inStockAmount = 5000;
        let costPerItem = 25 * 10 ** decimals;
        let mintAmount = 70 * 10 ** decimals;

        await gmt.addNewGoods(name, costPerItem, inStockAmount);
        await mint(accounts[0], mintAmount);

        let ownedQuantityBefore = parseInt(await getOwnedQuantity(0, accounts[0]));
        let balanceBefore = parseInt(await getBalance(accounts[0]));
        await gmt.buyGoods(0, 2);
        let ownedQuantityAfter = parseInt(await getOwnedQuantity(0, accounts[0]));
        let balanceAfter = parseInt(await getBalance(accounts[0]));
        let item = await gmt.getExactGoods(0);

        assert.equal(balanceAfter, balanceBefore-costPerItem*2, "Buyer's balance was not decreased correctly");
        assert.equal(item.inStockAmount, inStockAmount-2, "Goods in-stock amount was not decreased correctly");
        assert.equal(ownedQuantityAfter, ownedQuantityBefore+2, "Buyer's owned quantity was not increased correctly");
    });

    it("buyGoods() throws 'Insufficient goods amount' properly", async () => {
        let decimals = parseInt(await getDecimals());
        let name = "bronze sword";
        let inStockAmount = 1;
        let costPerItem = 25 * 10 ** decimals;
        let mintAmount = 70 * 10 ** decimals;

        await gmt.addNewGoods(name, costPerItem, inStockAmount);
        await mint(accounts[0], mintAmount);

        let ownedQuantityBefore = parseInt(await getOwnedQuantity(0, accounts[0]));
        let balanceBefore = parseInt(await getBalance(accounts[0]));
        try{
            await gmt.buyGoods(0, 2);
            assert.fail("The transaction should have thrown an error. Insufficient goods amount");
        }catch(error) {
            assert.include(error.message, "Insufficient goods amount", "Wrong error, should include 'Insufficient goods amount'");
        }
        let ownedQuantityAfter = parseInt(await getOwnedQuantity(0, accounts[0]));
        let balanceAfter = parseInt(await getBalance(accounts[0]));
        let item = await gmt.getExactGoods(0);

        assert.equal(balanceAfter, balanceBefore, "Buyer's balance should not change");
        assert.equal(item.inStockAmount, inStockAmount, "Goods in-stock amount should not change");
        assert.equal(ownedQuantityAfter, ownedQuantityBefore, "Buyer's owned quantity should not change");
    });

    it("buyGoods() throws 'Insufficient balance' properly", async () => {
        let decimals = parseInt(await getDecimals());
        let name = "bronze sword";
        let inStockAmount = 5000;
        let costPerItem = 25 * 10 ** decimals;
        let mintAmount = 40 * 10 ** decimals;

        await gmt.addNewGoods(name, costPerItem, inStockAmount);
        await mint(accounts[0], mintAmount);

        let ownedQuantityBefore = parseInt(await getOwnedQuantity(0, accounts[0]));
        let balanceBefore = parseInt(await getBalance(accounts[0]));
        try{
            await gmt.buyGoods(0, 2);
            assert.fail("The transaction should have thrown an error. Insufficient balance");
        }catch(error) {
            assert.include(error.message, "Insufficient balance", "Wrong error, should include 'Insufficient balance'");
        }
        let ownedQuantityAfter = parseInt(await getOwnedQuantity(0, accounts[0]));
        let balanceAfter = parseInt(await getBalance(accounts[0]));
        let item = await gmt.getExactGoods(0);

        assert.equal(balanceAfter, balanceBefore, "Buyer's balance should not change");
        assert.equal(item.inStockAmount, inStockAmount, "Goods in-stock amount should not change");
        assert.equal(ownedQuantityAfter, ownedQuantityBefore, "Buyer's owned quantity should not change");
    });

    it("spendGoods() works properly", async () => {
        let decimals = parseInt(await getDecimals());
        let name = "bronze sword";
        let inStockAmount = 5000;
        let costPerItem = 25 * 10 ** decimals;
        let mintAmount = 300 * 10 ** decimals;

        await gmt.addNewGoods(name, costPerItem, inStockAmount);
        await mint(accounts[0], mintAmount);
        await gmt.buyGoods(0, 10);

        let ownedQuantityBefore = parseInt(await getOwnedQuantity(0, accounts[0]));
        await gmt.spendGoods(0, 6);
        let ownedQuantityAfter = parseInt(await getOwnedQuantity(0, accounts[0]));
        
        assert.equal(ownedQuantityAfter, ownedQuantityBefore-6, "Owned quantity was not decreased correctly");
    });

    it("spendGoods() throws 'Insufficient goods owned' properly", async () => {
        let decimals = parseInt(await getDecimals());
        let name = "bronze sword";
        let inStockAmount = 5000;
        let costPerItem = 25 * 10 ** decimals;
        let mintAmount = 300 * 10 ** decimals;

        await gmt.addNewGoods(name, costPerItem, inStockAmount);
        await mint(accounts[0], mintAmount);
        await gmt.buyGoods(0, 2);

        let ownedQuantityBefore = parseInt(await getOwnedQuantity(0, accounts[0]));
        try{
            await gmt.spendGoods(0, 6);
            assert.fail("The transaction should have thrown an error. Insufficient goods owned");
        }catch(error) {
            assert.include(error.message, "Insufficient goods owned", "Wrong error, should include 'Insufficient goods owned'");
        }
        
        let ownedQuantityAfter = parseInt(await getOwnedQuantity(0, accounts[0]));
        
        assert.equal(ownedQuantityAfter, ownedQuantityBefore, "Owned quantity should not change");
    });

    it("transferGoods() works properly", async () => {
        let decimals = parseInt(await getDecimals());
        let name = "bronze sword";
        let inStockAmount = 5000;
        let costPerItem = 25 * 10 ** decimals;
        let mintAmount = 300 * 10 ** decimals;

        await gmt.addNewGoods(name, costPerItem, inStockAmount);
        await mint(accounts[0], mintAmount);
        await gmt.buyGoods(0, 10);

        let senderQuantityBefore = parseInt(await getOwnedQuantity(0, accounts[0]));
        let recipientQuantityBefore = parseInt(await getOwnedQuantity(0, accounts[1]));
        await gmt.transferGoods(accounts[1], 0, 6);
        let senderQuantityAfter = parseInt(await getOwnedQuantity(0, accounts[0]));
        let recipientQuantityAfter = parseInt(await getOwnedQuantity(0, accounts[1]));
        
        assert.equal(senderQuantityAfter, senderQuantityBefore-6, "Sender's Owned quantity was not decreased correctly");
        assert.equal(recipientQuantityAfter, recipientQuantityBefore+6, "Recipient's Owned quantity was not increased correctly");
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
async function getOwnedQuantity(index, goodsOwner) {
    let ownedQuantity = await gmt.getOwnedQuantity(index, goodsOwner);
    return await ownedQuantity.toString();
}
async function mint(to, amount) {
    let decimals = parseInt(await getDecimals());
    await gmt.addRewards(to, amount);
    await gmt.claimRewards({ from: to });
    let balance = parseInt(await getBalance(to));
    //console.log("------------------------------------------------------");
    //console.log(`Minted amount - ${balance/10**decimals} GMT`);
}
