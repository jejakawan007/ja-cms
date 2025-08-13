import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Settings, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Zap
} from 'lucide-react';

interface CategoryRule {
  id: string;
  name: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
  conditions: {
    keywords?: string[];
    titlePatterns?: string[];
    contentPatterns?: string[];
    minimumMatches?: number;
    confidence: number;
    contentType?: string[];
    readingTime?: {
      min?: number;
      max?: number;
    };
    wordCount?: {
      min?: number;
      max?: number;
    };
  };
  priority: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    executions: number;
  };
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface RuleExecution {
  id: string;
  ruleId: string;
  postId: string;
  confidenceScore: number;
  executedAt: string;
  executionResult: any;
  post: {
    id: string;
    title: string;
    slug: string;
  };
}

export default function CategoryRulesTab() {
  const [rules, setRules] = useState<CategoryRule[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [executions, setExecutions] = useState<RuleExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [_selectedRule, setSelectedRule] = useState<CategoryRule | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    priority: 0,
    isActive: true,
    conditions: {
      keywords: [] as string[],
      titlePatterns: [] as string[],
      contentPatterns: [] as string[],
      minimumMatches: 1,
      confidence: 0.8,
      contentType: [] as string[],
      readingTime: { min: 0, max: 0 },
      wordCount: { min: 0, max: 0 },
    }
  });

  // Load data
  useEffect(() => {
    fetchRules();
    fetchCategories();
    fetchExecutions();
  }, []);

  const fetchRules = async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/category-rules', {
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
        throw new Error('Failed to fetch rules');
      }

      const data = await response.json();
      setRules(data.data);
    } catch (error) {
      console.error('Error fetching rules:', error);
      toast({
        title: "Error",
        description: "Failed to fetch category rules",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

  const fetchExecutions = async () => {
    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) return;

      const response = await fetch('/api/category-rules/logs/executions?limit=20', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExecutions(data.data);
      }
    } catch (error) {
      console.error('Error fetching executions:', error);
    }
  };

  const createRule = async () => {
    try {
      setIsCreating(true);
      const token = localStorage.getItem('ja-cms-token');
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/category-rules', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
        throw new Error('Failed to create rule');
      }

      await response.json();
      toast({
        title: "Success",
        description: "Category rule created successfully",
      });

      setIsDialogOpen(false);
      resetForm();
      fetchRules();
    } catch (error) {
      console.error('Error creating rule:', error);
      toast({
        title: "Error",
        description: "Failed to create category rule",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      const token = localStorage.getItem('ja-cms-token');
      if (!token) return;

      const response = await fetch(`/api/category-rules/${ruleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Rule deleted successfully",
        });
        fetchRules();
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast({
        title: "Error",
        description: "Failed to delete rule",
        variant: "destructive",
      });
    }
  };

  const executeRule = async (_ruleId: string) => {
    try {
      setIsExecuting(true);
      const token = localStorage.getItem('ja-cms-token');
      if (!token) return;

      // Get uncategorized posts
      const postsResponse = await fetch('/api/posts?categoryId=null&limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        const posts = postsData.data;

        // Execute rules for each post
        for (const post of posts) {
          await fetch(`/api/category-rules/execute/post/${post.id}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        }

        toast({
          title: "Success",
          description: `Executed rules for ${posts.length} posts`,
        });

        fetchExecutions();
      }
    } catch (error) {
      console.error('Error executing rules:', error);
      toast({
        title: "Error",
        description: "Failed to execute rules",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      categoryId: '',
      priority: 0,
      isActive: true,
      conditions: {
        keywords: [],
        titlePatterns: [],
        contentPatterns: [],
        minimumMatches: 1,
        confidence: 0.8,
        contentType: [],
        readingTime: { min: 0, max: 0 },
        wordCount: { min: 0, max: 0 },
      }
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (confidence >= 0.6) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
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
          <h2 className="text-2xl font-bold tracking-tight">Category Rules Engine</h2>
          <p className="text-muted-foreground">
            Manage automatic categorization rules using AI and NLP
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => executeRule('all')}
            disabled={isExecuting}
            variant="outline"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isExecuting ? 'Executing...' : 'Execute All Rules'}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Category Rule</DialogTitle>
                <DialogDescription>
                  Define conditions for automatic categorization
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Rule Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Technology Posts"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Target Category</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Input
                      id="priority"
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confidence">Confidence Threshold</Label>
                    <Input
                      id="confidence"
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={formData.conditions.confidence}
                      onChange={(e) => setFormData({
                        ...formData,
                        conditions: {
                          ...formData.conditions,
                          confidence: parseFloat(e.target.value)
                        }
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                  <Textarea
                    id="keywords"
                    value={formData.conditions.keywords.join(', ')}
                    onChange={(e) => setFormData({
                      ...formData,
                      conditions: {
                        ...formData.conditions,
                        keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                      }
                    })}
                    placeholder="javascript, react, programming, development"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createRule} disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Rule'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Rules</CardTitle>
              <CardDescription>
                Manage automatic categorization rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Executions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: rule.category.color }}
                          />
                          {rule.category.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{rule.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={rule.isActive ? "default" : "secondary"}>
                          {rule.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Play className="h-4 w-4" />
                          {rule._count.executions}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => executeRule(rule.id)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRule(rule);
                              // TODO: Implement edit
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteRule(rule.id)}
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

        <TabsContent value="executions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
              <CardDescription>
                Latest rule execution results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Post</TableHead>
                    <TableHead>Rule</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Executed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {executions.map((execution) => (
                    <TableRow key={execution.id}>
                      <TableCell className="font-medium">
                        {execution.post.title}
                      </TableCell>
                      <TableCell>
                        {rules.find(r => r.id === execution.ruleId)?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getConfidenceIcon(execution.confidenceScore)}
                          <span className={getConfidenceColor(execution.confidenceScore)}>
                            {(execution.confidenceScore * 100).toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {new Date(execution.executedAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rules.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active rules in system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
                <Play className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {executions.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Rule executions today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {executions.length > 0 
                    ? `${((executions.filter(e => e.confidenceScore > 0.5).length / executions.length) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  High confidence matches
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
