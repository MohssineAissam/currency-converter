export default function AmountInput({ value, onChange, label = "Amount", id = "amount" }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>
      <input
        id={id}
        type="number"
        step="any"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-sky-400 dark:bg-gray-800 dark:border-gray-700"
        placeholder="0.00"
      />
    </div>
  );
}
