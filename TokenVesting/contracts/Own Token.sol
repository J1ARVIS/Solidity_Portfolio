// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC20Burnable.sol";
import "./ERC20Capped.sol";
import "./Ownable.sol";

contract Own_Token is ERC20Capped, ERC20Burnable, Ownable {

    //  OGN Token
    //  OGN
    //  14 decimals
    //  9300000 cap
    //  930000000000000000000

    constructor(string memory name_, string memory symbol_, uint256 cap_) ERC20(name_, symbol_) ERC20Capped(cap_*(10**decimals())) {
    }
    
    function decimals() public view virtual override returns (uint8) {
        return 14;
    }

    function mint(address to_, uint256 amount_) public virtual onlyOwner {
        _mint(to_, amount_);
    }
    
    function _mint(address account, uint256 amount) internal virtual override(ERC20, ERC20Capped) {
        require(ERC20.totalSupply() + amount <= cap(), "ERC20Capped: cap exceeded");
        super._mint(account, amount);
    }
}