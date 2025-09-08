import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, Download } from "lucide-react";

export default function ImageTest() {
  const [prompt, setPrompt] = useState("A beautiful sunset over mountains");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateTestImage = async () => {
    console.log('🧪 TEST: Generate Image clicked');
    console.log('🧪 TEST: Prompt:', prompt);
    
    if (!prompt.trim()) {
      console.error('🧪 TEST: No prompt provided');
      setError("Please enter a prompt");
      return;
    }
    
    console.log('🧪 TEST: Starting generation...');
    setIsGenerating(true);
    setError(null);
    setGeneratedImageUrl(null);
    
    try {
      console.log('🧪 TEST: Sending request to /api/generate-image');
      
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      
      console.log('🧪 TEST: Response status:', response.status);
      console.log('🧪 TEST: Response ok:', response.ok);
      
      const result = await response.json();
      console.log('🧪 TEST: Response data:', result);
      
      if (result.success && result.imageUrl) {
        console.log('🧪 TEST: ✅ Image generated successfully:', result.imageUrl);
        setGeneratedImageUrl(result.imageUrl);
      } else {
        console.error('🧪 TEST: ❌ Generation failed:', result.message);
        setError(result.message || "Generation failed");
      }
    } catch (error) {
      console.error('🧪 TEST: ❌ Network error:', error);
      setError("Network error occurred");
    } finally {
      console.log('🧪 TEST: Generation completed');
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (generatedImageUrl) {
      const link = document.createElement('a');
      link.href = generatedImageUrl;
      link.download = 'generated-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Image Generation Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prompt">Image Prompt</Label>
              <Input
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter image description..."
                disabled={isGenerating}
              />
            </div>
            
            <Button
              onClick={() => {
                console.log('🧪 TEST: Button clicked - direct handler');
                generateTestImage();
              }}
              disabled={isGenerating || !prompt.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating Image...
                </>
              ) : (
                "Generate Image"
              )}
            </Button>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
                <strong>Error:</strong> {error}
              </div>
            )}
            
            {generatedImageUrl && (
              <div className="space-y-3">
                <div className="border rounded p-2">
                  <img 
                    src={generatedImageUrl} 
                    alt="Generated image"
                    className="w-full max-h-96 object-contain rounded"
                    onLoad={() => console.log('🧪 TEST: Image loaded successfully')}
                    onError={() => console.error('🧪 TEST: Image failed to load')}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={generateTestImage}
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                  <Button
                    variant="outline"
                    onClick={downloadImage}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Image URL:</strong> {generatedImageUrl}
                </div>
              </div>
            )}
            
            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
              <strong>Debug Info:</strong>
              <br />• Check browser console for detailed logs
              <br />• Check server logs for API call details
              <br />• Prompt: {prompt}
              <br />• Generating: {isGenerating.toString()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}