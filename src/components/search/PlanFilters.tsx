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
    <div className="flex items-center space-x-6 bg-white p-4 rounded-lg">
      {/* Prix mensuel */}
      <div className="flex-1">
        <div className="flex flex-col">
          <label className="text-sm text-gray-500 mb-1">Prix mensuel</label>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={filters.priceRange[1]}
              onChange={(e) => onChange({
                ...filters,
                priceRange: [filters.priceRange[0], parseInt(e.target.value)]
              })}
              className="w-full"
            />
            <span className="text-sm">Max: {filters.priceRange[1]}€</span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-blue-100 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full w-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Données mobiles */}
      <div className="flex-1">
        <div className="flex flex-col">
          <label className="text-sm text-gray-500 mb-1">Données mobiles</label>
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
          <div className="mt-2">
            <div className="w-full bg-blue-100 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full w-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Type de réseau */}
      <div className="flex-1">
        <div className="flex flex-col">
          <label className="text-sm text-gray-500 mb-1">Type de réseau</label>
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
      <div className="flex-1">
        <div className="flex flex-col">
          <label className="text-sm text-gray-500 mb-1">Avantages</label>
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
  );
};

export default PlanFilters;
