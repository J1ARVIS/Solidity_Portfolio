let OGN = artifacts.require("Own_Token");

let ogn = null;
module.exports = async(deployer)=>{
    console.log("-------------------------------------");
    try{
        ogn = await OGN.deployed();
        console.log("OGN Token contract address - " + ogn.address);
    }catch (err) {
        //console.log(err);
        await deployer.deploy(OGN, "OGN Token", "OGN", "9300000");
        ogn = await OGN.deployed();
        console.log("OGN Token contract address - " + ogn.address);
    }
    console.log("-------------------------------------");
}