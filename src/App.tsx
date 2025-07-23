import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { theme } from './theme';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';

// Placeholder components for other routes
const AddTrade = () => (
  <Box>
    <h2>Add Trade</h2>
    <p>Trade entry form will be implemented here.</p>
  </Box>
);

const TradeLog = () => (
  <Box>
    <h2>Trade Log</h2>
    <p>Complete trade history and management interface.</p>
  </Box>
);

const Analytics = () => (
  <Box>
    <h2>Analytics</h2>
    <p>Advanced trading analytics and performance metrics.</p>
  </Box>
);

const Calendar = () => (
  <Box>
    <h2>Trading Calendar</h2>
    <p>Calendar view of trading activity and performance.</p>
  </Box>
);

const Reports = () => (
  <Box>
    <h2>Reports</h2>
    <p>Detailed trading reports and insights.</p>
  </Box>
);

const Playbooks = () => (
  <Box>
    <h2>Trading Playbooks</h2>
    <p>Create and manage your trading strategies and playbooks.</p>
  </Box>
);

const Journal = () => (
  <Box>
    <h2>Trading Journal</h2>
    <p>Daily trading journal and notes.</p>
  </Box>
);

const Settings = () => (
  <Box>
    <h2>Settings</h2>
    <p>Application settings and preferences.</p>
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-trade" element={<AddTrade />} />
            <Route path="/trades" element={<TradeLog />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/playbooks" element={<Playbooks />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;