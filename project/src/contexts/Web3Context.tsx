import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers';
import PokerGameABI from '../contracts/PokerGameABI.json';

const BSC_CHAIN_ID = '0x38';
const BSC_TESTNET_CHAIN_ID = '0x61';
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';

interface Web3ContextType {
  account: string | null;
  balance: string;
  chainId: string | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  contract: Contract | null;
  provider: BrowserProvider | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [chainId, setChainId] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);

  const isCorrectNetwork = chainId === BSC_CHAIN_ID || chainId === BSC_TESTNET_CHAIN_ID;
  const isConnected = !!account;

  const updateBalance = async (address: string, web3Provider: BrowserProvider) => {
    try {
      const bal = await web3Provider.getBalance(address);
      setBalance(formatEther(bal));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const initContract = async (web3Provider: BrowserProvider) => {
    try {
      if (!CONTRACT_ADDRESS) return;
      const signer = await web3Provider.getSigner();
      const contractInstance = new Contract(CONTRACT_ADDRESS, PokerGameABI, signer);
      setContract(contractInstance);
    } catch (error) {
      console.error('Error initializing contract:', error);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or another Web3 wallet');
      return;
    }

    try {
      const web3Provider = new BrowserProvider(window.ethereum);
      const accounts = await web3Provider.send('eth_requestAccounts', []);
      const network = await web3Provider.getNetwork();

      setAccount(accounts[0]);
      setChainId(`0x${network.chainId.toString(16)}`);
      setProvider(web3Provider);

      await updateBalance(accounts[0], web3Provider);
      await initContract(web3Provider);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setBalance('0');
    setChainId(null);
    setProvider(null);
    setContract(null);
  };

  const switchNetwork = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BSC_TESTNET_CHAIN_ID }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: BSC_TESTNET_CHAIN_ID,
                chainName: 'BSC Testnet',
                nativeCurrency: {
                  name: 'BNB',
                  symbol: 'BNB',
                  decimals: 18,
                },
                rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
                blockExplorerUrls: ['https://testnet.bscscan.com'],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding network:', addError);
        }
      }
    }
  };

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        if (provider) {
          updateBalance(accounts[0], provider);
        }
      } else {
        disconnectWallet();
      }
    };

    const handleChainChanged = (newChainId: string) => {
      setChainId(newChainId);
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    const checkConnection = async () => {
      try {
        const web3Provider = new BrowserProvider(window.ethereum);
        const accounts = await web3Provider.send('eth_accounts', []);
        if (accounts.length > 0) {
          const network = await web3Provider.getNetwork();
          setAccount(accounts[0]);
          setChainId(`0x${network.chainId.toString(16)}`);
          setProvider(web3Provider);
          await updateBalance(accounts[0], web3Provider);
          await initContract(web3Provider);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    };

    checkConnection();

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        account,
        balance,
        chainId,
        isConnected,
        isCorrectNetwork,
        contract,
        provider,
        connectWallet,
        disconnectWallet,
        switchNetwork,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
