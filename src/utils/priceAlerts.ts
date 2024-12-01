import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { PriceAlert, PriceAlertData, PriceAlertPreferences, Provider } from '@/types/priceAlert';
import { sendWelcomeAlertEmail } from './emailSender';
import { getPlanById } from './dataLoader';

const alertsPath = path.join(process.cwd(), 'src/data/price-alerts.json');

export async function getAlerts(): Promise<PriceAlertData> {
  try {
    const fileContent = await fs.readFile(alertsPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    return { alerts: [] };
  }
}

export async function createAlert(
  email: string,
  smartphoneId: string,
  provider: Provider,
  preferences: PriceAlertPreferences = {
    notifyOnAnyChange: true,
    notifyOnPriceDecrease: true
  }
): Promise<PriceAlert> {
  const data = await getAlerts();

  // Vérifier si une alerte existe déjà pour cet email et ce smartphone
  const existingAlert = data.alerts.find(
    alert => alert.email === email && alert.smartphoneId === smartphoneId && alert.provider === provider
  );

  if (existingAlert) {
    throw new Error('Une alerte existe déjà pour ce smartphone chez cet opérateur');
  }

  const newAlert: PriceAlert = {
    id: uuidv4(),
    email,
    smartphoneId,
    provider,
    createdAt: new Date().toISOString(),
    preferences
  };

  data.alerts.push(newAlert);
  await fs.writeFile(alertsPath, JSON.stringify(data, null, 2));

  // Envoyer un email de confirmation
  await sendWelcomeAlertEmail(email, smartphoneId, provider);

  return newAlert;
}

export async function deleteAlert(id: string): Promise<void> {
  const data = await getAlerts();
  data.alerts = data.alerts.filter(alert => alert.id !== id);
  await fs.writeFile(alertsPath, JSON.stringify(data, null, 2));
}

export async function getAlertsByEmail(email: string): Promise<PriceAlert[]> {
  const data = await getAlerts();
  return data.alerts.filter(alert => alert.email === email);
}

export async function updateAlertPreferences(
  id: string,
  preferences: Partial<PriceAlertPreferences>
): Promise<PriceAlert | null> {
  const data = await getAlerts();
  const alertIndex = data.alerts.findIndex(alert => alert.id === id);

  if (alertIndex === -1) {
    return null;
  }

  data.alerts[alertIndex].preferences = {
    ...data.alerts[alertIndex].preferences,
    ...preferences
  };

  await fs.writeFile(alertsPath, JSON.stringify(data, null, 2));
  return data.alerts[alertIndex];
}
