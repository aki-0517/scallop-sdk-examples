import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useScallop } from '../../hooks/useScallop';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import ScallopService from '../../services/scallopService';
import toast from 'react-hot-toast';

export const DepositWithdraw = () => {
  const { assets, isConnected, refreshData } = useScallop();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [selectedAsset, setSelectedAsset] = useState('');
  const [amount, setAmount] = useState('');
  const [operation, setOperation] = useState<'deposit' | 'withdraw'>('deposit');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !selectedAsset || !amount || !currentAccount?.address) {
      toast.error('Please connect wallet and fill all fields');
      return;
    }

    setIsLoading(true);
    try {
      const scallopBuilder = await ScallopService.getInstance().getBuilder();
      const asset = assets.find(a => a.coinName === selectedAsset);
      if (!asset) {
        throw new Error('Asset not found');
      }

      const amountWithDecimals = Math.floor(parseFloat(amount) * Math.pow(10, asset.decimals));
      
      // Create transaction block using Scallop builder
      const txBlock = scallopBuilder.createTxBlock();
      txBlock.setSender(currentAccount.address);

      if (operation === 'deposit') {
        const result = await txBlock.depositQuick(amountWithDecimals, selectedAsset, false);
        // Transfer the result back to sender to avoid UnusedValueWithoutDrop
        if (result) {
          txBlock.transferObjects([result], currentAccount.address);
        }
      } else {
        const result = await txBlock.withdrawQuick(amountWithDecimals, selectedAsset);
        // Transfer the result back to sender to avoid UnusedValueWithoutDrop
        if (result) {
          txBlock.transferObjects([result], currentAccount.address);
        }
      }

      // Sign and execute transaction using dapp-kit
      signAndExecuteTransaction(
        {
          transaction: txBlock.txBlock,
          chain: 'sui:mainnet',
        },
        {
          onSuccess: (result) => {
            console.log('Transaction successful:', result);
            toast.success(`${operation} successful! TX: ${result.digest.slice(0, 8)}...`);
            setAmount('');
            refreshData();
          },
          onError: (error) => {
            console.error(`${operation} failed:`, error);
            toast.error(`${operation} failed: ${error.message || 'Unknown error'}`);
          },
        }
      );
    } catch (error: any) {
      console.error(`${operation} failed:`, error);
      toast.error(`${operation} failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card title="Deposit/Withdraw">
        <div className="text-center py-8 text-gray-500">
          Please connect your wallet to use deposit/withdraw features
        </div>
      </Card>
    );
  }

  return (
    <Card title="Deposit/Withdraw">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Operation Toggle */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setOperation('deposit')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              operation === 'deposit'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Deposit
          </button>
          <button
            type="button"
            onClick={() => setOperation('withdraw')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              operation === 'withdraw'
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Withdraw
          </button>
        </div>

        {/* Asset Selection */}
        <div>
          <label htmlFor="asset" className="block text-sm font-medium text-gray-700 mb-2">
            Asset
          </label>
          <select
            id="asset"
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select an asset</option>
            {assets.map((asset) => (
              <option key={asset.coinName} value={asset.coinName}>
                {asset.symbol} - {operation === 'deposit' ? asset.supplyApy.toFixed(2) : asset.borrowApy.toFixed(2)}% APY
              </option>
            ))}
          </select>
        </div>

        {/* Amount Input */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            step="0.000001"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Asset Info */}
        {selectedAsset && (
          <div className="bg-gray-50 p-4 rounded-lg">
            {(() => {
              const asset = assets.find(a => a.coinName === selectedAsset);
              if (!asset) return null;
              return (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Price:</span>
                    <span className="ml-2 font-medium">${asset.price.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">
                      {operation === 'deposit' ? 'Supply APY:' : 'Borrow APY:'}
                    </span>
                    <span className="ml-2 font-medium text-green-600">
                      {(operation === 'deposit' ? asset.supplyApy : asset.borrowApy).toFixed(2)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Collateral Factor:</span>
                    <span className="ml-2 font-medium">{(asset.collateralFactor * 100).toFixed(0)}%</span>
                  </div>
                  {amount && (
                    <div>
                      <span className="text-gray-600">USD Value:</span>
                      <span className="ml-2 font-medium">
                        ${(parseFloat(amount) * asset.price).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !selectedAsset || !amount}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
            operation === 'deposit'
              ? 'bg-green-500 hover:bg-green-600 disabled:bg-gray-400'
              : 'bg-red-500 hover:bg-red-600 disabled:bg-gray-400'
          } text-white disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <>
              <LoadingSpinner variant="dots" size="sm" className="mr-2" />
              Processing...
            </>
          ) : (
            `${operation === 'deposit' ? 'Deposit' : 'Withdraw'} ${selectedAsset ? assets.find(a => a.coinName === selectedAsset)?.symbol : ''}`
          )}
        </button>
      </form>
    </Card>
  );
};