import { useState, useEffect } from 'react';
import { currencyAPI } from './services/api';
import Header from './components/Header';
import CurrencyConverter from './components/CurrencyConverter';
import './App.css';

function App() {
  const [apiStatus, setApiStatus] = useState('offline');

  // Check API status on component mount
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        await currencyAPI.healthCheck();
        setApiStatus('online');
      } catch (error) {
        console.error('API health check failed:', error);
        setApiStatus('offline');
      }
    };

    checkApiStatus();
    
    // Check API status every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app">
      <Header apiStatus={apiStatus} />
      <main className="main-content">
        <div className="container">
          <CurrencyConverter />
        </div>
      </main>
    </div>
  );
}

export default App;