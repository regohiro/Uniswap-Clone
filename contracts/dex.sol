// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Dex {
  event buy(address tokenAddr, address account, uint256 amount, uint256 cost);
  event sell(address tokenAddr, address account, uint256 amount, uint256 cost);

  mapping(address => bool) private supportedTokenAddr;

  modifier supportsToken(address _tokenAddr) {
    require(supportedTokenAddr[_tokenAddr] == true, "Dex: This token is not supported");
    _;
  }

  constructor(address[] memory _tokenAddr){
    for(uint i = 0; i < _tokenAddr.length; i++){
      supportedTokenAddr[_tokenAddr[i]] = true;
    }
  }

  function buyToken(address _tokenAddr, uint256 _cost, uint256 _amount) external payable supportsToken(_tokenAddr){
    IERC20 token = IERC20(_tokenAddr);
    require(msg.value == _cost, "Dex: Insufficient fund!");
    require(token.balanceOf(address(this)) >= _amount, "Dex: Token sold out :(");
    token.transfer(msg.sender, _amount);
    emit buy(_tokenAddr, msg.sender, _amount, _cost);
  }

  function sellToken(address _tokenAddr, uint256 _cost, uint256 _amount) external supportsToken(_tokenAddr){
    IERC20 token = IERC20(_tokenAddr);
    require(token.balanceOf(msg.sender) >= _cost, "Dex: Insufficient token balance");
    require(address(this).balance >= _amount, "Dex: Cannot afford this token :(");
    token.transferFrom(msg.sender, address(this), _cost);
    (bool success, ) = payable(msg.sender).call{value: _amount}("");
    require(success, "Dex: Eth transfer unsuccessful!");
    emit sell(_tokenAddr, msg.sender, _amount, _cost);
  }
}