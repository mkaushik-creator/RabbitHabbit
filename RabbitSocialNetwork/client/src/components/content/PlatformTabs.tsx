import { PLATFORM_COLORS } from '@/constants';
import { cn } from '@/lib/utils';

interface PlatformTabsProps {
  platforms: string[];
  activePlatform: string;
  onSelectPlatform: (platform: string) => void;
}

export default function PlatformTabs({ platforms, activePlatform, onSelectPlatform }: PlatformTabsProps) {
  return (
    <div className="flex overflow-x-auto px-2 py-2 no-scrollbar">
      {platforms.map((platform) => (
        <button
          key={platform}
          onClick={() => onSelectPlatform(platform)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap mr-2 min-w-max transition-colors",
            activePlatform === platform
              ? `bg-${PLATFORM_COLORS[platform] || 'primary'} text-white`
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          {platform}
        </button>
      ))}
    </div>
  );
}