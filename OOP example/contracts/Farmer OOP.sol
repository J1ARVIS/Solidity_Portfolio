// SPDX-License-Identifier: MIT.

pragma solidity ^0.8.17;

interface iAnimal{
    function getIfMeatEater() view external returns(bool);
    function eat(string memory) pure external returns(string memory);
    function speak() pure external returns(string memory);
    function sleep() pure external returns(string memory);
}

contract Farmer{
    
    function feed(address animal, string memory food) view onlyDomestic(animal) public returns(string memory){
        return iAnimal(animal).eat(food);
    }

    function call(address animal) view onlyDomestic(animal) public returns(string memory){
        return iAnimal(animal).speak();
    }

    function close(address animal) view onlyDomestic(animal) public returns(string memory){
        return iAnimal(animal).sleep();
    }

    function fight(address animal) view public returns(string memory){
        require(iAnimal(animal).getIfMeatEater(), "It is necessary to fight only against predators.");
        return "It's my farm!";
    }

    modifier onlyDomestic(address animal) {
        require(!iAnimal(animal).getIfMeatEater(), "You may manage only domestic animals.");
        _;
    }
}