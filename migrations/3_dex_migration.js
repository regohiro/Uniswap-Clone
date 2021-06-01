const Dex = artifacts.require("Dex");
const Dai = artifacts.require("Dai");
const Link = artifacts.require("Link");
const Comp = artifacts.require("Comp");

module.exports = async function (deployer) {
  const dai = await Dai.deployed();  
  const link = await Link.deployed();
  const comp = await Comp.deployed();

  const tokenAddr = [dai.address, link.address, comp.address];
  await deployer.deploy(Dex, tokenAddr);
  const dex = await Dex.deployed();

  await dai.transfer(dex.address, '10000000000000000000000000000');
  await link.transfer(dex.address, '1000000000000000000000000');
  await comp.transfer(dex.address, '1000000000000000000000000');
};
