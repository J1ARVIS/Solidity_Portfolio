let GMT = artifacts.require("GameToken");

let gmt = null;

contract("Game Token (creation)", async(accounts)=>{

    beforeEach(async () => {
        gmt = await GMT.new("Game Token", "GMT");
    });

    it("Token has the correct name", async()=>{
        let name = "Game Token";
        let result = await gmt.name();
        assert.equal(result, name, "The returned token's name is not the correct one");
    });

    it("Token has the correct symbol", async()=>{
        let ticker = "GMT";
        let result = await gmt.symbol();
        assert.equal(result, ticker, "The returned token's symbol is not the correct one");
    });

    it("Token has correct decimals", async()=>{
        let decimals = "9";
        let result = await getDecimals();
        assert.equal(result, decimals, "The returned token's decimals value is not correct");
    });

    it("Token has correct initial Total Supply", async()=>{
        let supply = "0";
        let result  = await getSupply();
        assert.equal(result, supply, "The returned initial Total Supply value is not correct");
    });

    it("Token has the correct owner", async()=>{
        let owner = accounts[0].toString();
        let result = await getOwner();
        assert.equal(result, owner, "The returned address is not the correct owner of the contract");
    });
})

async function getDecimals() {
    let decimals = await gmt.decimals();
    return await decimals.toString(); 
}
async function getSupply() {
    let supply = await gmt.totalSupply();
    return await supply.toString(); 
}
async function getOwner() {
    let owner = await gmt.getOwner();
    return await owner.toString();
}
