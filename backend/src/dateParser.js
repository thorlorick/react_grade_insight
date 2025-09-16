function parseDate(cellValue) {
  if (!cellValue) return null;

  let raw = cellValue.trim();
  if (raw === '-' || raw === '') return null;

  // Remove ordinal suffixes: 1st, 2nd, 3rd, 4th, etc.
  raw = raw.replace(/(\d+)(st|nd|rd|th)/i, '$1');

  // Try native Date parsing
  let d = new Date(raw);
  if (!isNaN(d)) {
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }); // e.g., "Jan 15, 2026"
  }

  // Fallback for numeric formats (MM/DD/YYYY, DD/MM/YYYY)
  const parts = raw.match(/(\d{1,4})[\/.-](\d{1,2})[\/.-](\d{1,4})/);
  if (parts) {
    let [_, p1, p2, p3] = parts.map(Number);

    let year, month, day;
    if (p1 > 31) {
      year = p1; month = p2; day = p3;
    } else if (p3 > 31) {
      year = p3; month = p1; day = p2;
    } else {
      month = p1; day = p2; year = p3;
    }

    d = new Date(year, month - 1, day);
    if (!isNaN(d)) {
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  }

  return null;
}

module.exports = { parseDate };