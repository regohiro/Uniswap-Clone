// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

contract ERC20 is IERC20, IERC20Metadata{
  string override public name;
  string override public symbol;
  uint8 override public decimals;
  uint256 override public totalSupply;

  mapping(address => uint256) override public balanceOf;
  mapping(address => mapping(address => uint256)) override public allowance;

  constructor(string memory _name, string memory _symbol, uint _decimals, uint _totalSupply){
    name = _name;
    symbol = _symbol;
    decimals = uint8(_decimals);
    totalSupply = _totalSupply;
    balanceOf[msg.sender] = totalSupply;
  }

  function approve(address _spender, uint256 _amount) override external returns (bool) {
    allowance[msg.sender][_spender] = _amount;
    emit Approval(msg.sender, _spender, _amount);
    return true;
  }

  function transferFrom(address _from, address _to, uint256 _amount) override external returns (bool){
    require(allowance[_from][msg.sender] >= _amount, "ERC20: transfer amount exceeds allowance");
    _transfer(_from, _to, _amount);
    allowance[_from][msg.sender] -= _amount;
    return true;
  }

  function transfer(address _to, uint256 _amount) override external returns (bool){
    _transfer(msg.sender, _to, _amount);
    return true;
  }

  function _transfer(address _from, address _to, uint256 _amount) private {
    require(_from != address(0), "ERC20: transfer from the zero address");
    require(_to != address(0), "ERC20: transfer to the zero address");
    require(_to != _from, "ERC20: recipient and sender is the same");
    require(balanceOf[_from] >= _amount, "ERC20: transfer amount exceeds balance");
    balanceOf[_from] -= _amount;
    balanceOf[_to] += _amount;
    emit Transfer(_from, _to, _amount);
  }
}