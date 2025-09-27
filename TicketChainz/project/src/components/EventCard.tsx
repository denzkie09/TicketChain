import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Shield, Camera, Eye } from 'lucide-react';
import { Event } from '../types';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const soldPercentage = ((event.totalSupply - event.availableTickets) / event.totalSupply) * 100;

  return (
    <div className="group relative bg-white/10 backdrop-blur-lg rounded-3xl overflow-hidden border border-white/20 hover:border-white/40 transition-all duration-500 hover:transform hover:scale-105">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Special Features Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {event.isSoulbound && (
            <div className="flex items-center gap-1 px-3 py-1 bg-purple-600/90 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              <Shield className="w-4 h-4" />
              Soulbound
            </div>
          )}
          {event.hasPhotoMemories && (
            <div className="flex items-center gap-1 px-3 py-1 bg-blue-600/90 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              <Camera className="w-4 h-4" />
              Photo NFTs
            </div>
          )}
        </div>

        {/* Price Badge */}
        <div className="absolute top-4 right-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white font-bold">
          {event.price} ETH
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-2 text-purple-400 text-sm font-medium mb-2">
          <span className="px-2 py-1 bg-purple-500/20 rounded-lg">{event.category}</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
          {event.title}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-300">
            <Calendar className="w-4 h-4" />
            <span>{new Date(event.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin className="w-4 h-4" />
            <span>{event.venue}</span>
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* Availability */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300">Availability</span>
            <span className="text-sm text-white font-medium">
              {event.availableTickets}/{event.totalSupply}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${soldPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Special Features Info */}
        {(event.isSoulbound || event.hasPhotoMemories) && (
          <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">Special Features</span>
            </div>
            <div className="space-y-1 text-xs text-gray-300">
              {event.isSoulbound && (
                <div>• Non-transferable ticket (prevents scalping)</div>
              )}
              {event.hasPhotoMemories && (
                <div>• Exclusive post-event NFT photo memories</div>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Link
          to={`/event/${event.id}`}
          className="block w-full text-center py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}