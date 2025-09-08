import { useState } from "react";
import { useLocation } from "wouter";
import { 
  ChevronLeft,
  Plus,
  Users,
  MessageSquare,
  Briefcase,
  Edit
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import MainHeader from "@/components/common/MainHeader";

export default function Collaborators() {
  const [_, setLocation] = useLocation();
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [newCollaborator, setNewCollaborator] = useState("");
  const [captionStyle, setCaptionStyle] = useState("fun-chill");

  const addCollaborator = () => {
    if (newCollaborator.trim() && !collaborators.includes(newCollaborator.trim())) {
      setCollaborators(prev => [...prev, newCollaborator.trim()]);
      setNewCollaborator("");
    }
  };

  const removeCollaborator = (collaborator: string) => {
    setCollaborators(prev => prev.filter(c => c !== collaborator));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addCollaborator();
    }
  };

  const handleContinue = () => {
    // Store the selected options in localStorage or state management
    localStorage.setItem('collaborators', JSON.stringify(collaborators));
    localStorage.setItem('captionStyle', captionStyle);
    
    // Navigate to hashtag generator
    setLocation("/hashtag-generator");
  };

  return (
    <div className="min-h-screen bg-background">
      <MainHeader title="Tag Collaborators" showBackButton={true} />

      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Tag Collaborators & Customize Caption</h2>
          <p className="text-gray-600">Add collaborators and personalize your caption style</p>
        </div>

        {/* Add Collaborators Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="h-5 w-5 text-gray-600" />
            <Label className="text-base font-semibold">Add Collaborators</Label>
          </div>
          
          <div className="flex space-x-2 mb-4">
            <Input
              placeholder="Enter collaborator handle (e.g., @username)"
              value={newCollaborator}
              onChange={(e) => setNewCollaborator(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={addCollaborator}
              size="icon"
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Display added collaborators */}
          {collaborators.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {collaborators.map((collaborator, index) => (
                <div 
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                >
                  <span>{collaborator}</span>
                  <button 
                    onClick={() => removeCollaborator(collaborator)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Caption Style Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <MessageSquare className="h-5 w-5 text-gray-600" />
            <Label className="text-base font-semibold">Caption Style</Label>
          </div>
          
          <RadioGroup value={captionStyle} onValueChange={setCaptionStyle} className="space-y-3">
            <Card className={`cursor-pointer transition-colors ${captionStyle === 'fun-chill' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="fun-chill" id="fun-chill" />
                  <div className="flex-1">
                    <Label htmlFor="fun-chill" className="text-base font-medium cursor-pointer">
                      Fun & Chill
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Casual, conversational captions with emojis
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`cursor-pointer transition-colors ${captionStyle === 'trendy-genz' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="trendy-genz" id="trendy-genz" />
                  <div className="flex-1">
                    <Label htmlFor="trendy-genz" className="text-base font-medium cursor-pointer">
                      Trendy Gen-Z
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      On-trend slang and contemporary style
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`cursor-pointer transition-colors ${captionStyle === 'professional' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="professional" id="professional" />
                  <div className="flex-1">
                    <Label htmlFor="professional" className="text-base font-medium cursor-pointer">
                      Professional & Sleek
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Polished, industry-appropriate wording
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`cursor-pointer transition-colors ${captionStyle === 'custom' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="custom" id="custom" />
                  <div className="flex-1">
                    <Label htmlFor="custom" className="text-base font-medium cursor-pointer">
                      Write My Own
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Create your own custom caption
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </RadioGroup>
        </div>

        {/* Continue Button */}
        <Button 
          onClick={handleContinue}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 text-base font-medium"
        >
          Continue to Hashtag Generator
        </Button>
      </div>
    </div>
  );
}