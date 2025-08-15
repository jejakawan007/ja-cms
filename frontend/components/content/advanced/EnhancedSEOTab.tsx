import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
// import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import {
  Download,
  BarChart3,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  Settings,
  Eye,
  Edit,
  Play,
  Globe
} from 'lucide-react';

interface SEOMetadata {
  id: string;
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType: string;
  twitterCard: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  metaRobots: string;
  pageType: string;
  createdAt: string;
  updatedAt: string;
}

interface SEOAudit {
  id: string;
  auditType: string;
  score: number;
  issues: Array<{
    type: string;
    severity: 'error' | 'warning' | 'info';
    message: string;
    suggestion?: string;
  }>;
  recommendations: Array<{
    type: string;
    priority: 'high' | 'medium' | 'low';
    message: string;
    action?: string;
  }>;
  auditDate: string;
  creator: {
    firstName: string;
    lastName: string;
  };
  post?: {
    title: string;
    slug: string;
  };
  category?: {
    name: string;
    slug: string;
  };
}

interface Post {
  id: string;
  title: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function EnhancedSEOTab() {
  const [metadata, setMetadata] = useState<SEOMetadata[]>([]);
  const [audits, setAudits] = useState<SEOAudit[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isCreatingMetadata, setIsCreatingMetadata] = useState(false);
  const [selectedContent, setSelectedContent] = useState<{ type: string; id: string } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state for metadata
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    keywords: '',
    canonicalUrl: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    ogType: 'article',
    twitterCard: 'summary',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    metaRobots: 'index,follow'
  });

  // Load data
  useEffect(() => {
    fetchMetadata();
    fetchAudits();
    fetchPosts();
    fetchCategories();
    fetchStatistics();
  }, []);

  const fetchMetadata = async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) return;

      const response = await fetch('/api/enhanced-seo/metadata', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMetadata(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching metadata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAudits = async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) return;

      const response = await fetch('/api/enhanced-seo/audit/history?limit=20', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAudits(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching audits:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) return;

      const response = await fetch('/api/posts?limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) return;

      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) return;

      const response = await fetch('/api/enhanced-seo/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatistics(data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const performAudit = async () => {
    if (!selectedContent) {
      toast({
        title: "Error",
        description: "Please select content to audit",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAuditing(true);
      const token = localStorage.getItem('ja-cms-token');
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/enhanced-seo/audit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: selectedContent.type === 'post' ? selectedContent.id : undefined,
          categoryId: selectedContent.type === 'category' ? selectedContent.id : undefined,
          auditType: 'onpage'
        }),
      });

      if (response.status === 401) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive",
        });
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to perform audit');
      }

      const data = await response.json();
      toast({
        title: "Success",
        description: `SEO audit completed! Score: ${data.data.score}/100`,
      });

      fetchAudits();
      fetchStatistics();
    } catch (error) {
      console.error('Error performing audit:', error);
      toast({
        title: "Error",
        description: "Failed to perform SEO audit",
        variant: "destructive",
      });
    } finally {
      setIsAuditing(false);
    }
  };

  const createMetadata = async () => {
    if (!selectedContent) return;

    try {
      setIsCreatingMetadata(true);
      const token = localStorage.getItem('ja-cms-token');
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/enhanced-seo/metadata', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: selectedContent.type === 'post' ? selectedContent.id : undefined,
          categoryId: selectedContent.type === 'category' ? selectedContent.id : undefined,
          pageType: selectedContent.type,
          metadata: formData
        }),
      });

      if (response.status === 401) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive",
        });
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to create metadata');
      }

      await response.json();
      toast({
        title: "Success",
        description: "SEO metadata created successfully",
      });

      setIsDialogOpen(false);
      resetForm();
      fetchMetadata();
    } catch (error) {
      console.error('Error creating metadata:', error);
      toast({
        title: "Error",
        description: "Failed to create SEO metadata",
        variant: "destructive",
      });
    } finally {
      setIsCreatingMetadata(false);
    }
  };

  const generateSitemap = async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) return;

      const response = await fetch('/api/enhanced-seo/sitemap', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sitemap.xml';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Success",
          description: "Sitemap generated successfully",
        });
      }
    } catch (error) {
      console.error('Error generating sitemap:', error);
      toast({
        title: "Error",
        description: "Failed to generate sitemap",
        variant: "destructive",
      });
    }
  };

  const exportAuditReport = async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) return;

      const response = await fetch('/api/enhanced-seo/audit/export?format=csv', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'seo-audit-report.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Success",
          description: "SEO audit report exported successfully",
        });
      }
    } catch (error) {
      console.error('Error exporting audit report:', error);
      toast({
        title: "Error",
        description: "Failed to export audit report",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      keywords: '',
      canonicalUrl: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      ogType: 'article',
      twitterCard: 'summary',
      twitterTitle: '',
      twitterDescription: '',
      twitterImage: '',
      metaRobots: 'index,follow'
    });
    setSelectedContent(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    if (score >= 50) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 70) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    if (score >= 50) return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  // const getSeverityColor = (severity: string) => {
  //   switch (severity) {
  //     case 'error': return 'text-red-600 bg-red-50';
  //     case 'warning': return 'text-yellow-600 bg-yellow-50';
  //     case 'info': return 'text-blue-600 bg-blue-50';
  //     default: return 'text-gray-600 bg-gray-50';
  //   }
  // };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Enhanced SEO</h2>
          <p className="text-muted-foreground">
            Advanced SEO optimization and metadata management
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportAuditReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={generateSitemap} variant="outline">
            <Globe className="h-4 w-4 mr-2" />
            Generate Sitemap
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Create Metadata
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create SEO Metadata</DialogTitle>
                <DialogDescription>
                  Configure SEO metadata for your content
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="content">Select Content</Label>
                  <Select
                    value={selectedContent ? `${selectedContent.type}:${selectedContent.id}` : ''}
                    onValueChange={(value) => {
                      const [type, id] = value.split(':');
                      if (type && id) {
                        setSelectedContent({ type: type as string, id: id as string });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select content" />
                    </SelectTrigger>
                    <SelectContent>
                      <optgroup label="Posts">
                        {posts.map((post) => (
                          <SelectItem key={`post:${post.id}`} value={`post:${post.id}`}>
                            {post.title}
                          </SelectItem>
                        ))}
                      </optgroup>
                      <optgroup label="Categories">
                        {categories.map((category) => (
                          <SelectItem key={`category:${category.id}`} value={`category:${category.id}`}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </optgroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="SEO title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Meta description"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ogTitle">Open Graph Title</Label>
                    <Input
                      id="ogTitle"
                      value={formData.ogTitle}
                      onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                      placeholder="OG title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ogDescription">Open Graph Description</Label>
                    <Input
                      id="ogDescription"
                      value={formData.ogDescription}
                      onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
                      placeholder="OG description"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="ogImage">Open Graph Image URL</Label>
                  <Input
                    id="ogImage"
                    value={formData.ogImage}
                    onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createMetadata} disabled={isCreatingMetadata || !selectedContent}>
                  {isCreatingMetadata ? 'Creating...' : 'Create Metadata'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Metadata</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalMetadata}</div>
              <p className="text-xs text-muted-foreground">
                SEO metadata entries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Audits</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalAudits}</div>
              <p className="text-xs text-muted-foreground">
                SEO audits performed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.averageScore}/100</div>
              <p className="text-xs text-muted-foreground">
                Average SEO score
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Audits</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.recentAudits}</div>
              <p className="text-xs text-muted-foreground">
                Last 7 days
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="audits" className="space-y-4">
        <TabsList>
          <TabsTrigger value="audits">SEO Audits</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
        </TabsList>

        <TabsContent value="audits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO Audits</CardTitle>
              <CardDescription>
                Recent SEO audit results and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Issues</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {audits.map((audit) => (
                    <TableRow key={audit.id}>
                      <TableCell className="font-medium">
                        {audit.post?.title || audit.category?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{audit.auditType}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getScoreIcon(audit.score)}
                          <Badge className={getScoreColor(audit.score)}>
                            {audit.score}/100
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{audit.issues.length} issues</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(audit.auditDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO Metadata</CardTitle>
              <CardDescription>
                Configured SEO metadata for your content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metadata.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.pageType}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {item.description}
                      </TableCell>
                      <TableCell>
                        {new Date(item.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Audit Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="fixed bottom-4 right-4">
            <Play className="h-4 w-4 mr-2" />
            Quick Audit
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick SEO Audit</DialogTitle>
            <DialogDescription>
              Select content to perform a quick SEO audit
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="audit-content">Select Content</Label>
              <Select
                value={selectedContent ? `${selectedContent.type}:${selectedContent.id}` : ''}
                onValueChange={(value) => {
                  const [type, id] = value.split(':');
                  if (type && id) {
                    setSelectedContent({ type: type as string, id: id as string });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select content to audit" />
                </SelectTrigger>
                <SelectContent>
                  <optgroup label="Posts">
                    {posts.map((post) => (
                      <SelectItem key={`post:${post.id}`} value={`post:${post.id}`}>
                        {post.title}
                      </SelectItem>
                    ))}
                  </optgroup>
                  <optgroup label="Categories">
                    {categories.map((category) => (
                      <SelectItem key={`category:${category.id}`} value={`category:${category.id}`}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </optgroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={performAudit} disabled={isAuditing || !selectedContent}>
              {isAuditing ? 'Auditing...' : 'Perform Audit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
