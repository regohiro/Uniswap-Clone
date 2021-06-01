// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

contract ERC20 is IERC20, IERC20Metadata{
  string private name_;
  string private symbol_;
  uint8 private decimals_;
  uint256 private totalSupply_;

  mapping(address => uint256) private balance;
  mapping(address => mapping(address => uint256)) private allowances;

  constructor(string memory _name, string memory _symbol, uint _decimals, uint _totalSupply){
    name_ = _name;
    symbol_ = _symbol;
    decimals_ = uint8(_decimals);
    totalSupply_ = _totalSupply;
    balance[msg.sender] = totalSupply_;
  }

  function name() external view override returns(string memory){
    return name_;
  }

  function symbol() external view override returns(string memory){
    return symbol_;
  }

  function decimals() external view override returns(uint8){
    return decimals_;
  }

  function totalSupply() external view override returns(uint256){
    return totalSupply_;
  }

  function balanceOf(address _account) external view override returns(uint256){
    return balance[_account];
  }

  function allowance(address _owner, address _spender) external view override returns(uint256){
    return allowances[_owner][_spender];
  }  

  function approve(address _spender, uint256 _amount) override external returns (bool) {
    allowances[msg.sender][_spender] = _amount;
    emit Approval(msg.sender, _spender, _amount);
    return true;
  }

  function transferFrom(address _from, address _to, uint256 _amount) override external returns (bool){
    require(allowances[_from][msg.sender] >= _amount, "ERC20: transfer amount exceeds allowances");
    _transfer(_from, _to, _amount);
    allowances[_from][msg.sender] -= _amount;
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
    require(balance[_from] >= _amount, "ERC20: transfer amount exceeds balance");
    balance[_from] -= _amount;
    balance[_to] += _amount;
    emit Transfer(_from, _to, _amount);
  }
}