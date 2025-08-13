import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import {
  Plus,
  Download,
  BarChart3,
  Target,
  TrendingUp,
  Clock,
  Trash2,
  Zap
} from 'lucide-react';

interface ContentGapAnalysis {
  id: string;
  keyword: string;
  searchVolume: number;
  difficulty: number;
  opportunity: number;
  competition: number;
  existingContent: number;
  recommendedType: string;
  priority: string;
  estimatedTraffic: number;
  estimatedRevenue: number;
  analysisDate: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
}

interface ContentGapRecommendation {
  id: string;
  title: string;
  description: string;
  contentType: string;
  targetKeywords: string[];
  estimatedWordCount: number;
  estimatedTime: number;
  priority: string;
  status: string;
  assignedTo?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  gapAnalysis: {
    keyword: string;
    category: {
      name: string;
    };
  };
}

interface Category {
  id: string;
  name: string;
  color: string;
}

export default function ContentGapAnalysisTab() {
  const [analyses, setAnalyses] = useState<ContentGapAnalysis[]>([]);
  const [recommendations, setRecommendations] = useState<ContentGapRecommendation[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCreatingRecommendation, setIsCreatingRecommendation] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<ContentGapAnalysis | null>(null);

  // Form state for recommendation
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentType: 'article',
    targetKeywords: [] as string[],
    estimatedWordCount: 1500,
    estimatedTime: 120,
    priority: 'medium'
  });

  // Load data
  useEffect(() => {
    fetchAnalyses();
    fetchRecommendations();
    fetchCategories();
    fetchStatistics();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) return;

      const response = await fetch('/api/content-gap-analysis/results', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalyses(data.data);
      }
    } catch (error) {
      console.error('Error fetching analyses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) return;

      const response = await fetch('/api/content-gap-analysis/recommendations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.data);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
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
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) return;

      const response = await fetch('/api/content-gap-analysis/statistics', {
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

  const analyzeCategory = async () => {
    if (!selectedCategory) {
      toast({
        title: "Error",
        description: "Please select a category to analyze",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      const token = localStorage.getItem('ja-cms-token');
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`/api/content-gap-analysis/analyze/${selectedCategory}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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
        throw new Error('Failed to analyze category');
      }

      const data = await response.json();
      toast({
        title: "Success",
        description: `Analysis completed! Found ${data.data.gaps.length} opportunities`,
      });

      // Refresh data
      fetchAnalyses();
      fetchStatistics();
    } catch (error) {
      console.error('Error analyzing category:', error);
      toast({
        title: "Error",
        description: "Failed to analyze category",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createRecommendation = async () => {
    if (!selectedAnalysis) return;

    try {
      setIsCreatingRecommendation(true);
      const token = localStorage.getItem('ja-cms-token');
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/content-gap-analysis/recommendations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gapAnalysisId: selectedAnalysis.id,
          ...formData
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
        throw new Error('Failed to create recommendation');
      }

      await response.json();
      toast({
        title: "Success",
        description: "Content recommendation created successfully",
      });

      setIsDialogOpen(false);
      resetForm();
      fetchRecommendations();
    } catch (error) {
      console.error('Error creating recommendation:', error);
      toast({
        title: "Error",
        description: "Failed to create recommendation",
        variant: "destructive",
      });
    } finally {
      setIsCreatingRecommendation(false);
    }
  };

  const exportAnalyses = async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) return;

      const response = await fetch('/api/content-gap-analysis/export', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'content-gap-analysis.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Success",
          description: "Analysis results exported successfully",
        });
      }
    } catch (error) {
      console.error('Error exporting analyses:', error);
      toast({
        title: "Error",
        description: "Failed to export analysis results",
        variant: "destructive",
      });
    }
  };

  const deleteAnalysis = async (id: string) => {
    if (!confirm('Are you sure you want to delete this analysis?')) return;

    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) return;

      const response = await fetch(`/api/content-gap-analysis/results/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Analysis deleted successfully",
        });
        fetchAnalyses();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error deleting analysis:', error);
      toast({
        title: "Error",
        description: "Failed to delete analysis",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      contentType: 'article',
      targetKeywords: [],
      estimatedWordCount: 1500,
      estimatedTime: 120,
      priority: 'medium'
    });
    setSelectedAnalysis(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in-progress': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

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
          <h2 className="text-2xl font-bold tracking-tight">Content Gap Analysis</h2>
          <p className="text-muted-foreground">
            Analyze content gaps and generate content recommendations
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportAnalyses} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Analyze Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Analyze Category</DialogTitle>
                <DialogDescription>
                  Select a category to analyze for content gaps
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={analyzeCategory} disabled={isAnalyzing || !selectedCategory}>
                  {isAnalyzing ? 'Analyzing...' : 'Analyze'}
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
              <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalAnalyses}</div>
              <p className="text-xs text-muted-foreground">
                Content gap analyses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.highPriorityGaps}</div>
              <p className="text-xs text-muted-foreground">
                High priority opportunities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Est. Traffic</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(statistics.totalEstimatedTraffic)}</div>
              <p className="text-xs text-muted-foreground">
                Potential monthly traffic
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Est. Revenue</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${formatNumber(statistics.totalEstimatedRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                Potential monthly revenue
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="analyses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analyses">Analyses</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="analyses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Gap Analyses</CardTitle>
              <CardDescription>
                Analysis results showing content opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keyword</TableHead>
                    <TableHead>Search Volume</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Opportunity</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Est. Traffic</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyses.map((analysis) => (
                    <TableRow key={analysis.id}>
                      <TableCell className="font-medium">{analysis.keyword}</TableCell>
                      <TableCell>{formatNumber(analysis.searchVolume)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{analysis.difficulty}%</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{analysis.opportunity.toFixed(1)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(analysis.priority)}>
                          {analysis.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatNumber(analysis.estimatedTraffic)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAnalysis(analysis);
                              setFormData({
                                title: `Complete Guide to ${analysis.keyword}`,
                                description: `Comprehensive guide covering all aspects of ${analysis.keyword}. Learn best practices, tips, and strategies.`,
                                contentType: analysis.recommendedType,
                                targetKeywords: [analysis.keyword],
                                estimatedWordCount: 1500,
                                estimatedTime: 120,
                                priority: analysis.priority
                              });
                              setIsDialogOpen(true);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteAnalysis(analysis.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Recommendations</CardTitle>
              <CardDescription>
                Generated content recommendations based on gap analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Est. Time</TableHead>
                    <TableHead>Assigned To</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recommendations.map((recommendation) => (
                    <TableRow key={recommendation.id}>
                      <TableCell className="font-medium">{recommendation.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{recommendation.contentType}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(recommendation.priority)}>
                          {recommendation.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(recommendation.status)}>
                          {recommendation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {recommendation.estimatedTime} min
                        </div>
                      </TableCell>
                      <TableCell>
                        {recommendation.assignedTo ? (
                          <span>{recommendation.assignedTo.firstName} {recommendation.assignedTo.lastName}</span>
                        ) : (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Recommendation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Content Recommendation</DialogTitle>
            <DialogDescription>
              Create a content recommendation based on gap analysis
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter content title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter content description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contentType">Content Type</Label>
                <Select
                  value={formData.contentType}
                  onValueChange={(value) => setFormData({ ...formData, contentType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="guide">Guide</SelectItem>
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                    <SelectItem value="pillar">Pillar Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wordCount">Estimated Word Count</Label>
                <Input
                  id="wordCount"
                  type="number"
                  value={formData.estimatedWordCount}
                  onChange={(e) => setFormData({ ...formData, estimatedWordCount: parseInt(e.target.value) })}
                  min="500"
                  max="10000"
                />
              </div>

              <div>
                <Label htmlFor="time">Estimated Time (minutes)</Label>
                <Input
                  id="time"
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) })}
                  min="30"
                  max="480"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createRecommendation} disabled={isCreatingRecommendation}>
              {isCreatingRecommendation ? 'Creating...' : 'Create Recommendation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
