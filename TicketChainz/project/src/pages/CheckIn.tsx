import React, { useState } from 'react';
import { QrCode, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import QRScanner from '../components/QRScanner';
import { useWallet } from '../hooks/useWallet';
import { contractService } from '../utils/contracts';

interface CheckedInTicket {
  ticketId: string;
  eventTitle: string;
  owner: string;
  timestamp: number;
}

export default function CheckIn() {
  const [showScanner, setShowScanner] = useState(false);
  const [checkedInTickets, setCheckedInTickets] = useState<CheckedInTicket[]>([]);
  const [currentEvent, setCurrentEvent] = useState<string>('');
  const { walletState } = useWallet();

  const handleScan = async (ticketData: any) => {
    try {
      // In a real implementation, you'd verify the ticket on the blockchain
      // and mark it as used
      
      const newCheckedIn: CheckedInTicket = {
        ticketId: ticketData.ticketId,
        eventTitle: ticketData.eventTitle,
        owner: ticketData.owner,
        timestamp: Date.now()
      };

      setCheckedInTickets(prev => [newCheckedIn, ...prev]);
      setShowScanner(false);
      
      // Here you would call the smart contract to mark ticket as used
      // await contractService.useTicket(ticketData.ticketId);
      
    } catch (error) {
      console.error('Error checking in ticket:', error);
      alert('Failed to check in ticket');
    }
  };

  if (!walletState.connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Event Check-In</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Scan QR codes to check in attendees to your events
            </p>
          </div>
          
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <QrCode className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h3>
            <p className="text-gray-300 mb-8 max-w-md mx-auto">
              Connect your wallet to access the event check-in system.
            </p>
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Event Check-In</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Scan QR codes to check in attendees to your events
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-white mb-2">{checkedInTickets.length}</div>
            <div className="text-gray-300">Total Check-ins</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {checkedInTickets.filter(t => Date.now() - t.timestamp < 3600000).length}
            </div>
            <div className="text-gray-300">Last Hour</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {new Set(checkedInTickets.map(t => t.eventTitle)).size}
            </div>
            <div className="text-gray-300">Events</div>
          </div>
        </div>

        {/* Scanner Button */}
        <div className="text-center mb-12">
          <button
            onClick={() => setShowScanner(true)}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105"
          >
            <QrCode className="w-6 h-6" />
            Scan Ticket QR Code
          </button>
        </div>

        {/* Recent Check-ins */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Recent Check-ins
          </h2>

          {checkedInTickets.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Check-ins Yet</h3>
              <p className="text-gray-300">Start scanning QR codes to check in attendees.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {checkedInTickets.map((ticket, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{ticket.eventTitle}</div>
                        <div className="text-gray-400 text-sm">Ticket #{ticket.ticketId}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-sm font-mono">
                        {ticket.owner.slice(0, 6)}...{ticket.owner.slice(-4)}
                      </div>
                      <div className="text-gray-400 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(ticket.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}