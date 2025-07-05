import 'dotenv/config';
import fs from 'fs';

async function main() {
  console.log("🔍 Verifying contract on Celoscan via API...");

  // Verificar que tenemos la dirección del contrato
  const CONTRACT_ADDRESS = process.env.AGENT_REGISTRY_ADDRESS;
  if (!CONTRACT_ADDRESS) {
    throw new Error("AGENT_REGISTRY_ADDRESS no está definido en .env");
  }

  // Verificar que tenemos la API key de Etherscan (funciona para todas las chains)
  const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
  if (!ETHERSCAN_API_KEY) {
    throw new Error("ETHERSCAN_API_KEY no está definido en .env");
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

    // Leer el archivo flattened
    console.log("📖 Reading flattened contract...");
    const flattenedContract = fs.readFileSync('AgentRegistry_flattened.sol', 'utf8');

    // Generar ABI-encoded constructor arguments
    console.log("🔧 Generating ABI-encoded constructor arguments...");
    const { encodeAbiParameters } = await import("viem");
    
    const parameterTypes = [
      { type: "address", name: "identityVerificationHubV2" },
      { type: "uint256", name: "scope" },
      { type: "address", name: "paymentToken" }
    ];

    const abiEncoded = encodeAbiParameters(parameterTypes, [
      constructorArgs[0],
      BigInt(constructorArgs[1]),
      constructorArgs[2]
    ]);

    console.log("🔗 ABI-encoded constructor arguments:");
    console.log(abiEncoded);

    // Preparar datos para la API
    const verificationData = {
      apikey: ETHERSCAN_API_KEY,
      module: 'contract',
      action: 'verifysourcecode',
      contractaddress: CONTRACT_ADDRESS,
      sourceCode: flattenedContract,
      codeformat: 'solidity-single-file',
      constructorArguements: abiEncoded.substring(2), // Remove '0x' prefix
      contractname: 'AgentRegistry',
      compilerversion: 'v0.8.28+commit.93dde7a7',
      optimizationUsed: '0',
      runs: '200',
      evmversion: 'paris',
      licenseType: '3' // MIT License
    };

    console.log("🚀 Sending verification request to Celoscan API...");
    
    // Hacer la petición a la API
    const response = await fetch('https://api-alfajores.celoscan.io/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(verificationData)
    });

    const result = await response.json();

    if (result.status === '1') {
      console.log("✅ Verification submitted successfully!");
      console.log("📝 GUID:", result.result);
      console.log("🔗 Check status at:");
      console.log(`   https://alfajores.celoscan.io/address/${CONTRACT_ADDRESS}`);
    } else {
      console.log("❌ Verification failed:");
      console.log("   Message:", result.message);
      console.log("   Result:", result.result);
    }

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