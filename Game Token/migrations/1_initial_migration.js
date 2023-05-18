let GMT = artifacts.require("GameToken");

let gmt = null;
module.exports = async(deployer)=>{
    console.log("-------------------------------------");
    try{
        gmt = await GMT.deployed();
        console.log("Game Token contract address - " + gmt.address);
    }catch (err) {
        //console.log(err);
        await deployer.deploy(GMT, "Game Token", "GMT");
        gmt = await GMT.deployed();
        console.log("Game Token contract address - " + gmt.address);
    }
    console.log("-------------------------------------");
}

// deployed to Sepolia
//  contract address - 0x9044F3dcBd57b062c4eD531b19c437fcda0ff091