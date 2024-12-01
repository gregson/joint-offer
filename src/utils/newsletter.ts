import fs from 'fs/promises';
import path from 'path';
import type { NewsletterData, NewsletterSubscriber } from '@/types/newsletter';

const subscribersPath = path.join(process.cwd(), 'src/data/newsletter-subscribers.json');

export async function getSubscribers(): Promise<NewsletterData> {
  try {
    const fileContent = await fs.readFile(subscribersPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    // Si le fichier n'existe pas, retourner un tableau vide
    return { subscribers: [] };
  }
}

export async function addSubscriber(email: string, acceptedTerms: boolean): Promise<NewsletterSubscriber> {
  const data = await getSubscribers();
  
  // Vérifier si l'email existe déjà
  if (data.subscribers.some(sub => sub.email === email)) {
    throw new Error('Cette adresse email est déjà inscrite');
  }

  const newSubscriber: NewsletterSubscriber = {
    email,
    acceptedTerms,
    subscribedAt: new Date().toISOString()
  };

  data.subscribers.push(newSubscriber);
  await fs.writeFile(subscribersPath, JSON.stringify(data, null, 2));

  return newSubscriber;
}

export async function removeSubscriber(email: string): Promise<void> {
  const data = await getSubscribers();
  data.subscribers = data.subscribers.filter(sub => sub.email !== email);
  await fs.writeFile(subscribersPath, JSON.stringify(data, null, 2));
}
