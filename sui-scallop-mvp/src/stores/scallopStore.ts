import { create } from 'zustand';
import { type AssetInfo, type ObligationInfo, type StakeAccountInfo } from '../types';

interface ScallopStore {
  assets: AssetInfo[];
  obligations: ObligationInfo[];
  stakeAccounts: StakeAccountInfo[];
  loading: boolean;
  error: string | null;
  
  setAssets: (assets: AssetInfo[]) => void;
  setObligations: (obligations: ObligationInfo[]) => void;
  setStakeAccounts: (accounts: StakeAccountInfo[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useScallopStore = create<ScallopStore>((set) => ({
  assets: [],
  obligations: [],
  stakeAccounts: [],
  loading: false,
  error: null,
  
  setAssets: (assets) => set({ assets }),
  setObligations: (obligations) => set({ obligations }),
  setStakeAccounts: (accounts) => set({ stakeAccounts: accounts }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set({ 
    assets: [], 
    obligations: [], 
    stakeAccounts: [], 
    loading: false, 
    error: null 
  }),
}));