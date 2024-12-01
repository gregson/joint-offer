export interface NewsletterSubscriber {
  email: string;
  acceptedTerms: boolean;
  subscribedAt: string;
}

export interface NewsletterData {
  subscribers: NewsletterSubscriber[];
}
