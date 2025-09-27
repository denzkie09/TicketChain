import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, Menu, X, Ticket, Plus, Image, Shield, Camera, Settings, QrCode } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { walletState, connectWallet, disconnectWallet } = useWallet();
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: Ticket },
    { name: 'My Tickets', href: '/tickets', icon: Shield },
    { name: 'My Memories', href: '/memories', icon: Camera },
    { name: 'Manage Events', href: '/manage', icon: Settings },
    { name: 'Check-In', href: '/checkin', icon: QrCode },
    { name: 'Create Event', href: '/create', icon: Plus },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">TicketChain</h1>
              <div className="text-xs text-gray-400">Web3 Ticketing</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                    isActive(item.href)
                      ? 'bg-white/20 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium whitespace-nowrap">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Wallet Connection */}
          <div className="hidden md:flex items-center gap-2 min-w-0 flex-shrink-0">
            {walletState.connected ? (
              <div className="flex items-center gap-2 min-w-0">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/20 min-w-0">
                  <div className="text-xs text-gray-300">Balance</div>
                  <div className="text-white font-semibold text-xs">{walletState.balance} ETH</div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="flex items-center gap-1 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl px-2 py-2 border border-white/20 text-white transition-all duration-300 min-w-0"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="font-mono text-xs truncate">
                    {walletState.address?.slice(0, 6)}...{walletState.address?.slice(-4)}
                  </span>
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-3 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 whitespace-nowrap text-sm"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 ${
                      isActive(item.href)
                        ? 'bg-white/20 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Wallet Connection */}
            <div className="mt-4 pt-4 border-t border-white/10">
              {walletState.connected ? (
                <div className="space-y-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <div className="text-sm text-gray-300">Wallet Balance</div>
                    <div className="text-white font-semibold">{walletState.balance} ETH</div>
                    <div className="text-xs text-gray-400 font-mono mt-1">
                      {walletState.address}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      disconnectWallet();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-3 rounded-xl transition-all duration-300"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    connectWallet();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-4 py-3 rounded-xl transition-all duration-300"
                >
                  <Wallet className="w-5 h-5" />
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}