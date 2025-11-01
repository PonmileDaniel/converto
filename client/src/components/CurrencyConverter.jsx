import { useState } from 'react';
import { currencyAPI } from '../services/api';
import { POPULAR_CURRENCIES, getCurrencyInfo } from '../utils/currencies';
import { formatNumber, validateAmount } from '../utils/helpers';
import './CurrencyConverter.css';

const CurrencyConverter = () => {
  const [fromCurrency, setFromCurrency] = useState('BRL');
  const [toCurrency, setToCurrency] = useState('USD');
  const [amount, setAmount] = useState('100');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const convertCurrency = async () => {
    const validation = validateAmount(amount);
    if (!validation.isValid) {
      setError(validation.error);
      setResult(null);
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      console.log(`Converting ${amount} ${fromCurrency} to ${toCurrency}`);
      
      const response = await currencyAPI.convertCurrency(
        fromCurrency,
        toCurrency,
        parseFloat(amount)
      );

      console.log('Full API Response:', response);

      if (response.success && response.data) {
        console.log('Setting result:', response.data);
        setResult(response.data);
        setError('');
      } else {
        setError(response.error || 'Conversion failed');
        setResult(null);
      }
    } catch (error) {
      console.error('Conversion error:', error);
      setError(error.response?.data?.error || 'Failed to connect to server');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
    setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      convertCurrency();
    }
  };

  return (
    <div className="converter-card">
      <h2 className="card-title">💱 Currency Converter</h2>

      {/* Amount Input Section */}
      <div className="input-section">
        <label className="input-label">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter amount"
          className="amount-input"
          min="0"
          step="0.01"
        />
      </div>

      {/* Currency Selection */}
      <div className="currency-section">
        <div className="currency-input">
          <label className="input-label">FROM</label>
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="currency-select"
          >
            {POPULAR_CURRENCIES.map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.flag} {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={swapCurrencies}
          className="swap-button"
          type="button"
          title="Swap currencies"
        >
          ⇅
        </button>

        <div className="currency-input">
          <label className="input-label">TO</label>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="currency-select"
          >
            {POPULAR_CURRENCIES.map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.flag} {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Convert Button */}
      <button
        onClick={convertCurrency}
        disabled={loading || !amount}
        className="convert-button"
      >
        {loading ? (
          <>
            <span className="loading-icon">⏳</span>
            Converting...
          </>
        ) : (
          '🔄 Convert Now'
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* RESULT SECTION - THIS SHOULD SHOW THE CONVERSION */}
      {result && !loading && (
        <div className="result-section">
          <div className="result-card">
            <h3 className="result-header">✅ Conversion Result</h3>

            <div className="result-amount">
              {/* FROM AMOUNT */}
              <div className="from-amount">
                <span className="currency-flag">{getCurrencyInfo(result.from)?.flag || '💵'}</span>
                <span className="amount-value">{formatNumber(result.amount)}</span>
                <span className="currency-code">{result.from}</span>
              </div>

              {/* EQUALS SIGN */}
              <span className="equals">=</span>

              {/* TO AMOUNT - THIS IS THE CONVERTED VALUE */}
              <div className="to-amount">
                <span className="currency-flag">{getCurrencyInfo(result.to)?.flag || '💶'}</span>
                <span className="amount-value converted">{formatNumber(result.convertedAmount)}</span>
                <span className="currency-code">{result.to}</span>
              </div>
            </div>

            <div className="result-details">
              <div className="rate-info">
                <strong>Exchange Rate:</strong> 1 {result.from} = {formatNumber(result.rate)} {result.to}
              </div>

              <div className="meta-info">
                <div className={`source ${result.cached ? 'cached' : 'live'}`}>
                  <span>{result.cached ? '💾 Cached' : '🔄 Live'}</span>
                </div>
                <div className="source">
                  <span>Source: {result.source}</span>
                </div>
                <div className="timestamp">
                  <span>⏰ {new Date(result.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyConverter;
