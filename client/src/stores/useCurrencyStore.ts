import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

interface CurrencyState {
  currency: Currency;
  rate: number;
  symbol: string;
  setCurrency: (c: Currency) => void;
}

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

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: 'INR',
      rate: 1,
      symbol: '₹',
      setCurrency: (currency) =>
        set({
          currency,
          rate: rates[currency],
          symbol: symbols[currency],
        }),
    }),
    {
      name: 'currency-preference',
    }
  )
);

export type { Currency };