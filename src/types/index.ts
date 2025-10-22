export interface Trade {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  entryDate: Date;
  exitDate?: Date;
  pnl?: number;
  pnlPercent?: number;
  commission: number;
  setup?: string;
  notes?: string;
  tags: string[];
  isOpen: boolean;
  stopLoss?: number;
  takeProfit?: number;
  rMultiple?: number;
  duration?: number;
}

export interface TradingStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  expectancy: number;
  maxDrawdown: number;
  averageRMultiple: number;
  largestWin: number;
  largestLoss: number;
  consistency: number;
  recoveryFactor: number;
}

export interface DailyStats {
  date: string;
  pnl: number;
  trades: number;
  winRate: number;
  volume: number;
}

export interface Playbook {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  rules: string[];
  executedTrades: number;
  missedTrades: number;
  winRate: number;
  profitFactor: number;
  expectancy: number;
}

export interface ZellaScore {
  overall: number;
  winLossRatio: number;
  winPercentage: number;
  maxDrawdown: number;
  profitFactor: number;
  recoveryFactor: number;
  consistency: number;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
  broker: string;
}

export interface CalendarDay {
  date: string;
  pnl: number;
  trades: number;
  hasJournal: boolean;
}