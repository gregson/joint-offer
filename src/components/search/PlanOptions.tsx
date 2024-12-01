import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

interface PlanOptionsProps {
  data: string;
  calls: string;
  messages: string;
  onDataChange: (value: string) => void;
  onCallsChange: (value: string) => void;
  onMessagesChange: (value: string) => void;
}

const getProgressPercentage = (value: string, type: 'data' | 'calls' | 'messages'): number => {
  if (value === 'Unlimited' || value === 'unlimited') return 100;
  const numValue = parseInt(value);
  if (isNaN(numValue)) return 0;
  
  const maxValues = {
    data: 200,
    calls: 500,
    messages: 1000
  };
  
  return Math.min((numValue / maxValues[type]) * 100, 100);
};

const getValueFromPercentage = (percentage: number, type: 'data' | 'calls' | 'messages'): string => {
  const maxValues = {
    data: 200,
    calls: 500,
    messages: 1000
  };

  if (percentage >= 100) {
    return 'Unlimited';
  }

  const value = Math.round((percentage / 100) * maxValues[type]);
  const steps = {
    data: [10,35,70, 100, 150, 200],
    calls: [100, 200, 300, 500],
    messages: [250, 500, 750, 1000]
  };

  return steps[type].reduce((prev, curr) => {
    return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
  }).toString();
};

const GaugeSlider: React.FC<{
  value: string;
  type: 'data' | 'calls' | 'messages';
  onChange: (value: string) => void;
  label: string;
  tooltip: string;
}> = ({ value, type, onChange, label, tooltip }) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const sliderRef = React.useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateValue(e);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updateValue(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const updateValue = (e: React.MouseEvent | MouseEvent) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    onChange(getValueFromPercentage(percentage, type));
  };

  const percentage = getProgressPercentage(value, type);
  const displayValue = type === 'data' 
    ? (value === 'Unlimited' ? '∞' : `${value} Go`)
    : type === 'calls'
    ? (value === 'Unlimited' ? '∞' : `${value} min`)
    : (value === 'Unlimited' ? '∞' : `${value} SMS`);

  return (
    <div className="flex-1">
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center">
            <label className="text-sm text-gray-500">{label}</label>
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="rounded-md bg-gray-800 px-3 py-2 text-sm text-white shadow-md animate-fadeIn"
                    sideOffset={5}
                  >
                    {tooltip}
                    <Tooltip.Arrow className="fill-gray-800" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
          <span className="text-sm font-medium text-blue-600">{displayValue}</span>
        </div>
        <div 
          ref={sliderRef}
          className="relative h-3 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
          onMouseDown={handleMouseDown}
        >
          <div 
            className="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all duration-100"
            style={{ width: `${percentage}%` }}
          >
            <div 
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-3 border-blue-500 transition-all duration-100 hover:scale-110 ${isDragging ? 'scale-110 shadow-xl' : ''}`}
              style={{
                boxShadow: isDragging 
                  ? '0 4px 12px rgba(59, 130, 246, 0.4)' 
                  : '0 2px 6px rgba(59, 130, 246, 0.2)'
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlanOptions: React.FC<PlanOptionsProps> = ({
  data,
  calls,
  messages,
  onDataChange,
  onCallsChange,
  onMessagesChange
}) => {
  return (
    <div className="flex items-center space-x-6">
      <GaugeSlider
        value={calls}
        type="calls"
        onChange={onCallsChange}
        label="Minutes"
        tooltip="Définissez le nombre de minutes d'appel dont vous avez besoin par mois. Faites glisser pour ajuster."
      />
      <GaugeSlider
        value={data}
        type="data"
        onChange={onDataChange}
        label="Data"
        tooltip="Choisissez votre volume de données mobiles mensuel. Faites glisser pour ajuster."
      />
      <GaugeSlider
        value={messages}
        type="messages"
        onChange={onMessagesChange}
        label="SMS"
        tooltip="Définissez le nombre de SMS dont vous avez besoin par mois. Faites glisser pour ajuster."
      />
    </div>
  );
};

export default PlanOptions;
