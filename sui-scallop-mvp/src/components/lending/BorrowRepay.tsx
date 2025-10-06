import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useScallop } from '../../hooks/useScallop';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import ScallopService from '../../services/scallopService';
import toast from 'react-hot-toast';

export const BorrowRepay = () => {
  const { assets, obligations, isConnected, refreshData } = useScallop();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [selectedAsset, setSelectedAsset] = useState('');
  const [selectedObligation, setSelectedObligation] = useState('');
  const [amount, setAmount] = useState('');
  const [operation, setOperation] = useState<'borrow' | 'repay'>('borrow');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !selectedAsset || !amount || !currentAccount?.address) {
      toast.error('Please connect wallet and fill all fields');
      return;
    }

    if ((operation === 'borrow' || operation === 'repay') && !selectedObligation) {
      toast.error(`Please select an obligation for ${operation}`);
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
      const obligation = obligations.find(o => o.id === selectedObligation);
      if (!obligation) {
        throw new Error('Obligation not found');
      }

      // Create transaction block using Scallop builder
      const txBlock = scallopBuilder.createTxBlock();
      txBlock.setSender(currentAccount.address);
      
      if (operation === 'borrow') {
        const borrowedCoin = await txBlock.borrowQuick(amountWithDecimals, selectedAsset, obligation.id, obligation.keyId);
        // Transfer borrowed coin to sender
        if (borrowedCoin) {
          txBlock.transferObjects([borrowedCoin], currentAccount.address);
        }
      } else {
        // For repay, the function consumes the coin so no transfer needed
        await txBlock.repayQuick(amountWithDecimals, selectedAsset, obligation.id);
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
      <Card title="Borrow/Repay">
        <div className="text-center py-8 text-gray-500">
          Please connect your wallet to use borrow/repay features
        </div>
      </Card>
    );
  }

  return (
    <Card title="Borrow/Repay">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Operation Toggle */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setOperation('borrow')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              operation === 'borrow'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Borrow
          </button>
          <button
            type="button"
            onClick={() => setOperation('repay')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              operation === 'repay'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Repay
          </button>
        </div>

        {/* Obligation Selection */}
        {(operation === 'borrow' || operation === 'repay') && (
          <div>
            <label htmlFor="obligation" className="block text-sm font-medium text-gray-700 mb-2">
              Obligation Account
            </label>
            <select
              id="obligation"
              value={selectedObligation}
              onChange={(e) => setSelectedObligation(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required={operation === 'borrow' || operation === 'repay'}
            >
              <option value="">Select an obligation</option>
              {obligations.map((obligation) => (
                <option key={obligation.id} value={obligation.id}>
                  {obligation.id.slice(0, 8)}... (Health: {(obligation.healthFactor * 100).toFixed(1)}%)
                </option>
              ))}
            </select>
            {obligations.length === 0 && (
              <p className="mt-2 text-sm text-amber-600">
                No obligations found. You need to create an obligation account and deposit collateral first.
              </p>
            )}
          </div>
        )}

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
                {asset.symbol} - {asset.borrowApy.toFixed(2)}% Borrow APY
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

        {/* Obligation Info */}
        {operation === 'borrow' && selectedObligation && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            {(() => {
              const obligation = obligations.find(o => o.id === selectedObligation);
              if (!obligation) return null;
              return (
                <div className="space-y-2 text-sm">
                  <div className="font-medium text-yellow-800">Selected Obligation:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-600">Health Factor:</span>
                      <span className={`ml-2 font-medium ${
                        obligation.healthFactor > 1.5 ? 'text-green-600' :
                        obligation.healthFactor > 1.2 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {(obligation.healthFactor * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Borrowing Power:</span>
                      <span className="ml-2 font-medium">${obligation.borrowingPower.toFixed(2)}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Collaterals:</span>
                      <span className="ml-2">
                        {obligation.collaterals.length > 0 
                          ? obligation.collaterals.map(c => `${c.coinName}: ${c.amount}`).join(', ')
                          : 'None'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

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
                    <span className="text-gray-600">Borrow APY:</span>
                    <span className="ml-2 font-medium text-red-600">
                      {asset.borrowApy.toFixed(2)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Available to Borrow:</span>
                    <span className="ml-2 font-medium">
                      {((parseInt(asset.totalSupply) - parseInt(asset.totalBorrow)) / Math.pow(10, asset.decimals)).toLocaleString()}
                    </span>
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
          disabled={isLoading || !selectedAsset || !amount || ((operation === 'borrow' || operation === 'repay') && !selectedObligation)}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
            operation === 'borrow'
              ? 'bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400'
              : 'bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400'
          } text-white disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <>
              <LoadingSpinner variant="dots" size="sm" className="mr-2" />
              Processing...
            </>
          ) : (
            `${operation === 'borrow' ? 'Borrow' : 'Repay'} ${selectedAsset ? assets.find(a => a.coinName === selectedAsset)?.symbol : ''}`
          )}
        </button>
      </form>
    </Card>
  );
};