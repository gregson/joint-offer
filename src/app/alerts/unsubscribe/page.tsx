'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const alertId = searchParams?.get('id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!alertId) {
      setStatus('error');
      setErrorMessage('ID d\'alerte manquant');
      return;
    }

    const unsubscribe = async () => {
      try {
        const response = await fetch(`/api/price-alerts/${alertId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Une erreur est survenue');
        }

        setStatus('success');
      } catch (error) {
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Une erreur est survenue');
      }
    };

    unsubscribe();
  }, [alertId]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        {status === 'loading' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Désinscription en cours...
            </h1>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </>
        )}

        {status === 'success' && (
          <>
            <svg
              className="h-16 w-16 text-green-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Désinscription réussie
            </h1>
            <p className="text-gray-600 mb-6">
              Vous ne recevrez plus d'alertes prix pour ce forfait.
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Retour à l'accueil
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <svg
              className="h-16 w-16 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Une erreur est survenue
            </h1>
            <p className="text-gray-600 mb-6">
              {errorMessage}
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Retour à l'accueil
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
