// Display formatting helpers.

export function fmtMoney(n) {
  if (!isFinite(n)) return '$0.00';
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Quantities: whole numbers plain, fractional to 1 decimal (e.g. 1.5 lb seed)
export function fmtQty(n) {
  if (!isFinite(n)) return '0';
  return Number.isInteger(n) ? n.toLocaleString('en-US') : n.toFixed(1);
}

export function fmtSqFt(n) {
  if (!isFinite(n) || n <= 0) return '0';
  return n < 10 ? n.toFixed(1) : Math.round(n).toLocaleString('en-US');
}

// Decimal feet → "12 ft 6 in" for read-only display
export function fmtFtIn(valueFt) {
  if (!isFinite(valueFt) || valueFt <= 0) return '—';
  const ft = Math.floor(valueFt);
  const inches = Math.round((valueFt - ft) * 12 * 4) / 4; // quarter-inch precision
  if (inches === 0) return `${ft} ft`;
  if (inches === 12) return `${ft + 1} ft`;
  return ft === 0 ? `${inches} in` : `${ft} ft ${inches} in`;
}
