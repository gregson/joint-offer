export type SortOption = 'lowest-price' | 'highest-price' | 'most-data' | 'most-minutes';

export interface Plan {
  id: string;
  provider: string;
  name: string;
  price: number;
  data: string;
  calls: string;
  sms: string;
  networkType: string[];
  commitment?: string;
  features?: string[];
  promotion?: {
    description: string;
    endDate: string;
  };
  dataEurope?: string;
  internationalCalls?: string;
}
