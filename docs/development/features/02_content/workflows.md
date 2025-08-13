# 🔄 Content Workflows System

> **Advanced Publishing Pipeline JA-CMS**  
> Comprehensive workflow management untuk content creation, review, dan publishing

---

## 📋 **Deskripsi**

Content Workflows System menyediakan pipeline yang terstruktur untuk mengelola proses content creation dari draft hingga publikasi. Sistem ini mendukung multi-step approval, collaboration, scheduling, dan automation untuk memastikan kualitas content yang konsisten.

---

## ⭐ **Core Features**

### **1. 📝 Publishing Pipeline**

#### **Workflow States:**
```typescript
interface ContentWorkflow {
  id: string;
  name: string;
  description: string;
  states: WorkflowState[];
  transitions: WorkflowTransition[];
  rules: WorkflowRule[];
  settings: {
    allowSelfApproval: boolean;
    requireAllApprovals: boolean;
    autoPublishOnApproval: boolean;
    notifyOnStateChange: boolean;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowState {
  id: string;
  name: string;
  description: string;
  type: 'draft' | 'review' | 'approved' | 'published' | 'archived' | 'rejected';
  permissions: {
    canEdit: string[]; // role IDs
    canTransition: string[];
    canView: string[];
  };
  requirements: StateRequirement[];
  notifications: NotificationConfig[];
  isInitial: boolean;
  isFinal: boolean;
}

interface WorkflowTransition {
  id: string;
  from: string; // state ID
  to: string; // state ID
  name: string;
  description: string;
  conditions: TransitionCondition[];
  actions: TransitionAction[];
  requiredRoles: string[];
  requiresComment: boolean;
}

interface StateRequirement {
  type: 'approval' | 'field_completion' | 'quality_check' | 'seo_check';
  config: any;
  required: boolean;
}

interface ContentWorkflowInstance {
  id: string;
  contentId: string;
  contentType: 'post' | 'page';
  workflowId: string;
  currentState: string;
  history: WorkflowHistoryEntry[];
  assignees: WorkflowAssignee[];
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowHistoryEntry {
  id: string;
  fromState: string;
  toState: string;
  transitionedBy: string;
  transitionedAt: Date;
  comment?: string;
  metadata?: Record<string, any>;
}
```

