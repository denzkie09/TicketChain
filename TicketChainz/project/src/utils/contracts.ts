import { ethers } from 'ethers';

// Contract ABIs
export const TICKET_CHAIN_ABI = [
  "function createEvent(string title, string description, string venue, uint256 date, uint256 price, uint256 totalSupply, string category, bool isSoulbound, bool hasPhotoMemories, string imageUrl) returns (uint256)",
  "function purchaseTicket(uint256 eventId) payable returns (uint256)",
  "function getEvent(uint256 eventId) view returns (tuple(uint256 id, string title, string description, string venue, uint256 date, uint256 price, uint256 totalSupply, uint256 availableTickets, address organizer, string category, bool isSoulbound, bool hasPhotoMemories, string imageUrl, bool isActive))",
  "function getTicket(uint256 ticketId) view returns (tuple(uint256 id, uint256 eventId, address owner, bool isSoulbound, uint256 mintedAt, bool isUsed))",
  "function getTicketsByOwner(address owner) view returns (uint256[])",
  "function getEventsByOrganizer(address organizer) view returns (uint256[])",
  "function getAllEvents() view returns (tuple(uint256 id, string title, string description, string venue, uint256 date, uint256 price, uint256 totalSupply, uint256 availableTickets, address organizer, string category, bool isSoulbound, bool hasPhotoMemories, string imageUrl, bool isActive)[])",
  "function isAttendee(uint256 eventId, address user) view returns (bool)",
  "function useTicket(uint256 ticketId)",
  "function addOrganizer(address organizer)",
  "function organizers(address) view returns (bool)",
  "function getEventCount() view returns (uint256)",
  "function getTicketCount() view returns (uint256)",
  "event EventCreated(uint256 indexed eventId, string title, address indexed organizer, uint256 price, uint256 totalSupply, bool isSoulbound, bool hasPhotoMemories)",
  "event TicketPurchased(uint256 indexed ticketId, uint256 indexed eventId, address indexed buyer, uint256 price, bool isSoulbound)"
];

export const PHOTO_MEMORIES_ABI = [
  "function distributeMemories(uint256 eventId, address[] attendees, string[] titles, string[] descriptions, string[] imageUrls)",
  "function getMemory(uint256 memoryId) view returns (tuple(uint256 id, uint256 eventId, string title, string description, string imageUrl, uint8 rarity, address recipient, uint256 mintedAt))",
  "function getMemoriesByOwner(address owner) view returns (uint256[])",
  "function getMemoriesByEvent(uint256 eventId) view returns (uint256[])",
  "function hasReceivedMemory(uint256 eventId, address user) view returns (bool)",
  "function getRarityString(uint8 rarity) pure returns (string)",
  "function getMemoryCount() view returns (uint256)",
  "event MemoryMinted(uint256 indexed memoryId, uint256 indexed eventId, address indexed recipient, uint8 rarity, string title)"
];

// Contract addresses (will be set from environment variables)
export const TICKET_CHAIN_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';
export const PHOTO_MEMORIES_ADDRESS = import.meta.env.VITE_MEMORIES_CONTRACT_ADDRESS || '';
export const NETWORK_ID = parseInt(import.meta.env.VITE_NETWORK_ID || '1337');

// Network configurations
export const NETWORKS = {
  1337: {
    name: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: 'http://localhost:8545'
  },
  4202: {
    name: 'Lisk Sepolia',
    rpcUrl: 'https://rpc.sepolia-api.lisk.com',
    blockExplorer: 'https://sepolia-blockscout.lisk.com'
  },
  11155111: {
    name: 'Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    blockExplorer: 'https://sepolia.etherscan.io'
  },
  137: {
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com'
  }
};

export class ContractService {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private ticketChainContract: ethers.Contract | null = null;
  private photoMemoriesContract: ethers.Contract | null = null;
  private isInitialized = false;

  async initialize() {
    if (typeof window.ethereum !== 'undefined') {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();
      
      if (TICKET_CHAIN_ADDRESS) {
        this.ticketChainContract = new ethers.Contract(
          TICKET_CHAIN_ADDRESS,
          TICKET_CHAIN_ABI,
          this.signer
        );
      }
      
      if (PHOTO_MEMORIES_ADDRESS) {
        this.photoMemoriesContract = new ethers.Contract(
          PHOTO_MEMORIES_ADDRESS,
          PHOTO_MEMORIES_ABI,
          this.signer
        );
      }
      
      this.isInitialized = true;
    } else {
      throw new Error('MetaMask not found');
    }
  }

  async createEvent(eventData: {
    title: string;
    description: string;
    venue: string;
    date: Date;
    price: string;
    totalSupply: number;
    category: string;
    isSoulbound: boolean;
    hasPhotoMemories: boolean;
    imageUrl: string;
  }) {
    if (!this.ticketChainContract) throw new Error('Contract not initialized');
    
    const dateTimestamp = Math.floor(eventData.date.getTime() / 1000);
    const priceWei = ethers.utils.parseEther(eventData.price);
    
    const tx = await this.ticketChainContract.createEvent(
      eventData.title,
      eventData.description,
      eventData.venue,
      dateTimestamp,
      priceWei,
      eventData.totalSupply,
      eventData.category,
      eventData.isSoulbound,
      eventData.hasPhotoMemories,
      eventData.imageUrl
    );
    
    return await tx.wait();
  }

  async purchaseTicket(eventId: number, price: string) {
    if (!this.ticketChainContract) throw new Error('Contract not initialized');
    
    const priceWei = ethers.utils.parseEther(price);
    const tx = await this.ticketChainContract.purchaseTicket(eventId, {
      value: priceWei
    });
    
    return await tx.wait();
  }

