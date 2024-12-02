import React from 'react';
import type { Smartphone } from '@/types/smartphone';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  FacebookShareButton, 
  TwitterShareButton, 
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon
} from 'react-share';
import plansData from '@/data/plans.json';

interface PriceTableProps {
  phones: Array<{
    id: string;
    brand: string;
    model: string;
    prices: {
      proximus: number | null;
      voo: number | null;
      orange: number | null;
    };
    upfrontPrices?: {
      proximus?: {
        price: number;
        url?: string;
        condition?: string;
      };
      voo?: {
        price: number;
        url?: string;
        condition?: string;
      };
      orange?: {
        price: number;
        url?: string;
        condition?: string;
      };
    };
  }>;
}

interface PlanDetails {
  name: string;
  dataGB: number;
  monthlyPrice: number;
}

// Organiser les plans par opérateur
const OPERATOR_PLANS: Record<string, PlanDetails[]> = {
  proximus: plansData.plans
    .filter(plan => plan.provider.toLowerCase() === 'proximus')
    .map(plan => ({
      name: plan.name,
      dataGB: parseInt(plan.data),
      monthlyPrice: plan.price
    })),
  voo: plansData.plans
    .filter(plan => plan.provider.toLowerCase() === 'voo')
    .map(plan => ({
      name: plan.name,
      dataGB: parseInt(plan.data),
      monthlyPrice: plan.price
    })),
  orange: plansData.plans
    .filter(plan => plan.provider.toLowerCase() === 'orange')
    .map(plan => ({
      name: plan.name,
      dataGB: parseInt(plan.data),
      monthlyPrice: plan.price
    }))
};

