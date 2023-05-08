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

// deployed to Sepolia
//  contract address - 0xE1de2e2f48B9c39adA6957DAF39E7d75aC9D8371