import { useCurrencyStore, type Currency } from '../stores/useCurrencyStore';

const locales: Record<Currency, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
};

const decimals: Record<Currency, number> = {
  INR: 0,
  USD: 2,
  EUR: 2,
  GBP: 2,
};

const rates: Record<Currency, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
};

const symbols: Record<Currency, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export function convertPrice(paise: number, rate: number): number {
  return (paise / 100) * rate;
}

export function formatPrice(paise: number, currency?: Currency): string {
  const state = useCurrencyStore.getState();
  const curr = currency ?? state.currency;
  const rate = curr === 'INR' ? 1 : rates[curr];
  const symbol = symbols[curr];
  const amount = convertPrice(paise, rate);
  const formatted = amount.toLocaleString(locales[curr], {
    minimumFractionDigits: decimals[curr],
    maximumFractionDigits: decimals[curr],
  });
  return `${symbol}${formatted}`;
}