import { create } from 'zustand';
import { type AssetInfo, type ObligationInfo, type StakeAccountInfo } from '../types';

interface ScallopStore {
  assets: AssetInfo[];
  obligations: ObligationInfo[];
  stakeAccounts: StakeAccountInfo[];
  loading: boolean;
  loadingMarkets: boolean;
  loadingObligations: boolean;
  loadingStakeAccounts: boolean;
  error: string | null;
  
  setAssets: (assets: AssetInfo[]) => void;
  setObligations: (obligations: ObligationInfo[]) => void;
  setStakeAccounts: (accounts: StakeAccountInfo[]) => void;
  setLoading: (loading: boolean) => void;
  setLoadingMarkets: (loading: boolean) => void;
  setLoadingObligations: (loading: boolean) => void;
  setLoadingStakeAccounts: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useScallopStore = create<ScallopStore>((set) => ({
  assets: [],
  obligations: [],
  stakeAccounts: [],
  loading: false,
  loadingMarkets: false,
  loadingObligations: false,
  loadingStakeAccounts: false,
  error: null,
  
  setAssets: (assets) => set({ assets }),
  setObligations: (obligations) => set({ obligations }),
  setStakeAccounts: (accounts) => set({ stakeAccounts: accounts }),
  setLoading: (loading) => set({ loading }),
  setLoadingMarkets: (loading) => set({ loadingMarkets: loading }),
  setLoadingObligations: (loading) => set({ loadingObligations: loading }),
  setLoadingStakeAccounts: (loading) => set({ loadingStakeAccounts: loading }),
  setError: (error) => set({ error }),
  reset: () => set({ 
    assets: [], 
    obligations: [], 
    stakeAccounts: [], 
    loading: false,
    loadingMarkets: false,
    loadingObligations: false,
    loadingStakeAccounts: false,
    error: null 
  }),
}));