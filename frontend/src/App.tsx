import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Layout from './components/Layout';
import SearchView from './components/SearchView';
import { useLegalResearchStore } from './store/legalStore';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f8fafc',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  const { activeTab } = useLegalResearchStore();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'search':
        return <SearchView />;
      case 'analysis':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Case Analysis</h2>
            <p className="text-gray-600">Advanced case analysis features coming soon...</p>
          </div>
        );
      case 'drafting':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Document Drafting</h2>
            <p className="text-gray-600">AI-powered document drafting features coming soon...</p>
          </div>
        );
      case 'calendar':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Calendar & Deadlines</h2>
            <p className="text-gray-600">Calendar and deadline management coming soon...</p>
          </div>
        );
      default:
        return <SearchView />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="legal-app">
        <Layout>
          {renderActiveView()}
        </Layout>
      </div>
    </ThemeProvider>
  );
}

export default App;
