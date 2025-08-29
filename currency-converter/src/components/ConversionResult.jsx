export default function ConversionResult({ amount, from, to, rate }) {
  if (!rate || !amount) return null;

  const numeric = Number(amount);
  if (Number.isNaN(numeric)) return null;

  const converted = numeric * rate;

  return (
    <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-center dark:bg-sky-900/20 dark:border-sky-800">
      <p className="text-xl font-semibold text-sky-700 dark:text-sky-300">
        {numeric} {from} = {converted.toFixed(4)} {to}
      </p>
      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
        1 {from} = {rate.toFixed(6)} {to}
      </p>
    </div>
  );
}
