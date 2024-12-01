import { Provider } from './priceAlert';

export interface PriceHistoryEntry {
  price: number;
  date: string;
}

export interface SmartphonePriceHistory {
  smartphoneId: string;
  prices: {
    [K in Provider]: PriceHistoryEntry[];
  };
}

export type PriceHistoryData = SmartphonePriceHistory[];
