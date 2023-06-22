let REMINDER = artifacts.require("Reminder");

let reminder = null;

module.exports = async(deployer)=>{
    console.log("-------------------------------------");
    try{
        reminder = await REMINDER.deployed();
        console.log("Reminder App contract address - " + reminder.address);
    }catch (err) {
        //console.log(err);
        await deployer.deploy(REMINDER);
        reminder = await REMINDER.deployed();
        console.log("Reminder App contract address - " + reminder.address);
    }
    console.log("-------------------------------------");
}
