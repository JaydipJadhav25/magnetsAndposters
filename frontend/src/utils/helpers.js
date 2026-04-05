/**
 * Format price in Indian Rupees
 */
export const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

/**
 * Truncate text
 */
export const truncate = (str, n = 80) => (str.length > n ? str.slice(0, n) + '…' : str)

/**
 * Generate a slug from a string
 */
export const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

/**
 * Shipping threshold
 */
export const FREE_SHIPPING_THRESHOLD = 699
export const SHIPPING_COST = 60

export const getShipping = (subtotal) => (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST)