#### **Workflow Management Service:**
```typescript
export class WorkflowService {
  async createWorkflow(workflowData: CreateWorkflowData): Promise<ContentWorkflow> {
    // Validate workflow configuration
    const validation = await this.validateWorkflowConfig(workflowData);
    if (!validation.valid) {
      throw new Error(`Invalid workflow configuration: ${validation.errors.join(', ')}`);
    }

    // Create workflow
    const workflow = await this.prisma.contentWorkflow.create({
      data: {
        name: workflowData.name,
        description: workflowData.description,
        states: workflowData.states,
        transitions: workflowData.transitions,
        rules: workflowData.rules || [],
        settings: workflowData.settings,
        createdBy: workflowData.createdBy
      }
    });

    // Create workflow states and transitions in database
    await this.createWorkflowStates(workflow.id, workflowData.states);
    await this.createWorkflowTransitions(workflow.id, workflowData.transitions);

    return workflow;
  }

  async startWorkflow(contentId: string, workflowId: string, userId: string): Promise<ContentWorkflowInstance> {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    // Find initial state
    const initialState = workflow.states.find(s => s.isInitial);
    if (!initialState) {
      throw new Error('Workflow has no initial state');
    }

    // Create workflow instance
    const instance = await this.prisma.contentWorkflowInstance.create({
      data: {
        contentId,
        workflowId,
        currentState: initialState.id,
        assignees: await this.determineInitialAssignees(contentId, initialState),
        priority: 'medium',
        metadata: {}
      }
    });

    // Create initial history entry
    await this.addHistoryEntry(instance.id, {
      fromState: '',
      toState: initialState.id,
      transitionedBy: userId,
      comment: 'Workflow started'
    });

    // Send notifications
    await this.sendStateChangeNotifications(instance, initialState);

    return instance;
  }

  async transitionWorkflow(
    instanceId: string, 
    transitionId: string, 
    userId: string, 
    comment?: string
  ): Promise<ContentWorkflowInstance> {
    const instance = await this.getWorkflowInstance(instanceId);
    if (!instance) {
      throw new Error('Workflow instance not found');
    }

    const workflow = await this.getWorkflow(instance.workflowId);
    const transition = workflow.transitions.find(t => t.id === transitionId);
    
    if (!transition) {
      throw new Error('Transition not found');
    }

    // Validate transition
    await this.validateTransition(instance, transition, userId);

    // Check transition conditions
    const conditionsResult = await this.checkTransitionConditions(instance, transition);
    if (!conditionsResult.passed) {
      throw new Error(`Transition conditions not met: ${conditionsResult.failedConditions.join(', ')}`);
    }

    // Execute transition
    const updatedInstance = await this.executeTransition(instance, transition, userId, comment);

    // Execute transition actions
    await this.executeTransitionActions(updatedInstance, transition);

    return updatedInstance;
  }

  async getWorkflowDashboard(userId: string): Promise<WorkflowDashboard> {
    const userRoles = await this.getUserRoles(userId);
    
    // Get assigned workflows
    const assignedInstances = await this.getAssignedWorkflows(userId);
    
    // Get pending approvals
    const pendingApprovals = await this.getPendingApprovals(userId, userRoles);
    
    // Get recent activity
    const recentActivity = await this.getRecentWorkflowActivity(userId, 20);
    
    // Get workflow statistics
    const statistics = await this.getWorkflowStatistics(userRoles);

    return {
      assigned: assignedInstances,
      pendingApprovals,
      recentActivity,
      statistics,
      quickActions: await this.getQuickActions(userId, userRoles)
    };
  }

  async scheduleContent(contentId: string, publishAt: Date, userId: string): Promise<ScheduledContent> {
    // Validate content is ready for publishing
    const content = await this.getContent(contentId);
    if (!content) {
      throw new Error('Content not found');
    }

    const workflowInstance = await this.getWorkflowInstanceByContent(contentId);
    if (workflowInstance && !this.isInPublishableState(workflowInstance)) {
      throw new Error('Content is not in a publishable state');
    }

    // Create scheduled content entry
    const scheduled = await this.prisma.scheduledContent.create({
      data: {
        contentId,
        contentType: content.type,
        publishAt,
        scheduledBy: userId,
        status: 'scheduled'
      }
    });

    // Schedule the publishing job
    await this.schedulePublishingJob(scheduled);

    return scheduled;
  }

  private async validateTransition(
    instance: ContentWorkflowInstance, 
    transition: WorkflowTransition, 
    userId: string
  ): Promise<void> {
    // Check if transition is from current state
    if (transition.from !== instance.currentState) {
      throw new Error('Invalid transition: not from current state');
    }

    // Check user permissions
    const hasPermission = await this.checkTransitionPermission(transition, userId);
    if (!hasPermission) {
      throw new Error('Insufficient permissions for this transition');
    }

    // Check if comment is required
    if (transition.requiresComment && !comment) {
      throw new Error('Comment is required for this transition');
    }
  }

  private async checkTransitionConditions(
    instance: ContentWorkflowInstance, 
    transition: WorkflowTransition
  ): Promise<ConditionCheckResult> {
    const results: ConditionResult[] = [];

    for (const condition of transition.conditions) {
      const result = await this.evaluateCondition(instance, condition);
      results.push(result);
    }

    const failedConditions = results.filter(r => !r.passed).map(r => r.message);

    return {
      passed: failedConditions.length === 0,
      failedConditions,
      allResults: results
    };
  }

  private async evaluateCondition(
    instance: ContentWorkflowInstance, 
    condition: TransitionCondition
  ): Promise<ConditionResult> {
    switch (condition.type) {
      case 'approval_required':
        return this.checkApprovalCondition(instance, condition);
      
      case 'field_completion':
        return this.checkFieldCompletionCondition(instance, condition);
      
      case 'quality_score':
        return this.checkQualityScoreCondition(instance, condition);
      
      case 'seo_score':
        return this.checkSEOScoreCondition(instance, condition);
      
      case 'time_based':
        return this.checkTimeBasedCondition(instance, condition);
      
      default:
        return { passed: true, message: 'Unknown condition type' };
    }
  }

  private async executeTransition(
    instance: ContentWorkflowInstance,
    transition: WorkflowTransition,
    userId: string,
    comment?: string
  ): Promise<ContentWorkflowInstance> {
    // Update instance state
    const updatedInstance = await this.prisma.contentWorkflowInstance.update({
      where: { id: instance.id },
      data: {
        currentState: transition.to,
        updatedAt: new Date()
      }
    });

    // Add history entry
    await this.addHistoryEntry(instance.id, {
      fromState: transition.from,
      toState: transition.to,
      transitionedBy: userId,
      comment
    });

    // Update assignees if needed
    const newState = await this.getWorkflowState(transition.to);
    if (newState) {
      await this.updateWorkflowAssignees(instance.id, newState);
    }

    // Send notifications
    await this.sendStateChangeNotifications(updatedInstance, newState);

    return updatedInstance;
  }
}

interface CreateWorkflowData {
  name: string;
  description: string;
  states: WorkflowState[];
  transitions: WorkflowTransition[];
  rules?: WorkflowRule[];
  settings: WorkflowSettings;
  createdBy: string;
}

interface WorkflowDashboard {
  assigned: ContentWorkflowInstance[];
  pendingApprovals: PendingApproval[];
  recentActivity: WorkflowActivity[];
  statistics: WorkflowStatistics;
  quickActions: QuickAction[];
}

interface ConditionCheckResult {
  passed: boolean;
  failedConditions: string[];
  allResults: ConditionResult[];
}

interface ConditionResult {
  passed: boolean;
  message: string;
  metadata?: any;
}
```

