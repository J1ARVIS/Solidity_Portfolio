let OGN = artifacts.require("Own_Token");

let ogn = null;

contract("OGN Token (view)", async(accounts)=>{
    it("Token has the correct name", async()=>{
        ogn = await OGN.deployed();
        let name = "OGN Token";
        let result = await getName();
        assert.equal(result, name, "The returned name isn't the correct one");
    });
    it("Token has the correct symbol", async()=>{
        ogn = await OGN.deployed();
        let ticker = "OGN";
        let result = await getSymbol();
        assert.equal(result, ticker, "The returned symbol isn't the correct one");
    });
    it("Token's decimals are correct", async()=>{
        ogn = await OGN.deployed();
        let decimals = "14";
        let result = await getDecimals();
        assert.equal(result, decimals, "The returned decimals value isn't correct");
    });
    it("Token has the correct initial Total Supply", async()=>{
        ogn = await OGN.deployed();
        let supply = "0";
        let result = await getSupply();
        assert.equal(result, supply, "The returned initial Total Supply value isn't correct");
    });
    it("Token has the correct owner", async()=>{
        ogn = await OGN.deployed();
        let owner = accounts[0].toString();
        let result = await getOwner();
        assert.equal(result, owner, "The returned address isn't the owner of the contract");
    });
    it("Token has the correct maximum possible supply", async()=>{
        ogn = await OGN.deployed();
        let cap = "930000000000000000000";
        let result = await getCap();
        assert.equal(result, cap, "The returned maximum possible supply value isn't correct");
    });
})

async function getName() {
    return await ogn.name(); 
}
async function getSymbol() {
    return await ogn.symbol(); 
}
async function getDecimals() {
    let decimals = await ogn.decimals();
    return await decimals.toString(); 
}
async function getSupply() {
    let supply = await ogn.totalSupply();
    return await supply.toString(); 
}
async function getOwner() {
    let owner = await ogn.owner();
    return await owner.toString();
}
async function getCap() {
    let cap = await ogn.cap();
    return await cap.toString(); 
}