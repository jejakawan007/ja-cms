'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Zap, 
  CheckCircle, 
  FileText, 
  Target, 
  Activity, 
  Eye
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CategorySuggestion {
  categoryId: string;
  categoryName: string;
  confidence: number;
  reasons: string[];
}

interface ContentAnalysis {
  keywords: string[];
  contentType: string;
  readingTime: number;
  structure: {
    headings: number;
    lists: number;
    images: number;
    links: number;
  };
}

interface CategorizationStats {
  totalPosts: number;
  categorizedPosts: number;
  uncategorizedPosts: number;
  autoCategorized: number;
  manualReview: number;
  accuracy: number;
}

interface PostSuggestion {
  postId: string;
  postTitle: string;
  suggestions: CategorySuggestion[];
}

export default function AICategorizationTab() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [suggestions, setSuggestions] = useState<CategorySuggestion[]>([]);
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [stats, setStats] = useState<CategorizationStats | null>(null);
  const [postSuggestions, setPostSuggestions] = useState<PostSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAutoCategorizing, setIsAutoCategorizing] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);

  useEffect(() => {
    fetchCategorizationStats();
    fetchPostSuggestions();
  }, []);

  const fetchCategorizationStats = async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) {
        toast({ title: 'Authentication Required', description: 'Please login to access AI Categorization features', variant: 'destructive' });
        return;
      }
      const response = await fetch('/api/ai-categorization/stats', { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.status === 401) {
        toast({ title: 'Authentication Error', description: 'Please login again to continue', variant: 'destructive' });
        return;
      }
      if (response.ok) { 
        const data = await response.json(); 
        if (data.success) { 
          setStats(data.data); 
        } else { 
          throw new Error('Failed to fetch stats'); 
        } 
      } else { 
        const errorData = await response.json().catch(() => ({})); 
        throw new Error(errorData.message || 'Failed to fetch stats'); 
      }
    } catch (error) { 
      console.error('Error fetching categorization stats:', error); 
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to fetch categorization statistics', variant: 'destructive' }); 
    }
  };

  const fetchPostSuggestions = async () => {
    try {
      setIsLoadingSuggestions(true);
      const token = localStorage.getItem('ja-cms-token');
      if (!token) { return; }
      const response = await fetch('/api/ai-categorization/suggestions/review', { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.status === 401) { return; }
      if (response.ok) { const data = await response.json(); if (data.success) { setPostSuggestions(data.data); } }
    } catch (error) { console.error('Error fetching post suggestions:', error); }
    finally { setIsLoadingSuggestions(false); }
  };

  const analyzeContent = async () => {
    if (!title.trim() && !content.trim()) {
      toast({ title: 'Input Required', description: 'Please enter title or content to analyze', variant: 'destructive' });
      return;
    }

    try {
      setIsAnalyzing(true);
      const token = localStorage.getItem('ja-cms-token');
      if (!token) {
        toast({ title: 'Authentication Required', description: 'Please login to access AI Categorization features', variant: 'destructive' });
        return;
      }

      const response = await fetch('/api/ai-categorization/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
      });

      if (response.status === 401) {
        toast({ title: 'Authentication Error', description: 'Please login again to continue', variant: 'destructive' });
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSuggestions(data.data.suggestions);
          setAnalysis(data.data.analysis);
          toast({ title: 'Analysis Complete', description: 'Content analyzed successfully' });
        } else {
          throw new Error(data.message || 'Analysis failed');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to analyze content', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const autoCategorizePosts = async () => {
    try {
      setIsAutoCategorizing(true);
      const token = localStorage.getItem('ja-cms-token');
      if (!token) {
        toast({ title: 'Authentication Required', description: 'Please login to access AI Categorization features', variant: 'destructive' });
        return;
      }

      const response = await fetch('/api/ai-categorization/auto-categorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        toast({ title: 'Authentication Error', description: 'Please login again to continue', variant: 'destructive' });
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast({ 
            title: 'Auto-Categorization Complete', 
            description: `Processed ${data.data.processed} posts, categorized ${data.data.categorized} automatically` 
          });
          fetchCategorizationStats();
          fetchPostSuggestions();
        } else {
          throw new Error(data.message || 'Auto-categorization failed');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Auto-categorization failed');
      }
    } catch (error) {
      console.error('Error auto-categorizing posts:', error);
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to auto-categorize posts', variant: 'destructive' });
    } finally {
      setIsAutoCategorizing(false);
    }
  };

  const applySuggestion = async (postId: string, categoryId: string) => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) {
        toast({ title: 'Authentication Required', description: 'Please login to access AI Categorization features', variant: 'destructive' });
        return;
      }

      const response = await fetch('/api/ai-categorization/suggestions/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ postId, categoryId })
      });

      if (response.status === 401) {
        toast({ title: 'Authentication Error', description: 'Please login again to continue', variant: 'destructive' });
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast({ title: 'Success', description: 'Category applied successfully' });
          fetchPostSuggestions();
          fetchCategorizationStats();
        } else {
          throw new Error(data.message || 'Failed to apply suggestion');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to apply suggestion');
      }
    } catch (error) {
      console.error('Error applying suggestion:', error);
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to apply suggestion', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts}</div>
              <p className="text-xs text-muted-foreground">
                All posts in system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorized</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.categorizedPosts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalPosts > 0 ? ((stats.categorizedPosts / stats.totalPosts) * 100).toFixed(1) : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Auto-Categorized</CardTitle>
              <Zap className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.autoCategorized}</div>
              <p className="text-xs text-muted-foreground">
                AI-powered categorization
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
              <Target className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.accuracy}%</div>
              <p className="text-xs text-muted-foreground">
                AI categorization accuracy
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Content Analysis</span>
          </CardTitle>
          <CardDescription>
            Analyze content to get AI-powered category suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Content Title</Label>
              <Input
                id="title"
                placeholder="Enter content title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="content">Content Body</Label>
              <Textarea
                id="content"
                placeholder="Enter content body..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button onClick={analyzeContent} disabled={isAnalyzing || (!title.trim() && !content.trim())}>
              {isAnalyzing ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Analyze Content
                </>
              )}
            </Button>
            <Button onClick={autoCategorizePosts} disabled={isAutoCategorizing} variant="outline">
              {isAutoCategorizing ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Auto-Categorize All
                </>
              )}
            </Button>
          </div>

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-4">
              <h4 className="font-medium">Content Analysis</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{analysis.keywords.length}</div>
                  <div className="text-xs text-muted-foreground">Keywords</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{analysis.contentType}</div>
                  <div className="text-xs text-muted-foreground">Content Type</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{analysis.readingTime}</div>
                  <div className="text-xs text-muted-foreground">Reading Time (min)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{analysis.structure.headings}</div>
                  <div className="text-xs text-muted-foreground">Headings</div>
                </div>
              </div>
            </div>
          )}

          {/* Category Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Category Suggestions</h4>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{suggestion.categoryName}</div>
                      <div className="text-sm text-muted-foreground">
                        {suggestion.reasons.join(', ')}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={suggestion.confidence > 0.8 ? "default" : suggestion.confidence > 0.6 ? "secondary" : "outline"}>
                        {(suggestion.confidence * 100).toFixed(0)}%
                      </Badge>
                      <Progress value={suggestion.confidence * 100} className="w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Posts Needing Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Posts Needing Review</span>
          </CardTitle>
          <CardDescription>
            Posts that need manual category assignment
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingSuggestions ? (
            <div className="flex items-center justify-center h-32">
              <Activity className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading suggestions...</span>
            </div>
          ) : postSuggestions.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-medium">No posts need review</h3>
              <p className="text-sm text-muted-foreground">All posts have been categorized successfully!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {postSuggestions.map((post) => (
                <div key={post.postId} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{post.postTitle}</h4>
                      <div className="mt-2 space-y-2">
                        {post.suggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">{suggestion.categoryName}</span>
                              <Badge variant="outline" className="text-xs">
                                {(suggestion.confidence * 100).toFixed(0)}%
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => applySuggestion(post.postId, suggestion.categoryId)}
                              disabled={suggestion.confidence < 0.5}
                            >
                              Apply
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
