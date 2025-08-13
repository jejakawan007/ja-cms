import { PlaceholderPage } from '@/components/ui/placeholder-page';

export default function ContentCommentsPage() {
  return (
    <PlaceholderPage
      title="Comments Management"
      description="Manage and moderate user comments"
      category="Content"
      features={[
        "Comment moderation",
        "Comment approval",
        "Spam filtering",
        "Comment analytics",
        "Comment settings"
      ]}
    />
  );
}

