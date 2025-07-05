import { network } from "hardhat";
import 'dotenv/config';

async function main() {
  console.log("🔍 Verifying contract on Celoscan...");

  // Verificar que tenemos la dirección del contrato
  const CONTRACT_ADDRESS = process.env.AGENT_REGISTRY_ADDRESS;
  if (!CONTRACT_ADDRESS) {
    throw new Error("AGENT_REGISTRY_ADDRESS no está definido en .env");
  }

  // Verificar que tenemos la API key de Celoscan
  const CELOSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
  if (!CELOSCAN_API_KEY) {
    throw new Error("CELOSCAN_API_KEY no está definido en .env");
  }

  console.log("📋 Parameters:");
  console.log("   Contract Address:", CONTRACT_ADDRESS);
  console.log("   Network: Celo Alfajores");

  try {
    // Argumentos del constructor desde .env
    const constructorArgs = [
      process.env.IDENTITY_VERIFICATION_HUB!, // IDENTITY_VERIFICATION_HUB
      process.env.SCOPE!, // SCOPE
      process.env.CELO_TESTNET_USDC! // CELO_TESTNET_USDC
    ];

    // Verificar que todos los argumentos están definidos
    if (!process.env.IDENTITY_VERIFICATION_HUB || !process.env.SCOPE || !process.env.CELO_TESTNET_USDC) {
      throw new Error("Faltan variables de entorno: IDENTITY_VERIFICATION_HUB, SCOPE, o CELO_TESTNET_USDC");
    }

    console.log("📝 Constructor arguments:");
    constructorArgs.forEach((arg, index) => {
      console.log(`   ${index + 1}. ${arg}`);
    });

    // Usar el comando de Hardhat para verificar
    const { exec } = await import('child_process');
    const util = await import('util');
    const execAsync = util.promisify(exec);

    const verifyCommand = `npx hardhat verify --network celoAlfajores ${CONTRACT_ADDRESS} "${constructorArgs[0]}" "${constructorArgs[1]}" "${constructorArgs[2]}"`;

    console.log("🚀 Executing verification command...");
    console.log("📝 Command:", verifyCommand);

    const { stdout, stderr } = await execAsync(verifyCommand, { cwd: process.cwd() });

    if (stdout) {
      console.log("✅ Verification output:");
      console.log(stdout);
    }

    if (stderr) {
      console.log("⚠️  Verification warnings/errors:");
      console.log(stderr);
    }

    console.log("🎉 Verification process completed!");
    console.log("🔗 Check your contract on Celoscan:");
    console.log(`   https://alfajores.celoscan.io/address/${CONTRACT_ADDRESS}`);

  } catch (error) {
    console.error("❌ Verification failed:", error);
    
    // Si falla, mostrar instrucciones manuales
    console.log("\n📋 Manual verification instructions:");
    console.log("1. Go to: https://alfajores.celoscan.io/verifyContract");
    console.log("2. Paste the flattened contract code from: AgentRegistry_flattened.sol");
    console.log("3. Use these constructor arguments from your .env:");
    console.log(`   - IDENTITY_VERIFICATION_HUB: ${process.env.IDENTITY_VERIFICATION_HUB}`);
    console.log(`   - SCOPE: ${process.env.SCOPE}`);
    console.log(`   - CELO_TESTNET_USDC: ${process.env.CELO_TESTNET_USDC}`);
    
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }); 