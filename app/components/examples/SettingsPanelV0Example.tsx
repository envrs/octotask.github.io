/**
 * Example Settings Panel Component - v0 Design
 *
 * This is an example of how to modernize existing components
 * to use the v0 design system.
 *
 * This component demonstrates:
 * - Using v0 Card components
 * - Using v0 Button variants
 * - Using v0 Input components
 * - Responsive layout with Tailwind
 * - Dark mode support
 */

import React, { useState } from 'react';
import { V0Button } from '../v0/Button';
import { Card, CardHeader, CardBody, CardFooter, CardTitle, CardDescription } from '../v0/Card';
import { Input } from '../v0/Input';

interface SettingsPanelV0ExampleProps {
  onSave?: (settings: Record<string, any>) => void;
}

export function SettingsPanelV0Example({ onSave }: SettingsPanelV0ExampleProps) {
  const [formData, setFormData] = useState({
    apiKey: '',
    modelName: '',
    temperature: 0.7,
    notifications: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSave = async () => {
    // Validate
    const newErrors: Record<string, string> = {};

    if (!formData.apiKey) {
      newErrors.apiKey = 'API key is required';
    }

    if (!formData.modelName) {
      newErrors.modelName = 'Model name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onSave?.(formData);

      // Show success toast here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
      {/* Header Card */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>Configure your AI model settings and API credentials</CardDescription>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="API Key"
            type="password"
            placeholder="sk-..."
            value={formData.apiKey}
            onChange={(e) => handleChange('apiKey', e.target.value)}
            error={errors.apiKey}
            helperText="Your API key is stored securely"
            fullWidth
          />

          <Input
            label="Model Name"
            placeholder="gpt-4, claude-3, etc."
            value={formData.modelName}
            onChange={(e) => handleChange('modelName', e.target.value)}
            error={errors.modelName}
            helperText="Choose the model to use for responses"
            fullWidth
          />

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Temperature</label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Higher = more creative (0.0 - 2.0)</p>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={formData.temperature}
              onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
              className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-white w-10">
              {formData.temperature.toFixed(1)}
            </span>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.notifications}
              onChange={(e) => handleChange('notifications', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
            />
            <span className="text-sm text-gray-900 dark:text-white">Enable notifications for long-running tasks</span>
          </label>
        </CardBody>

        <CardFooter>
          <V0Button
            variant="ghost"
            onClick={() => setFormData({ apiKey: '', modelName: '', temperature: 0.7, notifications: true })}
          >
            Reset
          </V0Button>
          <V0Button variant="primary" onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Settings'}
          </V0Button>
        </CardFooter>
      </Card>

      {/* Additional Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Feature Card 1 */}
        <Card variant="default" hoverable>
          <CardHeader>
            <CardTitle className="text-base">Advanced Options</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Fine-tune model behavior with advanced parameters
            </p>
            <V0Button variant="secondary" size="sm" className="w-full">
              Configure Advanced Settings
            </V0Button>
          </CardBody>
        </Card>

        {/* Feature Card 2 */}
        <Card variant="default" hoverable>
          <CardHeader>
            <CardTitle className="text-base">Integrations</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Connect with third-party services and tools</p>
            <V0Button variant="secondary" size="sm" className="w-full">
              Manage Integrations
            </V0Button>
          </CardBody>
        </Card>
      </div>

      {/* Info Banner */}
      <Card variant="outline" className="border-accent-500 bg-accent-50/50 dark:bg-accent-950/20">
        <CardBody className="py-3">
          <p className="text-sm text-gray-900 dark:text-white">
            <span className="font-semibold">Tip:</span> Settings are automatically saved to your profile and synced
            across all devices.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

/**
 * Example of how to modernize existing components:
 *
 * 1. Replace component imports:
 *    OLD: import { Button } from '~/components/ui/Button';
 *    NEW: import { V0Button } from '~/components/v0';
 *
 * 2. Update component usage:
 *    OLD: <Button variant="default">Click</Button>
 *    NEW: <V0Button variant="primary">Click</V0Button>
 *
 * 3. Use v0 Card system instead of custom div containers:
 *    OLD: <div className="border p-4">Content</div>
 *    NEW: <Card><CardBody>Content</CardBody></Card>
 *
 * 4. Use v0 Input for form fields:
 *    OLD: <input className="..." />
 *    NEW: <Input label="..." error={error} />
 *
 * 5. Leverage responsive helpers:
 *    className="grid grid-cols-1 md:grid-cols-2 gap-4"
 *
 * Benefits:
 * - Consistent design language across the app
 * - Automatic dark mode support
 * - Better accessibility
 * - Easier to maintain
 * - Smaller component surface area
 */
