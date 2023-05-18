// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./ERC20.sol";

contract GameToken is ERC20 {
    address immutable owner;

    struct Goods {
        string name;
        uint256 costPerItem;
        uint256 inStockAmount;
    }
    Goods[] goods;

    mapping(uint256 => mapping(address => uint256)) ownedQuantity;
    mapping(address => uint256) private rewards;

    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {
        owner = _msgSender();
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function decimals() public view virtual override returns (uint8) {
        return 9;
    }

    function getAllGoods() view public returns(Goods[] memory) {
        return goods;
    }

    function getExactGoods(uint256 index) view public returns(Goods memory) {
        require(index < goods.length, "GameToken: Invalid goods index");
        return goods[index];
    }

    function getOwnedQuantity(uint256 index, address goodsOwner) public view returns (uint256) {
        return ownedQuantity[index][goodsOwner];
    }

    function getRewards() public view returns (uint256) {
        return rewards[_msgSender()];
    }

    function addNewGoods(string memory name, uint256 costPerItem, uint256 inStockAmount) public onlyOwner {
        Goods memory newGoods = Goods(name, costPerItem, inStockAmount);
        goods.push(newGoods);
        emit newGoodsAdded(name, costPerItem, inStockAmount);
    }

    function changeGoodsAmount(uint256 index, uint256 amount) public onlyOwner {
        require(index < goods.length, "GameToken: Invalid goods index");
        goods[index].inStockAmount = amount;
        emit goodsAmountChanged(index, amount);
    }

    function changeGoodsPrice(uint256 index, uint256 price) public onlyOwner {
        require(index < goods.length, "GameToken: Invalid goods index");
        goods[index].costPerItem = price;
        emit goodsPriceChanged(index, price);
    }

    function addRewards(address user, uint256 amount) public onlyOwner {
        rewards[user] += amount;
    }

    function claimRewards() public {
        uint256 rewardAmount = rewards[_msgSender()];
        require(rewardAmount > 0, "GameToken: No rewards to claim");

        rewards[_msgSender()] = 0;
        _mint(_msgSender(), rewardAmount);
        emit rewardsClaimed(_msgSender(), rewardAmount);
    }

    function deductRewards(address from, uint256 amount) public onlyOwner {
        uint256 rewardsAmount = rewards[from];
        require(rewardsAmount >= amount, "GameToken: Insufficient rewards balance");

        rewards[from] -= amount;
    }

    function buyGoods(uint256 index, uint256 amount) public {
        require(index < goods.length, "GameToken: Invalid goods index");
        require(amount <= goods[index].inStockAmount, "GameToken: Insufficient goods amount");
        uint256 totalCost = goods[index].costPerItem * amount;
        require(balanceOf(_msgSender()) >= totalCost, "GameToken: Insufficient balance");

        _burn(_msgSender(), totalCost);
        goods[index].inStockAmount -= amount;
        ownedQuantity[index][_msgSender()] += amount;
        emit goodsAmountChanged(index, goods[index].inStockAmount);
    }

    function spendGoods(uint256 index, uint256 amount) public {
        require(index < goods.length, "GameToken: Invalid goods index");
        require(amount <= ownedQuantity[index][_msgSender()], "GameToken: Insufficient goods owned");

        ownedQuantity[index][_msgSender()] -= amount;
    }

    function transferGoods(address to, uint256 index, uint256 amount) public {
        require(index < goods.length, "GameToken: Invalid goods index");
        require(amount <= ownedQuantity[index][_msgSender()], "GameToken: Insufficient goods owned");

        ownedQuantity[index][_msgSender()] -= amount;
        ownedQuantity[index][to] += amount;
        emit GoodsTransferred(_msgSender(), to, index, amount);
    }

    modifier onlyOwner() {
        require(_msgSender() == owner, "GameToken: Caller is not the owner");
        _;
    }

    event newGoodsAdded(string name, uint256 costPerItem, uint256 inStockAmount);
    event goodsAmountChanged(uint256 index, uint256 newAmount);
    event goodsPriceChanged(uint256 index, uint256 newPrice);
    event rewardsClaimed(address to, uint256 amount);
    event GoodsTransferred(address from, address to, uint256 index, uint256 amount);
}
