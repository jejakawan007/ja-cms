import { PlaceholderPage } from '@/components/ui/placeholder-page';

export default function SecurityFirewallPage() {
  return (
    <PlaceholderPage
      title="Security Firewall"
      description="Configure and manage firewall rules and security policies"
      category="Security"
      features={[
        "Firewall rule management",
        "IP blocking and whitelisting",
        "Rate limiting",
        "Security policies",
        "Firewall logs"
      ]}
    />
  );
}

