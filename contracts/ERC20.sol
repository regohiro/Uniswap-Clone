// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ERC20 {
  string public name;
  string public symbol;
  uint8 public decimals = 18;
  uint256 public totalSupply;

  mapping(address => uint256) private balances;
  mapping(address => mapping(address => uint256)) private allowances;

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);

  constructor(string memory _name, string memory _symbol, uint256 _totalSupply){
    name = _name;
    symbol = _symbol;
    totalSupply = _totalSupply;
    balances[msg.sender] = totalSupply;
  }

  function balanceOf(address _account) external view returns(uint256){
    return balances[_account];
  }

  function allowance(address _owner, address _spender) external view returns(uint256){
    return allowances[_owner][_spender];
  }  

  function approve(address _spender, uint256 _amount) external returns (bool) {
    allowances[msg.sender][_spender] = _amount;
    emit Approval(msg.sender, _spender, _amount);
    return true;
  }

  function transferFrom(address _from, address _to, uint256 _amount) external returns (bool){
    require(allowances[_from][msg.sender] >= _amount, "ERC20: transfer amount exceeds allowances");
    _transfer(_from, _to, _amount);
    allowances[_from][msg.sender] -= _amount;
    return true;
  }

  function transfer(address _to, uint256 _amount) external returns (bool){
    _transfer(msg.sender, _to, _amount);
    return true;
  }

  function _transfer(address _from, address _to, uint256 _amount) private {
    require(_from != address(0), "ERC20: transfer from the zero address");
    require(_to != address(0), "ERC20: transfer to the zero address");
    require(_to != _from, "ERC20: recipient and sender is the same");
    require(balances[_from] >= _amount, "ERC20: transfer amount exceeds balances");
    balances[_from] -= _amount;
    balances[_to] += _amount;
    emit Transfer(_from, _to, _amount);
  }
}