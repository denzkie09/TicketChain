const { ethers } = require("hardhat");

async function main() {
  console.log("Starting local deployment for development...");
  
  // Start local Hardhat node first
  console.log("Make sure to run 'npx hardhat node' in another terminal first!");
  
  const [deployer, user1, user2] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy contracts
  const TicketChain = await ethers.getContractFactory("TicketChain");
  const ticketChain = await TicketChain.deploy();
  await ticketChain.deployed();

  const PhotoMemories = await ethers.getContractFactory("PhotoMemories");
  const photoMemories = await PhotoMemories.deploy(ticketChain.address);
  await photoMemories.deployed();

  console.log("TicketChain deployed to:", ticketChain.address);
  console.log("PhotoMemories deployed to:", photoMemories.address);

  // Create test events and purchase tickets for development
  const currentTime = Math.floor(Date.now() / 1000);
  const futureTime = currentTime + (30 * 24 * 60 * 60);

  // Create events
  await ticketChain.createEvent(
    "Web3 Summit 2024",
    "The premier Web3 conference featuring industry leaders and cutting-edge technology.",
    "Crypto Convention Center",
    futureTime,
    ethers.utils.parseEther("0.05"),
    1000,
    "Conference",
    true,
    true,
    "https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg"
  );

  await ticketChain.createEvent(
    "NFT Art Gala",
    "Exclusive art exhibition showcasing the finest NFT collections.",
    "Digital Arts Museum",
    futureTime + (7 * 24 * 60 * 60),
    ethers.utils.parseEther("0.08"),
    500,
    "Art",
    false,
    true,
    "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg"
  );

  // Purchase some test tickets
  await ticketChain.connect(user1).purchaseTicket(1, { value: ethers.utils.parseEther("0.05") });
  await ticketChain.connect(user2).purchaseTicket(1, { value: ethers.utils.parseEther("0.05") });
  await ticketChain.connect(user1).purchaseTicket(2, { value: ethers.utils.parseEther("0.08") });

  console.log("\n=== Local Development Setup Complete ===");
  console.log("TicketChain:", ticketChain.address);
  console.log("PhotoMemories:", photoMemories.address);
  console.log("Test tickets purchased for development");
  
  console.log("\n=== Add to .env ===");
  console.log(`VITE_CONTRACT_ADDRESS=${ticketChain.address}`);
  console.log(`VITE_MEMORIES_CONTRACT_ADDRESS=${photoMemories.address}`);
  console.log("VITE_NETWORK_ID=1337");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});