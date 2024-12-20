import nodemailer from 'nodemailer';
import type { PriceAlert } from '@/types/priceAlert';
import type { Smartphone } from '@/types/smartphone';
import type { SmartphonePriceChangeEmailData } from '../types/emailData';
import { Provider } from '@/types/priceAlert';
import smartphonesData from '../data/smartphones.json';

const smartphones = smartphonesData.smartphones;

// Configuration pour l'envoi d'emails
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.jointoffer.be',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'infos@jointoffer.be',
    pass: process.env.SMTP_PASS || 'Jointoffer2024!',
  },
});

console.log('SMTP Configuration:', {
  host: process.env.SMTP_HOST || 'mail.jointoffer.be',
  port: process.env.SMTP_PORT || '587',
  secure: process.env.SMTP_SECURE || 'false',
  user: process.env.SMTP_USER || 'infos@jointoffer.be',
  from: process.env.SMTP_FROM || 'infos@jointoffer.be'
});

export async function sendSmartphonePriceChangeEmail(data: SmartphonePriceChangeEmailData): Promise<void> {
  const priceChange = data.newPrice - data.oldPrice;
  const priceChangeType = priceChange < 0 ? 'baisse' : 'augmentation';
  const changeAmount = Math.abs(priceChange).toFixed(2);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://www.jointoffer.be';
  const searchUrl = `${baseUrl}/search?phone=${data.smartphone.id}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || 'infos@jointoffer.be',
    to: data.email,
    subject: `${priceChangeType.charAt(0).toUpperCase() + priceChangeType.slice(1)} de prix - ${data.smartphone.brand} ${data.smartphone.model}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">Changement de prix détecté</h1>
        <p>Bonjour,</p>
        <p>Nous avons détecté une ${priceChangeType} de prix de ${changeAmount}€ pour le ${data.smartphone.brand} ${data.smartphone.model} chez ${data.provider} :</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Ancien prix :</strong> ${data.oldPrice}€</p>
          <p style="margin: 10px 0;"><strong>Nouveau prix :</strong> ${data.newPrice}€</p>
          <p style="margin: 0;"><strong>Fournisseur :</strong> ${data.provider}</p>
        </div>

        <p style="color: #64748b;">Type d'alerte : ${data.alert.preferences.notifyOnAnyChange ? 'Tout changement de prix' : 'Baisse de prix uniquement'}</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${searchUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Voir les détails sur JointOffer</a>
        </div>

        <p style="margin-top: 30px;">Cordialement,<br>L'équipe JointOffer</p>
      </div>
    `
  };

  try {
    console.log('Sending email:', mailOptions);
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de changement de prix:', error);
    throw error;
  }
}

export async function sendWelcomeAlertEmail(
  email: string,
  smartphoneId: string,
  provider: string
): Promise<void> {
  const smartphone = smartphones.find(s => s.id === smartphoneId);
  if (!smartphone) {
    throw new Error('Smartphone non trouvé');
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || 'infos@jointoffer.be',
    to: email,
    subject: `Alerte de prix créée pour ${smartphone.brand} ${smartphone.model}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">Votre alerte de prix a été créée</h1>
        <p>Bonjour,</p>
        <p>Nous vous confirmons la création de votre alerte de prix pour le ${smartphone.brand} ${smartphone.model} chez ${provider}.</p>
        <p>Nous vous enverrons un email dès qu'un changement de prix sera détecté.</p>
        <p>Cordialement,<br>L'équipe JointOffer</p>
      </div>
    `
  };

  try {
    console.log('Sending email:', mailOptions);
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de confirmation:', error);
    throw error;
  }
}

export const sendPriceChangeEmail = async (emailData: SmartphonePriceChangeEmailData): Promise<void> => {
  try {
    // Simulation d'envoi d'email
    console.log('Sending price change email:', emailData);
  } catch (error) {
    console.error('Error sending price change email:', error);
    throw error;
  }
};

export const sendEmail = async (to: string, subject: string, body: string): Promise<void> => {
  try {
    // Simulation d'envoi d'email
    console.log('Sending email:', { to, subject, body });
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
