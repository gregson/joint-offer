import React from 'react';

interface DetailSection {
  title: string;
  items: {
    label: string;
    value: string | undefined;
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
          <div key={index} className="border-t pt-6 first:border-t-0 first:pt-0">
            <h3 className="text-xl font-semibold mb-4">{section.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-medium">{item.value || 'Non disponible'}</span>
                  </div>
                  {item.info && (
                    <p className="text-sm text-gray-500">{item.info}</p>
                  )}
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
