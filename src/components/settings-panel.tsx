"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SettingsPanel() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("apiKey") || "");
  const [model, setModel] = useState(() => localStorage.getItem("model") || "gpt-4o");
  const [temperature, setTemperature] = useState(() => {
    const savedTemperature = localStorage.getItem("temperature");
    return savedTemperature ? parseFloat(savedTemperature) : 0.7;
  });
  const [maxTokens, setMaxTokens] = useState(() => {
    const savedMaxTokens = localStorage.getItem("maxTokens");
    return savedMaxTokens ? parseInt(savedMaxTokens, 10) : 2000;
  });
  const [streamResponse, setStreamResponse] = useState(() => {
    const savedStreamResponse = localStorage.getItem("streamResponse");
    return savedStreamResponse ? JSON.parse(savedStreamResponse) : true;
  });
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "system");

  // Advanced section state
  const [systemPrompt, setSystemPrompt] = useState(() => localStorage.getItem("systemPrompt") || "");
  const [baseUrl, setBaseUrl] = useState(() => localStorage.getItem("baseUrl") || "");

  // Manage visibility of the settings panel
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  
  // Save "Saved!" popup visibility
  const [showSavedPopup, setShowSavedPopup] = useState(false);

  // Save settings to localStorage function
  const saveSettings = () => {
    localStorage.setItem("apiKey", apiKey);
    localStorage.setItem("model", model);
    localStorage.setItem("temperature", temperature.toString());
    localStorage.setItem("maxTokens", maxTokens.toString());
    localStorage.setItem("streamResponse", JSON.stringify(streamResponse));
    localStorage.setItem("theme", theme);

    // Save advanced section settings
    localStorage.setItem("systemPrompt", systemPrompt);
    localStorage.setItem("baseUrl", baseUrl);

    // Alerting
    alert("Saved!")
  };

  useEffect(() => {
    // Load values on component mount (this is covered by the useState initialization)
    // So we don't need to do anything special in useEffect
  }, []);

  if (!isSettingsOpen) {
    return null; // Hide the settings panel if it's closed
  }

  return (
    <div>
      <Tabs defaultValue="model">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="model">Model</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        <TabsContent value="model" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
            />
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally and never sent to our servers.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="model-select">Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger id="model-select">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                <SelectItem value="llama-3-70b">Llama 3 70B</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="temperature">Temperature: {temperature}</Label>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={2}
              step={0.1}
              value={[temperature]}
              onValueChange={(value) => setTemperature(value[0])}
            />
            <p className="text-xs text-muted-foreground">
              Higher values produce more creative results, lower values are more
              deterministic.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="max-tokens">Max Tokens: {maxTokens}</Label>
            </div>
            <Slider
              id="max-tokens"
              min={100}
              max={8000}
              step={100}
              value={[maxTokens]}
              onValueChange={(value) => setMaxTokens(value[0])}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="stream"
              checked={streamResponse}
              onCheckedChange={setStreamResponse}
            />
            <Label htmlFor="stream">Stream response</Label>
          </div>
        </TabsContent>
        <TabsContent value="advanced" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="system-prompt">System Prompt</Label>
            <Input
              id="system-prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are a helpful assistant..."
            />
            <p className="text-xs text-muted-foreground">
              Define the behavior and capabilities of the AI assistant.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="base-url">API Base URL</Label>
            <Input
              id="base-url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
            />
            <p className="text-xs text-muted-foreground">
              For custom endpoints or self-hosted models.
            </p>
          </div>
        </TabsContent>
        <div className="mt-4">
          <button
            onClick={saveSettings}
            className="px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800"
          >
            Save
          </button>
        </div>
      </Tabs>

      {/* "Saved!" Popup */}
      {showSavedPopup && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="p-4 bg-white rounded-lg">
            <p className="text-xl font-semibold">Saved!</p>
          </div>
        </div>
      )}
    </div>
  );
}
