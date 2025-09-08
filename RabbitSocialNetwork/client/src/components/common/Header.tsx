import { ChevronLeft } from "lucide-react";

interface HeaderProps {
  showBackButton?: boolean;
  showSkipButton?: boolean;
  onBackClick?: () => void;
  onSkipClick?: () => void;
}

export default function Header({
  showBackButton = false,
  showSkipButton = false,
  onBackClick,
  onSkipClick,
}: HeaderProps) {
  return (
    <header className="bg-white p-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-10">
      <div className="flex items-center">
        {showBackButton && (
          <button
            onClick={onBackClick}
            className="mr-2 p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white mr-2">
            <span className="text-xs font-bold">R</span>
          </div>
          <span className="font-medium">Rabbit</span>
        </div>
      </div>
      
      {showSkipButton && (
        <button
          onClick={onSkipClick}
          className="text-sm font-medium text-primary"
        >
          Skip
        </button>
      )}
    </header>
  );
}