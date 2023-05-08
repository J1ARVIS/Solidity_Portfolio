let TeamDB = artifacts.require("TeamDB");

let teamDB = null;

contract("TeamDB", async(account)=>{
    it("getTeammate() correctly returns Teammate by index", async()=>{
        teamDB = await TeamDB.deployed();
        let index = 0;
        let teammate = await testGetTeammate(index);
        assert.notEqual(teammate, false, "Teammate doesn't exist");
    });

    it("addTeammate() correctly adds Teammate to DB", async()=>{
        teamDB = await TeamDB.deployed();
        let index = await getTeammatesAmount();
        //console.log("\tTeammates amount - " + index);
        let account = (await web3.eth.getAccounts())[2];
        let name = "Scarlett";
        let salary = "1000000000000000000"
        let year = "2002";
        let month = "2";
        let day = "1";
        let birthday = "1012521600";
        try{
            let result = await addTeammate(account, name, salary, year, month, day);
            //console.log(result);
        }catch(err){
            console.log(err.message);
        }
        console.log("-------------------------------------");
        let teammate = await testGetTeammate(index);
        assert.notEqual(teammate, false, "Teammate wasn't added");
        assert.equal(teammate["account"], account, "the wrong teammate's address was added");
        assert.equal(teammate["name"], name, "the wrong teammate's name was added");
        assert.equal(teammate["salary"], salary, "the wrong teammate's salary was added");
        assert.equal(teammate["birthday"], birthday, "the wrong teammate's birthday was added");
    });
})

async function getTeammate(index){
    return await teamDB.getTeammate(index);
}
async function addTeammate(address, name, salary, year, month, day){
    return await teamDB.addTeammate(address, name, salary, year, month, day);
}
async function getTeammatesAmount() {
    let index = 0;
    let found = false;
    while(found == false){
        try{
            await getTeammate(index);
            index++;
        }catch(err){
            found = true;
        }
    }
    return index;
}
async function testGetTeammate(index) {
    let teammate = false;
    try{
        teammate = await getTeammate(index);
        //console.log(teammate);
    }catch(err){
        console.log(err.message);
    }
    return teammate;
}