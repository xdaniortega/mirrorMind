const hre = require("hardhat");
const fs = require("fs");
require("dotenv").config();

async function main() {
    console.log("Setting scope for AgentRegistry contract...");

    // Read deployment info
    if (!fs.existsSync("./deployments/latest.json")) {
        console.error("No deployment found. Please deploy the contract first.");
        process.exit(1);
    }

    const deploymentInfo = JSON.parse(fs.readFileSync("./deployments/latest.json", "utf8"));
    const contractAddress = deploymentInfo.contractAddress;

    console.log("Using contract at:", contractAddress);
    console.log("Network:", hre.network.name);

    // Get the new scope value from environment variable
    const newScope = process.env.NEW_SCOPE;

    if (!newScope) {
        console.error("Please provide the new scope value:");
        console.error("Set NEW_SCOPE environment variable:");
        console.error("  NEW_SCOPE=<scope_value> npx hardhat run scripts/set_scope.js --network <network>");
        console.error("");
        console.error("Example:");
        console.error("NEW_SCOPE=1234567890 npx hardhat run scripts/set_scope.js --network alfajores");
        process.exit(1);
    }

    console.log("Setting scope to:", newScope);

    // Get the contract instance
    const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
    const agentRegistry = AgentRegistry.attach(contractAddress);

    // Get current scope for comparison
    try {
        const currentScope = await agentRegistry.scope();
        console.log("Current scope:", currentScope.toString());
    } catch (error) {
        console.log("Could not read current scope:", error.message);
    }

    // Call setScope function
    console.log("Calling setScope...");
    try {
        const tx = await agentRegistry.setScope(newScope);
        console.log("Transaction hash:", tx.hash);

        // Wait for transaction confirmation
        console.log("Waiting for transaction confirmation...");
        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);

        // Verify the scope was updated
        const updatedScope = await agentRegistry.scope();
        console.log("Updated scope:", updatedScope.toString());

        // Update deployment info with new scope
        deploymentInfo.scope = newScope;
        deploymentInfo.scopeUpdatedAt = new Date().toISOString();
        deploymentInfo.scopeUpdateTxHash = tx.hash;

        fs.writeFileSync(
            "./deployments/latest.json",
            JSON.stringify(deploymentInfo, null, 2)
        );

        console.log("\nScope update complete!");
        console.log("Deployment info updated with new scope");

    } catch (error) {
        console.error("Failed to set scope:", error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