### **2. 👥 Collaboration Features**

#### **Multi-Author Collaboration:**
```typescript
export class CollaborationService {
  async assignCollaborators(contentId: string, collaborators: Collaborator[]): Promise<void> {
    // Remove existing collaborators
    await this.prisma.contentCollaborator.deleteMany({
      where: { contentId }
    });

    // Add new collaborators
    for (const collaborator of collaborators) {
      await this.prisma.contentCollaborator.create({
        data: {
          contentId,
          userId: collaborator.userId,
          role: collaborator.role,
          permissions: collaborator.permissions,
          assignedBy: collaborator.assignedBy,
          assignedAt: new Date()
        }
      });

      // Send collaboration invitation
      await this.sendCollaborationInvitation(contentId, collaborator);
    }
  }

  async trackContentChanges(contentId: string, changes: ContentChange[]): Promise<void> {
    for (const change of changes) {
      await this.prisma.contentChange.create({
        data: {
          contentId,
          userId: change.userId,
          changeType: change.type,
          field: change.field,
          oldValue: change.oldValue,
          newValue: change.newValue,
          timestamp: new Date()
        }
      });
    }

    // Notify collaborators of changes
    await this.notifyCollaboratorsOfChanges(contentId, changes);
  }

  async createContentVersion(contentId: string, userId: string): Promise<ContentVersion> {
    const content = await this.getContent(contentId);
    if (!content) {
      throw new Error('Content not found');
    }

    // Create version snapshot
    const version = await this.prisma.contentVersion.create({
      data: {
        contentId,
        versionNumber: await this.getNextVersionNumber(contentId),
        title: content.title,
        content: content.content,
        metadata: content.metadata,
        createdBy: userId,
        createdAt: new Date()
      }
    });

    // Clean up old versions if limit exceeded
    await this.cleanupOldVersions(contentId);

    return version;
  }

  async getCollaborationActivity(contentId: string): Promise<CollaborationActivity[]> {
    const activities = await this.prisma.collaborationActivity.findMany({
      where: { contentId },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    return activities.map(activity => ({
      id: activity.id,
      type: activity.type,
      user: activity.user,
      description: activity.description,
      metadata: activity.metadata,
      timestamp: activity.timestamp
    }));
  }

  async setupRealTimeCollaboration(contentId: string): Promise<CollaborationSession> {
    const session = await this.prisma.collaborationSession.create({
      data: {
        contentId,
        sessionId: this.generateSessionId(),
        startedAt: new Date(),
        isActive: true
      }
    });

    // Initialize WebSocket room for real-time collaboration
    await this.initializeCollaborationRoom(session.sessionId, contentId);

    return session;
  }

  async handleRealTimeEdit(sessionId: string, edit: RealTimeEdit): Promise<void> {
    // Validate edit
    const validation = await this.validateRealTimeEdit(edit);
    if (!validation.valid) {
      throw new Error(`Invalid edit: ${validation.error}`);
    }

    // Apply operational transform
    const transformedEdit = await this.applyOperationalTransform(sessionId, edit);

    // Broadcast to other collaborators
    await this.broadcastEdit(sessionId, transformedEdit);

    // Store edit in history
    await this.storeEditInHistory(sessionId, transformedEdit);
  }

  private async applyOperationalTransform(sessionId: string, edit: RealTimeEdit): Promise<RealTimeEdit> {
    // Get pending edits from other users
    const pendingEdits = await this.getPendingEdits(sessionId, edit.userId);

    // Apply operational transformation algorithm
    let transformedEdit = edit;
    
    for (const pendingEdit of pendingEdits) {
      transformedEdit = this.transformEdit(transformedEdit, pendingEdit);
    }

    return transformedEdit;
  }

  private transformEdit(edit1: RealTimeEdit, edit2: RealTimeEdit): RealTimeEdit {
    // Simplified operational transform logic
    // In a real implementation, this would be much more sophisticated
    
    if (edit1.position <= edit2.position) {
      return edit1; // No transformation needed
    }

    // Adjust position based on the other edit
    return {
      ...edit1,
      position: edit1.position + (edit2.type === 'insert' ? edit2.content.length : -edit2.length)
    };
  }
}

interface Collaborator {
  userId: string;
  role: 'editor' | 'reviewer' | 'viewer';
  permissions: CollaboratorPermission[];
  assignedBy: string;
}

interface CollaboratorPermission {
  action: 'edit' | 'comment' | 'approve' | 'publish';
  granted: boolean;
}

interface ContentChange {
  userId: string;
  type: 'create' | 'update' | 'delete';
  field: string;
  oldValue: any;
  newValue: any;
}

interface RealTimeEdit {
  userId: string;
  type: 'insert' | 'delete' | 'retain';
  position: number;
  content: string;
  length?: number;
  timestamp: Date;
}

interface CollaborationSession {
  id: string;
  contentId: string;
  sessionId: string;
  participants: SessionParticipant[];
  startedAt: Date;
  isActive: boolean;
}
```

