const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function below100(n: number): string {
  return n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? ` ${ONES[n % 10]}` : "");
}

function wholeInWords(n: number): string {
  if (n === 0) return "Zero";
  // South-Asian grouping: crore / lakh / thousand / hundred.
  const parts: string[] = [];
  const units: [number, string][] = [[10_000_000, "Crore"], [100_000, "Lakh"], [1000, "Thousand"], [100, "Hundred"]];
  let rest = n;
  for (const [size, label] of units) {
    const q = Math.floor(rest / size);
    if (q > 0) {
      parts.push(`${q >= 100 ? wholeInWords(q) : below100(q)} ${label}`);
      rest %= size;
    }
  }
  if (rest > 0) parts.push(below100(rest));
  return parts.join(" ");
}

/** 12345.5 → "Rupees Twelve Thousand Three Hundred Forty Five and Fifty Paisa Only" */
export function amountInWords(amount: number): string {
  const cents = Math.round(Math.abs(amount) * 100);
  const rupees = Math.floor(cents / 100);
  const paisa = cents % 100;
  return `Rupees ${wholeInWords(rupees)}${paisa ? ` and ${below100(paisa)} Paisa` : ""} Only`;
}
