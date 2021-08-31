// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";

contract Fallback {
  mapping(address => uint256) public contributions;
  address payable public owner;

  constructor() {
    owner = payable(msg.sender);
    contributions[msg.sender] = 1000 * (1 ether);
  }

  modifier onlyOwner {
    require(msg.sender == owner, "caller is not the owner");
    _;
  }

  event NewOwner(address _newOwner);

  function contribute() external payable {
    require(msg.value < 0.001 ether);
    contributions[msg.sender] += msg.value;
    if (contributions[msg.sender] > contributions[owner]) {
      owner = payable(msg.sender);
      emit NewOwner(msg.sender);
    }
  }

  function getContribution() external view returns (uint256) {
    return contributions[msg.sender];
  }

  function withdraw() external onlyOwner {
    owner.transfer(address(this).balance);
  }

  fallback() external payable {
    require(msg.value > 0 && contributions[msg.sender] > 0);
    owner = payable(msg.sender);
    emit NewOwner(msg.sender);
  }
}