### **3. 📅 Content Scheduling**

#### **Advanced Scheduling System:**
```typescript
export class ContentSchedulingService {
  async scheduleContent(scheduleData: ScheduleContentData): Promise<ScheduledContent> {
    // Validate scheduling data
    const validation = await this.validateScheduleData(scheduleData);
    if (!validation.valid) {
      throw new Error(`Invalid schedule data: ${validation.errors.join(', ')}`);
    }

    // Check for scheduling conflicts
    const conflicts = await this.checkSchedulingConflicts(scheduleData);
    if (conflicts.length > 0) {
      throw new Error(`Scheduling conflicts detected: ${conflicts.join(', ')}`);
    }

    // Create scheduled content
    const scheduled = await this.prisma.scheduledContent.create({
      data: {
        contentId: scheduleData.contentId,
        contentType: scheduleData.contentType,
        publishAt: scheduleData.publishAt,
        unpublishAt: scheduleData.unpublishAt,
        timezone: scheduleData.timezone,
        recurringPattern: scheduleData.recurringPattern,
        scheduledBy: scheduleData.scheduledBy,
        status: 'scheduled',
        metadata: scheduleData.metadata || {}
      }
    });

    // Schedule publishing job
    await this.schedulePublishingJob(scheduled);

    // Schedule unpublishing job if specified
    if (scheduleData.unpublishAt) {
      await this.scheduleUnpublishingJob(scheduled);
    }

    // Handle recurring schedule
    if (scheduleData.recurringPattern) {
      await this.setupRecurringSchedule(scheduled);
    }

    return scheduled;
  }

  async getContentCalendar(timeRange: DateRange, filters?: CalendarFilters): Promise<ContentCalendar> {
    const scheduledContent = await this.getScheduledContentInRange(timeRange, filters);
    const publishedContent = await this.getPublishedContentInRange(timeRange, filters);

    // Group content by date
    const calendarData = new Map<string, CalendarDay>();

    // Process scheduled content
    for (const content of scheduledContent) {
      const dateKey = format(content.publishAt, 'yyyy-MM-dd');
      if (!calendarData.has(dateKey)) {
        calendarData.set(dateKey, {
          date: content.publishAt,
          scheduled: [],
          published: [],
          events: []
        });
      }
      calendarData.get(dateKey)!.scheduled.push(content);
    }

    // Process published content
    for (const content of publishedContent) {
      const dateKey = format(content.publishedAt, 'yyyy-MM-dd');
      if (!calendarData.has(dateKey)) {
        calendarData.set(dateKey, {
          date: content.publishedAt,
          scheduled: [],
          published: [],
          events: []
        });
      }
      calendarData.get(dateKey)!.published.push(content);
    }

    // Add editorial events
    const editorialEvents = await this.getEditorialEvents(timeRange);
    for (const event of editorialEvents) {
      const dateKey = format(event.date, 'yyyy-MM-dd');
      if (!calendarData.has(dateKey)) {
        calendarData.set(dateKey, {
          date: event.date,
          scheduled: [],
          published: [],
          events: []
        });
      }
      calendarData.get(dateKey)!.events.push(event);
    }

    return {
      timeRange,
      days: Array.from(calendarData.values()).sort((a, b) => a.date.getTime() - b.date.getTime()),
      summary: {
        totalScheduled: scheduledContent.length,
        totalPublished: publishedContent.length,
        totalEvents: editorialEvents.length
      }
    };
  }

  async createEditorialCalendar(calendarData: EditorialCalendarData): Promise<EditorialCalendar> {
    const calendar = await this.prisma.editorialCalendar.create({
      data: {
        name: calendarData.name,
        description: calendarData.description,
        startDate: calendarData.startDate,
        endDate: calendarData.endDate,
        timezone: calendarData.timezone,
        settings: calendarData.settings,
        createdBy: calendarData.createdBy
      }
    });

    // Create calendar events
    for (const event of calendarData.events) {
      await this.createEditorialEvent({
        ...event,
        calendarId: calendar.id
      });
    }

    return calendar;
  }

  async optimizePublishingSchedule(contentIds: string[]): Promise<OptimizedSchedule> {
    const contents = await this.getContentsByIds(contentIds);
    const analytics = await this.getAudienceAnalytics();
    
    // Analyze optimal publishing times based on audience behavior
    const optimalTimes = await this.calculateOptimalPublishingTimes(analytics);
    
    // Create optimized schedule
    const optimizedSchedule: ScheduleRecommendation[] = [];
    
    for (const content of contents) {
      const recommendation = await this.generateScheduleRecommendation(content, optimalTimes);
      optimizedSchedule.push(recommendation);
    }

    return {
      recommendations: optimizedSchedule,
      insights: {
        optimalTimes,
        audiencePatterns: analytics.patterns,
        competitorAnalysis: await this.getCompetitorPublishingPatterns()
      },
      conflictAnalysis: await this.analyzeScheduleConflicts(optimizedSchedule)
    };
  }

  private async calculateOptimalPublishingTimes(analytics: AudienceAnalytics): Promise<OptimalTime[]> {
    const optimalTimes: OptimalTime[] = [];

    // Analyze hourly engagement patterns
    for (let hour = 0; hour < 24; hour++) {
      const engagement = analytics.hourlyEngagement[hour];
      const reach = analytics.hourlyReach[hour];
      
      const score = (engagement * 0.6) + (reach * 0.4);
      
      optimalTimes.push({
        hour,
        dayOfWeek: null, // Will be calculated separately for each day
        score,
        engagement,
        reach
      });
    }

    // Analyze daily patterns
    const dailyOptimalTimes: OptimalTime[] = [];
    
    for (let day = 0; day < 7; day++) {
      const dayAnalytics = analytics.dailyPatterns[day];
      const bestHour = this.findBestHourForDay(optimalTimes, dayAnalytics);
      
      dailyOptimalTimes.push({
        hour: bestHour.hour,
        dayOfWeek: day,
        score: bestHour.score * dayAnalytics.activityMultiplier,
        engagement: bestHour.engagement,
        reach: bestHour.reach
      });
    }

    return dailyOptimalTimes.sort((a, b) => b.score - a.score);
  }

  private async generateScheduleRecommendation(
    content: Content, 
    optimalTimes: OptimalTime[]
  ): Promise<ScheduleRecommendation> {
    // Consider content type and category
    const contentTypeMultiplier = this.getContentTypeMultiplier(content.type);
    const categoryMultiplier = this.getCategoryMultiplier(content.category);

    // Find best time slot
    const adjustedTimes = optimalTimes.map(time => ({
      ...time,
      adjustedScore: time.score * contentTypeMultiplier * categoryMultiplier
    }));

    const bestTime = adjustedTimes.reduce((best, current) => 
      current.adjustedScore > best.adjustedScore ? current : best
    );

    // Calculate recommended date (next occurrence of optimal day/hour)
    const recommendedDate = this.calculateNextOptimalDate(bestTime);

    return {
      contentId: content.id,
      contentTitle: content.title,
      recommendedDate,
      confidence: bestTime.adjustedScore,
      reasoning: this.generateSchedulingReasoning(bestTime, content),
      alternatives: adjustedTimes.slice(1, 4).map(time => ({
        date: this.calculateNextOptimalDate(time),
        confidence: time.adjustedScore,
        reasoning: this.generateSchedulingReasoning(time, content)
      }))
    };
  }
}

interface ScheduleContentData {
  contentId: string;
  contentType: 'post' | 'page';
  publishAt: Date;
  unpublishAt?: Date;
  timezone: string;
  recurringPattern?: RecurringPattern;
  scheduledBy: string;
  metadata?: Record<string, any>;
}

interface ContentCalendar {
  timeRange: DateRange;
  days: CalendarDay[];
  summary: {
    totalScheduled: number;
    totalPublished: number;
    totalEvents: number;
  };
}

interface CalendarDay {
  date: Date;
  scheduled: ScheduledContent[];
  published: PublishedContent[];
  events: EditorialEvent[];
}

interface OptimizedSchedule {
  recommendations: ScheduleRecommendation[];
  insights: {
    optimalTimes: OptimalTime[];
    audiencePatterns: AudiencePattern[];
    competitorAnalysis: CompetitorAnalysis;
  };
  conflictAnalysis: ConflictAnalysis;
}

interface ScheduleRecommendation {
  contentId: string;
  contentTitle: string;
  recommendedDate: Date;
  confidence: number; // 0-1
  reasoning: string;
  alternatives: {
    date: Date;
    confidence: number;
    reasoning: string;
  }[];
}
```

