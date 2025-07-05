import { ethers } from "ethers";

async function main() {
  // Test user address
  const testUserAddress = "0x1234567890abcdef1234567890abcdef12345678";
  
  // Simulate frontend encoding using abi.encode
  const userData = ethers.AbiCoder.defaultAbiCoder().encode([
    "address"
  ], [
    testUserAddress
  ]);
  const hexData = userData.slice(2); // Remove '0x' prefix
  
  console.log("Original address:", testUserAddress);
  console.log("Hex data (from abi.encode, 64 chars):", hexData);
  console.log("Hex data length:", hexData.length);
  
  // Convert to bytes for contract (already bytes)
  console.log("UserData bytes length:", ethers.getBytes(userData).length);
  console.log("UserData:", userData);
  
  // Simulate contract extraction (decode)
  const decoded = ethers.AbiCoder.defaultAbiCoder().decode([
    "address"
  ], userData);
  const extractedAddress = decoded[0];
  
  console.log("Extracted address:", extractedAddress);
  console.log("Addresses match:", testUserAddress.toLowerCase() === extractedAddress.toLowerCase());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 