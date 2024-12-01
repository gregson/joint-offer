export type AlertType = 'price-drop' | 'any-change';
export type Provider = 'proximus' | 'orange' | 'voo';

export interface PriceAlertPreferences {
  notifyOnAnyChange: boolean;
  notifyOnPriceDecrease: boolean;
}

export interface PriceAlert {
  id: string;
  email: string;
  smartphoneId: string;
  provider: Provider;
  targetPrice?: number;
  createdAt: string;
  lastNotifiedAt?: string;
  preferences: PriceAlertPreferences;
}

export interface PriceAlertData {
  alerts: PriceAlert[];
}