### **4. 🔍 Content Discovery & Search**

#### **Advanced Search System:**
```typescript
export class ContentSearchService {
  private searchEngine: SearchEngine;
  private indexer: ContentIndexer;

  async searchContent(query: SearchQuery): Promise<SearchResults> {
    // Parse and enhance search query
    const enhancedQuery = await this.enhanceSearchQuery(query);

    // Execute search
    const results = await this.searchEngine.search(enhancedQuery);

    // Apply filters and sorting
    const filteredResults = await this.applyFilters(results, query.filters);
    const sortedResults = await this.applySorting(filteredResults, query.sortBy);

    // Calculate relevance scores
    const scoredResults = await this.calculateRelevanceScores(sortedResults, query);

    // Add search analytics
    await this.trackSearchQuery(query, scoredResults.length);

    return {
      query: enhancedQuery,
      results: scoredResults,
      totalCount: scoredResults.length,
      facets: await this.generateSearchFacets(results),
      suggestions: await this.generateSearchSuggestions(query),
      relatedSearches: await this.getRelatedSearches(query.term)
    };
  }

  async indexContent(contentId: string): Promise<void> {
    const content = await this.getContentForIndexing(contentId);
    if (!content) {
      throw new Error('Content not found');
    }

    // Extract searchable text
    const searchableText = await this.extractSearchableText(content);

    // Extract metadata
    const metadata = await this.extractSearchMetadata(content);

    // Create search document
    const document: SearchDocument = {
      id: content.id,
      type: content.type,
      title: content.title,
      content: searchableText,
      excerpt: content.excerpt || this.generateExcerpt(searchableText),
      author: content.author,
      categories: content.categories,
      tags: content.tags,
      publishedAt: content.publishedAt,
      updatedAt: content.updatedAt,
      status: content.status,
      metadata,
      searchableFields: {
        titleKeywords: await this.extractKeywords(content.title),
        contentKeywords: await this.extractKeywords(searchableText),
        entities: await this.extractEntities(searchableText)
      }
    };

    // Index document
    await this.indexer.indexDocument(document);

    // Update search statistics
    await this.updateSearchStatistics(content.type);
  }

  async setupAutoComplete(query: string): Promise<AutoCompleteResult[]> {
    const suggestions: AutoCompleteResult[] = [];

    // Get content title suggestions
    const titleSuggestions = await this.getTitleSuggestions(query);
    suggestions.push(...titleSuggestions);

    // Get tag suggestions
    const tagSuggestions = await this.getTagSuggestions(query);
    suggestions.push(...tagSuggestions);

    // Get category suggestions
    const categorySuggestions = await this.getCategorySuggestions(query);
    suggestions.push(...categorySuggestions);

    // Get author suggestions
    const authorSuggestions = await this.getAuthorSuggestions(query);
    suggestions.push(...authorSuggestions);

    // Sort by relevance and frequency
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  async getSearchAnalytics(timeRange: DateRange): Promise<SearchAnalytics> {
    const searchLogs = await this.getSearchLogs(timeRange);
    
    return {
      overview: {
        totalSearches: searchLogs.length,
        uniqueSearchers: new Set(searchLogs.map(s => s.userId).filter(Boolean)).size,
        averageResultsPerSearch: searchLogs.reduce((sum, s) => sum + s.resultCount, 0) / searchLogs.length,
        clickThroughRate: this.calculateClickThroughRate(searchLogs),
        noResultsRate: searchLogs.filter(s => s.resultCount === 0).length / searchLogs.length * 100
      },
      topQueries: await this.getTopSearchQueries(searchLogs),
      noResultQueries: await this.getNoResultQueries(searchLogs),
      popularContent: await this.getPopularSearchResults(searchLogs),
      searchTrends: await this.calculateSearchTrends(searchLogs),
      userBehavior: await this.analyzeSearchBehavior(searchLogs)
    };
  }

  private async enhanceSearchQuery(query: SearchQuery): Promise<EnhancedSearchQuery> {
    const enhanced: EnhancedSearchQuery = {
      ...query,
      expandedTerms: await this.expandSearchTerms(query.term),
      synonyms: await this.findSynonyms(query.term),
      stemmedTerms: await this.stemTerms(query.term),
      entities: await this.extractQueryEntities(query.term),
      intent: await this.detectSearchIntent(query.term)
    };

    return enhanced;
  }

  private async extractSearchableText(content: Content): Promise<string> {
    let searchableText = content.title + ' ' + content.content;

    // Remove HTML tags
    searchableText = searchableText.replace(/<[^>]*>/g, ' ');

    // Extract text from embedded media
    const mediaText = await this.extractMediaText(content);
    searchableText += ' ' + mediaText;

    // Extract text from custom fields
    const customFieldsText = await this.extractCustomFieldsText(content.customFields);
    searchableText += ' ' + customFieldsText;

    return searchableText.trim();
  }

  private async calculateRelevanceScores(
    results: SearchResult[], 
    query: SearchQuery
  ): Promise<ScoredSearchResult[]> {
    const scoredResults: ScoredSearchResult[] = [];

    for (const result of results) {
      const score = await this.calculateRelevanceScore(result, query);
      scoredResults.push({
        ...result,
        relevanceScore: score,
        scoreBreakdown: {
          titleMatch: this.calculateTitleMatchScore(result.title, query.term),
          contentMatch: this.calculateContentMatchScore(result.content, query.term),
          categoryMatch: this.calculateCategoryMatchScore(result.categories, query.filters?.categories),
          freshnessScore: this.calculateFreshnessScore(result.publishedAt),
          popularityScore: this.calculatePopularityScore(result.views, result.engagement)
        }
      });
    }

    return scoredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  private async generateSearchFacets(results: SearchResult[]): Promise<SearchFacet[]> {
    const facets: SearchFacet[] = [];

    // Content type facet
    const contentTypes = new Map<string, number>();
    results.forEach(r => {
      contentTypes.set(r.type, (contentTypes.get(r.type) || 0) + 1);
    });
    
    facets.push({
      name: 'Content Type',
      key: 'type',
      values: Array.from(contentTypes.entries()).map(([value, count]) => ({ value, count }))
    });

    // Category facet
    const categories = new Map<string, number>();
    results.forEach(r => {
      r.categories.forEach(cat => {
        categories.set(cat, (categories.get(cat) || 0) + 1);
      });
    });
    
    facets.push({
      name: 'Categories',
      key: 'categories',
      values: Array.from(categories.entries()).map(([value, count]) => ({ value, count }))
    });

    // Author facet
    const authors = new Map<string, number>();
    results.forEach(r => {
      authors.set(r.author.name, (authors.get(r.author.name) || 0) + 1);
    });
    
    facets.push({
      name: 'Authors',
      key: 'author',
      values: Array.from(authors.entries()).map(([value, count]) => ({ value, count }))
    });

    return facets;
  }
}

interface SearchQuery {
  term: string;
  filters?: {
    type?: string[];
    categories?: string[];
    tags?: string[];
    authors?: string[];
    dateRange?: DateRange;
    status?: string[];
  };
  sortBy?: 'relevance' | 'date' | 'title' | 'popularity';
  page?: number;
  limit?: number;
}

interface SearchResults {
  query: EnhancedSearchQuery;
  results: ScoredSearchResult[];
  totalCount: number;
  facets: SearchFacet[];
  suggestions: string[];
  relatedSearches: string[];
}

interface ScoredSearchResult extends SearchResult {
  relevanceScore: number;
  scoreBreakdown: {
    titleMatch: number;
    contentMatch: number;
    categoryMatch: number;
    freshnessScore: number;
    popularityScore: number;
  };
}

interface SearchAnalytics {
  overview: {
    totalSearches: number;
    uniqueSearchers: number;
    averageResultsPerSearch: number;
    clickThroughRate: number;
    noResultsRate: number;
  };
  topQueries: TopQuery[];
  noResultQueries: NoResultQuery[];
  popularContent: PopularContent[];
  searchTrends: SearchTrend[];
  userBehavior: SearchBehaviorData;
}
```

