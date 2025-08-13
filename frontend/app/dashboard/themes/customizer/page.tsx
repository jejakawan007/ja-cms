import { PlaceholderPage } from '@/components/ui/placeholder-page';

export default function ThemeCustomizerPage() {
  return (
    <PlaceholderPage
      title="Theme Customizer"
      description="Customize colors, fonts, and layout of your active theme"
      category="Themes"
      features={[
        "Live theme preview",
        "Color scheme customization",
        "Typography settings",
        "Layout options",
        "Custom CSS editor"
      ]}
    />
  );
}

