import { Trade, TradingStats, ZellaScore } from '../types';

export const calculatePnL = (trade: Trade): number => {
  if (!trade.exitPrice) return 0;
  
  const pnl = trade.side === 'long' 
    ? (trade.exitPrice - trade.entryPrice) * trade.quantity - trade.commission
    : (trade.entryPrice - trade.exitPrice) * trade.quantity - trade.commission;
  
  return Number(pnl.toFixed(2));
};

export const calculatePnLPercent = (trade: Trade): number => {
  if (!trade.exitPrice) return 0;
  
  const pnl = calculatePnL(trade);
  const cost = trade.entryPrice * trade.quantity;
  return Number(((pnl / cost) * 100).toFixed(2));
};

export const calculateRMultiple = (trade: Trade): number => {
  if (!trade.exitPrice || !trade.stopLoss) return 0;
  
  const pnl = calculatePnL(trade);
  const risk = trade.side === 'long' 
    ? (trade.entryPrice - trade.stopLoss) * trade.quantity
    : (trade.stopLoss - trade.entryPrice) * trade.quantity;
  
  if (risk <= 0) return 0;
  return Number((pnl / risk).toFixed(2));
};

export const calculateDuration = (trade: Trade): number => {
  if (!trade.exitDate) return 0;
  return Math.floor((trade.exitDate.getTime() - trade.entryDate.getTime()) / (1000 * 60 * 60 * 24));
};

export const calculateTradingStats = (trades: Trade[]): TradingStats => {
  const closedTrades = trades.filter(trade => !trade.isOpen && trade.exitPrice);
  
  if (closedTrades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      totalPnL: 0,
      averageWin: 0,
      averageLoss: 0,
      profitFactor: 0,
      expectancy: 0,
      maxDrawdown: 0,
      averageRMultiple: 0,
      largestWin: 0,
      largestLoss: 0,
      consistency: 0,
      recoveryFactor: 0,
    };
  }

  const tradesWithPnL = closedTrades.map(trade => ({
    ...trade,
    pnl: calculatePnL(trade),
    rMultiple: calculateRMultiple(trade),
  }));

  const winningTrades = tradesWithPnL.filter(trade => trade.pnl > 0);
  const losingTrades = tradesWithPnL.filter(trade => trade.pnl < 0);
  const breakEvenTrades = tradesWithPnL.filter(trade => trade.pnl === 0);

  const totalPnL = tradesWithPnL.reduce((sum, trade) => sum + trade.pnl, 0);
  const totalWinnings = winningTrades.reduce((sum, trade) => sum + trade.pnl, 0);
  const totalLosses = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0));

  const winRate = (winningTrades.length / closedTrades.length) * 100;
  const averageWin = winningTrades.length > 0 ? totalWinnings / winningTrades.length : 0;
  const averageLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;
  const profitFactor = totalLosses > 0 ? totalWinnings / totalLosses : totalWinnings > 0 ? Infinity : 0;
  const expectancy = closedTrades.length > 0 ? totalPnL / closedTrades.length : 0;

  // Calculate max drawdown
  let runningBalance = 0;
  let peak = 0;
  let maxDrawdown = 0;

  tradesWithPnL.forEach(trade => {
    runningBalance += trade.pnl;
    if (runningBalance > peak) {
      peak = runningBalance;
    }
    const drawdown = peak - runningBalance;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });

  const averageRMultiple = tradesWithPnL
    .filter(trade => trade.rMultiple !== 0)
    .reduce((sum, trade) => sum + trade.rMultiple, 0) / 
    Math.max(1, tradesWithPnL.filter(trade => trade.rMultiple !== 0).length);

  const largestWin = winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.pnl)) : 0;
  const largestLoss = losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.pnl)) : 0;

  // Calculate consistency (standard deviation of returns)
  const dailyReturns = tradesWithPnL.map(trade => trade.pnl);
  const avgReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length;
  const variance = dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / dailyReturns.length;
  const stdDev = Math.sqrt(variance);
  const consistency = avgReturn !== 0 ? Math.abs(avgReturn) / stdDev : 0;

  // Recovery factor
  const recoveryFactor = maxDrawdown > 0 ? totalPnL / maxDrawdown : totalPnL > 0 ? Infinity : 0;

  return {
    totalTrades: closedTrades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate: Number(winRate.toFixed(2)),
    totalPnL: Number(totalPnL.toFixed(2)),
    averageWin: Number(averageWin.toFixed(2)),
    averageLoss: Number(averageLoss.toFixed(2)),
    profitFactor: Number(profitFactor.toFixed(2)),
    expectancy: Number(expectancy.toFixed(2)),
    maxDrawdown: Number(maxDrawdown.toFixed(2)),
    averageRMultiple: Number(averageRMultiple.toFixed(2)),
    largestWin: Number(largestWin.toFixed(2)),
    largestLoss: Number(largestLoss.toFixed(2)),
    consistency: Number(consistency.toFixed(2)),
    recoveryFactor: Number(recoveryFactor.toFixed(2)),
  };
};

