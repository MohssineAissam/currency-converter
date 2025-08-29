export default function ErrorBanner({ msg, onRetry }) {
  if (!msg) return null;
  return (
    <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">
      <div className="flex items-center justify-between gap-3">
        <span>⚠️ {msg}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded-lg bg-red-600 px-3 py-1 text-white text-xs hover:bg-red-700"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