---

## 🎨 **Workflows Interface**

### **Workflow Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│ 🔄 Content Workflows                  [Create Workflow] │
├─────────────────────────────────────────────────────────┤
│ ┌─ My Tasks ─────────────────────────────────────────┐   │
│ │ 📝 Pending Reviews (5)                             │   │
│ │ ┌─────────────────────────────────────────────────┐ │   │
│ │ │ 📄 "React Best Practices" - Due: Today         │ │   │
│ │ │ 👤 Sarah Wilson → Review Required              │ │   │
│ │ │ [Review] [Approve] [Request Changes]           │ │   │
│ │ │                                               │ │   │
│ │ │ 📄 "Node.js Performance" - Due: Tomorrow       │ │   │
│ │ │ 👤 Mike Johnson → Final Approval               │ │   │
│ │ │ [Approve] [Reject] [Schedule]                  │ │   │
│ │ └─────────────────────────────────────────────────┘ │   │
│ │                                                   │   │
│ │ 🚀 Ready to Publish (3)                           │   │
│ │ • "CSS Grid Guide" - Approved by 2/2 reviewers   │   │
│ │ • "JavaScript ES2024" - Auto-approved            │   │
│ │ • "Web Security Tips" - Editorial approved       │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Content Calendar ─────────────────────────────────┐   │
│ │ This Week:                                         │   │
│ │ Mon 15: React Tutorial (Scheduled 9:00 AM)        │   │
│ │ Wed 17: Performance Guide (Scheduled 2:00 PM)     │   │
│ │ Fri 19: Security Update (Scheduled 10:00 AM)      │   │
│ │                                                   │   │
│ │ Next Week:                                         │   │
│ │ Mon 22: JavaScript Tips (Draft - needs review)    │   │
│ │ Thu 25: CSS Tricks (In progress)                  │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### **Content Search Interface:**
```
┌─────────────────────────────────────────────────────────┐
│ 🔍 Content Search                      [Advanced Search] │
├─────────────────────────────────────────────────────────┤
│ [Search content, tags, categories...___________________] │
│ [🔍 Search] [Filter ▼] [Sort: Relevance ▼]             │
├─────────────────────────────────────────────────────────┤
│ ┌─ Search Results (234 found) ──────────────────────┐   │
│ │ 📄 Getting Started with React Hooks               │   │
│ │ by Sarah Wilson • 2 days ago • Tutorial           │   │
│ │ "Learn how to use React Hooks effectively in your │   │
│ │ applications. This comprehensive guide covers..."   │   │
│ │ 🏷️ react, hooks, tutorial  📊 1.2K views          │   │
│ │                                                   │   │
│ │ 📄 Advanced JavaScript Performance Tips            │   │
│ │ by Mike Johnson • 1 week ago • Guide              │   │
│ │ "Optimize your JavaScript code for better..."      │   │
│ │ 🏷️ javascript, performance  📊 856 views          │   │
│ │                                                   │   │
│ │ 📄 CSS Grid Complete Reference                     │   │
│ │ by Alex Chen • 2 weeks ago • Reference            │   │
│ │ "Everything you need to know about CSS Grid..."    │   │
│ │ 🏷️ css, grid, layout  📊 2.1K views              │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Filters ──────────────────────────────────────────┐   │
│ │ Content Type:     Categories:        Authors:       │   │
│ │ ☑ Posts (189)     ☑ Tutorial (45)   ☑ Sarah (23)  │   │
│ │ ☑ Pages (45)      ☑ Guide (34)      ☑ Mike (19)   │   │
│ │ ☐ Drafts (12)     ☑ Reference (28)  ☑ Alex (15)   │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Workflow management
GET    /api/workflows                      // List workflows
POST   /api/workflows                      // Create workflow
GET    /api/workflows/{id}                 // Get workflow
PUT    /api/workflows/{id}                 // Update workflow
DELETE /api/workflows/{id}                 // Delete workflow

// Workflow instances
GET    /api/workflow-instances             // List instances
POST   /api/workflow-instances             // Start workflow
GET    /api/workflow-instances/{id}        // Get instance
POST   /api/workflow-instances/{id}/transition // Transition state

// Content scheduling
GET    /api/scheduled-content              // List scheduled content
POST   /api/scheduled-content              // Schedule content
PUT    /api/scheduled-content/{id}         // Update schedule
DELETE /api/scheduled-content/{id}         // Cancel schedule

// Content calendar
GET    /api/content-calendar               // Get calendar view
POST   /api/editorial-events               // Create editorial event
GET    /api/publishing-schedule/optimize   // Get optimized schedule

// Collaboration
POST   /api/content/{id}/collaborators     // Assign collaborators
GET    /api/content/{id}/activity          // Get collaboration activity
POST   /api/content/{id}/versions          // Create version
GET    /api/collaboration-sessions         // List active sessions

// Content search
GET    /api/search/content                 // Search content
GET    /api/search/suggestions             // Get search suggestions
POST   /api/search/index                   // Index content
GET    /api/search/analytics               // Search analytics
```

