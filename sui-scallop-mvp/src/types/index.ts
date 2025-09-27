export interface WalletState {
  connected: boolean;
  address: string | null;
  balance: string;
}

export interface AssetInfo {
  coinName: string;
  symbol: string;
  decimals: number;
  price: number;
  supplyApy: number;
  borrowApy: number;
  totalSupply: string;
  totalBorrow: string;
  collateralFactor: number;
}

export interface ObligationInfo {
  id: string;
  keyId: string;
  collaterals: Array<{
    coinName: string;
    amount: string;
    value: number;
  }>;
  debts: Array<{
    coinName: string;
    amount: string;
    value: number;
  }>;
  healthFactor: number;
  borrowingPower: number;
  liquidationThreshold: number;
}

export interface StakeAccountInfo {
  id: string;
  poolName: string;
  stakedAmount: string;
  rewardAmount: string;
  apy: number;
}

export interface TransactionResult {
  success: boolean;
  txHash?: string;
  error?: string;
}