// SPDX-License-Identifier: MIT.

pragma solidity ^0.8.17;

library StringCompare{
    function compare(string memory str1, string memory str2) public pure returns (bool) {   
        return keccak256(abi.encodePacked(str1)) == keccak256(abi.encodePacked(str2));
    }
}

interface iAnimal{
    function getIfMeatEater() view external returns(bool);
    function eat(string memory) pure external returns(string memory);
    function speak() pure external returns(string memory);
    function sleep() pure external returns(string memory);
}

abstract contract HasName{
    string _name;

    constructor(string memory name){
        _name = name;
    }

    function getName() view public returns(string memory){
        return _name;
    }
}

abstract contract Animal is iAnimal{   
    bool ifMeatEater = false;
    function getIfMeatEater() view public returns(bool){
        return ifMeatEater;
    }
    function changeIfMeatEater() virtual internal{
        ifMeatEater = true;
    }

    function eat(string memory) pure virtual public returns(string memory){
        return "Nom-Nom";
    }
    function speak() pure virtual public returns(string memory){
        return "...";
    }
    function sleep() pure public returns(string memory){
        return "z-z-z-z";
    }
}

abstract contract Herbivore is Animal{
    string constant private FOOD = "plant";

    function eat(string memory food) pure onlyPlant(food) override public returns(string memory){
        return super.eat(food);
    }

    modifier onlyPlant(string memory food) {
        require(StringCompare.compare(food, FOOD), "It can't eat this.");
        _;
    }
}

abstract contract meatEater is Animal{
    string constant private FOOD = "meat";

    function eat(string memory food) pure onlyMeat(food) override public returns(string memory){
        return super.eat(food);
    }

    modifier onlyMeat(string memory food) {
        require(StringCompare.compare(food, FOOD), "It can't eat this");
        _;
    }
}

abstract contract Omnivore is Animal{
    string constant private FOOD1 = "plant";
    string constant private FOOD2 = "meat";
    //string constant private BADFOOD = "chocolate";

    function eat(string memory food) pure plantOrMeat(food) override public returns(string memory){
        return super.eat(food);
    }

    modifier plantOrMeat(string memory food) {
        require(StringCompare.compare(food, FOOD1) || StringCompare.compare(food, FOOD2), "It can't eat this");
        /*require(StringCompare.compare(food, FOOD1)&&!StringCompare.compare(food, BADFOOD) 
            || StringCompare.compare(food, FOOD2)&&!StringCompare.compare(food, BADFOOD), "It can't eat this");*/
        _;
    }
}

contract Cow is Herbivore, HasName{
    constructor(string memory name) HasName(name){
    }

    function speak() pure override public returns(string memory){
        return "Mooo";
    }
}
contract Horse is Herbivore, HasName{
    constructor(string memory name) HasName(name){
    }

    function speak() pure override public returns(string memory){
        return "Igogo";
    }
}

contract Wolf is meatEater{
    constructor(){
        super.changeIfMeatEater();
    }

    function speak() pure override public returns(string memory){
        return "Awoo";
    }
}

contract Dog is Omnivore, HasName{
    constructor(string memory name) HasName(name){
    }

    function speak() pure override public returns(string memory){
        return "Woof";
    }
}