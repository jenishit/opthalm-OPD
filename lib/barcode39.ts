/**
 * Code 39 encoder. Each of the 44 characters below is a 9-element bar/space
 * pattern (starts and ends on a bar) where "1" is a wide element and "0" is
 * narrow — every valid character has exactly 3 wide elements, which doubles
 * as a correctness check on this table.
 */
const PATTERNS: Record<string, string> = {
  "0": "000110100",
  "1": "100100001",
  "2": "001100001",
  "3": "101100000",
  "4": "000110001",
  "5": "100110000",
  "6": "001110000",
  "7": "000100101",
  "8": "100100100",
  "9": "001100100",
  A: "100001001",
  B: "001001001",
  C: "101001000",
  D: "000011001",
  E: "100011000",
  F: "001011000",
  G: "000001101",
  H: "100001100",
  I: "001001100",
  J: "000011100",
  K: "100000011",
  L: "001000011",
  M: "101000010",
  N: "000010011",
  O: "100010010",
  P: "001010010",
  Q: "000000111",
  R: "100000110",
  S: "001000110",
  T: "000010110",
  U: "110000001",
  V: "011000001",
  W: "111000000",
  X: "010010001",
  Y: "110010000",
  Z: "011010000",
  "-": "010000101",
  ".": "110000100",
  " ": "011000100",
  $: "010101000",
  "/": "010100010",
  "+": "010001010",
  "%": "000101010",
  "*": "010010100", // start/stop
};

/** Characters Code 39 can represent — anything else is stripped before encoding. */
export const CODE39_CHARS = /^[0-9A-Z\-. $/+%]*$/;

export interface Code39Bar {
  isBar: boolean; // true = ink, false = gap
  wide: boolean;
}

/**
 * Encodes text as Code 39, returning the full bar/space sequence including
 * the start/stop "*" and inter-character gaps. Non-representable characters
 * are dropped (after uppercasing) rather than silently corrupting the symbol.
 */
export function encodeCode39(text: string): Code39Bar[] {
  const clean = text
    .toUpperCase()
    .split("")
    .filter((c) => CODE39_CHARS.test(c))
    .join("");
  const chars = ["*", ...clean.split(""), "*"];

  const bars: Code39Bar[] = [];
  chars.forEach((char, i) => {
    const pattern = PATTERNS[char] ?? PATTERNS["-"];
    pattern.split("").forEach((bit, j) => {
      bars.push({ isBar: j % 2 === 0, wide: bit === "1" });
    });
    if (i < chars.length - 1) {
      bars.push({ isBar: false, wide: false }); // inter-character gap (narrow space)
    }
  });
  return bars;
}
