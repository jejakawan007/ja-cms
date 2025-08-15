import { PlaceholderPage } from '@/components/ui/placeholder-page';

export default function SystemEmailPage() {
  return (
    <PlaceholderPage
      title="Email Configuration"
      description="Configure email settings and templates"
      category="System"
      features={[
        "Email settings",
        "SMTP configuration",
        "Email templates",
        "Email testing",
        "Email logs"
      ]}
    />
  );
}

