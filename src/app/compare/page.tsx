'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useSmartphones } from '@/hooks/useSmartphones';
import { PriceChart } from '@/components/PriceChart';
import { PriceTable } from '@/components/PriceTable';
import { PriceBadge } from '@/components/PriceBadge';
import SmartphoneModal from '@/components/search/SmartphoneModal';
import { 
  FacebookShareButton, 
  TwitterShareButton, 
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon
} from 'react-share';
import html2canvas from 'html2canvas';
import { ComparisonImage } from '@/components/ComparisonImage';
import type { Smartphone } from '@/types/smartphone';
import Link from 'next/link';

export default function ComparePage() {
  const { smartphones } = useSmartphones();
  const [selectedPhones, setSelectedPhones] = useState<Smartphone[]>([]);
  const [activeTab, setActiveTab] = useState('price');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shareImage, setShareImage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const comparisonRef = useRef<HTMLDivElement>(null);

  // Mettre à jour l'URL quand les smartphones sélectionnés changent
  useEffect(() => {
    if (selectedPhones.length > 0) {
      const newUrl = `/compare?phones=${selectedPhones.map(p => p.id).join(',')}`;
      window.history.replaceState({}, '', newUrl);
    } else {
      window.history.replaceState({}, '', '/compare');
    }
  }, [selectedPhones]);

  // Charger les smartphones depuis l'URL au chargement de la page
  useEffect(() => {
    const phonesParam = searchParams.get('phones');
    if (phonesParam && smartphones.length > 0) {
      const phoneIds = phonesParam.split(',');
      const phonesToSelect = phoneIds
        .map(id => smartphones.find(phone => phone.id === id))
        .filter((phone): phone is Smartphone => phone !== undefined)
        .slice(0, 3); // Limite de 3 smartphones
      
      if (phonesToSelect.length > 0) {
        setSelectedPhones(phonesToSelect);
      }
    }
  }, [searchParams, smartphones]);

  const handlePhoneSelect = (phone: Smartphone) => {
    if (selectedPhones.length < 3 && !selectedPhones.find(p => p.id === phone.id)) {
      setSelectedPhones([...selectedPhones, phone]);
    }
    setIsModalOpen(false);
  };

  const removePhone = (phoneId: string) => {
    const newSelection = selectedPhones.filter(phone => phone.id !== phoneId);
    setSelectedPhones(newSelection);
  };

  const selectedPhonesData = selectedPhones.map(phone => ({
    id: phone.id,
    brand: phone.brand,
    model: phone.model,
    storage: phone.storage,
    imageUrl: phone.imageUrl,
    prices: {
      proximus: phone.upfrontPrices?.proximus?.price || null,
      orange: phone.upfrontPrices?.orange?.price || null,
      voo: phone.upfrontPrices?.voo?.price || null,
    },
    upfrontPrices: {
      proximus: phone.upfrontPrices?.proximus,
      orange: phone.upfrontPrices?.orange,
      voo: phone.upfrontPrices?.voo,
    }
  }));

  const baseUrl = 'https://www.jointoffer.be';
  const shareUrl = `${baseUrl}/compare?phones=${selectedPhones.map(p => p.id).join(',')}`;
  
  const getLowestMonthlyPrice = (phone: Smartphone) => {
    const prices = [
      phone.upfrontPrices?.proximus?.price,
      phone.upfrontPrices?.orange?.price,
      phone.upfrontPrices?.voo?.price
    ].filter(price => price !== undefined) as number[];
    
    if (prices.length === 0) return null;
    const lowestUpfront = Math.min(...prices);
    return Math.round((lowestUpfront / 24 + 20.99) * 100) / 100; // 20.99€ est le forfait de base le moins cher
  };

  const formatPrice = (price: number | null | undefined): string => {
    return price ? `${price}€` : 'N/A';
  };

  const getBestPlan = (phone: Smartphone) => {
    const plans = [
      { operator: 'Proximus', price: phone.upfrontPrices?.proximus?.price, plan: 'Mobile Flex S', monthly: 20.99 },
      { operator: 'VOO', price: phone.upfrontPrices?.voo?.price, plan: 'Mobile S', monthly: 15 },
      { operator: 'Orange', price: phone.upfrontPrices?.orange?.price, plan: 'Go Light', monthly: 20 },
    ].filter(p => p.price !== undefined && p.price !== null);

    if (plans.length === 0) return null;

    return plans.reduce((best, current) => {
      const bestTotal = best.price! / 24 + best.monthly;
      const currentTotal = current.price! / 24 + current.monthly;
      return currentTotal < bestTotal ? current : best;
    });
  };

  const generateComparisonText = () => {
    const intro = "📱 Comparaison intéressante de smartphones avec abonnement sur JointOffer !\n\n";
    
    const phonesComparison = selectedPhones.map(phone => {
      const bestPlan = getBestPlan(phone);
      const text = `${phone.brand} ${phone.model} (${phone.storage}GB):\n`;
      if (bestPlan) {
        const monthlyTotal = Math.round((bestPlan.price! / 24 + bestPlan.monthly) * 100) / 100;
        return text + `- Meilleure offre: ${bestPlan.operator} avec ${bestPlan.plan}\n` +
               `- Prix initial: ${formatPrice(bestPlan.price)}\n` +
               `- Prix mensuel total: ${formatPrice(monthlyTotal)} (sur 24 mois)\n`;
      }
      return text + "- Données non disponibles\n";
    }).join("\n");

    const compareUrl = `\n🔍 Comparez vous-même sur ${shareUrl}\n`;
    const footer = "\n#JointOffer #ComparaisonSmartphones #MeilleurPrix";

    return intro + phonesComparison + compareUrl + footer;
  };

  const shareTitle = `Comparaison de smartphones sur JointOffer:\n${selectedPhones.map(phone => 
    `${phone.brand} ${phone.model} (à partir de ${getLowestMonthlyPrice(phone)}€/mois)`
  ).join(' vs ')}`;

  const shareMessage = generateComparisonText();
  
  const generateImage = async () => {
    if (comparisonRef.current) {
      try {
        const canvas = await html2canvas(comparisonRef.current, {
          scale: 2,
          backgroundColor: '#ffffff',
        });
        return canvas.toDataURL('image/png');
      } catch (error) {
        console.error('Error generating image:', error);
        return null;
      }
    }
    return null;
  };

  const handleFacebookShare = async () => {
    // Génération de l'image
    const imageUrl = await generateImage();
    if (imageUrl) {
      setShareImage(imageUrl);
    }

    // Tracking analytics pour le partage Facebook
    try {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'share', {
          method: 'facebook',
          content_type: 'comparison',
          item_id: selectedPhones.join(',')
        });
      }
    } catch (error) {
      console.error('Error tracking Facebook share:', error);
    }
  };

  const ShareButton = ({ children, onClick, icon }: { children: React.ReactNode; onClick: () => void; icon: React.ReactNode }) => (
    <button
      onClick={onClick}
      className="flex items-center space-x-2 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow-sm"
    >
      {icon}
      <span>{children}</span>
    </button>
  );

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Comparaison de smartphones</h1>
          <p className="mt-2 text-gray-600">
            Comparez jusqu'à 3 smartphones et leurs offres chez différents opérateurs pour trouver la meilleure offre.
          </p>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                1
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Sélectionnez</h3>
                <p className="text-sm text-gray-500">Choisissez jusqu'à 3 smartphones à comparer</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                2
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Comparez</h3>
                <p className="text-sm text-gray-500">Analysez les prix et les offres des opérateurs</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                3
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Partagez</h3>
                <p className="text-sm text-gray-500">Partagez votre comparaison avec vos proches</p>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Phones */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Smartphones sélectionnés</h2>
            <Button
              onClick={() => setIsModalOpen(true)}
              disabled={selectedPhones.length >= 3}
              variant={selectedPhones.length >= 3 ? "outline" : "default"}
            >
              Ajouter un smartphone
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedPhones.map(phone => (
              <div key={phone.id} className="relative bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                <button
                  onClick={() => removePhone(phone.id)}
                  className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 relative flex-shrink-0">
                    <img
                      src={phone.imageUrl || '/images/smartphone-default.png'}
                      alt={`${phone.brand} ${phone.model}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{phone.brand} {phone.model}</h3>
                    <p className="text-sm text-gray-500 mb-2">{phone.storage}GB</p>
                    {getBestPlan(phone) && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-blue-600">
                          À partir de {getLowestMonthlyPrice(phone)}€/mois
                        </p>
                        <p className="text-xs text-gray-500">
                          avec un coût unique à partir de {Math.min(
                            ...[
                              phone.upfrontPrices?.proximus?.price,
                              phone.upfrontPrices?.orange?.price,
                              phone.upfrontPrices?.voo?.price
                            ].filter(Boolean) as number[]
                          )}€
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {Array.from({ length: Math.max(0, 3 - selectedPhones.length) }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="border-2 border-dashed rounded-lg p-4 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => setIsModalOpen(true)}
              >
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">Ajouter un smartphone</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Content */}
        {selectedPhones.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b">
                <div className="px-6">
                  <TabsList className="flex space-x-6">
                    <TabsTrigger value="price" className="pb-4 text-sm font-medium">
                      Prix et forfaits
                    </TabsTrigger>
                    <TabsTrigger value="specs" className="pb-4 text-sm font-medium">
                      Caractéristiques
                    </TabsTrigger>
                    <TabsTrigger value="share" className="pb-4 text-sm font-medium">
                      Partager
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>

              <div className="p-6">
                <TabsContent value="price">
                  <div className="space-y-8">
                    <PriceTable phones={selectedPhonesData} />
                    <PriceChart phones={selectedPhonesData} />
                  </div>
                </TabsContent>

                <TabsContent value="specs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {selectedPhones.map(phone => (
                      <div key={phone.id} className="space-y-4">
                        <h3 className="font-medium text-lg">{phone.brand} {phone.model}</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-500">Stockage</span>
                            <span className="font-medium">{phone.storage}GB</span>
                          </div>
                          {/* Add more specs here */}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="share">
                  <div className="space-y-8">
                    {/* Bannière incitative */}
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-6 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold">Partagez votre comparaison !</h3>
                          <p className="text-blue-100">
                            Vous avez trouvé la meilleure offre ? Aidez vos proches à faire le bon choix en partageant votre comparaison.
                          </p>
                        </div>
                        <div className="hidden md:block">
                          <svg className="w-24 h-24 text-blue-200 opacity-75" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Options de partage */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Réseaux sociaux */}
                      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                        <h3 className="font-medium text-lg mb-4">Partager sur les réseaux</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FacebookShareButton 
                            url={shareUrl}
                            quote={shareTitle}
                            hashtag="#JointOffer"
                            onClick={handleFacebookShare}
                          >
                            <Button variant="outline" size="lg" className="w-full flex items-center justify-center space-x-3 hover:bg-blue-50">
                              <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-600">
                                <path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                              </svg>
                              <span>Facebook</span>
                            </Button>
                          </FacebookShareButton>

                          <TwitterShareButton 
                            url={shareUrl} 
                            title={shareTitle}
                            hashtags={["JointOffer", "ComparaisonSmartphones", "MeilleurPrix"]}
                          >
                            <Button variant="outline" size="lg" className="w-full flex items-center justify-center space-x-3 hover:bg-blue-50">
                              <svg viewBox="0 0 24 24" className="h-5 w-5">
                                <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                              </svg>
                              <span>X</span>
                            </Button>
                          </TwitterShareButton>

                          <WhatsappShareButton 
                            url={shareUrl} 
                            title={shareTitle}
                          >
                            <Button variant="outline" size="lg" className="w-full flex items-center justify-center space-x-3 hover:bg-green-50">
                              <svg viewBox="0 0 24 24" className="h-5 w-5 text-green-600">
                                <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                              <span>WhatsApp</span>
                            </Button>
                          </WhatsappShareButton>
                        </div>
                      </div>

                      {/* Copier le lien */}
                      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                        <h3 className="font-medium text-lg mb-4">Copier le lien</h3>
                        <div className="space-y-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium mb-2">Message de partage</h4>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">
                              {shareMessage}
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <input
                              type="text"
                              value={shareUrl}
                              readOnly
                              className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 text-sm"
                            />
                            <Button
                              onClick={() => {
                                navigator.clipboard.writeText(shareMessage + "\n\n" + shareUrl);
                              }}
                              variant="outline"
                              size="lg"
                              className="whitespace-nowrap"
                            >
                              Copier tout
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}

        <SmartphoneModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelect={handlePhoneSelect}
          filterComparable={true}
        />
      </div>
    </main>
  );
}
