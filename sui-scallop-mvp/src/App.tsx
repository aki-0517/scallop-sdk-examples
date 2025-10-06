import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { WalletProvider } from './components/wallet/WalletProvider';
import { Layout } from './components/ui/Layout';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { Dashboard } from './pages/Dashboard';
import { Portfolio } from './pages/Portfolio';
import { useWalletStore } from './stores/walletStore';
import { useScallopStore } from './stores/scallopStore';

type PageType = 'dashboard' | 'portfolio';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const { isInitializing } = useWalletStore();
  const { loading } = useScallopStore();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'portfolio':
        return <Portfolio />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <WalletProvider>
      <Layout>
        {/* Subtle Loading Indicator */}
        {(isInitializing || loading) && (
          <div className="fixed top-4 right-4 z-50">
            <div className="bg-white rounded-lg p-3 shadow-lg border flex items-center space-x-2">
              <LoadingSpinner variant="spinner" size="sm" />
              <span className="text-sm text-gray-600">
                {isInitializing ? 'Connecting...' : 'Loading...'}
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-4">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 'dashboard'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentPage('portfolio')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 'portfolio'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Portfolio
            </button>
          </nav>
        </div>

        {/* Page Content */}
        {renderPage()}
      </Layout>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10B981',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#EF4444',
            },
          },
        }}
      />
    </WalletProvider>
  );
}

export default App;
