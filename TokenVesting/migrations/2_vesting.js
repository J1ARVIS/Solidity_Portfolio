let Vesting = artifacts.require("TokenVesting");
let OGN = artifacts.require("Own_Token");

let ogn = null;
let vesting = null;
module.exports = async(deployer)=>{
    ogn = await OGN.deployed();
    console.log("-------------------------------------");
    try{
        vesting = await Vesting.deployed();
        console.log("TokenVesting contract address - " + vesting.address);
    }catch (err) {
        //console.log(err.message);
        await deployer.deploy(Vesting, ogn.address, await getAccount(1), getTimestampInSeconds()+300, twoMonthsToSeconds(23), 23);
        vesting = await Vesting.deployed();
        await ogn.mint(vesting.address, (parseInt(await getCap())*0.04).toString());
        console.log("TokenVesting contract address - " + vesting.address);
        console.log("Token Vesting will start in 5 minutes.");
    }
    console.log("-------------------------------------");
}

async function getAccount(index) {
    return (await web3.eth.getAccounts())[index];
}
function getTimestampInSeconds() {
    return Math.floor(Date.now() / 1000)
}
function twoMonthsToSeconds(twoMonths) {
    return twoMonths*5270400;
}
async function getCap() {
    let cap = await ogn.cap();
    return await cap.toString(); 
}