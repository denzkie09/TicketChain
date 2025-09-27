import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Shield, Download, ExternalLink, Share2, QrCode, Loader, AlertCircle } from 'lucide-react';
import { Ticket } from '../types';
import { contractService } from '../utils/contracts';
import { useWallet } from '../hooks/useWallet';

export default function MyTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const { walletState } = useWallet();

  useEffect(() => {
    const loadTickets = async () => {
      if (!walletState.connected || !walletState.address) {
        setTickets([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        if (contractService.isContractInitialized()) {
          const fetchedTickets = await contractService.getTicketsByOwner(walletState.address);
          setTickets(fetchedTickets);
        } else {
          setTickets([]);
        }
      } catch (err: any) {
        console.error('Error loading tickets:', err);
        setError(err.message || 'Failed to load tickets');
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [walletState.connected, walletState.address]);

  const upcomingTickets = tickets.filter(ticket => new Date(ticket.eventDate) > new Date());
  const pastTickets = tickets.filter(ticket => new Date(ticket.eventDate) <= new Date());
  const soulboundCount = tickets.filter(ticket => ticket.isSoulbound).length;

  const handleDownloadTicket = (ticket: Ticket) => {
    // Create a downloadable ticket image/PDF
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 600;

    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 400, 600);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(ticket.eventTitle, 20, 50);

    // Details
    ctx.font = '16px Arial';
    ctx.fillText(`Date: ${new Date(ticket.eventDate).toLocaleDateString()}`, 20, 100);
    ctx.fillText(`Venue: ${ticket.venue}`, 20, 130);
    ctx.fillText(`Token ID: #${ticket.tokenId}`, 20, 160);

    // Download
    const link = document.createElement('a');
    link.download = `ticket-${ticket.tokenId}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleShareTicket = async (ticket: Ticket) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My ticket to ${ticket.eventTitle}`,
          text: `Check out my NFT ticket to ${ticket.eventTitle}!`,
          url: window.location.origin + `/event/${ticket.eventId}`
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `Check out my NFT ticket to ${ticket.eventTitle}! ${window.location.origin}/event/${ticket.eventId}`;
      navigator.clipboard.writeText(shareText);
      alert('Share link copied to clipboard!');
    }
  };

  const handleViewOnBlockchain = (ticket: Ticket) => {
    const networkId = walletState.chainId || 1337;
    let explorerUrl = '';
    
    switch (networkId) {
      case 1:
        explorerUrl = 'https://etherscan.io';
        break;
      case 11155111:
        explorerUrl = 'https://sepolia.etherscan.io';
        break;
      case 4202:
        explorerUrl = 'https://sepolia-blockscout.lisk.com';
        break;
      default:
        explorerUrl = 'http://localhost:8545';
    }
    
    window.open(`${explorerUrl}/token/${contractService.getTicketChainAddress()}?a=${ticket.tokenId}`, '_blank');
  };

  const TicketCard = ({ ticket, isPast = false }: { ticket: Ticket; isPast?: boolean }) => (
    <div
      className={`group relative bg-white/10 backdrop-blur-lg rounded-3xl overflow-hidden border border-white/20 hover:border-white/40 transition-all duration-500 hover:transform hover:scale-105 cursor-pointer ${
        isPast ? 'opacity-75' : ''
      }`}
      onClick={() => setSelectedTicket(ticket)}
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-pink-500/20"></div>
      
      {/* Content */}
      <div className="relative p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span className={`px-3 py-1 rounded-full font-medium ${
              isPast 
                ? 'bg-gray-500/20 text-gray-400' 
                : 'bg-green-500/20 text-green-400'
            }`}>
              {isPast ? 'Past Event' : 'Upcoming'}
            </span>
            {ticket.isSoulbound && (
              <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded-full text-purple-400 text-xs">
                <Shield className="w-3 h-3" />
                Soulbound
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Token ID</div>
            <div className="text-sm font-mono text-white">#{ticket.tokenId}</div>
          </div>
        </div>

        {/* Event Title */}
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
          {ticket.eventTitle}
        </h3>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-300">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">
              {new Date(ticket.eventDate).toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{ticket.venue}</span>
          </div>
          {ticket.seat && (
            <div className="flex items-center gap-2 text-gray-300">
              <QrCode className="w-4 h-4" />
              <span className="text-sm">Seat: {ticket.seat}</span>
            </div>
          )}
        </div>

        {/* QR Code Preview */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-white rounded-lg p-2">
            <img 
              src={ticket.qrCode} 
              alt="QR Code" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadTicket(ticket);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-all duration-300"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShareTicket(ticket);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-all duration-300"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewOnBlockchain(ticket);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-sm font-medium rounded-lg transition-all duration-300"
          >
            <ExternalLink className="w-4 h-4" />
            Blockchain
          </button>
        </div>
      </div>
    </div>
  );

  if (!walletState.connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">My Tickets</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Your NFT ticket collection and proof of attendance
            </p>
          </div>
          
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <QrCode className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h3>
            <p className="text-gray-300 mb-8 max-w-md mx-auto">
              Connect your wallet to view your NFT tickets and proof of attendance records.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">My Tickets</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Your NFT ticket collection and proof of attendance
            </p>
          </div>
          
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-white">
              <Loader className="w-8 h-8 animate-spin" />
              <span className="text-lg">Loading your tickets...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">My Tickets</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Your NFT ticket collection and proof of attendance
            </p>
          </div>
          
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Unable to Load Tickets</h3>
            <p className="text-gray-300 mb-8 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">My Tickets</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Your NFT ticket collection and proof of attendance
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-white mb-2">{tickets.length}</div>
            <div className="text-gray-300">Total Tickets</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-white mb-2">{upcomingTickets.length}</div>
            <div className="text-gray-300">Upcoming Events</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-white mb-2">{soulboundCount}</div>
            <div className="text-gray-300">Soulbound Tickets</div>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <QrCode className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No Tickets Yet</h3>
            <p className="text-gray-300 mb-8 max-w-md mx-auto">
              Start exploring events and purchase your first NFT ticket to build your collection.
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
            >
              Explore Events
            </Link>
          </div>
        ) : (
          <>
            {/* Upcoming Tickets */}
            {upcomingTickets.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Upcoming Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingTickets.map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} />
                  ))}
                </div>
              </div>
            )}

            {/* Past Tickets */}
            {pastTickets.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Past Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastTickets.map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} isPast />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 max-w-md w-full">
            <div className="text-center">
              <div className="w-32 h-32 bg-white rounded-2xl p-4 mx-auto mb-6">
                <img 
                  src={selectedTicket.qrCode} 
                  alt="QR Code" 
                  className="w-full h-full object-contain"
                />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">{selectedTicket.eventTitle}</h3>
              <p className="text-gray-300 mb-6">{selectedTicket.venue}</p>
              
              <div className="space-y-3 text-left mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">Date:</span>
                  <span className="text-white">{new Date(selectedTicket.eventDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Seat:</span>
                  <span className="text-white">{selectedTicket.seat || 'General Admission'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Token ID:</span>
                  <span className="text-white font-mono">#{selectedTicket.tokenId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Minted:</span>
                  <span className="text-white">{new Date(selectedTicket.mintedAt).toLocaleDateString()}</span>
                </div>
                {selectedTicket.isSoulbound && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="flex items-center gap-1 text-purple-400">
                      <Shield className="w-4 h-4" />
                      Soulbound
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => handleDownloadTicket(selectedTicket)}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                >
                  Download
                </button>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="flex-1 py-3 px-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}