import { NextResponse } from 'next/server';
import { createAlert, deleteAlert } from '@/utils/priceAlerts';
import { z } from 'zod';

const createAlertSchema = z.object({
  email: z.string().email('Email invalide'),
  smartphoneId: z.string(),
  provider: z.enum(['proximus', 'orange', 'voo']),
  alertType: z.enum(['price-drop', 'any-change']),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createAlertSchema.parse(body);

    // Créer les préférences en fonction du type d'alerte
    const preferences = {
      notifyOnAnyChange: validatedData.alertType === 'any-change',
      notifyOnPriceDecrease: validatedData.alertType === 'price-drop',
    };

    const alert = await createAlert(
      validatedData.email,
      validatedData.smartphoneId,
      validatedData.provider,
      preferences
    );

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID manquant' },
        { status: 400 }
      );
    }

    await deleteAlert(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
