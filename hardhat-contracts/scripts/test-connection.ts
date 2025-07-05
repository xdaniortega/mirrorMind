import { network } from "hardhat";
import 'dotenv/config';

async function main() {
  console.log("🔍 Testing connection to Celo Alfajores...");

  try {
    // Conectar a la red
    const { viem } = await network.connect({ network: "celoAlfajores", chainType: "l1" });
    const publicClient = await viem.getPublicClient();

    console.log("✅ Connected to network successfully!");

    // Obtener información básica de la red
    const chainId = await publicClient.getChainId();
    console.log("📊 Chain ID:", chainId);

    const blockNumber = await publicClient.getBlockNumber();
    console.log("📦 Current block number:", blockNumber);

    // Obtener información del bloque
    const block = await publicClient.getBlock({ blockNumber });
    console.log("⏰ Block timestamp:", new Date(Number(block.timestamp) * 1000).toISOString());

    // Verificar si tenemos wallet clients
    const walletClients = await viem.getWalletClients();
    console.log("👛 Number of wallet clients:", walletClients.length);
    
    if (walletClients.length > 0) {
      const address = walletClients[0].account?.address;
      console.log("💰 Wallet address:", address);
      
      // Obtener balance
      const balance = await publicClient.getBalance({ address: address! });
      console.log("💎 Balance:", balance.toString(), "wei");
      console.log("💎 Balance in CELO:", Number(balance) / 1e18, "CELO");
    } else {
      console.log("⚠️  No wallet clients found - check PRIVATE_KEY in .env");
    }

    console.log("🎉 Connection test completed successfully!");

  } catch (error) {
    console.error("❌ Connection test failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }); 