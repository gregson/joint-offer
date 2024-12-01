import React from 'react';

interface DetailSection {
  title: string;
  items: {
    label: string;
    value: string;
    info?: string;
  }[];
}

interface PlanDetailsProps {
  sections: DetailSection[];
}

const PlanDetails: React.FC<PlanDetailsProps> = ({ sections }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-8">Détails du forfait</h2>
      
      <div className="space-y-8">
        {sections.map((section, index) => (
          <div key={index} className="border-b border-gray-200 pb-8 last:border-b-0">
            <h3 className="text-xl font-semibold mb-4">{section.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-600 mb-1">{item.label}</p>
                      <p className="font-semibold">{item.value}</p>
                    </div>
                    {item.info && (
                      <div className="group relative">
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <div className="absolute right-0 w-64 p-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                          {item.info}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanDetails;
