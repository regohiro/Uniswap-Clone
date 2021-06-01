// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./ERC20.sol";

contract Dai is ERC20 {
  constructor() ERC20("Dai", "DAI", 18, 10000000000000000000000000000) {

  }
}

contract Link is ERC20 {
  constructor() ERC20("Chainlink", "LINK", 18, 1000000000000000000000000) {

  }
}

contract Comp is ERC20 {
  constructor() ERC20("Compound", "COMP", 18, 1000000000000000000000000) {
    
  }
}