### **Database Schema:**
```sql
-- Content workflows
CREATE TABLE content_workflows (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  states JSONB NOT NULL,
  transitions JSONB NOT NULL,
  rules JSONB,
  settings JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workflow instances
CREATE TABLE content_workflow_instances (
  id UUID PRIMARY KEY,
  content_id UUID NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  workflow_id UUID REFERENCES content_workflows(id),
  current_state VARCHAR(100) NOT NULL,
  assignees JSONB,
  due_date TIMESTAMP,
  priority VARCHAR(20) DEFAULT 'medium',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workflow history
CREATE TABLE workflow_history (
  id UUID PRIMARY KEY,
  instance_id UUID REFERENCES content_workflow_instances(id) ON DELETE CASCADE,
  from_state VARCHAR(100),
  to_state VARCHAR(100) NOT NULL,
  transitioned_by UUID REFERENCES users(id),
  transitioned_at TIMESTAMP DEFAULT NOW(),
  comment TEXT,
  metadata JSONB
);

-- Scheduled content
CREATE TABLE scheduled_content (
  id UUID PRIMARY KEY,
  content_id UUID NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  publish_at TIMESTAMP NOT NULL,
  unpublish_at TIMESTAMP,
  timezone VARCHAR(50) DEFAULT 'UTC',
  recurring_pattern JSONB,
  status VARCHAR(20) DEFAULT 'scheduled',
  scheduled_by UUID REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Content collaborators
CREATE TABLE content_collaborators (
  id UUID PRIMARY KEY,
  content_id UUID NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  permissions JSONB,
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT NOW()
);

-- Content versions
CREATE TABLE content_versions (
  id UUID PRIMARY KEY,
  content_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT,
  metadata JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(content_id, version_number)
);

-- Search index
CREATE TABLE search_index (
  id UUID PRIMARY KEY,
  content_id UUID NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  searchable_text TEXT NOT NULL,
  keywords TEXT[],
  entities JSONB,
  metadata JSONB,
  indexed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(content_id)
);

-- Indexes for performance
CREATE INDEX idx_workflow_instances_content ON content_workflow_instances(content_id);
CREATE INDEX idx_workflow_instances_state ON content_workflow_instances(current_state);
CREATE INDEX idx_scheduled_content_publish_at ON scheduled_content(publish_at);
CREATE INDEX idx_search_index_searchable_text ON search_index USING gin(to_tsvector('english', searchable_text));
CREATE INDEX idx_search_index_keywords ON search_index USING gin(keywords);
```

---

## 🔗 **Related Documentation**

- **[Content Posts](./posts.md)** - Posts workflow integration
- **[Content Pages](./pages.md)** - Pages workflow integration
- **[User Management](../05_users/)** - User roles and permissions
- **[Content Analytics](../01_analytics/content-analytics.md)** - Workflow analytics and insights

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
