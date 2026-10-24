/** Identifiers stay strings so leading zeros survive. Arabic and Persian digits are accepted. */
export const normalizeUniversityNumber = (value: string) =>
  value
    .trim()
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x660))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x6f0));
export const isUniversityNumberReady = (value: string) =>
  /^\d{1,24}$/.test(normalizeUniversityNumber(value));
