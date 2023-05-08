let Horse = artifacts.require("Horse");
let Dog = artifacts.require("Dog");
let Farmer = artifacts.require("Farmer");

let horse = null;
let dog = null;
let farmer = null;

contract("Horse and Farmer", async(account)=>{
    it("Horse has the correct name", async()=>{
        horse = await Horse.deployed();
        let result = await getName(horse);
        let name = "Spirit";
        assert.equal(result, name, "The returned name isn't the correct one");
    });
    it("Horse can sleep", async()=>{
        horse = await Horse.deployed();
        let result = await sleep(horse);
        assert.equal(result, "z-z-z-z", "The horse didn't fall asleep");
    });
    it("Horse can eat “plant”", async()=>{
        horse = await Horse.deployed();
        await testGoodEat(horse, "plant");
    });
    it("Horse cannot eat ”meat”, ”not-food”, ”plastic”", async()=>{
        horse = await Horse.deployed();
        await testBadEat(horse, "meat");
        await testBadEat(horse, "not-food");
        await testBadEat(horse, "plastic");
    });
    it("Farmer can call Horse, Horse responds correctly", async()=>{
        horse = await Horse.deployed();
        farmer = await Farmer.deployed();
        let result = await testCall(horse);
        assert.equal(result, "Igogo", "It isn't a horse");
    });
    it("Farmer can feed Horse with plant", async()=>{
        horse = await Horse.deployed();
        farmer = await Farmer.deployed();
        await testGoodFeed(horse, "plant");
    });
    it("Farmer cannot feed Horse with anything else", async()=>{
        horse = await Horse.deployed();
        farmer = await Farmer.deployed();
        await testBadFeed(horse, "meat");
        await testBadFeed(horse, "fingers");
        await testBadFeed(horse, "plastic");
    });
})

contract("Dog and Farmer", async(account)=>{
    it("Dog has the correct name", async()=>{
        dog = await Dog.deployed();
        let result = await getName(dog);
        let name = "Charlie";
        assert.equal(result, name, "The returned name isn't the correct one");
    });
    it("Dog can sleep", async()=>{
        dog = await Dog.deployed();
        let result = await sleep(dog);
        assert.equal(result, "z-z-z-z", "The dog didn't fall asleep");
    });
    it("Dog can eat “plant”", async()=>{
        dog = await Dog.deployed();
        await testGoodEat(dog, "plant");
    });
    it("Dog can eat ”meat”", async()=>{
        dog = await Dog.deployed();
        await testGoodEat(dog, "meat");
    });
    it("Dog cannot eat ”not-food”, ”plastic”, ”chocolate”", async()=>{
        dog = await Dog.deployed();
        await testBadEat(dog, "chocolate");
        await testBadEat(dog, "not-food");
        await testBadEat(dog, "plastic");
    });
    it("Farmer can call Dog, Dog responds correctly", async()=>{
        dog = await Dog.deployed();
        farmer = await Farmer.deployed();
        let result = await testCall(dog);
        assert.equal(result, "Woof", "It isn't a dog");
    });
    it("Farmer can feed Dog with ”meat”,”plant”", async()=>{
        dog = await Dog.deployed();
        farmer = await Farmer.deployed();
        await testGoodFeed(dog, "plant");
        await testGoodFeed(dog, "meat");
    });
    it("Farmer cannot feed Dog with ”not-food”, ”plastic” and anything else", async()=>{
        dog = await Dog.deployed();
        farmer = await Farmer.deployed();
        await testBadFeed(dog, "not-food");
        await testBadFeed(dog, "chocolate");
        await testBadFeed(dog, "plastic");
    });
})

async function getName(animal) {
    return await animal.getName();
}
async function sleep(animal) {
    return await animal.sleep();
}
async function testGoodEat(animal, food) {
    let result = "What is this?";
    let name = await getName(animal);
    try{
        result = await animal.eat(food);
    }catch(err){
        console.log(err.message);
    }
    assert.equal(result, "Nom-Nom", `${name} can't eat this`);
}
async function testBadEat(animal, food) {
    let result = "What is this?";
    let name = await getName(animal);
    try{
        result = await animal.eat(food);
    }catch(err){
        //console.log(err.message);
    }
    assert.notEqual(result, "Nom-Nom", `${name} shouldn't eat this`);
}
async function testCall(animal) {
    let result = "predator";
    try{
        result = await farmer.call(animal.address);
    }catch(err){
        console.log(err.message);
    }
    assert.notEqual(result, "predator", "It's a predator and you can't call him");
    return result;
}
async function testGoodFeed(animal, food) {
    let result = "it's a bad food";
    let name = await getName(animal);
    try{
        result = await farmer.feed(animal.address, food);
    }catch(err){
        console.log(err.message);
        if(err.message.indexOf("domestic")>=0) {
            result = "predator";
        }
    }
    assert.notEqual(result, "predator", "It's a predator and you can't feed him");
    assert.equal(result, "Nom-Nom", `You can't feed ${name} with this`);
}
async function testBadFeed(animal, food) {
    let result = "it's a bad food";
    let name = await getName(animal);
    try{
        result = await farmer.feed(animal.address, food);
    }catch(err){
        //console.log(err.message);
        if(err.message.indexOf("domestic")>=0) {
            result = "predator";
        }
    }
    assert.notEqual(result, "predator", "It's a predator and you can't feed him");
    assert.notEqual(result, "Nom-Nom", `${name} shouldn't eat this`);
}