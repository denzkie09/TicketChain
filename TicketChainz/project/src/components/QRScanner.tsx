import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react';
import { verifyTicketQR } from '../utils/qrcode';

interface QRScannerProps {
  onScan: (ticketData: any) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        setError(null);
      }
    } catch (err) {
      setError('Camera access denied or not available');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  const captureAndScan = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    // In a real implementation, you'd use a QR code scanning library here
    // For demo purposes, we'll simulate scanning
    simulateQRScan();
  };

  const simulateQRScan = () => {
    // Simulate QR code scanning - in reality you'd use a library like jsQR
    const mockQRData = {
      ticketId: "123",
      eventId: "1",
      eventTitle: "Web3 Summit 2024",
      owner: "0x1234...5678",
      timestamp: Date.now()
    };

    try {
      const isValid = verifyTicketQR(JSON.stringify(mockQRData));
      if (isValid) {
        setScannedData(mockQRData);
        onScan(mockQRData);
      } else {
        setError('Invalid QR code');
      }
    } catch (err) {
      setError('Failed to scan QR code');
    }
  };

  const handleManualInput = (qrText: string) => {
    try {
      const ticketData = JSON.parse(qrText);
      const isValid = verifyTicketQR(qrText);
      
      if (isValid) {
        setScannedData(ticketData);
        onScan(ticketData);
      } else {
        setError('Invalid ticket QR code');
      }
    } catch (err) {
      setError('Invalid QR code format');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Scan Ticket QR Code</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {scannedData && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Valid Ticket Scanned!</span>
            </div>
            <div className="text-xs text-gray-300">
              <div>Event: {scannedData.eventTitle}</div>
              <div>Ticket ID: #{scannedData.ticketId}</div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Camera View */}
          <div className="relative bg-black rounded-xl overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-64 object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white/50 rounded-lg">
                  <div className="w-full h-full border border-white/30 rounded-lg animate-pulse"></div>
                </div>
              </div>
            )}
          </div>

          {/* Scan Button */}
          <button
            onClick={captureAndScan}
            disabled={!isScanning}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
          >
            <Camera className="w-5 h-5" />
            {isScanning ? 'Scan QR Code' : 'Camera Not Available'}
          </button>

          {/* Manual Input */}
          <div className="border-t border-white/20 pt-4">
            <label className="block text-white font-medium mb-2 text-sm">
              Or paste QR code data manually:
            </label>
            <textarea
              placeholder="Paste QR code JSON data here..."
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
              rows={3}
              onChange={(e) => {
                if (e.target.value.trim()) {
                  handleManualInput(e.target.value.trim());
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}