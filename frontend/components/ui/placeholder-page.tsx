import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Construction, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PlaceholderPageProps {
  title: string;
  description: string;
  category: string;
  features?: string[];
}

export function PlaceholderPage({ title, description, category, features = [] }: PlaceholderPageProps) {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <Badge variant="secondary">{category}</Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Construction className="h-8 w-8 text-orange-500" />
              <div>
                <CardTitle className="text-2xl">{title}</CardTitle>
                <CardDescription className="text-lg">{description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <p className="text-orange-800 dark:text-orange-200">
                This feature is currently under development. The functionality will be available soon.
              </p>
            </div>

            {features.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Planned Features:</h3>
                <ul className="space-y-2">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex space-x-4">
              <Button variant="outline" disabled>
                Coming Soon
              </Button>
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

