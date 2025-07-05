import { network } from "hardhat";
import 'dotenv/config';

async function main() {
  console.log("🚀 Starting deployment to Celo Alfajores...");

  // Verificar que tenemos la clave privada
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY no está definido en .env");
  }

  // Conectar a la red
  const { viem } = await network.connect({ network: "celoAlfajores", chainType: "l1" });
  
  // Obtener el wallet client
  const walletClients = await viem.getWalletClients();
  if (walletClients.length === 0) {
    throw new Error("No wallet clients found. Make sure PRIVATE_KEY is set in .env");
  }
  
  const deployer = walletClients[0];
  console.log("📝 Deploying from address:", deployer.account?.address);

  // Parámetros de despliegue
  const IDENTITY_VERIFICATION_HUB = "0x68c931C9a534D37aa78094877F46fE46a49F1A51";
  const SCOPE = "13830935831859129287571719984398581284431347386325123823325927294158145890989";
  const CELO_TESTNET_USDC = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

  console.log("📋 Deployment parameters:");
  console.log("   Hub:", IDENTITY_VERIFICATION_HUB);
  console.log("   Scope:", SCOPE);
  console.log("   USDC:", CELO_TESTNET_USDC);

  // Desplegar AgentRegistry
  console.log("📦 Deploying AgentRegistry...");
  const agentRegistry = await viem.deployContract("AgentRegistry", [
    IDENTITY_VERIFICATION_HUB,
    BigInt(SCOPE),
    CELO_TESTNET_USDC
  ]);

  console.log("✅ AgentRegistry deployed to:", agentRegistry.address);
  console.log("🎉 Deployment completed successfully!");

  // Verificar parámetros
  const scope = await agentRegistry.read.scope();
  const usdcToken = await agentRegistry.read.paymentToken();
  const creatorAgentFee = await agentRegistry.read.creatorAgentFee();
  const platformFee = await agentRegistry.read.platformFee();

  console.log("📊 Contract parameters:");
  console.log("   Scope:", scope.toString());
  console.log("   USDC Token:", usdcToken);
  console.log("   Creator Agent Fee:", Number(creatorAgentFee) / 1e6, "USDC");
  console.log("   Platform Fee:", platformFee.toString(), "basis points");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 