
export async function fetchRates(base) {
  const res = await fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`);
  if (!res.ok) throw new Error(`Network error (${res.status})`);
  const data = await res.json();

  if (!data || data.result !== "success" || !data.rates) {
    throw new Error("Invalid API response");
  }
  return {
    base,
    updatedAt: data.time_last_update_utc || null,
    rates: data.rates,
  };
}
