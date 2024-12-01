import type { Smartphone } from './smartphone';
import type { Provider, PriceAlert } from './priceAlert';

export interface SmartphonePriceChangeEmailData {
  email: string;
  smartphone: Smartphone;
  provider: Provider;
  oldPrice: number;
  newPrice: number;
  alert: PriceAlert;
}
