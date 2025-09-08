import { Option } from '@/types';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  isVisible: boolean;
  title: string;
  description: string;
  options: Option[];
  layout: "grid" | "list";
  selectedValue: string;
  multiSelect?: boolean;
  selectedValues?: string[];
  onSelect: (value: string) => void;
}

export default function QuestionCard({
  isVisible,
  title,
  description,
  options,
  layout,
  selectedValue,
  multiSelect = false,
  selectedValues = [],
  onSelect,
}: QuestionCardProps) {
  if (!isVisible) {
    return null;
  }

  const isSelected = (value: string) => {
    return multiSelect 
      ? selectedValues.includes(value)
      : selectedValue === value;
  };

  return (
    <div className="animate-in fade-in duration-300">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-gray-600 mb-6">{description}</p>
      
      <div className={cn(
        layout === "grid" 
          ? "grid grid-cols-2 gap-3" 
          : "space-y-3"
      )}>
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={cn(
              "w-full transition-all duration-200 relative",
              layout === "grid" 
                ? "p-4 rounded-lg border flex flex-col items-center text-center"
                : "p-3 rounded-lg border flex items-center justify-between",
              isSelected(option.value) 
                ? "border-primary/70 bg-primary/5" 
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <div className={cn(
              layout === "grid" ? "flex flex-col items-center" : "flex items-center"
            )}>
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mb-2",
                  layout === "grid" ? "mb-2" : "mr-3",
                  option.bgClass || `bg-${option.iconColor}-100`
                )}
              >
                {option.iconElement || (
                  <i className={`${option.icon} text-${option.iconColor}-500`}></i>
                )}
              </div>
              
              <div className={layout === "grid" ? "" : "flex-1"}>
                <div className="font-medium">{option.label}</div>
                {option.description && (
                  <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                )}
              </div>
            </div>
            
            {isSelected(option.value) && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white">
                <Check className="w-3 h-3" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}