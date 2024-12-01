export type SortOption = 
  | 'lowest-price'
  | 'lowest-upfront'
  | 'most-data'
  | 'most-calls'
  | '24-month-cost';

export interface Plan {
  id: string;
  provider: string;
  name: string;
  price: number;
  data: string;
  calls: string;
  sms: string;
  networkType: string[];
  commitment: string;
  features: string[];
  url: string;
  promotion: {
    description: string;
    endDate: string;
  } | null;
  dataEurope: string;
  internationalCalls: string;
}
