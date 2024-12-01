export interface Smartphone {
  id: string;
  brand: string;
  model: string;
  storage: number;
  imageUrl: string;
  upfrontPrices: {
    proximus?: {
      price: number;
      condition?: string;
      url?: string;
    };
    voo?: {
      price: number;
      condition?: string;
      url?: string;
    };
    orange?: {
      price: number;
      condition?: string;
      url?: string;
    };
  };
}
