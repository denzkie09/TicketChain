import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractService } from '../utils/contracts';

export interface WalletState {
  connected: boolean;
  address: string | null;
  balance: string;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
}

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    connected: false,
    address: null,
    balance: '0.00',
    chainId: null,
    isConnecting: false,
    error: null,
  });

  const updateBalance = useCallback(async (address: string) => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balanceWei = await provider.getBalance(address);
        const balance = parseFloat(ethers.utils.formatEther(balanceWei)).toFixed(4);
        
        setWalletState(prev => ({
          ...prev,
          balance
        }));
      }
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      setWalletState(prev => ({
        ...prev,
        error: 'MetaMask not found. Please install MetaMask to continue.'
      }));
      return;
    }

    setWalletState(prev => ({
      ...prev,
      isConnecting: true,
      error: null
    }));

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        
        // Get chain ID
        const chainId = await window.ethereum.request({
          method: 'eth_chainId',
        });

        // Initialize contract service
        await contractService.initialize();
        
        // Update balance
        await updateBalance(address);

        setWalletState(prev => ({
          ...prev,
          connected: true,
          address,
          chainId: parseInt(chainId, 16),
          isConnecting: false,
          error: null
        }));
        
        console.log('Wallet connected:', address);
        console.log('Network:', parseInt(chainId, 16));
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Failed to connect wallet'
      }));
    }
  }, [updateBalance]);

  const disconnectWallet = useCallback(() => {
    setWalletState({
      connected: false,
      address: null,
      balance: '0.00',
      chainId: null,
      isConnecting: false,
      error: null,
    });
    console.log('Wallet disconnected');
  }, []);

  const switchNetwork = useCallback(async (targetChainId: number) => {
    if (typeof window.ethereum === 'undefined') return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error: any) {
      console.error('Error switching network:', error);
      setWalletState(prev => ({
        ...prev,
        error: `Failed to switch network: ${error.message}`
      }));
    }
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== walletState.address) {
          setWalletState(prev => ({
            ...prev,
            address: accounts[0]
          }));
          updateBalance(accounts[0]);
        }
      };

      const handleChainChanged = (chainId: string) => {
        setWalletState(prev => ({
          ...prev,
          chainId: parseInt(chainId, 16)
        }));
        // Reload the page to reset the dapp state
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [walletState.address, updateBalance, disconnectWallet]);

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });

          if (accounts.length > 0) {
            const chainId = await window.ethereum.request({
              method: 'eth_chainId',
            });

            await contractService.initialize();
            await updateBalance(accounts[0]);

            setWalletState(prev => ({
              ...prev,
              connected: true,
              address: accounts[0],
              chainId: parseInt(chainId, 16)
            }));
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();
  }, [updateBalance]);

  return {
    walletState,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    updateBalance: () => walletState.address && updateBalance(walletState.address)
  };
}