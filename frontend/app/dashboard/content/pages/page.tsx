import { PlaceholderPage } from '@/components/ui/placeholder-page';

export default function ContentPagesPage() {
  return (
    <PlaceholderPage
      title="Pages Management"
      description="Create and manage static pages for your website"
      category="Content"
      features={[
        "Page creation and editing",
        "Page templates",
        "Page hierarchy",
        "Page publishing",
        "Page SEO settings"
      ]}
    />
  );
}

