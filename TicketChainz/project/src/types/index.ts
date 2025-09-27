export interface Event {
  id: string;
  title: string;
  date: string;
  venue: string;
  price: number;
  description: string;
  imageUrl: string;
  totalSupply: number;
  availableTickets: number;
  organizer: string;
  category: string;
  isSoulbound: boolean;
  hasPhotoMemories: boolean;
}

export interface Ticket {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  seat?: string;
  qrCode: string;
  tokenId: number;
  isSoulbound: boolean;
  mintedAt: string;
}

export interface PhotoMemory {
  id: string;
  eventId: string;
  eventTitle: string;
  title: string;
  description: string;
  imageUrl: string;
  rarity: 'common' | 'rare' | 'legendary';
  tokenId: number;
  mintedAt: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  balance: string;
  chainId: number | null;
}