import { useScallop } from '../hooks/useScallop';
import { useWalletStore } from '../stores/walletStore';
import { Card } from '../components/ui/Card';
import { useState, useEffect, useMemo } from 'react';

export const Portfolio = () => {
  const { assets, obligations, isConnected, loadUserDeposits } = useScallop();
  const { balance } = useWalletStore();
  const [userDeposits, setUserDeposits] = useState<{ [coinName: string]: string }>({});
  const [loadingUserDeposits, setLoadingUserDeposits] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const fetchUserDeposits = async () => {
      if (isConnected && assets.length > 0 && !loadingUserDeposits) {
        setLoadingUserDeposits(true);
        try {
          const deposits = await loadUserDeposits();
          setUserDeposits(deposits);
        } catch (error) {
          console.error('Failed to load user deposits:', error);
        } finally {
          setLoadingUserDeposits(false);
        }
      }
    };

    // Debounce the API call to prevent too frequent calls
    if (isConnected && assets.length > 0) {
      timeoutId = setTimeout(fetchUserDeposits, 300);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isConnected, assets.length, loadUserDeposits, loadingUserDeposits]);

  if (!isConnected) {
    return (
      <Card title="Portfolio Overview">
        <div className="text-center py-8 text-gray-500">
          Please connect your wallet to view your portfolio
        </div>
      </Card>
    );
  }

  // Calculate portfolio metrics - memoized to prevent expensive recalculations
  const portfolioMetrics = useMemo(() => {
    const totalCollateralValue = obligations.reduce((total, obligation) => {
      return total + obligation.collaterals.reduce((sum, collateral) => sum + collateral.value, 0);
    }, 0);

    const totalDebtValue = obligations.reduce((total, obligation) => {
      return total + obligation.debts.reduce((sum, debt) => sum + debt.value, 0);
    }, 0);

    const netWorth = totalCollateralValue - totalDebtValue + parseFloat(balance || '0');

    const averageHealthFactor = obligations.length > 0 
      ? obligations.reduce((sum, o) => sum + o.healthFactor, 0) / obligations.length
      : 0;

    return {
      totalCollateralValue,
      totalDebtValue,
      netWorth,
      averageHealthFactor
    };
  }, [obligations, balance]);

  // Calculate asset positions - memoized to prevent expensive recalculations on each render
  const assetPositions = useMemo(() => {
    return assets.map((asset) => {
      // Calculate user's positions for this asset
      const totalSupplied = obligations.reduce((sum, obligation) => {
        const collateral = obligation.collaterals.find(c => c.coinName === asset.coinName);
        return sum + (collateral ? parseFloat(collateral.amount) : 0);
      }, 0);

      const totalBorrowed = obligations.reduce((sum, obligation) => {
        const debt = obligation.debts.find(d => d.coinName === asset.coinName);
        return sum + (debt ? parseFloat(debt.amount) : 0);
      }, 0);

      // Get user's lending pool deposits (sCoin balance)
      const lendingPoolDeposit = parseFloat(userDeposits[asset.coinName] || '0');

      const netAPY = ((lendingPoolDeposit + totalSupplied) * asset.supplyApy - totalBorrowed * asset.borrowApy) / 
        Math.max(lendingPoolDeposit + totalSupplied + totalBorrowed, 1);

      const hasPosition = totalSupplied > 0 || totalBorrowed > 0 || lendingPoolDeposit > 0;

      return {
        ...asset,
        totalSupplied,
        totalBorrowed,
        lendingPoolDeposit,
        netAPY,
        hasPosition
      };
    });
  }, [assets, obligations, userDeposits]);

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <Card title="Portfolio Summary">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">${portfolioMetrics.netWorth.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Net Worth</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">${portfolioMetrics.totalCollateralValue.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Total Collateral</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">${portfolioMetrics.totalDebtValue.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Total Debt</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              portfolioMetrics.averageHealthFactor > 1.5 ? 'text-green-600' :
              portfolioMetrics.averageHealthFactor > 1.2 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {(portfolioMetrics.averageHealthFactor * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Avg Health Factor</div>
          </div>
        </div>
      </Card>

      {/* Asset Breakdown */}
      <Card title="Asset Breakdown">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wallet Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Your Deposits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Borrowed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net APY
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assetPositions.map((assetPosition) => {
                return (
                  <tr key={assetPosition.coinName} className={assetPosition.hasPosition ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {assetPosition.symbol.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{assetPosition.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assetPosition.coinName === 'sui' ? balance : '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-green-600 font-medium">
                          Lending: {assetPosition.lendingPoolDeposit.toFixed(6)}
                        </div>
                        <div className="text-blue-600 font-medium">
                          Collateral: {assetPosition.totalSupplied.toFixed(6)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Total: {(assetPosition.lendingPoolDeposit + assetPosition.totalSupplied).toFixed(6)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      {assetPosition.totalBorrowed.toFixed(6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={assetPosition.netAPY > 0 ? 'text-green-600' : assetPosition.netAPY < 0 ? 'text-red-600' : 'text-gray-600'}>
                        {assetPosition.hasPosition ? `${assetPosition.netAPY.toFixed(2)}%` : '-'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Obligations Detail */}
      {obligations.length > 0 && (
        <Card title="Your Obligations">
          <div className="space-y-4">
            {obligations.map((obligation, index) => (
              <div key={obligation.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium">Obligation #{index + 1}</h4>
                    <p className="text-sm text-gray-600 font-mono">{obligation.id.slice(0, 16)}...</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      obligation.healthFactor > 1.5 ? 'text-green-600' :
                      obligation.healthFactor > 1.2 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {(obligation.healthFactor * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Health Factor</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Collaterals */}
                  <div>
                    <h5 className="font-medium text-green-700 mb-2">Collaterals</h5>
                    {obligation.collaterals.length > 0 ? (
                      <div className="space-y-1">
                        {obligation.collaterals.map((collateral, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{collateral.coinName.toUpperCase()}</span>
                            <span>{collateral.amount} (${collateral.value.toFixed(2)})</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No collaterals</p>
                    )}
                  </div>

                  {/* Debts */}
                  <div>
                    <h5 className="font-medium text-red-700 mb-2">Debts</h5>
                    {obligation.debts.length > 0 ? (
                      <div className="space-y-1">
                        {obligation.debts.map((debt, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{debt.coinName.toUpperCase()}</span>
                            <span>{debt.amount} (${debt.value.toFixed(2)})</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No debts</p>
                    )}
                  </div>
                </div>

                {/* Risk Warning */}
                {obligation.healthFactor < 1.3 && (
                  <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                    <div className="flex items-center">
                      <div className="text-red-600 font-medium text-sm">
                        ⚠️ Liquidation Risk Warning
                      </div>
                    </div>
                    <p className="text-red-600 text-sm mt-1">
                      Your health factor is low. Consider adding more collateral or repaying some debt to avoid liquidation.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* No Obligations */}
      {obligations.length === 0 && (
        <Card title="Get Started">
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              You don't have any active positions yet.
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Start by depositing assets to earn interest</p>
              <p>• Create an obligation to borrow against your collateral</p>
              <p>• Stake your sCoin tokens for additional rewards</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};