const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TicketChain", function () {
  let TicketChain, ticketChain, PhotoMemories, photoMemories;
  let owner, organizer, user1, user2;

  beforeEach(async function () {
    [owner, organizer, user1, user2] = await ethers.getSigners();
    
    // Deploy TicketChain
    TicketChain = await ethers.getContractFactory("TicketChain");
    ticketChain = await TicketChain.deploy();
    await ticketChain.deployed();

    // Deploy PhotoMemories
    PhotoMemories = await ethers.getContractFactory("PhotoMemories");
    photoMemories = await PhotoMemories.deploy(ticketChain.address);
    await photoMemories.deployed();

    // Add organizer
    await ticketChain.addOrganizer(organizer.address);
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await ticketChain.owner()).to.equal(owner.address);
    });

    it("Should add owner as organizer", async function () {
      expect(await ticketChain.organizers(owner.address)).to.equal(true);
    });
  });

  describe("Event Creation", function () {
    it("Should allow organizer to create event", async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const futureTime = currentTime + (30 * 24 * 60 * 60);

      await expect(
        ticketChain.connect(organizer).createEvent(
          "Test Event",
          "Test Description",
          "Test Venue",
          futureTime,
          ethers.utils.parseEther("0.1"),
          100,
          "Conference",
          false,
          false,
          "https://example.com/image.jpg"
        )
      ).to.emit(ticketChain, "EventCreated");
    });

    it("Should not allow non-organizer to create event", async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const futureTime = currentTime + (30 * 24 * 60 * 60);

      await expect(
        ticketChain.connect(user1).createEvent(
          "Test Event",
          "Test Description",
          "Test Venue",
          futureTime,
          ethers.utils.parseEther("0.1"),
          100,
          "Conference",
          false,
          false,
          "https://example.com/image.jpg"
        )
      ).to.be.revertedWith("Not an organizer");
    });
  });

  describe("Ticket Purchase", function () {
    let eventId;

    beforeEach(async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const futureTime = currentTime + (30 * 24 * 60 * 60);

      const tx = await ticketChain.connect(organizer).createEvent(
        "Test Event",
        "Test Description",
        "Test Venue",
        futureTime,
        ethers.utils.parseEther("0.1"),
        100,
        "Conference",
        false,
        false,
        "https://example.com/image.jpg"
      );
      
      const receipt = await tx.wait();
      eventId = receipt.events[0].args.eventId;
    });

    it("Should allow ticket purchase with correct payment", async function () {
      await expect(
        ticketChain.connect(user1).purchaseTicket(eventId, {
          value: ethers.utils.parseEther("0.1")
        })
      ).to.emit(ticketChain, "TicketPurchased");
    });

    it("Should not allow purchase with incorrect payment", async function () {
      await expect(
        ticketChain.connect(user1).purchaseTicket(eventId, {
          value: ethers.utils.parseEther("0.05")
        })
      ).to.be.revertedWith("Incorrect payment amount");
    });

    it("Should update available tickets after purchase", async function () {
      await ticketChain.connect(user1).purchaseTicket(eventId, {
        value: ethers.utils.parseEther("0.1")
      });

      const event = await ticketChain.getEvent(eventId);
      expect(event.availableTickets).to.equal(99);
    });
  });

  describe("Soulbound Tickets", function () {
    let eventId, ticketId;

    beforeEach(async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const futureTime = currentTime + (30 * 24 * 60 * 60);

      // Create soulbound event
      const tx = await ticketChain.connect(organizer).createEvent(
        "Soulbound Event",
        "Test Description",
        "Test Venue",
        futureTime,
        ethers.utils.parseEther("0.1"),
        100,
        "Conference",
        true, // isSoulbound
        false,
        "https://example.com/image.jpg"
      );
      
      const receipt = await tx.wait();
      eventId = receipt.events[0].args.eventId;

      // Purchase ticket
      const purchaseTx = await ticketChain.connect(user1).purchaseTicket(eventId, {
        value: ethers.utils.parseEther("0.1")
      });
      
      const purchaseReceipt = await purchaseTx.wait();
      ticketId = purchaseReceipt.events[2].args.ticketId; // Transfer event is last
    });

    it("Should not allow transfer of soulbound tickets", async function () {
      await expect(
        ticketChain.connect(user1).transferFrom(user1.address, user2.address, ticketId)
      ).to.be.revertedWith("Soulbound tickets cannot be transferred");
    });
  });

  describe("Photo Memories", function () {
    let eventId;

    beforeEach(async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const futureTime = currentTime + (30 * 24 * 60 * 60);

      const tx = await ticketChain.connect(organizer).createEvent(
        "Event with Memories",
        "Test Description",
        "Test Venue",
        futureTime,
        ethers.utils.parseEther("0.1"),
        100,
        "Conference",
        false,
        true, // hasPhotoMemories
        "https://example.com/image.jpg"
      );
      
      const receipt = await tx.wait();
      eventId = receipt.events[0].args.eventId;

      // Purchase tickets
      await ticketChain.connect(user1).purchaseTicket(eventId, {
        value: ethers.utils.parseEther("0.1")
      });
      await ticketChain.connect(user2).purchaseTicket(eventId, {
        value: ethers.utils.parseEther("0.1")
      });
    });

    it("Should allow owner to distribute memories", async function () {
      await expect(
        photoMemories.distributeMemories(
          eventId,
          [user1.address, user2.address],
          ["Memory 1", "Memory 2"],
          ["Description 1", "Description 2"],
          ["https://example.com/1.jpg", "https://example.com/2.jpg"]
        )
      ).to.emit(photoMemories, "MemoryMinted");
    });

    it("Should not allow duplicate memory distribution", async function () {
      await photoMemories.distributeMemories(
        eventId,
        [user1.address],
        ["Memory 1"],
        ["Description 1"],
        ["https://example.com/1.jpg"]
      );

      await expect(
        photoMemories.distributeMemories(
          eventId,
          [user1.address],
          ["Memory 2"],
          ["Description 2"],
          ["https://example.com/2.jpg"]
        )
      ).to.be.revertedWith("Already received memory");
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to add organizers", async function () {
      await ticketChain.addOrganizer(user1.address);
      expect(await ticketChain.organizers(user1.address)).to.equal(true);
    });

    it("Should not allow non-owner to add organizers", async function () {
      await expect(
        ticketChain.connect(user1).addOrganizer(user2.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Pause Functionality", function () {
    it("Should allow owner to pause contract", async function () {
      await ticketChain.pause();
      expect(await ticketChain.paused()).to.equal(true);
    });

    it("Should prevent operations when paused", async function () {
      await ticketChain.pause();

      const currentTime = Math.floor(Date.now() / 1000);
      const futureTime = currentTime + (30 * 24 * 60 * 60);

      await expect(
        ticketChain.connect(organizer).createEvent(
          "Test Event",
          "Test Description",
          "Test Venue",
          futureTime,
          ethers.utils.parseEther("0.1"),
          100,
          "Conference",
          false,
          false,
          "https://example.com/image.jpg"
        )
      ).to.be.revertedWith("Pausable: paused");
    });
  });
});