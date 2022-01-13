const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FallbackAttack", function() {
  let Fallback;
  let FallbackAttack;
  let fallback;
  let fallbackAttack;
  let owner;
  let attacker;
  let alice;
  let signers;

  beforeEach(async function() {
    [owner, attacker, alice, ...signers] = await ethers.getSigners();
    Fallback = await ethers.getContractFactory("Fallback");
    fallback = await Fallback.connect(owner).deploy();
    FallbackAttack = await ethers.getContractFactory("FallbackAttack");
    fallbackAttack = await FallbackAttack.connect(attacker).deploy();
  });

  describe("deployment", function() {
    it("should set the owner and attacker of the contracts", async function() {
      expect(await fallback.owner()).to.equal(owner.address);
      expect(await fallbackAttack.attacker()).to.equal(attacker.address);
    });
  });

  describe("attack", function() {
    it("should transfer ether from Fallback contract", async function() {
      await fallback.connect(alice).contribute({value: 10**14});
      await alice.sendTransaction({to: fallback.address, value: ethers.utils.parseEther("1")});
      expect(await ethers.provider.getBalance(fallback.address)).to.gt(ethers.utils.parseEther("1"));

      await fallbackAttack.connect(attacker).attack(fallback.address, { value: 10**15 });
      expect(await ethers.provider.getBalance(fallback.address)).to.equal(0);
      expect(await ethers.provider.getBalance(fallbackAttack.address)).to.gt(ethers.utils.parseEther("1"));
    });
  });
});
