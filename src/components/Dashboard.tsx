import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ShowChart,
  AccountBalance,
  Assessment,
  Visibility,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { Trade, TradingStats, ZellaScore } from '../types';
import {
  calculateTradingStats,
  calculateZellaScore,
  formatCurrency,
  formatPercentage,
  generateSampleTrades,
} from '../utils/tradingCalculations';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<TradingStats | null>(null);
  const [zellaScore, setZellaScore] = useState<ZellaScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      const sampleTrades = generateSampleTrades();
      setTrades(sampleTrades);
      const calculatedStats = calculateTradingStats(sampleTrades);
      setStats(calculatedStats);
      setZellaScore(calculateZellaScore(calculatedStats));
      setLoading(false);
    }, 1000);
  }, []);

  if (loading || !stats || !zellaScore) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  const recentTrades = trades.slice(0, 10);

  // Generate sample P&L chart data
  const pnlChartData = Array.from({ length: 30 }, (_, i) => ({
    date: format(new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000), 'MMM dd'),
    cumulative: Math.floor(Math.random() * 5000 - 1000) + i * 100,
    daily: Math.floor(Math.random() * 1000 - 500),
  }));

  const pieData = [
    { name: 'Winning Trades', value: stats.winningTrades, color: '#10b981' },
    { name: 'Losing Trades', value: stats.losingTrades, color: '#ef4444' },
  ];

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color?: 'success' | 'error' | 'primary' | 'secondary';
    trend?: number;
  }> = ({ title, value, subtitle, icon, color = 'primary', trend }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h5" component="div" fontWeight={600}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ color: `${color}.main`, bgcolor: `${color}.light`, p: 1, borderRadius: 2 }}>
            {icon}
          </Box>
        </Box>
        {trend !== undefined && (
          <Box display="flex" alignItems="center" mt={1}>
            {trend >= 0 ? (
              <TrendingUp sx={{ color: 'success.main', fontSize: 20, mr: 0.5 }} />
            ) : (
              <TrendingDown sx={{ color: 'error.main', fontSize: 20, mr: 0.5 }} />
            )}
            <Typography
              variant="body2"
              sx={{ color: trend >= 0 ? 'success.main' : 'error.main' }}
            >
              {formatPercentage(Math.abs(trend))}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const ZellaScoreCard: React.FC = () => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Zella Score
        </Typography>
        <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
          <Box position="relative" display="inline-flex" alignItems="center" justifyContent="center">
            <CircularProgress
              variant="determinate"
              value={zellaScore.overall}
              size={120}
              thickness={6}
              sx={{
                color: zellaScore.overall >= 80 ? 'success.main' : 
                       zellaScore.overall >= 60 ? 'warning.main' : 'error.main'
              }}
            />
            <Box
              position="absolute"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Typography variant="h4" component="div" fontWeight={700}>
                {Math.round(zellaScore.overall)}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box>
          {[
            { label: 'Win/Loss Ratio', value: zellaScore.winLossRatio },
            { label: 'Win Percentage', value: zellaScore.winPercentage },
            { label: 'Profit Factor', value: zellaScore.profitFactor },
            { label: 'Recovery Factor', value: zellaScore.recoveryFactor },
          ].map((metric) => (
            <Box key={metric.label} mb={1}>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2">{metric.label}</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {Math.round(metric.value)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={metric.value}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: metric.value >= 80 ? 'success.main' : 
                                    metric.value >= 60 ? 'warning.main' : 'error.main',
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Your trading performance overview and key metrics
      </Typography>

      <Grid container spacing={3}>
        {/* Key Stats Row */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total P&L"
            value={formatCurrency(stats.totalPnL)}
            icon={<AccountBalance />}
            color={stats.totalPnL >= 0 ? 'success' : 'error'}
            trend={12.5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Win Rate"
            value={`${stats.winRate}%`}
            subtitle={`${stats.winningTrades}/${stats.totalTrades} trades`}
            icon={<TrendingUp />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Profit Factor"
            value={stats.profitFactor.toFixed(2)}
            icon={<Assessment />}
            color={stats.profitFactor >= 1 ? 'success' : 'error'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Expectancy"
            value={formatCurrency(stats.expectancy)}
            icon={<ShowChart />}
            color={stats.expectancy >= 0 ? 'success' : 'error'}
          />
        </Grid>

        {/* Charts Row */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Cumulative P&L
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={pnlChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), 'P&L']} />
                  <Line
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <ZellaScoreCard />
        </Grid>

        {/* Performance Breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Win/Loss Breakdown
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Key Metrics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Average Win
                  </Typography>
                  <Typography variant="h6" color="success.main" fontWeight={600}>
                    {formatCurrency(stats.averageWin)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Average Loss
                  </Typography>
                  <Typography variant="h6" color="error.main" fontWeight={600}>
                    {formatCurrency(stats.averageLoss)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Largest Win
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {formatCurrency(stats.largestWin)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Largest Loss
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {formatCurrency(stats.largestLoss)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Max Drawdown
                  </Typography>
                  <Typography variant="h6" color="error.main" fontWeight={600}>
                    {formatCurrency(stats.maxDrawdown)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    R-Multiple
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {stats.averageRMultiple.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Trades */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  Recent Trades
                </Typography>
                <IconButton size="small">
                  <Visibility />
                </IconButton>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Symbol</TableCell>
                      <TableCell>Side</TableCell>
                      <TableCell>Entry</TableCell>
                      <TableCell>Exit</TableCell>
                      <TableCell>P&L</TableCell>
                      <TableCell>Setup</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentTrades.map((trade) => (
                      <TableRow key={trade.id}>
                        <TableCell>
                          <Typography fontWeight={600}>{trade.symbol}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={trade.side}
                            size="small"
                            sx={{
                              bgcolor: trade.side === 'long' ? 'success.light' : 'error.light',
                              color: trade.side === 'long' ? 'success.dark' : 'error.dark',
                            }}
                          />
                        </TableCell>
                        <TableCell>{formatCurrency(trade.entryPrice)}</TableCell>
                        <TableCell>
                          {trade.exitPrice ? formatCurrency(trade.exitPrice) : '-'}
                        </TableCell>
                        <TableCell>
                          {trade.pnl !== undefined ? (
                            <Typography
                              color={trade.pnl >= 0 ? 'success.main' : 'error.main'}
                              fontWeight={600}
                            >
                              {formatCurrency(trade.pnl)}
                            </Typography>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>{trade.setup || '-'}</TableCell>
                        <TableCell>
                          {format(trade.entryDate, 'MMM dd, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;