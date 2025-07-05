import { describe, it } from "node:test";
import { network } from "hardhat";
// We don't have Ethereum specific assertions in Hardhat 3 yet
import assert from "node:assert/strict";

/*
 * `node:test` uses `describe` and `it` to define tests, similar to Mocha.
 * `describe` blocks support async functions, simplifying the setup of tests.
 */
describe("AgentRegistry Fork Test", async function () {
  // Configuration parameters
  const CELO_TESTNET_HUB = "0x68c931C9a534D37aa78094877F46fE46a49F1A51";
  const CELO_TESTNET_USDC = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";
  const CONFIG_ID = "0xefacbec81d9f7ce9eff069f164119208a871e933e75de0bc5d23d903581fbf27";
  const SCOPE = "13830935831859129287571719984398581284431347386325123823325927294158145890989";

  /*
   * Connect to the hardhat network (which is configured as a fork of Celo Alfajores)
   */
  const { viem } = await network.connect({ network: "hardhat", chainType: "l1" });
  const publicClient = await viem.getPublicClient();

  it("Should deploy AgentRegistry contract", async function () {
    console.log("🚀 Starting fork test on Celo Alfajores...");
    
    // Get the first account as owner
    const [owner] = await viem.getWalletClients();
    console.log("📝 Owner address:", owner.account?.address || "No account found");

    // Deploy AgentRegistry
    console.log("📦 Deploying AgentRegistry...");
    const agentRegistry = await viem.deployContract("AgentRegistry", [
      CELO_TESTNET_HUB,
      BigInt(SCOPE),
      CELO_TESTNET_USDC
    ]);
    console.log("✅ AgentRegistry deployed to:", agentRegistry.address);

    console.log("\n🎉 Deployment completed successfully!");
    console.log("📋 Contract Addresses:");
    console.log("   AgentRegistry:", agentRegistry.address);

    // Test AgentRegistry parameters
    const agentRegistryScope = await agentRegistry.read.scope();
    const usdcToken = await agentRegistry.read.paymentToken();
    const creatorAgentFee = await agentRegistry.read.creatorAgentFee();
    const platformFee = await agentRegistry.read.platformFee();

    assert.equal(agentRegistryScope, BigInt(SCOPE));
    assert.equal(usdcToken, CELO_TESTNET_USDC);
    assert.equal(creatorAgentFee, 50n * 10n**6n); // 50 USDC
    assert.equal(platformFee, 500n); // 5% (500 basis points)  
    });

  it("Should verify fork network configuration", async function () {
    // Check that we're connected to Celo Alfajores fork
    const chainId = await publicClient.getChainId();
    assert.equal(chainId, 44787); // Celo Alfajores chain ID

    // Check that USDC token exists on the fork
    const usdcCode = await publicClient.getBytecode({ address: CELO_TESTNET_USDC });
    assert.notEqual(usdcCode, "0x", "USDC token should exist on the fork");

    // Check that V2 Hub exists on the fork
    const hubCode = await publicClient.getBytecode({ address: CELO_TESTNET_HUB });
    assert.notEqual(hubCode, "0x", "V2 Hub should exist on the fork");

    console.log("✅ Fork network verification passed");
  });

  it("Should test contract integration", async function () {
    // Deploy AgentRegistry for integration test
    const agentRegistry = await viem.deployContract("AgentRegistry", [
      CELO_TESTNET_HUB,
      BigInt(SCOPE),
      CELO_TESTNET_USDC
    ]);

    // Verify the contract uses the correct scope
    const agentRegistryScope = await agentRegistry.read.scope();
    assert.equal(agentRegistryScope, BigInt(SCOPE));

    // Verify the contract returns the correct config ID
    const agentRegistryConfigId = await agentRegistry.read.getConfigId([
      "0x0000000000000000000000000000000000000000000000000000000000000001", // destinationChainId
      "0x0000000000000000000000000000000000000000000000000000000000000123", // userIdentifier
      "0x" // userDefinedData
    ]);
    assert.equal(agentRegistryConfigId, CONFIG_ID);

    console.log("✅ Contract integration test passed");
  });

  it("Should test AgentRegistry functionality", async function () {
    const agentRegistry = await viem.deployContract("AgentRegistry", [
      CELO_TESTNET_HUB,
      BigInt(SCOPE),
      CELO_TESTNET_USDC
    ]);

    // Test setting creator agent fee
    const newFee = 100n * 10n**6n; // 100 USDC
    await agentRegistry.write.setCreatorAgentFee([newFee]);
    const updatedFee = await agentRegistry.read.creatorAgentFee();
    assert.equal(updatedFee, newFee);

    console.log("✅ AgentRegistry functionality test passed");
  });
});