'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          acceptedTerms: isChecked,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      setIsSubmitted(true);
      setEmail('');
      setIsChecked(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-gray-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Newsletter Section */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Recevez nos derniers conseils, recommandations et meilleures offres de forfaits avec ou sans smartphone
          </h3>
          
          {isSubmitted ? (
            <div className="bg-green-100 text-green-700 p-4 rounded-lg">
              Merci pour votre inscription ! Vous recevrez bientôt nos actualités.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                  {error}
                </div>
              )}
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Adresse email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  className="mt-1"
                  required
                  disabled={isLoading}
                />
                <label className="text-sm text-gray-600 text-left">
                  J&apos;ai lu la{' '}
                  <Link href="/privacy" className="text-blue-600 hover:underline">
                    Politique de Confidentialité
                  </Link>{' '}
                  et les{' '}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    Conditions d&apos;Utilisation
                  </Link>{' '}
                  et je comprends que je peux me désabonner à tout moment.
                </label>
              </div>
              
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isChecked || !email || isLoading}
              >
                {isLoading ? 'Inscription...' : 'S\'abonner'}
              </button>
            </form>
          )}
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
          <div>
            <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase">Ressources</h2>
            <ul className="text-gray-600">
              <li className="mb-4">
                <Link href="/faq" className="hover:underline">FAQ</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline">Contact</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase">Légal</h2>
            <ul className="text-gray-600">
              <li className="mb-4">
                <Link href="/privacy" className="hover:underline">Vie privée</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:underline">Conditions</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase">Suivez-nous</h2>
            <ul className="text-gray-600">
              <li className="mb-4">
                <a href="#" className="hover:underline">Facebook</a>
              </li>
              <li>
                <a href="#" className="hover:underline">Twitter</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-600 text-sm mt-12 pt-8 border-t border-gray-200">
          {new Date().getFullYear()} Joint Offer. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
