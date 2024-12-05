import React from 'react';

export interface FilterState {
  priceRange: [number, number];
  data: string;
  calls: string;
  messages: string;
  networkType: string[];
  features: string[];
}

interface PlanFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const PlanFilters: React.FC<PlanFiltersProps> = ({ filters, onChange }) => {
  const handleNetworkTypeChange = (type: string) => {
    const newTypes = filters.networkType.includes(type)
      ? filters.networkType.filter(t => t !== type)
      : [...filters.networkType, type];
    onChange({ ...filters, networkType: newTypes });
  };

  const handleFeatureChange = (feature: string) => {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter(f => f !== feature)
      : [...filters.features, feature];
    onChange({ ...filters, features: newFeatures });
  };

  return (
    <div className="bg-white rounded-lg shadow mb-6 p-4">
      <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-6">
        {/* Smartphone sélectionné */}
        <div className="w-full lg:w-64 flex-shrink-0 cursor-pointer group">
          <div className="flex items-start space-x-4 p-3 rounded-lg group-hover:bg-gray-50 transition-colors">
            <div className="relative w-20 lg:w-28 h-28 flex-shrink-0">
              <img
                src="https://www.proximus.be/dam/cdn/sites/iportal/images/products/device/p/px-samsung-a35-5g-128gb-navy/detail/px-samsung-a35-5g-128gb-navy-XS-1.png"
                alt="Samsung Galaxy A35"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0 pt-1">
              <div className="text-xs text-gray-400 mb-0.5">Smartphone sélectionné</div>
              <div className="text-sm font-medium text-gray-900 truncate">Samsung</div>
              <div className="text-sm text-gray-500 truncate">Galaxy A35</div>
            </div>
          </div>
        </div>

        {/* Séparateur vertical - visible uniquement sur desktop */}
        <div className="hidden lg:block h-10 w-px bg-gray-200"></div>

        {/* Contrôles des filtres */}
        <div className="flex-1 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4">
            {/* Prix mensuel */}
            <div className="flex-1 px-2">
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <label className="text-sm text-gray-500">Prix mensuel</label>
                    <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
                  </div>
                  <span className="text-sm font-medium text-blue-600">{filters.priceRange[1]}€</span>
                </div>
                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden cursor-pointer">
                  <div className="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all duration-100" style={{ width: `${(filters.priceRange[1] / 100) * 100}%` }}>
                    <div 
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-blue-500 transition-all duration-100 hover:scale-110" 
                      style={{ boxShadow: 'rgba(59, 130, 246, 0.2) 0px 2px 6px' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Données mobiles */}
            <div className="flex-1 px-2">
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <label className="text-sm text-gray-500">Données mobiles</label>
                    <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
                  </div>
                  <span className="text-sm font-medium text-blue-600">{filters.data}</span>
                </div>
                <div className="relative">
                  <select
                    value={filters.data}
                    onChange={(e) => onChange({ ...filters, data: e.target.value })}
                    className="w-full border rounded-lg p-2 appearance-none bg-white pr-8"
                  >
                    <option value="">Toutes les offres</option>
                    <option value="100">100 Go</option>
                    <option value="150">150 Go</option>
                    <option value="200">200 Go</option>
                    <option value="unlimited">Illimité</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Type de réseau */}
            <div className="flex-1 px-2">
              <div className="flex flex-col">
                <label className="text-sm text-gray-500 mb-2">Type de réseau</label>
                <div className="space-y-2">
                  {['4G', '5G'].map(type => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.networkType.includes(type)}
                        onChange={() => handleNetworkTypeChange(type)}
                        className="rounded text-blue-600"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Avantages */}
            <div className="flex-1 px-2">
              <div className="flex flex-col">
                <label className="text-sm text-gray-500 mb-2">Avantages</label>
                <div className="space-y-2">
                  {[
                    'Hotspot mobile',
                    'Protection anti-spam',
                    'Appels internationaux',
                    'Multi-SIM'
                  ].map(feature => (
                    <label key={feature} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.features.includes(feature)}
                        onChange={() => handleFeatureChange(feature)}
                        className="rounded text-blue-600"
                      />
                      <span>{feature}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanFilters;
