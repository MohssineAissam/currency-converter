import { useState, useEffect } from "react";

export default function App() {
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [rate, setRate] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (fromCurrency && toCurrency) {
      fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.rates) {
            setRate(data.rates[toCurrency]);
          }
        });
    }
  }, [fromCurrency, toCurrency]);

  const convert = () => {
    if (rate) {
      setResult((amount * rate).toFixed(2));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-sky-100 via-white to-sky-200 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-center text-sky-700 mb-6">
          🌍 Currency Converter
        </h1>

        <div className="space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
            />
          </div>

          {/* From Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From
            </label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
            >
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
              <option>JPY</option>
            </select>
          </div>

          {/* To Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To
            </label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
            >
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
              <option>JPY</option>
            </select>
          </div>

          {/* Convert Button */}
          <button
            onClick={convert}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 rounded-lg transition-colors"
          >
            Convert
          </button>

          {/* Result */}
          {result && (
            <div className="text-center mt-4 p-4 bg-sky-50 border border-sky-200 rounded-lg">
              <p className="text-lg font-semibold text-sky-700">
                {amount} {fromCurrency} = {result} {toCurrency}
              </p>
              {rate && (
                <p className="text-sm text-gray-600">
                  1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
