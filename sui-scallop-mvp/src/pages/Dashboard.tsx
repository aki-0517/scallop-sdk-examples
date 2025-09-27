import { useState } from 'react';
import { MarketOverview } from '../components/lending/MarketOverview';
import { DepositWithdraw } from '../components/lending/DepositWithdraw';
import { BorrowRepay } from '../components/lending/BorrowRepay';
import { ObligationManagement } from '../components/lending/ObligationManagement';
import { SpoolStaking } from '../components/spool/SpoolStaking';

type TabType = 'market' | 'deposit' | 'borrow' | 'obligations' | 'staking';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('market');

  const tabs = [
    { id: 'market' as TabType, label: 'Market Overview', color: 'blue' },
    { id: 'deposit' as TabType, label: 'Deposit/Withdraw', color: 'green' },
    { id: 'borrow' as TabType, label: 'Borrow/Repay', color: 'orange' },
    { id: 'obligations' as TabType, label: 'Obligations', color: 'purple' },
    { id: 'staking' as TabType, label: 'Staking', color: 'indigo' },
  ];

  const getTabColorClass = (tabId: TabType, color: string) => {
    const isActive = activeTab === tabId;
    const colorClasses = {
      blue: isActive ? 'bg-blue-500 text-white' : 'text-blue-600 hover:bg-blue-50',
      green: isActive ? 'bg-green-500 text-white' : 'text-green-600 hover:bg-green-50',
      orange: isActive ? 'bg-orange-500 text-white' : 'text-orange-600 hover:bg-orange-50',
      purple: isActive ? 'bg-purple-500 text-white' : 'text-purple-600 hover:bg-purple-50',
      indigo: isActive ? 'bg-indigo-500 text-white' : 'text-indigo-600 hover:bg-indigo-50',
    };
    return colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'market':
        return <MarketOverview />;
      case 'deposit':
        return <DepositWithdraw />;
      case 'borrow':
        return <BorrowRepay />;
      case 'obligations':
        return <ObligationManagement />;
      case 'staking':
        return <SpoolStaking />;
      default:
        return <MarketOverview />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-current'
                  : 'border-transparent'
              } ${getTabColorClass(tab.id, tab.color)}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {renderContent()}
      </div>
    </div>
  );
};