export const calculateZellaScore = (stats: TradingStats): ZellaScore => {
  // Zella Score calculation based on TradeZella's methodology
  const calculateMetricScore = (value: number, thresholds: number[]): number => {
    for (let i = 0; i < thresholds.length; i++) {
      if (value >= thresholds[i]) {
        return 100 - (i * 10);
      }
    }
    return 20;
  };

  // Average Win/Loss Ratio scoring
  const winLossRatio = stats.averageLoss > 0 ? stats.averageWin / stats.averageLoss : stats.averageWin > 0 ? 100 : 50;
  const winLossScore = calculateMetricScore(winLossRatio, [2.6, 2.4, 2.2, 2.0, 1.9, 1.8]);

  // Win Percentage scoring (with 60% as top threshold)
  const winPercentageScore = Math.min(100, (stats.winRate / 60) * 100);

  // Max Drawdown scoring (lower is better)
  const maxDrawdownScore = Math.max(0, 100 - (stats.maxDrawdown / stats.totalPnL) * 100);

  // Profit Factor scoring
  const profitFactorScore = calculateMetricScore(stats.profitFactor, [2.6, 2.4, 2.2, 2.0, 1.9, 1.8]);

  // Recovery Factor scoring
  const recoveryFactorScore = calculateMetricScore(stats.recoveryFactor, [3.5, 3.0, 2.5, 2.0, 1.5, 1.0]);

  // Consistency scoring (higher is better)
  const consistencyScore = Math.min(100, stats.consistency * 10);

  // Weighted overall score
  const weights = {
    recoveryFactor: 0.1,
    winPercentage: 0.15,
    winLossRatio: 0.2,
    profitFactor: 0.25,
    maxDrawdown: 0.2,
    consistency: 0.1,
  };

  const overallScore = 
    recoveryFactorScore * weights.recoveryFactor +
    winPercentageScore * weights.winPercentage +
    winLossScore * weights.winLossRatio +
    profitFactorScore * weights.profitFactor +
    maxDrawdownScore * weights.maxDrawdown +
    consistencyScore * weights.consistency;

  return {
    overall: Number(overallScore.toFixed(1)),
    winLossRatio: Number(winLossScore.toFixed(1)),
    winPercentage: Number(winPercentageScore.toFixed(1)),
    maxDrawdown: Number(maxDrawdownScore.toFixed(1)),
    profitFactor: Number(profitFactorScore.toFixed(1)),
    recoveryFactor: Number(recoveryFactorScore.toFixed(1)),
    consistency: Number(consistencyScore.toFixed(1)),
  };
};

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export const generateSampleTrades = (): Trade[] => {
  const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX'];
  const setups = ['Breakout', 'Pullback', 'Support/Resistance', 'Trend Following', 'Reversal'];
  const trades: Trade[] = [];

  for (let i = 0; i < 50; i++) {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const side = Math.random() > 0.5 ? 'long' : 'short';
    const entryPrice = 50 + Math.random() * 200;
    const quantity = Math.floor(Math.random() * 100) + 10;
    const entryDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const isOpen = Math.random() > 0.8;
    
    let exitPrice, exitDate, stopLoss, takeProfit;
    
    if (!isOpen) {
      const priceChange = (Math.random() - 0.5) * 0.2; // ±10% price change
      exitPrice = entryPrice * (1 + priceChange);
      exitDate = new Date(entryDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
    }

    if (side === 'long') {
      stopLoss = entryPrice * (0.95 + Math.random() * 0.03); // 2-5% below entry
      takeProfit = entryPrice * (1.05 + Math.random() * 0.1); // 5-15% above entry
    } else {
      stopLoss = entryPrice * (1.02 + Math.random() * 0.03); // 2-5% above entry
      takeProfit = entryPrice * (0.9 + Math.random() * 0.05); // 5-10% below entry
    }

    const trade: Trade = {
      id: `trade-${i + 1}`,
      symbol,
      side,
      entryPrice: Number(entryPrice.toFixed(2)),
      exitPrice: exitPrice ? Number(exitPrice.toFixed(2)) : undefined,
      quantity,
      entryDate,
      exitDate,
      commission: Number((quantity * 0.01).toFixed(2)), // $0.01 per share
      setup: setups[Math.floor(Math.random() * setups.length)],
      notes: `Sample trade ${i + 1}`,
      tags: ['Sample'],
      isOpen,
      stopLoss: Number(stopLoss.toFixed(2)),
      takeProfit: Number(takeProfit.toFixed(2)),
    };

    if (!isOpen && exitPrice) {
      trade.pnl = calculatePnL(trade);
      trade.pnlPercent = calculatePnLPercent(trade);
      trade.rMultiple = calculateRMultiple(trade);
      trade.duration = calculateDuration(trade);
    }

    trades.push(trade);
  }

  return trades.sort((a, b) => b.entryDate.getTime() - a.entryDate.getTime());
};