/**
 * Formatting utilities for ID Online Auction System
 * Currency: Indian Rupees (₹ / INR) using Indian numbering system
 */

export const formatINR = (amount) => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₹0';
  }
  const num = Number(amount);
  return `₹${num.toLocaleString('en-IN')}`;
};

export const formatINRRaw = (amount) => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '0';
  }
  const num = Number(amount);
  return num.toLocaleString('en-IN');
};

export const formatDate = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
