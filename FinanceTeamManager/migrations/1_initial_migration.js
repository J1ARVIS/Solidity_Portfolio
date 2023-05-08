let TeamDB = artifacts.require("TeamDB");

let teamDB = null;
module.exports = async(deployer)=>{
    try{
        teamDB = await TeamDB.deployed();
        console.log("Contract address - " + teamDB.address);
    }catch (err) {
        //console.log(err);
        await deployer.deploy(TeamDB);
        teamDB = await TeamDB.deployed();
        console.log("Contract address - " + teamDB.address);
    }
    console.log("-------------------------------------");
    try{
        let teammate = await getTeammate(0)
        //console.log(teammate);
    }catch(err) {
        if(err.message.indexOf("revert")>=0) {
            console.log("No teammates yet.");
            let result = await addTeammate((await web3.eth.getAccounts())[1], "Steve", "1000000000000000000", "2001", "12", "20");
            //console.log(result);
            console.log("New Teammate added");
            console.log("-------------------------------------");
            let teammate = await getTeammate(0)
            //console.log(teammate);
            console.log("-------------------------------------");
        }
    }
    
    
    /*console.log(await getTeammate(0));
    console.log("-------------------------------------");
    console.log(await addTeammate((await web3.eth.getAccounts())[2], "Steve", "1500000000000000000", "2000", "12", "15"));
    console.log("-------------------------------------");
    console.log(await getTeammate(1));
    console.log("-------------------------------------");
    console.log(await deposit((web3.utils.toWei("0.1", "ether")).toString()));
    console.log("-------------------------------------");
    console.log("Balance of the contract - " +  web3.utils.fromWei(await getBalance(teamDB.address), "ether") + " ETH");
    //process.exit();
    console.log("-------------------------------------");
    if(await checkBirthday(0)) {
        console.log("Happy birthday to Teammate #1!");
        console.log(await sendBirthdayBonus());
        console.log("Balance of Teammate #1 - " +  web3.utils.fromWei(await getBalance((await web3.eth.getAccounts())[1]), "ether") + " ETH");      
    } else {console.log("Teammate #1 doesn't have birthday today.");}
    console.log("-------------------------------------");
    if(await checkBirthday(1)) {
        console.log("Happy birthday to Teammate #2!");
        console.log(await sendBirthdayBonus());
        console.log("Balance of Teammate #2 - " +  web3.utils.fromWei(await getBalance((await web3.eth.getAccounts())[2]), "ether") + " ETH");
    } else {console.log("Teammate #2 doesn't have birthday today.");}*/
}

async function getTeammate(index){
    return await teamDB.getTeammate(index);
}
async function addTeammate(address, name, salary, year, month, day){
    return await teamDB.addTeammate(address, name, salary, year, month, day);
}
/*async function checkBirthday(index){
    return await teamDB.checkBirthday(index);
}
async function deposit(amount) {
    return await teamDB.deposit({value: amount});
}
async function sendBirthdayBonus() {
    return await teamDB.sendBirthdayBonus();
}
async function getBalance(address) {
    return await web3.eth.getBalance(address);
}*/