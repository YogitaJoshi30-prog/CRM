/**
 * Format a numeric amount into Indian Rupee string (e.g., ₹1,25,000)
 * @param {number|string} amount
 * @returns {string} Formatted Indian Rupee string
 */
function formatINR(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

module.exports = {
  formatINR
};
