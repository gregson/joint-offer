import { useState, useEffect } from 'react';

interface UpfrontPrice {
  price: number;
  condition?: string;
  url?: string;
}

interface Smartphone {
  id: string;
  brand: string;
  model: string;
  storage: number;
  imageUrl: string;
  upfrontPrices: {
    proximus?: UpfrontPrice;
    voo?: UpfrontPrice;
    orange?: UpfrontPrice;
  };
}

export function useSmartphones() {
  const [smartphones, setSmartphones] = useState<Smartphone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSmartphones = async () => {
      try {
        const response = await fetch('/api/smartphones');
        if (!response.ok) {
          throw new Error('Failed to fetch smartphones');
        }
        const data = await response.json();
        setSmartphones(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSmartphones();
  }, []);

  return { smartphones, loading, error };
}
