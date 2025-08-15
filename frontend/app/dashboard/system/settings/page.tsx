import { PlaceholderPage } from '@/components/ui/placeholder-page';

export default function SystemSettingsPage() {
  return (
    <PlaceholderPage
      title="System Settings"
      description="Configure system-wide settings and preferences"
      category="System"
      features={[
        "General settings",
        "Site configuration",
        "Performance settings",
        "Cache management",
        "System preferences"
      ]}
    />
  );
}

