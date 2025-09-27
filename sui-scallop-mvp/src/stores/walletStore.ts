import { create } from 'zustand';

interface WalletStore {
  connected: boolean;
  address: string | null;
  balance: string;
  isInitializing: boolean;
  setConnected: (connected: boolean) => void;
  setAddress: (address: string | null) => void;
  setBalance: (balance: string) => void;
  setInitializing: (initializing: boolean) => void;
  reset: () => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  connected: false,
  address: null,
  balance: '0',
  isInitializing: false,
  setConnected: (connected) => set({ connected }),
  setAddress: (address) => set({ address }),
  setBalance: (balance) => set({ balance }),
  setInitializing: (isInitializing) => set({ isInitializing }),
  reset: () => set({ 
    connected: false, 
    address: null, 
    balance: '0',
    isInitializing: false
  }),
}));