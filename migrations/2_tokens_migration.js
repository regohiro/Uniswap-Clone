const Dai = artifacts.require("Dai");
const Link = artifacts.require("Link");
const Comp = artifacts.require("Comp");

module.exports = async function (deployer) {
  await deployer.deploy(Dai);
  await deployer.deploy(Link);
  await deployer.deploy(Comp);
};
