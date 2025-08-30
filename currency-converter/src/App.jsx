import React, { useState, useMemo, useEffect, useCallback } from 'react';

const CURRENCY_FLAGS = {
  USD: '🇺🇸', EUR: '🇪🇺', JPY: '🇯🇵', GBP: '🇬🇧', AUD: '🇦🇺', CAD: '🇨🇦',
  CHF: '🇨🇭', CNY: '🇨🇳', HKD: '🇭🇰', NZD: '🇳🇿', SEK: '🇸🇪', KRW: '🇰🇷',
  SGD: '🇸🇬', NOK: '🇳🇴', MXN: '🇲🇽', INR: '🇮🇳', RUB: '🇷🇺', ZAR: '🇿🇦',
  TRY: '🇹🇷', BRL: '🇧🇷', TWD: '🇹🇼', DKK: '🇩🇰', PLN: '🇵🇱', THB: '🇹🇭',
  IDR: '🇮🇩', HUF: '🇭🇺', CZK: '🇨🇿', ILS: '🇮🇱', CLP: '🇨🇱', PHP: '🇵🇭',
  AED: '🇦🇪', COP: '🇨🇴', SAR: '🇸🇦', MYR: '🇲🇾', RON: '🇷🇴',
};

const useRates = (baseCurrency) => {
  const [rates, setRates] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const fetchRates = useCallback(async () => {
    if (!baseCurrency) return;

    setLoading(true);
    setErr(null);

    try {
      const response = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch rates: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.result === 'error') {
        throw new Error(`API Error: ${data['error-type']}`);
      }
      
      setRates(data.rates);
      const date = new Date(data.time_last_update_unix * 1000);
      setUpdatedAt(date.toLocaleTimeString());

    } catch (e) {
      console.error("Fetch error:", e);
      setErr(e.message || "Could not fetch exchange rates.");
      setRates(null);
    } finally {
      setLoading(false);
    }
  }, [baseCurrency]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  return { rates, updatedAt, loading, err, refetch: fetchRates };
};

const CurrencySelector = ({ id, value, onChange, options }) => {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {CURRENCY_FLAGS[option] || '🏳️'} {option}
        </option>
      ))}
    </select>
  );
};

const AmountInput = ({ value, onChange }) => {
  const handleChange = (e) => {
    const { value: inputValue } = e.target;
    if (/^\d*\.?\d*$/.test(inputValue)) {
      onChange(inputValue);
    }
  };
  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder="1.00"
      className="w-full text-4xl font-bold p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center md:text-left"
    />
  );
};

const ConversionResult = ({ amount, from, to, rate }) => {
  const convertedAmount = useMemo(() => parseFloat(amount) * rate, [amount, rate]);
  const inverseRate = useMemo(() => 1 / rate, [rate]);


  const formattedResult = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      maximumFractionDigits: 6,
    }).format(convertedAmount);
  }, [convertedAmount]);
  
  const fromAmountFormatted = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(amount);


  return (
    <div className="text-center">
      <p className="text-lg text-gray-600 dark:text-gray-400">
        {fromAmountFormatted} {from} =
      </p>
      <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white my-2">
        {formattedResult} <span className="text-3xl font-medium">{to}</span>
      </h3>
      <p className="font-mono text-sm text-green-700 dark:text-green-300">
        1 {from} = {inverseRate.toFixed(6)} {to}
      </p>
    </div>
  );
};

const ErrorBanner = ({ msg, onRetry }) => {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center justify-between shadow-md">
      <span><strong>Error:</strong> {msg}</span>
      <button
        onClick={onRetry}
        className="ml-4 px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-red-900/20"
      >
        Retry
      </button>
    </div>
  );
};

export default function App() {
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [amount, setAmount] = useState("1");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const { rates, updatedAt, loading, err, refetch } = useRates(fromCurrency);
  
  const currencyList = useMemo(() => (rates ? Object.keys(rates).sort() : []), [rates]);
  const rate = useMemo(() => (rates && toCurrency ? rates[toCurrency] : null), [rates, toCurrency]);
  const canConvert = !!rate && amount !== "" && Number(amount) >= 0;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const swap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };
  
  const handleAmountChange = (newAmount) => {
    if (newAmount === '.' || (newAmount.startsWith('0') && newAmount.length > 1 && newAmount[1] !== '.')) {
       setAmount(parseFloat(newAmount).toString());
    } else {
       setAmount(newAmount);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 text-gray-900 dark:text-white font-sans">
      {/* Background pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.15)_1px,transparent_0)] bg-[length:20px_20px] opacity-40 dark:opacity-20"></div>

      <div className="relative">
        {/* Navigation Bar */}
        <nav className="border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">FX</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  CurrencyPro
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? (
                     <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  ) : (
                     <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                  )}
                </button>
                <div className="flex items-center space-x-1 text-sm">
                  <div className={`h-2 w-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : err ? 'bg-red-400' : 'bg-green-400'}`}></div>
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    {loading ? 'Updating' : err ? 'Offline' : 'Live'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-4xl px-6 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
              Real-Time Currency
              <span className="block bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">Exchange</span>
            </h2>
            <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              Professional-grade currency conversion with live exchange rates, elegant design, and lightning-fast performance.
            </p>
          </div>

          {/* Main Converter Card */}
          <div className="bg-gradient-to-br from-white via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-xl backdrop-blur-xl p-6 sm:p-8">
            {/* Error Banner */}
            {err && (
              <div className="mb-6">
                <ErrorBanner msg={err} onRetry={refetch} />
              </div>
            )}
            
            {/* Converter Interface */}
            <div className="grid gap-6">
                <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr] items-end">
                    {/* From Currency Section */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        From
                        </label>
                        <div className="relative">
                        <CurrencySelector
                            id="from"
                            value={fromCurrency}
                            onChange={setFromCurrency}
                            options={currencyList}
                        />
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-2xl">
                            {CURRENCY_FLAGS[fromCurrency]}
                        </div>
                        </div>
                    </div>

                    {/* Swap Button */}
                    <div className="flex items-end justify-center">
                        <button
                        onClick={swap}
                        className="group relative inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        disabled={!rates}
                        title="Swap currencies"
                        >
                        <svg className="w-5 h-5 transition-transform group-hover:rotate-180 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-30 blur transition-opacity duration-300"></div>
                        </button>
                    </div>

                    {/* To Currency Section */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        To
                        </label>
                        <div className="relative">
                        <CurrencySelector
                            id="to"
                            value={toCurrency}
                            onChange={setToCurrency}
                            options={currencyList}
                        />
                         <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-2xl">
                           {CURRENCY_FLAGS[toCurrency]}
                        </div>
                        </div>
                    </div>
                </div>

                {/* Amount Section */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </label>
                  <AmountInput value={amount} onChange={handleAmountChange} />
                </div>

              {/* Result or Loading State */}
              <div className="mt-4 min-h-[140px] flex items-center justify-center">
                {loading ? (
                    <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                        Fetching latest rates...
                        </span>
                    </div>
                ) : canConvert ? (
                    <div className="w-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800/50 p-6">
                        <ConversionResult
                        amount={amount}
                        from={fromCurrency}
                        to={toCurrency}
                        rate={rate}
                        />
                    </div>
                ) : null}
              </div>
            </div>

            {/* Status Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200/60 dark:border-gray-700/60">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500 dark:text-gray-400">Powered by</span>
                  <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">ExchangeRate-API</a>
                </div>
                {updatedAt && !loading && !err && (
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Updated {updatedAt}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

