import React, { useState } from 'react';
import { Calendar, MapPin, DollarSign, Users, Image, Shield, Camera, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { contractService } from '../utils/contracts';

interface EventFormData {
  title: string;
  description: string;
  date: string;
  venue: string;
  price: string;
  totalSupply: string;
  category: string;
  imageUrl: string;
  isSoulbound: boolean;
  hasPhotoMemories: boolean;
}

export default function CreateEvent() {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    venue: '',
    price: '',
    totalSupply: '',
    category: '',
    imageUrl: '',
    isSoulbound: false,
    hasPhotoMemories: false,
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: target.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    
    try {
      // Create event on blockchain
      const eventData = {
        title: formData.title,
        description: formData.description,
        venue: formData.venue,
        date: new Date(formData.date),
        price: formData.price,
        totalSupply: parseInt(formData.totalSupply),
        category: formData.category,
        isSoulbound: formData.isSoulbound,
        hasPhotoMemories: formData.hasPhotoMemories,
        imageUrl: formData.imageUrl || 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg'
      };

      await contractService.createEvent(eventData);
      
      setIsCreating(false);
      setShowSuccess(true);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        date: '',
        venue: '',
        price: '',
        totalSupply: '',
        category: '',
        imageUrl: '',
        isSoulbound: false,
        hasPhotoMemories: false,
      });
    } catch (error: any) {
      console.error('Error creating event:', error);
      setIsCreating(false);
      alert(`Failed to create event: ${error.message}`);
    }
  };

  const isFormValid = formData.title && formData.description && formData.date && 
                     formData.venue && formData.price && formData.totalSupply && 
                     formData.category;

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Event Created Successfully!</h2>
            <p className="text-gray-300 mb-6">
              Your event has been deployed to the blockchain and is now live for ticket sales.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
              >
                Create Another Event
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full py-3 px-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                View All Events
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Create Event</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Deploy your event to the blockchain and start selling NFT tickets
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Basic Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-medium mb-2">Event Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter event title"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Select category</option>
                  <option value="Conference">Conference</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Art">Art</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Sports">Sports</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Date & Time *</label>
                <input
                  type="datetime-local"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Venue *</label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  placeholder="Enter venue location"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-white font-medium mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your event..."
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                required
              />
            </div>

            <div className="mt-6">
              <label className="block text-white font-medium mb-2">Event Image URL</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Ticket Configuration */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Ticket Configuration</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-medium mb-2">Ticket Price (ETH) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.05"
                  step="0.001"
                  min="0"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Total Supply *</label>
                <input
                  type="number"
                  name="totalSupply"
                  value={formData.totalSupply}
                  onChange={handleInputChange}
                  placeholder="1000"
                  min="1"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Special Features */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Special Features</h2>
            
            {/* Soulbound Option */}
            <div className="mb-8 p-6 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <input
                    type="checkbox"
                    name="isSoulbound"
                    checked={formData.isSoulbound}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-purple-600 bg-white/10 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <label className="text-lg font-semibold text-white">
                      Make Tickets Soulbound (Non-Transferable)
                    </label>
                  </div>
                  <p className="text-gray-300 mb-3">
                    Soulbound tickets are permanently bound to the buyer's wallet and cannot be transferred or resold. 
                    This prevents scalping and ensures authentic community engagement.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>Prevents ticket scalping and secondary market abuse</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>Creates authentic proof of attendance records</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>Builds stronger community connections</span>
                    </div>
                  </div>
                  {formData.isSoulbound && (
                    <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-400">
                          <strong>Important:</strong> Make sure to clearly communicate to your attendees that these tickets cannot be transferred or resold.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Photo Memories Option */}
            <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <input
                    type="checkbox"
                    name="hasPhotoMemories"
                    checked={formData.hasPhotoMemories}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 bg-white/10 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Camera className="w-5 h-5 text-blue-400" />
                    <label className="text-lg font-semibold text-white">
                      Enable Post-Event NFT Photo Memories
                    </label>
                  </div>
                  <p className="text-gray-300 mb-3">
                    Automatically distribute exclusive NFT photo memories to all attendees after the event. 
                    These collectibles come in different rarity tiers and create lasting digital mementos.
                  </p>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                      <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-yellow-400 text-sm">⭐</span>
                      </div>
                      <div className="text-xs font-medium text-yellow-400">Common</div>
                      <div className="text-xs text-gray-400">70% chance</div>
                    </div>
                    <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-blue-400 text-sm">💎</span>
                      </div>
                      <div className="text-xs font-medium text-blue-400">Rare</div>
                      <div className="text-xs text-gray-400">25% chance</div>
                    </div>
                    <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-purple-400 text-sm">👑</span>
                      </div>
                      <div className="text-xs font-medium text-purple-400">Legendary</div>
                      <div className="text-xs text-gray-400">5% chance</div>
                    </div>
                  </div>
                  {formData.hasPhotoMemories && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-400">
                          <strong>Note:</strong> You'll need to upload event photos after the event concludes. Memories will be automatically distributed to all attendees within 1-3 business days.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={!isFormValid || isCreating}
              className="px-12 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Deploying to Blockchain...
                </div>
              ) : (
                'Create Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}