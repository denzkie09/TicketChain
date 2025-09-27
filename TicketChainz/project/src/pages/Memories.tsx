import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Gem, Crown, Download, Share2, ExternalLink, Loader, AlertCircle } from 'lucide-react';
import { PhotoMemory } from '../types';
import { contractService } from '../utils/contracts';
import { useWallet } from '../hooks/useWallet';

export default function Memories() {
  const [memories, setMemories] = useState<PhotoMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<PhotoMemory | null>(null);
  const [rarityFilter, setRarityFilter] = useState<'all' | 'common' | 'rare' | 'legendary'>('all');
  const { walletState } = useWallet();

  useEffect(() => {
    const loadMemories = async () => {
      if (!walletState.connected || !walletState.address) {
        setMemories([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        if (contractService.isContractInitialized()) {
          const fetchedMemories = await contractService.getMemoriesByOwner(walletState.address);
          setMemories(fetchedMemories);
        } else {
          setMemories([]);
        }
      } catch (err: any) {
        console.error('Error loading memories:', err);
        setError(err.message || 'Failed to load memories');
        setMemories([]);
      } finally {
        setLoading(false);
      }
    };

    loadMemories();
  }, [walletState.connected, walletState.address]);

  const filteredMemories = memories.filter(memory => 
    rarityFilter === 'all' || memory.rarity === rarityFilter
  );

  const commonCount = memories.filter(m => m.rarity === 'common').length;
  const rareCount = memories.filter(m => m.rarity === 'rare').length;
  const legendaryCount = memories.filter(m => m.rarity === 'legendary').length;

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return <Star className="w-5 h-5 text-yellow-400" />;
      case 'rare':
        return <Gem className="w-5 h-5 text-blue-400" />;
      case 'legendary':
        return <Crown className="w-5 h-5 text-purple-400" />;
      default:
        return <Star className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'border-yellow-500/50';
      case 'rare':
        return 'border-blue-500/50';
      case 'legendary':
        return 'border-purple-500/50';
      default:
        return 'border-white/20';
    }
  };

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'from-yellow-500/20 to-yellow-600/20';
      case 'rare':
        return 'from-blue-500/20 to-blue-600/20';
      case 'legendary':
        return 'from-purple-500/20 to-purple-600/20';
      default:
        return 'from-gray-500/20 to-gray-600/20';
    }
  };

  const handleDownload = async (memory: PhotoMemory) => {
    try {
      const response = await fetch(memory.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `memory-${memory.tokenId}-${memory.title.replace(/\s+/g, '-').toLowerCase()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading memory:', error);
      alert('Failed to download memory. Please try again.');
    }
  };

  const handleShare = async (memory: PhotoMemory) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My ${memory.rarity} NFT Memory: ${memory.title}`,
          text: `Check out my ${memory.rarity} NFT memory from ${memory.eventTitle}!`,
          url: memory.imageUrl
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      const shareText = `Check out my ${memory.rarity} NFT memory "${memory.title}" from ${memory.eventTitle}! ${memory.imageUrl}`;
      navigator.clipboard.writeText(shareText);
      alert('Share link copied to clipboard!');
    }
  };

  const handleViewOnBlockchain = (memory: PhotoMemory) => {
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
    
    window.open(`${explorerUrl}/token/${contractService.getPhotoMemoriesAddress()}?a=${memory.tokenId}`, '_blank');
  };

  const MemoryCard = ({ memory }: { memory: PhotoMemory }) => (
    <div
      className={`group relative bg-white/10 backdrop-blur-lg rounded-3xl overflow-hidden border-2 ${getRarityBorder(memory.rarity)} hover:border-white/60 transition-all duration-500 hover:transform hover:scale-105 cursor-pointer`}
      onClick={() => setSelectedMemory(memory)}
    >
      {/* Rarity Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getRarityGradient(memory.rarity)}`}></div>
      
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={memory.imageUrl}
          alt={memory.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Rarity Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm font-medium">
          {getRarityIcon(memory.rarity)}
          <span className="capitalize">{memory.rarity}</span>
        </div>

        {/* Token ID */}
        <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs font-mono">
          #{memory.tokenId}
        </div>
      </div>

      {/* Content */}
      <div className="relative p-6">
        <div className="text-purple-400 text-sm font-medium mb-2">{memory.eventTitle}</div>
        
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
          {memory.title}
        </h3>

        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {memory.description}
        </p>

        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>Minted: {new Date(memory.mintedAt).toLocaleDateString()}</span>
          <span className="capitalize">{memory.rarity}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload(memory);
            }}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-all duration-300"
          >
            <Download className="w-3 h-3" />
            Download
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShare(memory);
            }}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-all duration-300"
          >
            <Share2 className="w-3 h-3" />
            Share
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
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">My NFT Memories</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Your exclusive collection of post-event NFT photo memories
            </p>
          </div>
          
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h3>
            <p className="text-gray-300 mb-8 max-w-md mx-auto">
              Connect your wallet to view your NFT photo memories collection.
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
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">My NFT Memories</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Your exclusive collection of post-event NFT photo memories
            </p>
          </div>
          
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-white">
              <Loader className="w-8 h-8 animate-spin" />
              <span className="text-lg">Loading your memories...</span>
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
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">My NFT Memories</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Your exclusive collection of post-event NFT photo memories
            </p>
          </div>
          
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Unable to Load Memories</h3>
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">My NFT Memories</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Your exclusive collection of post-event NFT photo memories
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-white mb-2">{memories.length}</div>
            <div className="text-gray-300">Total Memories</div>
          </div>
          <div className="bg-yellow-500/10 backdrop-blur-lg rounded-2xl p-6 border border-yellow-500/30 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">{commonCount}</div>
            <div className="text-gray-300 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" />
              Common
            </div>
          </div>
          <div className="bg-blue-500/10 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{rareCount}</div>
            <div className="text-gray-300 flex items-center justify-center gap-1">
              <Gem className="w-4 h-4 text-blue-400" />
              Rare
            </div>
          </div>
          <div className="bg-purple-500/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">{legendaryCount}</div>
            <div className="text-gray-300 flex items-center justify-center gap-1">
              <Crown className="w-4 h-4 text-purple-400" />
              Legendary
            </div>
          </div>
        </div>

        {memories.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No Memories Yet</h3>
            <p className="text-gray-300 mb-8 max-w-md mx-auto">
              You haven't collected any NFT memories yet. Attend events to start building your collection!
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
            {/* Filter */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => setRarityFilter('all')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    rarityFilter === 'all'
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/15'
                  }`}
                >
                  All ({memories.length})
                </button>
                <button
                  onClick={() => setRarityFilter('common')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                    rarityFilter === 'common'
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : 'bg-white/10 text-gray-300 hover:bg-white/15'
                  }`}
                >
                  <Star className="w-4 h-4" />
                  Common ({commonCount})
                </button>
                <button
                  onClick={() => setRarityFilter('rare')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                    rarityFilter === 'rare'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-white/10 text-gray-300 hover:bg-white/15'
                  }`}
                >
                  <Gem className="w-4 h-4" />
                  Rare ({rareCount})
                </button>
                <button
                  onClick={() => setRarityFilter('legendary')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                    rarityFilter === 'legendary'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-white/10 text-gray-300 hover:bg-white/15'
                  }`}
                >
                  <Crown className="w-4 h-4" />
                  Legendary ({legendaryCount})
                </button>
              </div>
            </div>

            {/* Memories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMemories.map((memory) => (
                <MemoryCard key={memory.id} memory={memory} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Memory Detail Modal */}
      {selectedMemory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <img
                src={selectedMemory.imageUrl}
                alt={selectedMemory.title}
                className="w-full h-64 object-cover rounded-2xl mb-4"
              />
              
              <div className="flex items-center justify-center gap-2 mb-2">
                {getRarityIcon(selectedMemory.rarity)}
                <h3 className="text-2xl font-bold text-white">{selectedMemory.title}</h3>
              </div>
              
              <p className="text-purple-400 mb-2">{selectedMemory.eventTitle}</p>
              <p className="text-gray-300 mb-6">{selectedMemory.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-left mb-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-gray-400 text-sm">Token ID</div>
                  <div className="text-white font-mono">#{selectedMemory.tokenId}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-gray-400 text-sm">Rarity</div>
                  <div className="text-white capitalize flex items-center gap-2">
                    {getRarityIcon(selectedMemory.rarity)}
                    {selectedMemory.rarity}
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-gray-400 text-sm">Minted</div>
                  <div className="text-white">{new Date(selectedMemory.mintedAt).toLocaleDateString()}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-gray-400 text-sm">Event</div>
                  <div className="text-white">{selectedMemory.eventTitle}</div>
                </div>
              </div>

              {/* Attributes */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-3">Attributes</h4>
                <div className="grid grid-cols-3 gap-3">
                  {selectedMemory.attributes.map((attr, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-3 text-center">
                      <div className="text-gray-400 text-xs">{attr.trait_type}</div>
                      <div className="text-white text-sm font-medium">{attr.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => handleDownload(selectedMemory)}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  Download
                </button>
                <button
                  onClick={() => handleShare(selectedMemory)}
                  className="flex-1 py-3 px-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
                >
                  <Share2 className="w-4 h-4 inline mr-2" />
                  Share
                </button>
                <button
                  onClick={() => handleViewOnBlockchain(selectedMemory)}
                  className="flex-1 py-3 px-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
                >
                  <ExternalLink className="w-4 h-4 inline mr-2" />
                  Blockchain
                </button>
              </div>
              
              <button
                onClick={() => setSelectedMemory(null)}
                className="mt-4 w-full py-3 px-4 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}