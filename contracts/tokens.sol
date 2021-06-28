// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./ERC20.sol";

contract Dai is ERC20 {
  constructor() ERC20("Dai", "DAI", (10**10)*(10**18)) {

  }
}

contract Link is ERC20 {
  constructor() ERC20("Chainlink", "LINK", (10**6)*(10**18)) {

  }
}

contract Comp is ERC20 {
  constructor() ERC20("Compound", "COMP", (10**4)*(10**18)) {
    
  }
}