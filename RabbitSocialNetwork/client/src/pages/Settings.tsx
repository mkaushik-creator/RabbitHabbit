import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface APIKey {
  name: string;
  key: string;
  placeholder: string;
  description: string;
  setupUrl: string;
  isFree: boolean;
  isRequired: boolean;
}

interface AIStatus {
  success: boolean;
  provider: string;
  name: string;
  isFree: boolean;
  status: string;
}

export default function Settings() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      name: 'GROQ_API_KEY',
      key: '',
      placeholder: 'gsk_...',
      description: 'Ultra-fast AI with Llama 3.3 70B - Completely FREE, no credit card required',
      setupUrl: 'https://console.groq.com',
      isFree: true,
      isRequired: false
    },
    {
      name: 'HUGGING_FACE_TOKEN',
      key: '',
      placeholder: 'hf_...',
      description: 'Access to 800k+ AI models with free tier - Great backup option',
      setupUrl: 'https://huggingface.co/settings/tokens',
      isFree: true,
      isRequired: false
    },
    {
      name: 'GEMINI_API_KEY',
      key: '',
      placeholder: 'AI...',
      description: 'Google Gemini AI - Free tier with 15 requests/minute',
      setupUrl: 'https://aistudio.google.com/app/apikey',
      isFree: true,
      isRequired: false
    },
    {
      name: 'ANTHROPIC_API_KEY',
      key: '',
      placeholder: 'sk-ant-...',
      description: 'Anthropic Claude AI - Requires paid account',
      setupUrl: 'https://console.anthropic.com',
      isFree: false,
      isRequired: false
    },
    {
      name: 'OPENAI_API_KEY',
      key: '',
      placeholder: 'sk-...',
      description: 'OpenAI GPT-4 - Requires paid account',
      setupUrl: 'https://platform.openai.com/api-keys',
      isFree: false,
      isRequired: false
    }
  ]);

  const [showKeys, setShowKeys] = useState<{[key: string]: boolean}>({});
  const [aiStatus, setAIStatus] = useState<AIStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load current AI status
  useEffect(() => {
    fetchAIStatus();
  }, []);

  const fetchAIStatus = async () => {
    try {
      const response = await fetch('/api/ai-status');
      if (response.ok) {
        const status = await response.json();
        setAIStatus(status);
      }
    } catch (error) {
      console.error('Failed to fetch AI status:', error);
    }
  };

  const handleKeyChange = (name: string, value: string) => {
    setApiKeys(prev => prev.map(key => 
      key.name === name ? { ...key, key: value } : key
    ));
  };

  const toggleShowKey = (name: string) => {
    setShowKeys(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const saveAPIKey = async (keyData: APIKey) => {
    if (!keyData.key.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: keyData.name,
          value: keyData.key
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `${keyData.name} saved successfully! Restarting AI service...`
        });
        
        // Refresh AI status after a short delay to allow restart
        setTimeout(() => {
          fetchAIStatus();
        }, 2000);
        
        // Clear the input field
        setApiKeys(prev => prev.map(key => 
          key.name === keyData.name ? { ...key, key: '' } : key
        ));
      } else {
        const error = await response.text();
        toast({
          title: "Error",
          description: error || "Failed to save API key",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save API key. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async (keyData: APIKey) => {
    if (!keyData.key.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key first",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/test-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: keyData.name,
          value: keyData.key
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: `${keyData.name} is working correctly!`
        });
      } else {
        toast({
          title: "Test Failed",
          description: result.error || "API key test failed",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test API key connection",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Settings</h1>
        <p className="text-muted-foreground">Configure your AI providers for content generation</p>
      </div>

      {/* Current AI Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Current AI Provider
            {aiStatus?.success ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertCircle className="w-3 h-3 mr-1" />
                Inactive
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {aiStatus ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{aiStatus.name}</p>
                <p className="text-sm text-muted-foreground">
                  Provider: {aiStatus.provider} • {aiStatus.isFree ? 'Free Tier' : 'Paid Tier'}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchAIStatus}>
                Refresh Status
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">Loading AI status...</p>
          )}
        </CardContent>
      </Card>

      {/* Recommended Free Providers */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Recommended:</strong> Start with Groq (completely free, no credit card) or Hugging Face (free tier). 
          These providers offer excellent quality without any payment requirements.
        </AlertDescription>
      </Alert>

      {/* API Keys Configuration */}
      <div className="grid gap-6">
        {apiKeys.map((keyData) => (
          <Card key={keyData.name}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {keyData.name.replace('_', ' ')}
                  {keyData.isFree ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      FREE
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      PAID
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(keyData.setupUrl, '_blank')}
                >
                  Get API Key
                  <ExternalLink className="w-4 h-4 ml-1" />
                </Button>
              </CardTitle>
              <CardDescription>
                {keyData.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={keyData.name}>API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id={keyData.name}
                      type={showKeys[keyData.name] ? "text" : "password"}
                      placeholder={keyData.placeholder}
                      value={keyData.key}
                      onChange={(e) => handleKeyChange(keyData.name, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleShowKey(keyData.name)}
                    >
                      {showKeys[keyData.name] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => testConnection(keyData)}
                    disabled={!keyData.key.trim() || isLoading}
                  >
                    Test
                  </Button>
                  <Button
                    onClick={() => saveAPIKey(keyData)}
                    disabled={!keyData.key.trim() || isLoading}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Setup Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Choose a Provider (Recommended: Groq)</h4>
            <p className="text-sm text-muted-foreground">
              Click "Get API Key" next to Groq above, sign up (no credit card needed), 
              create an API key, and paste it in the field.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">2. Test Your Connection</h4>
            <p className="text-sm text-muted-foreground">
              Use the "Test" button to verify your API key works correctly.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">3. Save and Activate</h4>
            <p className="text-sm text-muted-foreground">
              Click "Save" to activate the provider. Your app will automatically start using it.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}