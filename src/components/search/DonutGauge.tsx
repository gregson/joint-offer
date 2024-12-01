import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

interface DonutGaugeProps {
  value: number;
  maxValue: number;
  label: string;
  displayText?: string;
  sublabel?: string;
  color?: string;
  size?: number;
  tooltip?: string;  // Nouveau prop pour le texte du tooltip
}

const DonutGauge: React.FC<DonutGaugeProps> = ({
  value,
  maxValue,
  label,
  displayText,
  sublabel,
  color = '#22c55e',
  size = 60,
  tooltip
}) => {
  const percentage = value === -1 ? 100 : Math.min((value / maxValue) * 100, 100);
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const [animatedPercentage, setAnimatedPercentage] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 50);
    return () => clearTimeout(timer);
  }, [percentage, value]);

  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  const gaugeContent = (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Foreground circle with animation */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          />
        </svg>
        {/* Centered text */}
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="text-xs text-gray-500">{label}</div>
        </div>
      </div>
      {/* Text below donut */}
      <div className="mt-1 text-center">
        <div className="font-bold text-gray-800 text-sm">
          {value === -1 ? "Illimités" : displayText || `${value}${label}`}
        </div>
        {sublabel && (
          <div className="text-xs text-gray-500">{sublabel}</div>
        )}
      </div>
    </div>
  );

  return tooltip ? (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div className="cursor-help">{gaugeContent}</div>
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
  ) : (
    gaugeContent
  );
};

export default DonutGauge;
