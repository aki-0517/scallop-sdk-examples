import { useCurrentAccount, useConnectWallet, useDisconnectWallet, useSuiClientQuery, useWallets } from '@mysten/dapp-kit';
import { formatAddress } from '@mysten/sui/utils';
import { useWalletStore } from '../../stores/walletStore';
import { useEffect } from 'react';

export const WalletButton = () => {
  const currentAccount = useCurrentAccount();
  const { mutate: connectWallet } = useConnectWallet();
  const { mutate: disconnectWallet } = useDisconnectWallet();
  const wallets = useWallets();
  const { setBalance } = useWalletStore();

  // Get account balance
  const { data: balance } = useSuiClientQuery(
    'getBalance',
    {
      owner: currentAccount?.address || '',
    },
    {
      enabled: !!currentAccount?.address,
    }
  );

  // Update wallet store with balance
  useEffect(() => {
    if (balance) {
      const balanceAmount = (Number(balance.totalBalance) / 1e9).toString();
      setBalance(balanceAmount);
    }
  }, [balance, setBalance]);

  const handleConnect = () => {
    // Use the first available wallet
    const firstWallet = wallets[0];
    if (firstWallet) {
      connectWallet(
        { wallet: firstWallet },
        {
          onSuccess: () => {
            console.log('Wallet connected successfully');
          },
          onError: (error) => {
            console.error('Failed to connect wallet:', error);
          },
        }
      );
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  if (currentAccount) {
    const balanceAmount = balance ? Number(balance.totalBalance) / 1e9 : 0;
    
    return (
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-600">
          <div>Balance: {balanceAmount.toFixed(4)} SUI</div>
          <div>Address: {formatAddress(currentAccount.address)}</div>
        </div>
        <button
          onClick={handleDisconnect}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
    >
      Connect Wallet
    </button>
  );
};