// utils/formatPrice.js
export const formatPrice = (price) => {
    const num = Number(price);
    if (isNaN(num)) return '0.000';
    if (num.toString().startsWith('0.0')) return num.toFixed(6);
    if (num >= 0.1) return num.toFixed(4);
    return num.toFixed(3);
  };
  