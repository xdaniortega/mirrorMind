const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("Deploying AgentRegistry contract...");

  // Validate required environment variables
  const requiredEnvVars = [
    'IDENTITY_VERIFICATION_HUB',
    'VERIFICATION_CONFIG_ID',
    'CELO_TESTNET_USDC',
    'PRIVATE_KEY'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  const mockScope = 1; // unless you use create2 and know the address of the contract before deploying, use a mock scope and update it after deployment.
  // see https://tools.self.xyz to compute the real value of the scope will set after deployment.
  const hubAddress = process.env.IDENTITY_VERIFICATION_HUB;
  const verificationConfigId = process.env.VERIFICATION_CONFIG_ID;
  const paymentTokenAddress = process.env.CELO_TESTNET_USDC;

  console.log("Using IdentityVerificationHub at:", hubAddress);
  console.log("Using VerificationConfigId:", verificationConfigId);
  console.log("Using PaymentToken at:", paymentTokenAddress);
  console.log("Using mock scope:", mockScope);

  // Deploy the contract
  const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
  const agentRegistry = await AgentRegistry.deploy(
    hubAddress, 
    mockScope, 
    verificationConfigId,
    paymentTokenAddress
  );

  console.log("Deployment transaction hash:", agentRegistry.deploymentTransaction().hash);
  
  await agentRegistry.waitForDeployment();
  const contractAddress = await agentRegistry.getAddress();

  console.log("AgentRegistry deployed to:", contractAddress);
  console.log("Network:", hre.network.name);

  // Wait for a few block confirmations
  console.log("Waiting for block confirmations...");
  await agentRegistry.deploymentTransaction().wait(5);

  // Verify the contract on Celoscan
  if (hre.network.name === "alfajores" && process.env.CELOSCAN_API_KEY) {
    console.log("Verifying contract on Celoscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [hubAddress, mockScope, verificationConfigId, paymentTokenAddress],
        network: "alfajores"
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.log("Verification failed:", error.message);
      if (error.message.includes("already verified")) {
        console.log("Contract was already verified.");
      } else {
        console.log("Verification error details:", error);
      }
    }
  } else if (!process.env.CELOSCAN_API_KEY) {
    console.log("Skipping verification: CELOSCAN_API_KEY not found in environment");
  } else {
    console.log("Skipping verification: Not on alfajores network");
  }

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    hubAddress: hubAddress,
    verificationConfigId: verificationConfigId,
    paymentTokenAddress: paymentTokenAddress,
    scope: mockScope,
    deployedAt: new Date().toISOString(),
    deployer: (await hre.ethers.provider.getSigner()).address,
    transactionHash: agentRegistry.deploymentTransaction().hash
  };

  fs.writeFileSync(
    "./deployments/latest.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\nDeployment complete!");
  console.log("Contract address:", contractAddress);
  console.log("Deployment info saved to: ./deployments/latest.json");
  console.log("\nNext steps:");
  console.log("1. Update NEXT_PUBLIC_SELF_ENDPOINT in app/.env");
  console.log("2. Go to https://tools.self.xyz, generate the scope and update it in your contract");
  console.log("3. Run: npm run set:scope to update the scope with the real value");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });