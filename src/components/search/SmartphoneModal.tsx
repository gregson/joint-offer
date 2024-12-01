import React from 'react';
import { getSmartphones } from '@/utils/dataLoader';
import type { Smartphone } from '@/types/smartphone';

interface SmartphoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (phone: Smartphone) => void;
  filterComparable?: boolean;
}

const SmartphoneModal: React.FC<SmartphoneModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelect,
  filterComparable = false
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedBrand, setSelectedBrand] = React.useState('');
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 2000]);

  const smartphones = getSmartphones();
  const brands = Array.from(new Set(smartphones.map(phone => phone.brand)));

  // Calculer le prix maximum parmi tous les smartphones
  const getPhoneMinPrice = (phone: any) => {
    if (!phone.upfrontPrices || Object.values(phone.upfrontPrices).length === 0) return Infinity;
    return Math.min(...Object.values(phone.upfrontPrices).map((p: any) => p.price));
  };

  const maxPrice = Math.max(
    ...smartphones
      .map(getPhoneMinPrice)
      .filter(price => price !== Infinity)
  );

  // Réinitialiser les filtres quand la modale s'ouvre
  React.useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedBrand('');
      setPriceRange([0, maxPrice]);
    }
  }, [isOpen, maxPrice]);

  const filteredPhones = smartphones
    .filter(phone => {
      const phoneModel = phone?.model?.toString() || '';
      const phoneBrand = phone?.brand?.toString() || '';
      const matchesSearch = phoneModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           phoneBrand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand = !selectedBrand || phoneBrand === selectedBrand;
      const phonePrice = getPhoneMinPrice(phone);
      const matchesPrice = phonePrice === Infinity || phonePrice <= priceRange[1];

      if (filterComparable) {
        const hasProximusPrice = !!phone.upfrontPrices?.proximus?.price;
        const hasVooPrice = !!phone.upfrontPrices?.voo?.price;
        const hasOrangePrice = !!phone.upfrontPrices?.orange?.price;
        const operatorCount = [hasProximusPrice, hasVooPrice, hasOrangePrice].filter(Boolean).length;
        return operatorCount >= 2 && matchesSearch && matchesBrand && matchesPrice;
      }

      return matchesSearch && matchesBrand && matchesPrice;
    })
    .sort((a, b) => {
      const priceA = getPhoneMinPrice(a);
      const priceB = getPhoneMinPrice(b);
      
      // Mettre les téléphones sans prix à la fin
      if (priceA === Infinity) return 1;
      if (priceB === Infinity) return -1;
      
      return priceA - priceB;
    });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Choisir un smartphone</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <input
              type="text"
              placeholder="Rechercher un smartphone..."
              className="border rounded-lg p-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="border rounded-lg p-2"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="">Toutes les marques</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max={maxPrice}
                step="50"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="w-full"
              />
              <span className="whitespace-nowrap">Max: {priceRange[1]}€</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 overflow-y-auto max-h-[60vh]">
            {filteredPhones.map(phone => (
              <div
                key={phone.id}
                className="border rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all duration-200 text-center flex flex-col h-full hover:border-blue-400 hover:scale-[1.02]"
                onClick={() => onSelect(phone)}
              >
                <div className="mb-3 flex-shrink-0 relative" style={{ paddingBottom: '100%' }}>
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
                    <img
                      src={phone.imageUrl}
                      alt={`${phone.brand} ${phone.model}`}
                      className="w-full h-full object-contain p-2"
                      style={{ maxHeight: '140px' }}
                    />
                  </div>
                </div>
                <div className="flex flex-col flex-grow">
                  <h3 className="font-semibold text-sm text-gray-800 leading-tight mb-1">
                    {phone.brand} {phone.model}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">
                    {phone.storage > 0 ? `${phone.storage}GB` : ''}
                  </p>
                  {phone.upfrontPrices && Object.values(phone.upfrontPrices).length > 0 && (
                    <div className="mt-auto">
                      <p className="text-xs text-gray-500">À partir de</p>
                      <p className="text-lg font-bold text-blue-600">
                        {Math.min(...Object.values(phone.upfrontPrices).map(p => p.price))}€
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartphoneModal;
