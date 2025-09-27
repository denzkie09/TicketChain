import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Shield, Camera, Clock, Star, Gem, Crown, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Event } from '../types';
import { contractService } from '../utils/contracts';
import { useWallet } from '../hooks/useWallet';

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { walletState, connectWallet } = useWallet();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  React.useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        if (contractService.isContractInitialized()) {
          const eventData = await contractService.getEvent(parseInt(id));
          setEvent({
            id: eventData.id.toString(),
            title: eventData.title,
            description: eventData.description,
            venue: eventData.venue,
            date: new Date(eventData.date.toNumber() * 1000).toISOString(),
            price: parseFloat(ethers.utils.formatEther(eventData.price)),
            totalSupply: eventData.totalSupply.toNumber(),
            availableTickets: eventData.availableTickets.toNumber(),
            organizer: eventData.organizer,
            category: eventData.category,
            isSoulbound: eventData.isSoulbound,
            hasPhotoMemories: eventData.hasPhotoMemories,
            imageUrl: eventData.imageUrl
          });
        }
      } catch (err: any) {
        console.error('Error loading event:', err);
        setError(err.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="text-lg">Loading event...</span>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {error || 'Event Not Found'}
          </h2>
          <Link 
            to="/" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Event Not Found</h2>
          <Link to="/" className="text-purple-400 hover:text-purple-300">Return to Home</Link>
        </div>
      </div>
    );
  }

  const soldPercentage = ((event.totalSupply - event.availableTickets) / event.totalSupply) * 100;

  const handlePurchaseTicket = async () => {
    if (!walletState.connected) {
      await connectWallet();
      return;
    }

    try {
      setIsPurchasing(false);
      
      const receipt = await contractService.purchaseTicket(
        parseInt(event.id),
        event.price.toString()
      );
      
      console.log('Ticket purchased:', receipt);
      setPurchaseSuccess(true);
      
      // Update event data
      const updatedEvent = await contractService.getEvent(parseInt(event.id));
      setEvent(prev => prev ? {
        ...prev,
        availableTickets: updatedEvent.availableTickets.toNumber()
      } : null);
      
    } catch (error: any) {
      console.error('Error purchasing ticket:', error);
      alert(`Failed to purchase ticket: ${error.message}`);
    } finally {
      setIsPurchasing(false);
    }
  };

  if (purchaseSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Ticket Purchased!</h2>
            <p className="text-gray-300 mb-6">
              Your NFT ticket for {event.title} has been minted successfully.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/tickets')}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
              >
                View My Tickets
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full py-3 px-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                Explore More Events
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden mb-8">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          
          {/* Special Features Badges */}
          <div className="absolute top-6 left-6 flex flex-col gap-3">
            {event.isSoulbound && (
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-600/90 backdrop-blur-sm rounded-full text-white font-medium">
                <Shield className="w-5 h-5" />
                Soulbound Ticket
              </div>
            )}
            {event.hasPhotoMemories && (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/90 backdrop-blur-sm rounded-full text-white font-medium">
                <Camera className="w-5 h-5" />
                Photo NFT Memories
              </div>
            )}
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="inline-block px-3 py-1 bg-purple-500/30 backdrop-blur-sm rounded-lg text-purple-300 text-sm font-medium mb-2">
                  {event.category}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{event.title}</h1>
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{event.venue}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white mb-1">{event.price} ETH</div>
                <div className="text-gray-300">per ticket</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">About This Event</h2>
              <p className="text-gray-300 leading-relaxed text-lg">{event.description}</p>
            </div>

            {/* Special Features Explanation */}
            {(event.isSoulbound || event.hasPhotoMemories) && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">Special Features</h2>
                <div className="space-y-6">
                  {event.isSoulbound && (
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <Shield className="w-6 h-6 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-2">Soulbound Ticket (Non-Transferable NFT)</h3>
                          <p className="text-gray-300 mb-4">
                            This ticket will be permanently bound to your wallet address and cannot be transferred or sold. 
                            This ensures authentic attendance and prevents scalping.
                          </p>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-green-400">
                              <CheckCircle className="w-4 h-4" />
                              <span>Prevents ticket scalping and fraud</span>
                            </div>
                            <div className="flex items-center gap-2 text-green-400">
                              <CheckCircle className="w-4 h-4" />
                              <span>Builds authentic community engagement</span>
                            </div>
                            <div className="flex items-center gap-2 text-green-400">
                              <CheckCircle className="w-4 h-4" />
                              <span>Permanent proof of attendance</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {event.hasPhotoMemories && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <Camera className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-2">Post-Event NFT Photo Memories</h3>
                          <p className="text-gray-300 mb-4">
                            After the event, you'll automatically receive exclusive NFT photo memories captured during the event. 
                            These collectibles come in different rarity tiers.
                          </p>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                              <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                              <div className="text-sm font-medium text-yellow-400">Common</div>
                              <div className="text-xs text-gray-400">70% chance</div>
                            </div>
                            <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                              <Gem className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                              <div className="text-sm font-medium text-blue-400">Rare</div>
                              <div className="text-xs text-gray-400">25% chance</div>
                            </div>
                            <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                              <Crown className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                              <div className="text-sm font-medium text-purple-400">Legendary</div>
                              <div className="text-xs text-gray-400">5% chance</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Event Details */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Event Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="text-white font-medium">Date & Time</div>
                      <div className="text-gray-300">{new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="text-white font-medium">Venue</div>
                      <div className="text-gray-300">{event.venue}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="text-white font-medium">Organizer</div>
                      <div className="text-gray-300 font-mono">{event.organizer}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="text-white font-medium">Category</div>
                      <div className="text-gray-300">{event.category}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-white mb-2">{event.price} ETH</div>
                <div className="text-gray-300">per ticket</div>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">Availability</span>
                  <span className="text-white">
                    {event.availableTickets}/{event.totalSupply}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${soldPercentage}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-300 mt-2">
                  {Math.round(soldPercentage)}% sold
                </div>
              </div>

              {/* Warning for Soulbound */}
              {event.isSoulbound && (
                <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-amber-400 font-medium text-sm mb-1">Soulbound Ticket</div>
                      <div className="text-gray-300 text-sm">
                        This ticket cannot be transferred or resold after purchase.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Purchase Button */}
              <button
                onClick={handlePurchaseTicket}
                disabled={isPurchasing || event.availableTickets === 0 || new Date(event.date) <= new Date()}
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {isPurchasing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {walletState.connected ? 'Processing...' : 'Connecting...'}
                  </div>
                ) : event.availableTickets === 0 ? (
                  'Sold Out'
                ) : new Date(event.date) <= new Date() ? (
                  'Event Ended'
                ) : !walletState.connected ? (
                  'Connect Wallet to Buy'
                ) : (
                  'Buy Ticket'
                )}
              </button>
            </div>

            {/* Additional Info */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Important Information</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-300">
                <div>• Tickets are issued as NFTs on the Ethereum blockchain</div>
                <div>• You'll need ETH in your wallet to purchase tickets</div>
                <div>• Gas fees apply for all blockchain transactions</div>
                {event.hasPhotoMemories && (
                  <div>• Photo memories will be airdropped 1-3 days after the event</div>
                )}
                {event.isSoulbound && (
                  <div>• Soulbound tickets cannot be transferred after purchase</div>
                )}
                <div>• Make sure you're on the correct network</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}