  async getAllEvents() {
    if (!this.ticketChainContract) throw new Error('Contract not initialized');
    
    try {
      const events = await this.ticketChainContract.getAllEvents();
      return events.map((event: any) => ({
        id: event.id.toString(),
        title: event.title,
        description: event.description,
        venue: event.venue,
        date: new Date(event.date.toNumber() * 1000).toISOString(),
        price: parseFloat(ethers.utils.formatEther(event.price)),
        totalSupply: event.totalSupply.toNumber(),
        availableTickets: event.availableTickets.toNumber(),
        organizer: event.organizer,
        category: event.category,
        isSoulbound: event.isSoulbound,
        hasPhotoMemories: event.hasPhotoMemories,
        imageUrl: event.imageUrl
      }));
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  async getEvent(eventId: number) {
    if (!this.ticketChainContract) throw new Error('Contract not initialized');
    return await this.ticketChainContract.getEvent(eventId);
  }

  async getTicketsByOwner(address: string) {
    if (!this.ticketChainContract) throw new Error('Contract not initialized');
    
    try {
      const ticketIds = await this.ticketChainContract.getTicketsByOwner(address);
      
      const tickets = [];
      for (const ticketId of ticketIds) {
        const ticket = await this.ticketChainContract.getTicket(ticketId);
        const event = await this.getEvent(ticket.eventId);
        
        tickets.push({
          id: ticket.id.toString(),
          eventId: ticket.eventId.toString(),
          eventTitle: event.title,
          eventDate: new Date(event.date.toNumber() * 1000).toISOString(),
          venue: event.venue,
          tokenId: ticket.id.toNumber(),
          isSoulbound: ticket.isSoulbound,
          mintedAt: new Date(ticket.mintedAt.toNumber() * 1000).toISOString(),
          qrCode: `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="white"/><text x="50" y="50" text-anchor="middle" dy=".3em" font-family="monospace" font-size="8">#${ticket.id.toString()}</text></svg>`)}`
        });
      }
      
      return tickets;
    } catch (error) {
      console.error('Error fetching tickets:', error);
      return [];
    }
  }

  async getMemoriesByOwner(address: string) {
    if (!this.photoMemoriesContract) throw new Error('Contract not initialized');
    
    try {
      const memoryIds = await this.photoMemoriesContract.getMemoriesByOwner(address);
      
      const memories = [];
      for (const memoryId of memoryIds) {
        const memory = await this.photoMemoriesContract.getMemory(memoryId);
        const rarityString = await this.photoMemoriesContract.getRarityString(memory.rarity);
        
        memories.push({
          id: memory.id.toString(),
          eventId: memory.eventId.toString(),
          eventTitle: `Event #${memory.eventId.toString()}`, // You might want to fetch actual event title
          title: memory.title,
          description: memory.description,
          imageUrl: memory.imageUrl,
          rarity: rarityString,
          tokenId: memory.id.toNumber(),
          mintedAt: new Date(memory.mintedAt.toNumber() * 1000).toISOString(),
          attributes: [
            { trait_type: 'Rarity', value: rarityString },
            { trait_type: 'Event ID', value: memory.eventId.toString() },
            { trait_type: 'Mint Date', value: new Date(memory.mintedAt.toNumber() * 1000).toLocaleDateString() }
          ]
        });
      }
      
      return memories;
    } catch (error) {
      console.error('Error fetching memories:', error);
      return [];
    }
  }

  async getEventsByOrganizer(address: string) {
    if (!this.ticketChainContract) throw new Error('Contract not initialized');
    
    try {
      const eventIds = await this.ticketChainContract.getEventsByOrganizer(address);
      
      const events = [];
      for (const eventId of eventIds) {
        const event = await this.getEvent(eventId);
        events.push({
          id: event.id.toString(),
          title: event.title,
          description: event.description,
          venue: event.venue,
          date: new Date(event.date.toNumber() * 1000).toISOString(),
          price: parseFloat(ethers.utils.formatEther(event.price)),
          totalSupply: event.totalSupply.toNumber(),
          availableTickets: event.availableTickets.toNumber(),
          organizer: event.organizer,
          category: event.category,
          isSoulbound: event.isSoulbound,
          hasPhotoMemories: event.hasPhotoMemories,
          imageUrl: event.imageUrl
        });
      }
      
      return events;
    } catch (error) {
      console.error('Error fetching organizer events:', error);
      return [];
    }
  }

  async distributeMemories(
    eventId: number,
    attendees: string[],
    titles: string[],
    descriptions: string[],
    imageUrls: string[]
  ) {
    if (!this.photoMemoriesContract) throw new Error('Contract not initialized');
    
    const tx = await this.photoMemoriesContract.distributeMemories(
      eventId,
      attendees,
      titles,
      descriptions,
      imageUrls
    );
    
    return await tx.wait();
  }

  async isOrganizer(address: string) {
    if (!this.ticketChainContract) throw new Error('Contract not initialized');
    return await this.ticketChainContract.organizers(address);
  }

  getProvider() {
    return this.provider;
  }

  getSigner() {
    return this.signer;
  }

  getTicketChainAddress() {
    return TICKET_CHAIN_ADDRESS;
  }

  getPhotoMemoriesAddress() {
    return PHOTO_MEMORIES_ADDRESS;
  }

  async getEventAttendees(eventId: number): Promise<string[]> {
    // This is a simplified version - in a real implementation,
    // you'd need to track attendees or query events from the blockchain
    // For now, return mock attendees
    return [
      '0x1234567890123456789012345678901234567890',
      '0x2345678901234567890123456789012345678901'
    ];
  }

  isContractInitialized() {
    return this.isInitialized && !!this.ticketChainContract;
  }
}

export const contractService = new ContractService();