import { useState } from 'react';
import { useScallop } from '../../hooks/useScallop';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import ScallopService from '../../services/scallopService';
import toast from 'react-hot-toast';

export const ObligationManagement = () => {
  const { assets, obligations, isConnected, refreshData } = useScallop();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState('');
  const [collateralAmount, setCollateralAmount] = useState('');
  const [selectedObligation, setSelectedObligation] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const createObligation = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsCreating(true);
    try {
      const client = await ScallopService.getInstance().getClient();
      const result = await client.openObligation();
      const digest = 'digest' in result ? result.digest : undefined;
      toast.success(`Obligation created!${digest ? ` TX: ${digest.slice(0, 8)}...` : ''}`);
      await refreshData();
    } catch (error: any) {
      console.error('Failed to create obligation:', error);
      toast.error(`Failed to create obligation: ${error.message || 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const depositCollateral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !selectedAsset || !collateralAmount) {
      toast.error('Please fill all fields');
      return;
    }

    setIsProcessing(true);
    try {
      const client = await ScallopService.getInstance().getClient();
      const asset = assets.find(a => a.coinName === selectedAsset);
      if (!asset) {
        throw new Error('Asset not found');
      }

      const amountWithDecimals = Math.floor(parseFloat(collateralAmount) * Math.pow(10, asset.decimals));
      const result = await client.depositCollateral(selectedAsset, amountWithDecimals);
      
      const digest = 'digest' in result ? result.digest : undefined;
      toast.success(`Collateral deposited!${digest ? ` TX: ${digest.slice(0, 8)}...` : ''}`);
      setCollateralAmount('');
      await refreshData();
    } catch (error: any) {
      console.error('Failed to deposit collateral:', error);
      toast.error(`Failed to deposit collateral: ${error.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const withdrawCollateral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !selectedObligation || !selectedAsset || !withdrawAmount) {
      toast.error('Please fill all fields');
      return;
    }

    setIsProcessing(true);
    try {
      const client = await ScallopService.getInstance().getClient();
      const asset = assets.find(a => a.coinName === selectedAsset);
      const obligation = obligations.find(o => o.id === selectedObligation);
      
      if (!asset || !obligation) {
        throw new Error('Asset or obligation not found');
      }

      const amountWithDecimals = Math.floor(parseFloat(withdrawAmount) * Math.pow(10, asset.decimals));
      const result = await client.withdrawCollateral(
        selectedAsset,
        amountWithDecimals,
        true,
        obligation.id,
        obligation.keyId
      );
      
      const digest = 'digest' in result ? result.digest : undefined;
      toast.success(`Collateral withdrawn!${digest ? ` TX: ${digest.slice(0, 8)}...` : ''}`);
      setWithdrawAmount('');
      await refreshData();
    } catch (error: any) {
      console.error('Failed to withdraw collateral:', error);
      toast.error(`Failed to withdraw collateral: ${error.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isConnected) {
    return (
      <Card title="Obligation Management">
        <div className="text-center py-8 text-gray-500">
          Please connect your wallet to manage obligations
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Obligation */}
      <Card title="Create Obligation">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Create an obligation account to start borrowing from Scallop
          </p>
          <button
            onClick={createObligation}
            disabled={isCreating}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center mx-auto"
          >
            {isCreating ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Creating...
              </>
            ) : (
              'Create New Obligation'
            )}
          </button>
        </div>
      </Card>

      {/* Existing Obligations */}
      {obligations.length > 0 && (
        <Card title="Your Obligations">
          <div className="space-y-4">
            {obligations.map((obligation) => (
              <div key={obligation.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-600">Obligation ID</div>
                    <div className="font-mono text-sm">{obligation.id.slice(0, 8)}...</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Health Factor</div>
                    <div className={`font-medium ${
                      obligation.healthFactor > 1.5 ? 'text-green-600' :
                      obligation.healthFactor > 1.2 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {(obligation.healthFactor * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Borrowing Power</div>
                    <div className="font-medium">${obligation.borrowingPower.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Liquidation Threshold</div>
                    <div className="font-medium">{(obligation.liquidationThreshold * 100).toFixed(1)}%</div>
                  </div>
                </div>

                {/* Collaterals */}
                {obligation.collaterals.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Collaterals:</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {obligation.collaterals.map((collateral, index) => (
                        <div key={index} className="bg-white p-2 rounded border">
                          <span className="font-medium">{collateral.coinName.toUpperCase()}</span>
                          <span className="ml-2 text-gray-600">
                            {collateral.amount} (${collateral.value.toFixed(2)})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Debts */}
                {obligation.debts.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Debts:</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {obligation.debts.map((debt, index) => (
                        <div key={index} className="bg-red-50 p-2 rounded border border-red-200">
                          <span className="font-medium text-red-700">{debt.coinName.toUpperCase()}</span>
                          <span className="ml-2 text-red-600">
                            {debt.amount} (${debt.value.toFixed(2)})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Deposit Collateral */}
      <Card title="Deposit Collateral">
        <form onSubmit={depositCollateral} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Asset</label>
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select asset</option>
                {assets.map((asset) => (
                  <option key={asset.coinName} value={asset.coinName}>
                    {asset.symbol} (CF: {(asset.collateralFactor * 100).toFixed(0)}%)
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
                value={collateralAmount}
                onChange={(e) => setCollateralAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isProcessing || !selectedAsset || !collateralAmount}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Processing...
              </>
            ) : (
              'Deposit Collateral'
            )}
          </button>
        </form>
      </Card>

      {/* Withdraw Collateral */}
      {obligations.length > 0 && (
        <Card title="Withdraw Collateral">
          <form onSubmit={withdrawCollateral} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Obligation</label>
                <select
                  value={selectedObligation}
                  onChange={(e) => setSelectedObligation(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select obligation</option>
                  {obligations.map((obligation) => (
                    <option key={obligation.id} value={obligation.id}>
                      {obligation.id.slice(0, 8)}... (Health: {(obligation.healthFactor * 100).toFixed(1)}%)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Asset</label>
                <select
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select asset</option>
                  {assets.map((asset) => (
                    <option key={asset.coinName} value={asset.coinName}>
                      {asset.symbol}
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
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isProcessing || !selectedObligation || !selectedAsset || !withdrawAmount}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Processing...
                </>
              ) : (
                'Withdraw Collateral'
              )}
            </button>
          </form>
        </Card>
      )}
    </div>
  );
};