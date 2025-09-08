import { useState } from "react";
import { useLocation } from "wouter";
import { 
  ChevronLeft,
  Plus,
  Hash,
  RefreshCw,
  X
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import MainHeader from "@/components/common/MainHeader";

export default function HashtagGenerator() {
  const [_, setLocation] = useLocation();
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [customHashtag, setCustomHashtag] = useState("");
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);

  // Predefined trending hashtags
  const trendingHashtags = [
    "#trending2025", "#viralpost", "#explorepage", "#fyp", "#trending", "#contentcreator"
  ];

  const nicheHashtags = [
    "#creatoreconomy", "#contentmarketing", "#socialmediamanagement", "#creatortips"
  ];

  const addCustomHashtag = () => {
    let hashtag = customHashtag.trim();
    if (hashtag && !hashtag.startsWith('#')) {
      hashtag = '#' + hashtag;
    }
    
    if (hashtag && hashtag.length > 1 && !selectedHashtags.includes(hashtag)) {
      setSelectedHashtags(prev => [...prev, hashtag]);
      setCustomHashtag("");
    }
  };

  const toggleHashtag = (hashtag: string) => {
    setSelectedHashtags(prev => 
      prev.includes(hashtag) 
        ? prev.filter(h => h !== hashtag)
        : [...prev, hashtag]
    );
  };

  const removeSelectedHashtag = (hashtag: string) => {
    setSelectedHashtags(prev => prev.filter(h => h !== hashtag));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addCustomHashtag();
    }
  };

  const refreshSuggestions = () => {
    // In a real app, this would fetch new suggestions from an API
    console.log("Refreshing hashtag suggestions...");
  };

  const handleContinue = () => {
    // Store selected hashtags
    localStorage.setItem('selectedHashtags', JSON.stringify(selectedHashtags));
    localStorage.setItem('autoGenerateHashtags', JSON.stringify(autoGenerate));
    
    // Navigate to scheduler
    setLocation("/scheduler");
  };

  return (
    <div className="min-h-screen bg-background">
      <MainHeader title="Hashtag Generator" showBackButton={true} />

      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Hashtag Generator</h2>
          <p className="text-gray-600">Boost your reach with optimal hashtags for your content</p>
        </div>

        {/* Auto-generate Toggle */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold">Auto-generate hashtags</Label>
                <p className="text-sm text-gray-600 mt-1">Use AI to find optimal hashtags</p>
              </div>
              <Switch 
                checked={autoGenerate} 
                onCheckedChange={setAutoGenerate}
              />
            </div>
          </CardContent>
        </Card>

        {/* Suggested Hashtags */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-base font-semibold">Suggested Hashtags</Label>
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshSuggestions}
              className="flex items-center space-x-1"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>

          {/* Trending Section */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Trending</h3>
            <div className="flex flex-wrap gap-2">
              {trendingHashtags.map((hashtag) => (
                <Badge
                  key={hashtag}
                  variant={selectedHashtags.includes(hashtag) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    selectedHashtags.includes(hashtag) 
                      ? 'bg-blue-500 text-white' 
                      : 'hover:bg-blue-50'
                  }`}
                  onClick={() => toggleHashtag(hashtag)}
                >
                  {hashtag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Niche Section */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Niche</h3>
            <div className="flex flex-wrap gap-2">
              {nicheHashtags.map((hashtag) => (
                <Badge
                  key={hashtag}
                  variant={selectedHashtags.includes(hashtag) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    selectedHashtags.includes(hashtag) 
                      ? 'bg-blue-500 text-white' 
                      : 'hover:bg-blue-50'
                  }`}
                  onClick={() => toggleHashtag(hashtag)}
                >
                  {hashtag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Add Custom Hashtags */}
        <div className="mb-6">
          <Label className="text-base font-semibold mb-4 block">Add Your Own Hashtags</Label>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter custom hashtag"
              value={customHashtag}
              onChange={(e) => setCustomHashtag(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={addCustomHashtag}
              size="icon"
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Selected Hashtags */}
        <div className="mb-8">
          <Label className="text-base font-semibold mb-4 block">
            Selected Hashtags ({selectedHashtags.length})
          </Label>
          
          {selectedHashtags.length > 0 ? (
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  {selectedHashtags.map((hashtag, index) => (
                    <Badge
                      key={index}
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center space-x-2"
                    >
                      <span>{hashtag}</span>
                      <button 
                        onClick={() => removeSelectedHashtag(hashtag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8">
                <div className="text-center text-gray-500">
                  <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Select hashtags from suggestions or add your own.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Continue Button */}
        <Button 
          onClick={handleContinue}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 text-base font-medium"
        >
          Continue to Scheduler
        </Button>
      </div>
    </div>
  );
}