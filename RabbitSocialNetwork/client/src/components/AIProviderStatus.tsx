import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Zap, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface AIProviderStatus {
  success: boolean;
  provider: string;
  name: string;
  isFree: boolean;
  status: 'active' | 'fallback';
}

export default function AIProviderStatus() {
  const { data: providerStatus, isLoading } = useQuery<AIProviderStatus>({
    queryKey: ['/api/ai-status'],
    refetchInterval: 10000 // Check every 10 seconds
  });

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            AI Provider
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="animate-pulse h-4 w-16 bg-gray-200 rounded"></div>
            <div className="animate-pulse h-4 w-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!providerStatus?.success) {
    return (
      <Card className="w-full max-w-md border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            AI Provider Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">Failed to check AI provider status</p>
        </CardContent>
      </Card>
    );
  }

  const { provider, name, isFree, status } = providerStatus;

  const getStatusColor = () => {
    if (status === 'active') return 'bg-green-100 text-green-800';
    return 'bg-orange-100 text-orange-800';
  };

  const getStatusIcon = () => {
    if (status === 'active') return <CheckCircle className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  const getFreeAPIKeyLinks = () => {
    const links = {
      gemini: {
        name: "Google AI Studio",
        url: "https://aistudio.google.com/app/apikey",
        description: "Free tier: 15 requests/minute"
      },
      anthropic: {
        name: "Anthropic Console",
        url: "https://console.anthropic.com/",
        description: "Free tier: Good monthly limits"
      },
      openai: {
        name: "OpenAI Platform",
        url: "https://platform.openai.com/api-keys",
        description: "Free tier: $5 credit for new users"
      }
    };

    return Object.entries(links).map(([key, link]) => (
      <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
        <div>
          <p className="font-medium">{link.name}</p>
          <p className="text-sm text-gray-600">{link.description}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open(link.url, '_blank')}
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          Get Key
        </Button>
      </div>
    ));
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          AI Provider
        </CardTitle>
        <CardDescription>
          Current AI service powering your content generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium">{name}</span>
          </div>
          <div className="flex gap-2">
            <Badge className={getStatusColor()}>
              {status === 'active' ? 'Active' : 'Fallback'}
            </Badge>
            {isFree && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Free
              </Badge>
            )}
          </div>
        </div>

        {provider === 'mock' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Using mock responses. Add a free API key below to enable real AI content generation.
            </AlertDescription>
          </Alert>
        )}

        {provider === 'mock' && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Get Free AI API Keys:</h4>
            <div className="space-y-2">
              {getFreeAPIKeyLinks()}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: Gemini offers the most generous free tier with 15 requests per minute!
            </p>
          </div>
        )}

        {provider !== 'mock' && (
          <div className="text-sm text-gray-600">
            <p>✅ Real AI content generation is active</p>
            <p>🚀 Creating authentic, intelligent content for your social media</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}