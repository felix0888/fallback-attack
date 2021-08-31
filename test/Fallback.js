const { expect } = require("chai");
const { ethers } = require("hardhat");

const bigNum = num=>(num + '0'.repeat(18));

describe("Fallback", function() {
  let Fallback;
  let fb;
  let owner;
  let user1;
  let user2;
  let signers;

  beforeEach(async function() {
    Fallback = await ethers.getContractFactory("Fallback");
    fb = await Fallback.deploy();
    [owner, user1, user2, ...signers] = await ethers.getSigners();
  });

  describe("deployment", function() {
    it("should set the owner of the contract and gives contribution", async function() {
      expect(await fb.owner()).to.equal(owner.address);
      expect(await fb.contributions(owner.address)).to.equal(bigNum(1000));
    });
  });

  describe("contribute", function() {
    it("should be reverted for contribution more than 0.001 ether", async function() {
      await expect(
        fb.contribute({value: 10**15})
      ).to.be.reverted;
    })

    it("should update the contribution", async function() {
      await fb.connect(user1).contribute({value: 10**14});
      expect(await fb.contributions(user1.address)).to.equal(10**14);
      await fb.connect(user2).contribute({value: 2 * 10**14});
      expect(await fb.contributions(user2.address)).to.equal(2 * 10**14);
      await fb.connect(user1).contribute({value: 3 * 10**14});
      expect(await fb.contributions(user1.address)).to.equal(4 * 10**14);
    });

    xit("should change the owner if contribution is bigger than the owner", async function() {
    });
  });

  describe("getContribution", function() {
    beforeEach(async function() {
      await fb.connect(user1).contribute({value: 10**14});
      await fb.connect(user2).contribute({value: 2 * 10**14});
    });

    it("should return user contribution", async function() {
      expect(await fb.connect(user1).getContribution()).to.equal(10**14);
      expect(await fb.connect(user2).getContribution()).to.equal(2 * 10**14);
    });
  });

  describe("withdraw", function() {
    it("should be reverted if non-owner tries to withdraw", async function() {
      await expect(
        fb.connect(user1).withdraw()
      ).to.be.reverted;
    });

    it("should transfer ether balance of the contract to the owner's address", async function() {
      await fb.connect(user1).contribute({value: 10**14});
      await fb.withdraw();
      expect(await ethers.provider.getBalance(fb.address)).to.equal(0);
    });
  });

  describe("fallback", function() {
    it("should be reverted when fallback is triggered without any ether", async function() {
      await expect(
        user1.sendTransaction({to: fb.address, value: ethers.utils.parseEther("0")})
      ).to.be.reverted;
    });

    it("should be reverted when fallback is triggered by one without any contribution", async function() {
      await expect(
        user1.sendTransaction({to: fb.address, value: ethers.utils.parseEther("1")})
      )
    });

    it("should change the owner when fallback method is triggered with ether", async function() {
      await fb.connect(user1).contribute({value: 10**14});
      await user1.sendTransaction({to: fb.address, value: ethers.utils.parseEther("1")});
      expect(await fb.owner()).to.equal(user1.address);
    })
  });
});
