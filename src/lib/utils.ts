// Minimal class name joiner to avoid adding a dependency
export function cn(...inputs: ClassValue[]) {
  const classes: string[] = [];
  for (const input of inputs) {
    if (typeof input === 'string' && input.length > 0) classes.push(input);
    else if (Array.isArray(input)) {
      for (const item of input) if (typeof item === 'string' && item) classes.push(item);
    }
  }
  return classes.join(' ');
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateOrderNumber(): string {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const random = Math.floor(1000 + Math.random() * 9000);
  return `SB${ymd}${random}`;
}

export function discountPercent(base: number, compareAt: number | null): number | null {
  if (!compareAt || compareAt <= base) return null;
  return Math.round(((compareAt - base) / compareAt) * 100);
}

export const WEIGHT_OPTIONS = [
  { label: '500 g', priceModifier: 0 },
  { label: '1 kg', priceModifier: 1 },
  { label: '1.5 kg', priceModifier: 2 },
  { label: '2 kg', priceModifier: 3 },
];

export const FLAVOUR_OPTIONS = [
  'Chocolate',
  'Vanilla',
  'Red Velvet',
  'Butterscotch',
  'Pineapple',
  'Strawberry',
  'Black Forest',
  'Coffee',
];

export const DELIVERY_SLOTS = [
  '10:00 AM – 12:00 PM',
  '12:00 PM – 2:00 PM',
  '2:00 PM – 4:00 PM',
  '4:00 PM – 6:00 PM',
  '6:00 PM – 8:00 PM',
];

export const DELIVERY_CHARGE = 49;
export const FREE_DELIVERY_THRESHOLD = 999;
