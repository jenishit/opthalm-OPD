/**
 * A deterministic, well-formed UUID (version-5 layout) for a string.
 *
 * Findings picked from a fixed checklist or typed free-text have no catalog
 * row, but the backend stores `diagnosis_id` as a UUID. Deriving the id from the
 * text keeps it valid AND stable — the same finding always gets the same id, so
 * saving twice never creates a different record. Not cryptographic.
 */
export function stableUuid(seed: string): string {
  // cyrb128: four independent 32-bit hashes of the seed.
  let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
  for (let i = 0; i < seed.length; i++) {
    const k = seed.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  const hex = [h1, h2, h3, h4].map((n) => (n >>> 0).toString(16).padStart(8, "0")).join("");
  // version 5, RFC 4122 variant
  const v = hex.slice(12, 16);
  const variant = ((parseInt(hex.slice(16, 17), 16) & 0x3) | 0x8).toString(16);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${v.slice(1)}-${variant}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}
