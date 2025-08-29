import { useEffect, useState } from "react";
import { fetchRates } from "../lib/fetchRates";

export function useRates(base) {
  const [rates, setRates] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);

    fetchRates(base)
      .then(({ rates, updatedAt }) => {
        if (cancelled) return;
        setRates(rates);
        setUpdatedAt(updatedAt);
      })
      .catch((e) => {
        if (cancelled) return;
        setErr(e.message || "Failed to fetch rates");
      })
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [base]);

  return { rates, updatedAt, loading, err };
}
