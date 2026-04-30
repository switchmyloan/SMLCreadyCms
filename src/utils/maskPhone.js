/**
 * Mask a phone number for table/list display in the CMS.
 *
 * Default pattern keeps first 2 and last 4 digits visible:
 *   "8830333610" -> "88****3610"
 *   "+91 8830333610" -> "+91 88****3610"
 *
 * - Strips non-digit chars when measuring/masking, but preserves any
 *   leading country-code prefix (e.g. "+91 ") in the output.
 * - For very short numbers (<= keepStart + keepEnd) returns as-is —
 *   masking would either be no-op or expose more than it hides.
 *
 * @param {string|number|null|undefined} value
 * @param {{ keepStart?: number, keepEnd?: number, maskChar?: string }} [opts]
 * @returns {string}
 */
export const maskPhone = (value, opts = {}) => {
  if (value === null || value === undefined) return '';
  const str = String(value).trim();
  if (!str) return '';

  const { keepStart = 2, keepEnd = 4, maskChar = '*' } = opts;

  // Split into a non-digit prefix (e.g. "+91 ") and the digits.
  const match = str.match(/^(\D*)(\d.*)$/);
  if (!match) return str;
  const prefix = match[1];
  const digitsPart = match[2];

  // Keep only digits for masking; ignore spaces/dashes inside.
  const digits = digitsPart.replace(/\D/g, '');
  if (digits.length <= keepStart + keepEnd) return str;

  const start = digits.slice(0, keepStart);
  const end = digits.slice(-keepEnd);
  const middleLen = digits.length - keepStart - keepEnd;
  return `${prefix}${start}${maskChar.repeat(middleLen)}${end}`;
};

export default maskPhone;
