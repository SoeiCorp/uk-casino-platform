const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const CasinoPlatformModule = buildModule("CasinoPlatformModule", (m: any) => {
  const casinoPlatform = m.contract("CasinoPlatform");

  return { casinoPlatform };
});

module.exports = CasinoPlatformModule;