/**
 * Formats a raw 12-character NIM string into the 3.4.5 dotted format (e.g. A11202415836 -> A11.2024.15836)
 */
export const formatNIM = (nim?: string): string => {
  if (!nim) return '';
  
  // Clean all existing dots just in case
  const raw = nim.replace(/\./g, '');
  
  if (raw.length === 12) {
    return `${raw.substring(0, 3)}.${raw.substring(3, 7)}.${raw.substring(7)}`;
  }
  
  return nim;
};
