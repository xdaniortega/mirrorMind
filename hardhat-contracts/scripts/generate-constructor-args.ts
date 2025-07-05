import { encodeAbiParameters } from "viem";

async function main() {
  console.log("🔧 Generating constructor arguments for verification...");

  // Argumentos del constructor
  const constructorArgs = [
    "0x68c931C9a534D37aa78094877F46fE46a49F1A51", // IDENTITY_VERIFICATION_HUB
    BigInt("13830935831859129287571719984398581284431347386325123823325927294158145890989"), // SCOPE
    "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1" // CELO_TESTNET_USDC
  ];

  // Tipos de los parámetros del constructor
  const parameterTypes = [
    { type: "address", name: "identityVerificationHubV2" },
    { type: "uint256", name: "scope" },
    { type: "address", name: "paymentToken" }
  ];

  console.log("📋 Constructor arguments:");
  console.log("   IDENTITY_VERIFICATION_HUB:", constructorArgs[0]);
  console.log("   SCOPE:", constructorArgs[1].toString());
  console.log("   CELO_TESTNET_USDC:", constructorArgs[2]);

  // Generar ABI-encoded
  const abiEncoded = encodeAbiParameters(parameterTypes, constructorArgs);

  console.log("\n🔗 ABI-encoded constructor arguments:");
  console.log(abiEncoded);

  console.log("\n📝 For Hardhat verify command:");
  console.log(`npx hardhat verify --network celoAlfajores 0xTU_DIRECCION_DEL_CONTRATO "${constructorArgs[0]}" "${constructorArgs[1].toString()}" "${constructorArgs[2]}"`);

  console.log("\n🎉 Constructor arguments generated successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Failed to generate constructor arguments:", error);
    process.exit(1);
  }); 