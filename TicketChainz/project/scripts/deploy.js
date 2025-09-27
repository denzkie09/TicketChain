const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy TicketChain contract
  console.log("\nDeploying TicketChain contract...");
  const TicketChain = await ethers.getContractFactory("TicketChain");
  const ticketChain = await TicketChain.deploy();
  await ticketChain.deployed();
  console.log("TicketChain deployed to:", ticketChain.address);

  // Deploy PhotoMemories contract
  console.log("\nDeploying PhotoMemories contract...");
  const PhotoMemories = await ethers.getContractFactory("PhotoMemories");
  const photoMemories = await PhotoMemories.deploy(ticketChain.address);
  await photoMemories.deployed();
  console.log("PhotoMemories deployed to:", photoMemories.address);

  // Create some sample events for testing
  console.log("\nCreating sample events...");
  
  const currentTime = Math.floor(Date.now() / 1000);
  const futureTime = currentTime + (30 * 24 * 60 * 60); // 30 days from now
  
  // Event 1: Web3 Summit (Soulbound with Photo Memories)
  const tx1 = await ticketChain.createEvent(
    "Web3 Summit 2024",
    "The premier Web3 conference featuring industry leaders and cutting-edge technology.",
    "Crypto Convention Center",
    futureTime,
    ethers.utils.parseEther("0.05"),
    1000,
    "Conference",
    true, // isSoulbound
    true, // hasPhotoMemories
    "https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg"
  );
  await tx1.wait();
  console.log("Created Web3 Summit event");

  // Event 2: NFT Art Gala (Regular with Photo Memories)
  const tx2 = await ticketChain.createEvent(
    "NFT Art Gala",
    "Exclusive art exhibition showcasing the finest NFT collections from renowned artists.",
    "Digital Arts Museum",
    futureTime + (7 * 24 * 60 * 60), // 37 days from now
    ethers.utils.parseEther("0.08"),
    500,
    "Art",
    false, // not soulbound
    true, // hasPhotoMemories
    "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg"
  );
  await tx2.wait();
  console.log("Created NFT Art Gala event");

  // Event 3: DeFi Workshop (Soulbound, no Photo Memories)
  const tx3 = await ticketChain.createEvent(
    "DeFi Developers Meetup",
    "Technical deep-dive into DeFi protocols and smart contract development.",
    "Innovation Hub",
    futureTime + (14 * 24 * 60 * 60), // 44 days from now
    ethers.utils.parseEther("0.02"),
    200,
    "Workshop",
    true, // isSoulbound
    false, // no photo memories
    "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg"
  );
  await tx3.wait();
  console.log("Created DeFi Workshop event");

  console.log("\n=== Deployment Summary ===");
  console.log("TicketChain Contract:", ticketChain.address);
  console.log("PhotoMemories Contract:", photoMemories.address);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Deployer:", deployer.address);
  
  console.log("\n=== Environment Variables ===");
  console.log("Add these to your .env file:");
  console.log(`VITE_CONTRACT_ADDRESS=${ticketChain.address}`);
  console.log(`VITE_MEMORIES_CONTRACT_ADDRESS=${photoMemories.address}`);
  console.log(`VITE_NETWORK_ID=${(await ethers.provider.getNetwork()).chainId}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });