import React, { useState, useEffect } from 'react';
import { Plus, Upload, Users, Calendar, Camera, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Event } from '../types';
import { contractService } from '../utils/contracts';
import { useWallet } from '../hooks/useWallet';

interface MemoryUpload {
  title: string;
  description: string;
  imageUrl: string;
}

export default function ManageEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showMemoryUpload, setShowMemoryUpload] = useState(false);
  const [memoryUploads, setMemoryUploads] = useState<MemoryUpload[]>([]);
  const [isDistributing, setIsDistributing] = useState(false);
  const { walletState } = useWallet();

  useEffect(() => {
    const loadEvents = async () => {
      if (!walletState.connected || !walletState.address) {
        setEvents([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        if (contractService.isContractInitialized()) {
          const organizerEvents = await contractService.getEventsByOrganizer(walletState.address);
          setEvents(organizerEvents);
        } else {
          setEvents([]);
        }
      } catch (err: any) {
        console.error('Error loading events:', err);
        setError(err.message || 'Failed to load events');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [walletState.connected, walletState.address]);

  const handleDistributeMemories = async (event: Event) => {
    if (!event.hasPhotoMemories) {
      alert('This event does not have photo memories enabled.');
      return;
    }

    setSelectedEvent(event);
    setShowMemoryUpload(true);
    
    // Initialize with sample memory uploads
    setMemoryUploads([
      {
        title: 'Opening Ceremony',
        description: 'The grand opening of the event with amazing atmosphere',
        imageUrl: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg'
      },
      {
        title: 'Main Stage Performance',
        description: 'Incredible performance on the main stage',
        imageUrl: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg'
      },
      {
        title: 'Networking Session',
        description: 'Great networking opportunities and connections',
        imageUrl: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg'
      }
    ]);
  };

  const addMemoryUpload = () => {
    setMemoryUploads([...memoryUploads, {
      title: '',
      description: '',
      imageUrl: ''
    }]);
  };

  const updateMemoryUpload = (index: number, field: keyof MemoryUpload, value: string) => {
    const updated = [...memoryUploads];
    updated[index][field] = value;
    setMemoryUploads(updated);
  };

  const removeMemoryUpload = (index: number) => {
    setMemoryUploads(memoryUploads.filter((_, i) => i !== index));
  };

  const handleSubmitMemories = async () => {
    if (!selectedEvent || memoryUploads.length === 0) return;

    try {
      setIsDistributing(true);
      
      // Get all attendees for the event
      const attendees = await contractService.getEventAttendees(parseInt(selectedEvent.id));
      
      if (attendees.length === 0) {
        alert('No attendees found for this event.');
        return;
      }

      // Prepare memory data
      const titles = memoryUploads.map(m => m.title);
      const descriptions = memoryUploads.map(m => m.description);
      const imageUrls = memoryUploads.map(m => m.imageUrl);

      // Distribute memories to all attendees
      await contractService.distributeMemories(
        parseInt(selectedEvent.id),
        attendees,
        titles,
        descriptions,
        imageUrls
      );

      alert(`Successfully distributed ${memoryUploads.length} memories to ${attendees.length} attendees!`);
      setShowMemoryUpload(false);
      setSelectedEvent(null);
      setMemoryUploads([]);
      
    } catch (error: any) {
      console.error('Error distributing memories:', error);
      alert(`Failed to distribute memories: ${error.message}`);
    } finally {
      setIsDistributing(false);
    }
  };

  if (!walletState.connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Manage Events</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Manage your events and distribute NFT memories to attendees
            </p>
          </div>
          
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h3>
            <p className="text-gray-300 mb-8 max-w-md mx-auto">
              Connect your wallet to manage your events and distribute NFT memories.
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
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Manage Events</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Manage your events and distribute NFT memories to attendees
            </p>
          </div>
          
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-white">
              <Loader className="w-8 h-8 animate-spin" />
              <span className="text-lg">Loading your events...</span>
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
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Manage Events</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Manage your events and distribute NFT memories to attendees
            </p>
          </div>
          
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Unable to Load Events</h3>
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Manage Events</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Manage your events and distribute NFT memories to attendees
          </p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No Events to Manage</h3>
            <p className="text-gray-300 mb-8 max-w-md mx-auto">
              You haven't created any events yet. Create your first event to start managing tickets and memories.
            </p>
            <Link
              to="/create"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create First Event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white/10 backdrop-blur-lg rounded-3xl overflow-hidden border border-white/20">
                <div className="relative h-48">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white mb-1">{event.title}</h3>
                    <p className="text-gray-300 text-sm">{event.venue}</p>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-300">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {event.totalSupply - event.availableTickets}/{event.totalSupply}
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    {event.isSoulbound && (
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-lg">
                        Soulbound
                      </span>
                    )}
                    {event.hasPhotoMemories && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg">
                        Photo NFTs
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Link
                      to={`/event/${event.id}`}
                      className="block w-full text-center py-2 px-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all duration-300"
                    >
                      View Event
                    </Link>
                    
                    {event.hasPhotoMemories && new Date(event.date) <= new Date() && (
                      <button
                        onClick={() => handleDistributeMemories(event)}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-300"
                      >
                        <Camera className="w-4 h-4" />
                        Distribute Memories
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Memory Upload Modal */}
      {showMemoryUpload && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Distribute Photo Memories</h2>
              <p className="text-gray-300">Upload photos for {selectedEvent.title}</p>
            </div>

            <div className="space-y-6 mb-8">
              {memoryUploads.map((memory, index) => (
                <div key={index} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Memory #{index + 1}</h3>
                    <button
                      onClick={() => removeMemoryUpload(index)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Title</label>
                      <input
                        type="text"
                        value={memory.title}
                        onChange={(e) => updateMemoryUpload(index, 'title', e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Memory title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Image URL</label>
                      <input
                        type="url"
                        value={memory.imageUrl}
                        onChange={(e) => updateMemoryUpload(index, 'imageUrl', e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-white font-medium mb-2">Description</label>
                    <textarea
                      value={memory.description}
                      onChange={(e) => updateMemoryUpload(index, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      placeholder="Describe this memory..."
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={addMemoryUpload}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                Add Memory
              </button>
              
              <div className="flex-1"></div>
              
              <button
                onClick={() => setShowMemoryUpload(false)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition-all duration-300"
              >
                Cancel
              </button>
              
              <button
                onClick={handleSubmitMemories}
                disabled={isDistributing || memoryUploads.length === 0}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
              >
                {isDistributing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Distributing...
                  </div>
                ) : (
                  'Distribute Memories'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}