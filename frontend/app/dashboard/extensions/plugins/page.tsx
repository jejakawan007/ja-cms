import { PlaceholderPage } from '@/components/ui/placeholder-page';

export default function ExtensionsPluginsPage() {
  return (
    <PlaceholderPage
      title="Plugin Management"
      description="Install and manage plugins for your system"
      category="Extensions"
      features={[
        "Plugin installation",
        "Plugin management",
        "Plugin updates",
        "Plugin configuration",
        "Plugin marketplace"
      ]}
    />
  );
}

