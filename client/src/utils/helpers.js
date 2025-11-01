export const formatNumber = (num, options = {}) => {
  const defaultOptions = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  };
  
  return new Intl.NumberFormat('en-US', { ...defaultOptions, ...options }).format(num);
};

export const formatCurrency = (amount, currency) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(amount);
};

export const validateAmount = (amount) => {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return { isValid: false, error: 'Please enter a valid amount greater than 0' };
  }
  if (numAmount > 1000000000) {
    return { isValid: false, error: 'Amount is too large' };
  }
  return { isValid: true, error: null };
};
