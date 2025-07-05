import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import 'dotenv/config';

const IDENTITY_VERIFICATION_HUB = process.env.IDENTITY_VERIFICATION_HUB!;
const SCOPE = process.env.SCOPE!;
const CELO_TESTNET_USDC = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"; // Puedes parametrizarlo si lo necesitas

export default buildModule("AgentRegistryModule", (m) => {
  const agentRegistry = m.contract("AgentRegistry", [
    IDENTITY_VERIFICATION_HUB,
    BigInt(SCOPE),
    CELO_TESTNET_USDC
  ]);

  return { agentRegistry };
}); 