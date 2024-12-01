import { NextResponse } from 'next/server';
import { deleteAlert } from '@/utils/priceAlerts';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteAlert(params.id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue' },
      { status: 400 }
    );
  }
}
