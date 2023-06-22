let REMINDER = artifacts.require("Reminder");

let reminder = null;

contract("Reminder App", async(accounts)=>{

    beforeEach(async () => {
        reminder = await REMINDER.new();
    });

    let message = "Test Record #";
    let year = 2023;
    let month = 5;
    let day = 9;

    it("Contract has the correct Owner", async()=>{
        let owner = accounts[0];
        let result = await reminder.getOwner();
        assert.equal(result, owner, "The returned address isn't the correct contract owner");
    });

    it("addRecord() works properly", async () => {
        await reminder.addRecord(message, year, month, day);
        let records = await reminder.getRecords();

        assert.equal(records[0].message, message, "Record was not added correctly. Message is not correct");
        assert.equal(records[0].year, year, "Record was not added correctly. Year is not correct");
        assert.equal(records[0].month, month, "Record was not added correctly. Month is not correct");
        assert.equal(records[0].day, day, "Record was not added correctly. Day is not correct");
    });

    it("getRecord() works properly", async () => {
        await reminder.addRecord(message, year, month, day);
        let record = await reminder.getRecord(0);

        assert.equal(record.message, message, "Message was not returned correctly");
        assert.equal(record.year, year, "Year was not returned correctly");
        assert.equal(record.month, month, "Month was not returned correctly");
        assert.equal(record.day, day, "Day was not returned correctly");
    });

    it("Modifier OnlyOwner() works properly", async () => {
        try {
            await reminder.addRecord(message, year, month, day, { from: accounts[1] });
            assert.fail("The transaction should have thrown an error. Signer is not the contract Owner");
        } catch (error) {
            assert.include(error.message, "Signer should be the owner of the contract", "The error message is not correct, it should include 'Signer should be the owner of the contract'");
        }
    });

    it("nextIndex works properly", async () => {
        let queue = 1;

        await reminder.addRecord(message+queue, year, month, day);
        queue++;
        assert.equal(await getNextIndex(), 1, "nextIndex is not correct after 1 record");

        while(queue<14) {
            await reminder.addRecord(message+queue, year, month, day);
            queue++;
        }
        assert.equal(await getNextIndex(), 3, "nextIndex is not correct after 13 records");
    });

    it("totalRecordsAdded works properly", async () => {
        let queue = 1;

        await reminder.addRecord(message+queue, year, month, day);
        queue++;
        assert.equal(await getTotalRecordsAdded(), 1, "totalRecordsAdded is not correct after 1 record");

        while(queue<14) {
            await reminder.addRecord(message+queue, year, month, day);
            queue++;
        }
        assert.equal(await getTotalRecordsAdded(), 13, "totalRecordsAdded is not correct after 13 records");
    });

    it("Events work properly", async () => {
        let queue = 1;

        let tx = await reminder.addRecord(message+queue, year, month, day);
        queue++;
        assert.equal(tx.logs.length, 1, "There should be 1 event emitted after 1st record");

        while(queue<10) {
            await reminder.addRecord(message+queue, year, month, day);
            queue++;
        }        
        tx = await reminder.addRecord(message+queue, year, month, day);
        assert.equal(tx.logs.length, 2, "There should be 2 events emitted after 10th record");
    });

    it("FIFO works properly", async () => {
        let queue = 1;

        while(queue<13) {
            await reminder.addRecord(message+queue, year, month, day);
            queue++;
        }

        assert.equal((await reminder.getRecord(0)).message, "Test Record #3", "The oldest record should be record #3");
        assert.equal((await reminder.getRecord(9)).message, "Test Record #12", "The newest record should be record #12");
    });
})

async function getNextIndex() {
    let result = await reminder.getNextIndex();
    return await result.toString();
}
async function getTotalRecordsAdded() {
    let result = await reminder.getTotalRecordsAdded();
    return await result.toString();
}
