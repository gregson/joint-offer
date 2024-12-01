import { NextResponse } from 'next/server';
import { addSubscriber } from '@/utils/newsletter';

export async function POST(request: Request) {
  try {
    const { email, acceptedTerms } = await request.json();

    // Validation basique
    if (!email || !acceptedTerms) {
      return NextResponse.json(
        { error: 'Email et acceptation des conditions requis' },
        { status: 400 }
      );
    }

    // Ajouter le nouvel abonné
    const newSubscriber = await addSubscriber(email, acceptedTerms);
    return NextResponse.json({ success: true, subscriber: newSubscriber });
    
  } catch (error) {
    console.error('Erreur lors de l\'inscription à la newsletter:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}
