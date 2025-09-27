import { useEffect, useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useScallopStore } from '../stores/scallopStore';
import { useWalletStore } from '../stores/walletStore';
import ScallopService from '../services/scallopService';
import toast from 'react-hot-toast';

export const useScallop = () => {
  const currentAccount = useCurrentAccount();
  const { assets, obligations, stakeAccounts, setAssets, setObligations, setStakeAccounts, setLoading, setError } = useScallopStore();
  const { setConnected, setAddress, setBalance, setInitializing } = useWalletStore();
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    if (currentAccount?.address) {
      setConnected(true);
      setAddress(currentAccount.address);
      initializeScallop();
    } else {
      setConnected(false);
      setAddress(null);
      setBalance('0');
      ScallopService.getInstance().reset();
      setClient(null);
    }
  }, [currentAccount, setConnected, setAddress, setBalance]);

  const initializeScallop = async () => {
    if (!currentAccount?.address) return;

    try {
      setInitializing(true);
      setLoading(true);
      
      console.log('Initializing Scallop SDK for address:', currentAccount.address);
      
      // Initialize Scallop SDK with wallet address
      await ScallopService.getInstance().initializeWithWallet(currentAccount.address);
      const scallopClient = await ScallopService.getInstance().getClient();
      setClient(scallopClient);

      // Load all data
      await Promise.all([
        loadMarketData(),
        loadObligations(),
        loadStakeData()
      ]);

      console.log('Scallop initialization completed');
    } catch (error) {
      console.error('Failed to initialize Scallop:', error);
      setError('Failed to initialize Scallop SDK');
      toast.error('Failed to connect to Scallop protocol');
    } finally {
      setLoading(false);
      setInitializing(false);
    }
  };

  const loadMarketData = async () => {
    try {
      const scallopClient = await ScallopService.getInstance().getClient();
      console.log('Loading market data...');
      
      const marketData = await scallopClient.queryMarket();
      console.log('Market data loaded:', marketData);
      
      if (marketData && marketData.pools) {
        const transformedAssets = Object.entries(marketData.pools).map(([coinName, pool]: [string, any]) => ({
          coinName,
          symbol: coinName.toUpperCase(),
          decimals: pool.decimals || 9,
          price: pool.price || 0,
          supplyApy: (pool.supplyApy || 0) * 100,
          borrowApy: (pool.borrowApy || 0) * 100,
          totalSupply: pool.totalSupply || '0',
          totalBorrow: pool.totalBorrow || '0',
          collateralFactor: pool.collateralFactor || 0,
        }));
        
        setAssets(transformedAssets);
        console.log('Assets set:', transformedAssets);
      } else {
        console.warn('No market data found, market might be empty');
        setAssets([]);
      }
    } catch (error) {
      console.error('Failed to load market data:', error);
      setError('Failed to load market data');
      // Don't throw error, just log it
    }
  };

  const loadObligations = async () => {
    if (!currentAccount?.address) return;

    try {
      const scallopClient = await ScallopService.getInstance().getClient();
      console.log('Loading obligations for address:', currentAccount.address);
      
      const obligationsData = await scallopClient.getObligations(currentAccount.address);
      console.log('Obligations data loaded:', obligationsData);
      
      if (obligationsData && Array.isArray(obligationsData)) {
        const transformedObligations = obligationsData.map((obligation: any) => ({
          id: obligation.id,
          keyId: obligation.keyId || obligation.obligationKey,
          collaterals: (obligation.collaterals || []).map((col: any) => ({
            coinName: col.coinName,
            amount: col.amount || '0',
            value: col.value || 0,
          })),
          debts: (obligation.debts || []).map((debt: any) => ({
            coinName: debt.coinName,
            amount: debt.amount || '0',
            value: debt.value || 0,
          })),
          healthFactor: obligation.healthFactor || 0,
          borrowingPower: obligation.borrowingPower || 0,
          liquidationThreshold: obligation.liquidationThreshold || 0,
        }));
        
        setObligations(transformedObligations);
        console.log('Obligations set:', transformedObligations);
      } else {
        console.log('No obligations found for this address');
        setObligations([]);
      }
    } catch (error) {
      console.error('Failed to load obligations:', error);
      // Don't throw error, user might not have obligations yet
      setObligations([]);
    }
  };

  const loadStakeData = async () => {
    if (!currentAccount?.address) return;

    try {
      const scallopClient = await ScallopService.getInstance().getClient();
      console.log('Loading stake accounts for address:', currentAccount.address);
      
      const allStakeAccounts = await scallopClient.getAllStakeAccounts(currentAccount.address);
      console.log('Stake accounts loaded:', allStakeAccounts);
      
      if (allStakeAccounts) {
        const transformedAccounts = Object.entries(allStakeAccounts).flatMap(([poolName, accounts]: [string, any]) =>
          (Array.isArray(accounts) ? accounts : []).map((account: any) => ({
            id: account.id,
            poolName,
            stakedAmount: account.stakedAmount || '0',
            rewardAmount: account.rewardAmount || '0',
            apy: account.apy || 0,
          }))
        );
        
        setStakeAccounts(transformedAccounts);
        console.log('Stake accounts set:', transformedAccounts);
      } else {
        console.log('No stake accounts found for this address');
        setStakeAccounts([]);
      }
    } catch (error) {
      console.error('Failed to load stake data:', error);
      // Don't throw error, user might not have stake accounts yet
      setStakeAccounts([]);
    }
  };

  const refreshData = async () => {
    if (!ScallopService.getInstance().isInitialized()) {
      await initializeScallop();
    } else {
      await Promise.all([
        loadMarketData(),
        loadObligations(),
        loadStakeData()
      ]);
    }
  };

  const loadUserDeposits = async () => {
    if (!currentAccount?.address) return {};

    try {
      const scallopClient = await ScallopService.getInstance().getClient();
      console.log('Loading user deposits for address:', currentAccount.address);
      
      const userDeposits: { [coinName: string]: string } = {};
      
      // Get user's sCoin balances (lending pool deposits)
      for (const asset of assets) {
        try {
          const sCoinName = `s${asset.coinName}`;
          const sCoinAmount = await scallopClient.query.getSCoinAmount(sCoinName, currentAccount.address);
          if (sCoinAmount && sCoinAmount > 0) {
            userDeposits[asset.coinName] = sCoinAmount.toString();
          } else {
            userDeposits[asset.coinName] = '0';
          }
        } catch (error) {
          console.log(`No sCoin balance found for ${asset.coinName}:`, error);
          userDeposits[asset.coinName] = '0';
        }
      }
      
      console.log('User deposits loaded:', userDeposits);
      return userDeposits;
    } catch (error) {
      console.error('Failed to load user deposits:', error);
      return {};
    }
  };

  return {
    client,
    assets,
    obligations,
    stakeAccounts,
    loadMarketData,
    loadObligations,
    loadStakeData,
    loadUserDeposits,
    refreshData,
    isConnected: !!currentAccount?.address,
    walletAddress: currentAccount?.address || null,
  };
};