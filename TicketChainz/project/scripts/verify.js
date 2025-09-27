const { run } = require("hardhat");

async function main() {
  // Get contract addresses from command line arguments or environment
  const ticketChainAddress = process.argv[2] || process.env.VITE_CONTRACT_ADDRESS;
  const photoMemoriesAddress = process.argv[3] || process.env.VITE_MEMORIES_CONTRACT_ADDRESS;

  if (!ticketChainAddress || !photoMemoriesAddress) {
    console.error("Usage: npx hardhat run scripts/verify.js --network <network> <ticketChainAddress> <photoMemoriesAddress>");
    console.error("Or set VITE_CONTRACT_ADDRESS and VITE_MEMORIES_CONTRACT_ADDRESS in .env");
    process.exit(1);
  }

  console.log("Verifying contracts...");
  console.log("TicketChain address:", ticketChainAddress);
  console.log("PhotoMemories address:", photoMemoriesAddress);

  try {
    // Verify TicketChain contract
    console.log("\nVerifying TicketChain contract...");
    await run("verify:verify", {
      address: ticketChainAddress,
      constructorArguments: [],
    });
    console.log("✅ TicketChain contract verified successfully");

    // Verify PhotoMemories contract
    console.log("\nVerifying PhotoMemories contract...");
    await run("verify:verify", {
      address: photoMemoriesAddress,
      constructorArguments: [ticketChainAddress],
    });
    console.log("✅ PhotoMemories contract verified successfully");

    console.log("\n🎉 All contracts verified successfully!");
    console.log("\nContract addresses:");
    console.log("TicketChain:", ticketChainAddress);
    console.log("PhotoMemories:", photoMemoriesAddress);

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contracts are already verified");
    } else {
      console.error("❌ Verification failed:", error.message);
      
      console.log("\n📝 Manual verification instructions:");
      console.log("1. Go to the block explorer for your network");
      console.log("2. Navigate to your contract address");
      console.log("3. Click 'Contract' → 'Verify and Publish'");
      console.log("4. Use these settings:");
      console.log("   - Compiler Type: Solidity (Single file)");
      console.log("   - Compiler Version: v0.8.19+commit.7dd6d404");
      console.log("   - License: MIT");
      console.log("   - Optimization: Yes (200 runs)");
      console.log("5. For PhotoMemories, add constructor argument:", ticketChainAddress);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });