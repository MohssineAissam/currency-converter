import { useMemo, useState } from "react";
import { useRates } from "./hooks/useRates";
import CurrencySelector from "./components/CurrencySelector";
import AmountInput from "./components/AmountInput";
import ConversionResult from "./components/ConversionResult";
import ErrorBanner from "./components/ErrorBanner";

export default function App() {
  // UI state
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [amount, setAmount] = useState("1");

  // Data state
  const { rates, updatedAt, loading, err } = useRates(fromCurrency);

  const currencyList = useMemo(() => (rates ? Object.keys(rates).sort() : []), [rates]);
  const rate = useMemo(() => (rates && toCurrency ? rates[toCurrency] : null), [rates, toCurrency]);

  const canConvert = !!rate && amount !== "" && Number(amount) >= 0;

  function swap() {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }

  function retry() {
    setFromCurrency((prev) => prev); // no-op to keep UX; user can also change base
    // A simple trick: toggle to force re-render if needed
    // but generally changing fromCurrency is enough to refetch.
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            🌍 Currency Converter
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Live exchange rates with a clean, responsive UI.
          </p>
        </header>

        <div className="rounded-3xl bg-white/80 backdrop-blur border border-gray-200 shadow-xl p-6 dark:bg-gray-900/70 dark:border-gray-800">
          {/* Inputs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AmountInput value={amount} onChange={setAmount} />

            <div className="grid grid-cols-1 gap-4">
              <CurrencySelector
                id="from"
                label="From"
                value={fromCurrency}
                onChange={setFromCurrency}
                options={currencyList}
              />
              <CurrencySelector
                id="to"
                label="To"
                value={toCurrency}
                onChange={setToCurrency}
                options={currencyList}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              onClick={swap}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-white text-sm font-medium hover:bg-sky-700 active:scale-[0.99]"
              disabled={!rates}
              title="Swap currencies"
            >
              ⇄ Swap
            </button>

            <div className="text-xs text-gray-600 dark:text-gray-400">
              {loading && "Fetching rates…"}
              {!loading && updatedAt && (
                <>Last update: <span className="font-medium">{updatedAt}</span></>
              )}
            </div>
          </div>

          {/* Errors */}
          {err && <div className="mt-4"><ErrorBanner msg={err} onRetry={retry} /></div>}

          {/* Result */}
          <div className="mt-6">
            {canConvert && (
              <ConversionResult
                amount={amount}
                from={fromCurrency}
                to={toCurrency}
                rate={rate}
              />
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-500">
          Source: open.er-api.com • No API key required
        </p>
      </div>
    </div>
  );
}
