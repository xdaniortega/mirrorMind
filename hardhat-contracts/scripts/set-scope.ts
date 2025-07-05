import { network } from "hardhat";
import 'dotenv/config';

async function main() {
  console.log("🔧 Setting scope for AgentRegistry...");

  // Verificar que tenemos la dirección del contrato
  const CONTRACT_ADDRESS = process.env.AGENT_REGISTRY_ADDRESS;
  if (!CONTRACT_ADDRESS) {
    throw new Error("AGENT_REGISTRY_ADDRESS no está definido en .env");
  }

  // Verificar que tenemos la nueva scope
  const NEW_SCOPE = process.env.SCOPE;
  if (!NEW_SCOPE) {
    throw new Error("NEW_SCOPE no está definido en .env");
  }

  console.log("📋 Parameters:");
  console.log("   Contract Address:", CONTRACT_ADDRESS);
  console.log("   New Scope:", NEW_SCOPE);

  try {
    // Conectar a la red
    const { viem } = await network.connect({ network: "celoAlfajores", chainType: "l1" });
    
    // Obtener el wallet client
    const walletClients = await viem.getWalletClients();
    if (walletClients.length === 0) {
      throw new Error("No wallet clients found. Make sure PRIVATE_KEY is set in .env");
    }
    
    const deployer = walletClients[0];
    console.log("📝 Using wallet:", deployer.account?.address);

    // Obtener el contrato
    const agentRegistry = await viem.getContractAt("AgentRegistry", CONTRACT_ADDRESS as `0x${string}`);

    // Obtener la scope actual
    const currentScope = await agentRegistry.read.scope();
    console.log("📊 Current scope:", currentScope.toString());

    // Llamar a setScope (solo el owner puede hacer esto)
    console.log("🔄 Setting new scope...");
    const hash = await agentRegistry.write.setScope([BigInt(NEW_SCOPE)]);
    
    console.log("✅ Transaction sent!");
    console.log("📝 Transaction hash:", hash);

    // Esperar a que se confirme
    console.log("⏳ Waiting for confirmation...");
    const publicClient = await viem.getPublicClient();
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);

    // Verificar que la scope cambió
    const updatedScope = await agentRegistry.read.scope();
    console.log("📊 Updated scope:", updatedScope.toString());

    console.log("🎉 Scope updated successfully!");

  } catch (error) {
    console.error("❌ Failed to set scope:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }); 