export function PriceTable({ phones }: PriceTableProps) {
  // Extraire le prix mensuel de l'option data depuis la condition
  const extractDataOptionPrice = (condition: string | undefined): number => {
    if (!condition) return 0;
    
    // Pour Proximus: "Avec DataPhone 3,5 GB : €35/mois."
    const proximusMatch = condition.match(/€(\d+)\/mois/);
    if (proximusMatch) return Number(proximusMatch[1]);
    
    // Pour Orange: "Avec Option Data à 35€/mois"
    const orangeMatch = condition.match(/à (\d+)€\/mois/);
    if (orangeMatch) return Number(orangeMatch[1]);
    
    // Pour VOO: "Avec 20 Gb pour 38€/mois"
    const vooMatch = condition.match(/pour (\d+)€\/mois/);
    if (vooMatch) return Number(vooMatch[1]);
    
    return 0;
  };

  // Calculer le prix mensuel total pour chaque combinaison
  const calculateMonthlyTotal = (phone: any, operator: string, planPrice: number) => {
    const upfrontPrice = phone.upfrontPrices?.[operator]?.price;
    if (!upfrontPrice) return null;

    const dataOptionPrice = extractDataOptionPrice(phone.upfrontPrices?.[operator]?.condition);
    const total = planPrice + dataOptionPrice;
    
    return Math.round(total * 100) / 100;
  };

  // Trouver le prix mensuel le plus bas parmi toutes les offres
  const findLowestPrice = () => {
    let lowestPrice = Infinity;
    let lowestPriceDetails = { operator: '', plan: '', phoneId: '' };

    Object.entries(OPERATOR_PLANS).forEach(([operator, plans]) => {
      plans.forEach(plan => {
        phones.forEach(phone => {
          const monthlyTotal = calculateMonthlyTotal(phone, operator, plan.monthlyPrice);
          if (monthlyTotal && monthlyTotal < lowestPrice) {
            lowestPrice = monthlyTotal;
            lowestPriceDetails = {
              operator,
              plan: plan.name,
              phoneId: phone.id
            };
          }
        });
      });
    });

    return { lowestPrice, ...lowestPriceDetails };
  };

  const bestOffer = findLowestPrice();

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Opérateur
            </th>
            {phones.map(phone => (
              <th key={phone.id} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {phone.brand} {phone.model}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Object.entries(OPERATOR_PLANS).map(([operator, plans]) => (
            plans.map((plan, planIndex) => (
              <tr key={`${operator}-${plan.name}`} className={planIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {operator.charAt(0).toUpperCase() + operator.slice(1)} - {plan.name}
                  <br />
                  <span className="text-xs text-gray-500">
                    {plan.dataGB === 999 ? 'Illimité' : `${plan.dataGB}GB`} - {plan.monthlyPrice}€/mois
                  </span>
                </td>
                {phones.map(phone => {
                  const monthlyTotal = calculateMonthlyTotal(phone, operator, plan.monthlyPrice);
                  const isBestOffer = bestOffer.operator === operator && 
                                    bestOffer.plan === plan.name && 
                                    bestOffer.phoneId === phone.id;

                  return (
                    <td 
                      key={`${operator}-${plan.name}-${phone.id}`} 
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                        isBestOffer ? 'bg-green-50 rounded-lg' : ''
                      }`}
                    >
                      {phone.upfrontPrices?.[operator as keyof typeof phone.upfrontPrices]?.price ? (
                        <>
                          <div className="space-y-2">
                            <div>Prix initial du téléphone: {phone.upfrontPrices[operator as keyof typeof phone.upfrontPrices]?.price}€</div>
                            <div className="text-sm text-gray-500">
                              Détail mensuel :
                              <ul className="list-disc list-inside ml-2">
                                <li>Abonnement : {plan.monthlyPrice}€/mois</li>
                                <li>Option data : {extractDataOptionPrice(phone.upfrontPrices[operator as keyof typeof phone.upfrontPrices]?.condition)}€/mois</li>
                              </ul>
                            </div>
                            <div className={`font-medium ${isBestOffer ? 'text-green-700' : ''}`}>
                              Total mensuel : {monthlyTotal}€/mois
                            </div>
                            <div className="text-xs text-gray-400">
                              {phone.upfrontPrices[operator as keyof typeof phone.upfrontPrices]?.condition}
                            </div>
                            {isBestOffer && (
                              <>
                                <div className="text-xs font-medium text-green-600 mt-2">
                                  Meilleure offre !
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                  <a 
                                    href={phone.upfrontPrices?.[operator as keyof typeof phone.upfrontPrices]?.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
                                  >
                                    <span>Voir l'offre</span>
                                    <ExternalLink className="ml-2 h-4 w-4" />
                                  </a>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="inline-flex items-center text-green-600 hover:bg-green-50"
                                      >
                                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                        </svg>
                                        Partager
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                      <DropdownMenuItem className="cursor-pointer">
                                        <FacebookShareButton
                                          url={`${window.location.origin}/search?phone=${phone.id}`}
                                          hashtag="#JointOffer"
                                          className="w-full flex items-center"
                                        >
                                          <FacebookIcon size={24} round className="mr-2" />
                                          <span>Partager sur Facebook</span>
                                        </FacebookShareButton>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="cursor-pointer">
                                        <TwitterShareButton
                                          url={`${window.location.origin}/search?phone=${phone.id}`}
                                          title={`J'ai trouvé la meilleure offre pour le ${phone.brand} ${phone.model} !\n${monthlyTotal}€/mois avec ${operator.charAt(0).toUpperCase() + operator.slice(1)} (${plan.name}) - Prix du téléphone : ${phone.upfrontPrices[operator as keyof typeof phone.upfrontPrices]?.price}€`}
                                          className="w-full flex items-center"
                                        >
                                          <TwitterIcon size={24} round className="mr-2" />
                                          <span>Partager sur X</span>
                                        </TwitterShareButton>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="cursor-pointer">
                                        <WhatsappShareButton
                                          url={`${window.location.origin}/search?phone=${phone.id}`}
                                          title={`J'ai trouvé la meilleure offre pour le ${phone.brand} ${phone.model} !\n${monthlyTotal}€/mois avec ${operator.charAt(0).toUpperCase() + operator.slice(1)} (${plan.name}) - Prix du téléphone : ${phone.upfrontPrices[operator as keyof typeof phone.upfrontPrices]?.price}€`}
                                          className="w-full flex items-center"
                                        >
                                          <WhatsappIcon size={24} round className="mr-2" />
                                          <span>Partager sur WhatsApp</span>
                                        </WhatsappShareButton>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </>
                            )}
                            {!isBestOffer && phone.upfrontPrices?.[operator as keyof typeof phone.upfrontPrices]?.url && (
                              <div className="mt-3">
                                <a 
                                  href={phone.upfrontPrices[operator as keyof typeof phone.upfrontPrices]?.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                >
                                  <span>Voir l'offre</span>
                                  <ExternalLink className="ml-2 h-4 w-4" />
                                </a>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-400">Non disponible</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          ))}
        </tbody>
      </table>
    </div>
  );
}
