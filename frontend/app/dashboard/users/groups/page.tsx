import { PlaceholderPage } from '@/components/ui/placeholder-page';

export default function UsersGroupsPage() {
  return (
    <PlaceholderPage
      title="User Groups"
      description="Create and manage user groups and permissions"
      category="Users"
      features={[
        "Group creation",
        "Group permissions",
        "Group membership",
        "Group hierarchy",
        "Group templates"
      ]}
    />
  );
}

