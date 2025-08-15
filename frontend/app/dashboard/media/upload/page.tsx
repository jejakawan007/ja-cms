import { PlaceholderPage } from '@/components/ui/placeholder-page';

export default function MediaUploadPage() {
  return (
    <PlaceholderPage
      title="Media Upload"
      description="Upload and manage media files"
      category="Media"
      features={[
        "File upload",
        "Drag and drop",
        "File validation",
        "Upload progress",
        "Batch upload"
      ]}
    />
  );
}

