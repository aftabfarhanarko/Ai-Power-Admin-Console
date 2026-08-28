/**
 * Utility functions for Bangla (Bengali) number and date formatting
 */

// Bengali numeral mapping
const banglaNumerals = {
  0: '০',
  1: '১',
  2: '২',
  3: '৩',
  4: '৪',
  5: '৫',
  6: '৬',
  7: '৭',
  8: '৮',
  9: '৯',
};

const englishNumerals = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

/**
 * Convert English numbers to Bangla numerals
 * @param {number|string} num - The number to convert
 * @returns {string} - Bangla numeral string
 */
export const toBanglaNumber = (num) => {
  if (num === null || num === undefined || num === '') return '';
  
  const numStr = String(num);
  return numStr.replace(/\d/g, (digit) => banglaNumerals[parseInt(digit)]);
};

/**
 * Convert Bangla numerals back to English numbers
 * @param {string} banglaNum - The Bangla numeral string
 * @returns {string} - English number string
 */
export const fromBanglaNumber = (banglaNum) => {
  if (!banglaNum) return '';
  
  return String(banglaNum).replace(/[০-৯]/g, (digit) => englishNumerals[digit] || digit);
};

/**
 * Format number with Bangla numerals based on language
 * @param {number|string} num - The number to format
 * @param {string} lang - Current language ('bn' or 'en')
 * @param {object} options - Formatting options
 * @returns {string} - Formatted number string
 */
export const formatNumber = (num, lang = 'en', options = {}) => {
  if (num === null || num === undefined || num === '') return '';
  
  const { decimals = 0, showCommas = true } = options;
  
  let formattedNum = parseFloat(num);
  
  if (isNaN(formattedNum)) return String(num);
  
  // Format with decimals
  if (decimals > 0) {
    formattedNum = formattedNum.toFixed(decimals);
  } else {
    formattedNum = Math.round(formattedNum);
  }
  
  // Add commas for thousands separator
  if (showCommas) {
    formattedNum = formattedNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  } else {
    formattedNum = formattedNum.toString();
  }
  
  // Convert to Bangla numerals if language is Bangla
  if (lang === 'bn') {
    return toBanglaNumber(formattedNum);
  }
  
  return formattedNum;
};

/**
 * Format percentage with Bangla numerals
 * @param {number} value - The percentage value
 * @param {string} lang - Current language ('bn' or 'en')
 * @returns {string} - Formatted percentage string
 */
export const formatPercentage = (value, lang = 'en') => {
  if (value === null || value === undefined) return '';
  
  const formatted = formatNumber(value, lang, { decimals: 1, showCommas: false });
  return `${formatted}%`;
};

/**
 * Format date in Bangla format
 * @param {Date|string} date - The date to format
 * @param {string} lang - Current language ('bn' or 'en')
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, lang = 'en') => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return '';
  
  if (lang === 'bn') {
    const day = toBanglaNumber(dateObj.getDate());
    const month = toBanglaNumber(dateObj.getMonth() + 1);
    const year = toBanglaNumber(dateObj.getFullYear());
    
    return `${day}/${month}/${year}`;
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

/**
 * Format date and time in Bangla format
 * @param {Date|string} date - The date to format
 * @param {string} lang - Current language ('bn' or 'en')
 * @returns {string} - Formatted date and time string
 */
export const formatDateTime = (date, lang = 'en') => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return '';
  
  if (lang === 'bn') {
    const day = toBanglaNumber(dateObj.getDate());
    const month = toBanglaNumber(dateObj.getMonth() + 1);
    const year = toBanglaNumber(dateObj.getFullYear());
    const hours = toBanglaNumber(dateObj.getHours());
    const minutes = toBanglaNumber(dateObj.getMinutes().toString().padStart(2, '0'));
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
  
  return dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format currency with Bangla numerals
 * @param {number} amount - The amount to format
 * @param {string} lang - Current language ('bn' or 'en')
 * @param {string} currency - Currency symbol (default: '৳' for BDT)
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, lang = 'en', currency = '৳') => {
  if (amount === null || amount === undefined) return '';
  
  const formatted = formatNumber(amount, lang, { decimals: 2, showCommas: true });
  
  if (lang === 'bn') {
    return `${formatted} ${currency}`;
  }
  
  return `${currency} ${formatted}`;
};
