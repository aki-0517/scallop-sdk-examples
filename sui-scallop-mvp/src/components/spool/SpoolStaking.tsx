import { useState, useEffect } from 'react';
import { useScallop } from '../../hooks/useScallop';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import ScallopService from '../../services/scallopService';
import toast from 'react-hot-toast';

const SPOOL_ASSETS = ['ssui', 'swusdc', 'swusdt'];

export const SpoolStaking = () => {
  const { stakeAccounts, isConnected, refreshData } = useScallop();
  const [selectedPool, setSelectedPool] = useState('ssui');
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [poolData, setPoolData] = useState<any>({});

  useEffect(() => {
    if (isConnected) {
      loadStakeData();
    }
  }, [isConnected]);

  const loadStakeData = async () => {
    if (!isConnected) return;

    try {
      setIsLoading(true);
      const client = await ScallopService.getInstance().getClient();
      
      // Load pool data for each spool
      const poolDataMap: any = {};
      for (const poolName of SPOOL_ASSETS) {
        try {
          const stakePool = await client.getStakePool(poolName);
          const rewardPool = await client.getStakeRewardPool(poolName);
          poolDataMap[poolName] = {
            ...stakePool,
            rewardPool,
            totalStaked: stakePool?.totalStaked || '0',
            apy: (stakePool as any)?.apy || 0,
          };
          console.log(`Pool data for ${poolName}:`, poolDataMap[poolName]);
        } catch (error) {
          console.error(`Failed to load pool data for ${poolName}:`, error);
          poolDataMap[poolName] = {
            totalStaked: '0',
            apy: 0,
          };
        }
      }
      setPoolData(poolDataMap);
      console.log('All pool data loaded:', poolDataMap);
    } catch (error) {
      console.error('Failed to load stake data:', error);
      toast.error('Failed to load stake data');
      setPoolData({});
    } finally {
      setIsLoading(false);
    }
  };

  const createStakeAccount = async (poolName: string) => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsLoading(true);
    try {
      const client = await ScallopService.getInstance().getClient();
      const result = await client.createStakeAccount(poolName);
      const digest = 'digest' in result ? result.digest : undefined;
      toast.success(`Stake account created for ${poolName}!${digest ? ` TX: ${digest.slice(0, 8)}...` : ''}`);
      await refreshData();
    } catch (error: any) {
      console.error('Failed to create stake account:', error);
      toast.error(`Failed to create stake account: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !stakeAmount) {
      toast.error('Please connect wallet and enter amount');
      return;
    }

    setIsLoading(true);
    try {
      const client = await ScallopService.getInstance().getClient();
      const amountWithDecimals = Math.floor(parseFloat(stakeAmount) * Math.pow(10, 9)); // Assuming 9 decimals
      const result = await client.stake(selectedPool, amountWithDecimals);
      
      const digest = 'digest' in result ? result.digest : undefined;
      toast.success(`Staked ${stakeAmount} ${selectedPool.toUpperCase()}!${digest ? ` TX: ${digest.slice(0, 8)}...` : ''}`);
      setStakeAmount('');
      await refreshData();
    } catch (error: any) {
      console.error('Staking failed:', error);
      toast.error(`Staking failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnstake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !unstakeAmount) {
      toast.error('Please connect wallet and enter amount');
      return;
    }

    setIsLoading(true);
    try {
      const client = await ScallopService.getInstance().getClient();
      const amountWithDecimals = Math.floor(parseFloat(unstakeAmount) * Math.pow(10, 9)); // Assuming 9 decimals
      const result = await client.unstake(selectedPool, amountWithDecimals);
      
      const digest = 'digest' in result ? result.digest : undefined;
      toast.success(`Unstaked ${unstakeAmount} ${selectedPool.toUpperCase()}!${digest ? ` TX: ${digest.slice(0, 8)}...` : ''}`);
      setUnstakeAmount('');
      await refreshData();
    } catch (error: any) {
      console.error('Unstaking failed:', error);
      toast.error(`Unstaking failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaim = async (poolName: string) => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsLoading(true);
    try {
      const client = await ScallopService.getInstance().getClient();
      const result = await client.claim(poolName);
      const digest = 'digest' in result ? result.digest : undefined;
      toast.success(`Rewards claimed for ${poolName}!${digest ? ` TX: ${digest.slice(0, 8)}...` : ''}`);
      await refreshData();
    } catch (error: any) {
      console.error('Claim failed:', error);
      toast.error(`Claim failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card title="Spool Staking">
        <div className="text-center py-8 text-gray-500">
          Please connect your wallet to use staking features
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pools Overview */}
      <Card title="Available Pools">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner variant="dots" size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SPOOL_ASSETS.map((poolName) => {
              const pool = poolData[poolName] || {};
              const userStake = stakeAccounts.find((a: any) => a.poolName === poolName);
              
              return (
                <div key={poolName} className="border rounded-lg p-4 bg-gray-50">
                  <div className="text-lg font-semibold mb-2">{poolName.toUpperCase()}</div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">APY:</span>
                      <span className="ml-2 font-medium text-green-600">{(pool.apy || 0).toFixed(2)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Staked:</span>
                      <span className="ml-2 font-medium">
                        {(parseInt(pool.totalStaked || '0') / Math.pow(10, 9)).toLocaleString()}
                      </span>
                    </div>
                    {userStake && (
                      <>
                        <div>
                          <span className="text-gray-600">Your Stake:</span>
                          <span className="ml-2 font-medium">{userStake.stakedAmount}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Rewards:</span>
                          <span className="ml-2 font-medium text-green-600">{userStake.rewardAmount}</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    {!userStake && (
                      <button
                        onClick={() => createStakeAccount(poolName)}
                        disabled={isLoading}
                        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                      >
                        Create Account
                      </button>
                    )}
                    {userStake && parseFloat(userStake.rewardAmount) > 0 && isConnected && (
                      <button
                        onClick={() => handleClaim(poolName)}
                        disabled={isLoading}
                        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                      >
                        Claim Rewards
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Staking Interface */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stake */}
        <Card title="Stake">
          <form onSubmit={handleStake} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pool</label>
              <select
                value={selectedPool}
                onChange={(e) => setSelectedPool(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {SPOOL_ASSETS.map((poolName) => (
                  <option key={poolName} value={poolName}>
                    {poolName.toUpperCase()} - {(poolData[poolName]?.apy || 0).toFixed(2)}% APY
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
              <input
                type="number"
                step="0.000001"
                min="0"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="Enter amount to stake"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !stakeAmount}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner variant="dots" size="sm" className="mr-2" />
                  Processing...
                </>
              ) : (
                `Stake ${selectedPool.toUpperCase()}`
              )}
            </button>
          </form>
        </Card>

        {/* Unstake */}
        <Card title="Unstake">
          <form onSubmit={handleUnstake} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pool</label>
              <select
                value={selectedPool}
                onChange={(e) => setSelectedPool(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {SPOOL_ASSETS.map((poolName) => (
                  <option key={poolName} value={poolName}>
                    {poolName.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
              <input
                type="number"
                step="0.000001"
                min="0"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                placeholder="Enter amount to unstake"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !unstakeAmount}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner variant="dots" size="sm" className="mr-2" />
                  Processing...
                </>
              ) : (
                `Unstake ${selectedPool.toUpperCase()}`
              )}
            </button>
          </form>
        </Card>
      </div>

      {/* Your Stake Accounts */}
      {stakeAccounts.length > 0 && (
        <Card title="Your Stake Accounts">
          <div className="space-y-4">
            {stakeAccounts.map((account: any) => (
              <div key={account.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Pool</div>
                    <div className="font-medium">{account.poolName.toUpperCase()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Staked Amount</div>
                    <div className="font-medium">{account.stakedAmount}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Pending Rewards</div>
                    <div className="font-medium text-green-600">{account.rewardAmount}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">APY</div>
                    <div className="font-medium">{account.apy.toFixed(2)}%</div>
                  </div>
                </div>
                
                {parseFloat(account.rewardAmount) > 0 && (
                  <div className="mt-4">
                    <button
                      onClick={() => handleClaim(account.poolName)}
                      disabled={isLoading}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                    >
                      Claim {account.rewardAmount} Rewards
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};