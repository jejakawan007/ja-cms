# 👥 User Groups System

> **Advanced User Grouping & Segmentation JA-CMS**  
> Flexible user groups dengan permissions, communication tools, dan advanced segmentation

---

## 📋 **Deskripsi**

User Groups System menyediakan capabilities untuk mengelompok users berdasarkan berbagai criteria seperti department, team, project, atau segmentasi custom. Sistem ini mendukung group-based permissions, bulk communication, nested groups, dan advanced segmentation untuk organizational management yang efficient.

---

## ⭐ **Core Features**

### **1. 🏗️ Group Architecture**

#### **Group Structure:**
```typescript
interface UserGroup {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: GroupType;
  category: GroupCategory;
  color: string;
  icon: string;
  parentId?: string; // for nested groups
  children: UserGroup[];
  members: GroupMember[];
  permissions: Permission[];
  settings: GroupSettings;
  rules: GroupRule[];
  metadata: GroupMetadata;
  stats: GroupStats;
}

interface GroupMember {
  id: string;
  userId: string;
  user: User;
  role: GroupRole;
  joinedAt: Date;
  joinedBy: string;
  status: MemberStatus;
  permissions: GroupPermission[];
  metadata: {
    invitedBy?: string;
    invitedAt?: Date;
    lastActivity?: Date;
    contributionScore?: number;
  };
}

interface GroupSettings {
  visibility: GroupVisibility;
  joinPolicy: JoinPolicy;
  memberLimit?: number;
  autoAssignment: AutoAssignmentRule[];
  communication: CommunicationSettings;
  permissions: GroupPermissionSettings;
  moderation: ModerationSettings;
  integration: IntegrationSettings;
}

interface GroupRule {
  id: string;
  name: string;
  type: RuleType;
  conditions: RuleCondition[];
  actions: RuleAction[];
  isActive: boolean;
  priority: number;
  createdBy: string;
  createdAt: Date;
}

interface GroupMetadata {
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastActivity?: Date;
  memberCount: number;
  activeMembers: number;
  tags: string[];
  customFields: CustomField[];
  externalIds: Record<string, string>; // for integrations
}

interface GroupStats {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  averageActivityScore: number;
  topContributors: string[];
  engagementRate: number;
  retentionRate: number;
}

type GroupType = 'department' | 'team' | 'project' | 'interest' | 'location' | 'custom';
type GroupCategory = 'organizational' | 'functional' | 'social' | 'temporary' | 'system';
type GroupVisibility = 'public' | 'private' | 'hidden' | 'invite_only';
type JoinPolicy = 'open' | 'approval_required' | 'invite_only' | 'closed';
type MemberStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'left';
type GroupRole = 'owner' | 'admin' | 'moderator' | 'member' | 'guest';
```

#### **Group Management Service:**
```typescript
export class GroupManagementService {
  private groupRepository: GroupRepository;
  private memberRepository: GroupMemberRepository;
  private permissionService: PermissionService;
  private communicationService: CommunicationService;
  private auditService: AuditService;
  private segmentationEngine: SegmentationEngine;

  async createGroup(groupData: CreateGroupData, createdBy: string): Promise<UserGroup> {
    // Validate group data
    const validation = await this.validateGroupData(groupData);
    if (!validation.valid) {
      throw new Error(`Group validation failed: ${validation.errors.join(', ')}`);
    }

    // Check for duplicate slug
    const existingGroup = await this.groupRepository.findBySlug(groupData.slug);
    if (existingGroup) {
      throw new Error('Group with this slug already exists');
    }

    // Validate parent group if specified
    if (groupData.parentId) {
      const parentGroup = await this.groupRepository.findById(groupData.parentId);
      if (!parentGroup) {
        throw new Error('Parent group not found');
      }
    }

    // Create group
    const group: UserGroup = {
      id: this.generateGroupId(),
      name: groupData.name,
      slug: groupData.slug,
      description: groupData.description,
      type: groupData.type,
      category: groupData.category || 'functional',
      color: groupData.color || this.generateGroupColor(),
      icon: groupData.icon || 'users',
      parentId: groupData.parentId,
      children: [],
      members: [],
      permissions: await this.resolvePermissions(groupData.permissions || []),
      settings: this.initializeGroupSettings(groupData.settings),
      rules: await this.createGroupRules(groupData.rules || []),
      metadata: {
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
        memberCount: 0,
        activeMembers: 0,
        tags: groupData.tags || [],
        customFields: groupData.customFields || [],
        externalIds: groupData.externalIds || {}
      },
      stats: this.initializeGroupStats()
    };

    // Save group
    const savedGroup = await this.groupRepository.create(group);

    // Add creator as owner
    await this.addMemberToGroup(savedGroup.id, createdBy, 'owner', createdBy);

    // Add initial members if specified
    if (groupData.initialMembers && groupData.initialMembers.length > 0) {
      await this.addMembersToGroup(savedGroup.id, groupData.initialMembers, createdBy);
    }

    // Execute auto-assignment rules
    if (group.settings.autoAssignment.length > 0) {
      await this.executeAutoAssignmentRules(savedGroup.id);
    }

    // Log audit event
    await this.auditService.log({
      action: 'group_created',
      resourceType: 'group',
      resourceId: savedGroup.id,
      performedBy: createdBy,
      details: {
        name: savedGroup.name,
        type: savedGroup.type,
        memberCount: savedGroup.metadata.memberCount
      }
    });

    return savedGroup;
  }

  async addMemberToGroup(groupId: string, userId: string, role: GroupRole = 'member', addedBy: string): Promise<GroupMember> {
    const [group, user] = await Promise.all([
      this.groupRepository.findById(groupId),
      this.getUserById(userId)
    ]);

    if (!group || !user) {
      throw new Error('Group or user not found');
    }

    // Check if user is already a member
    const existingMember = await this.memberRepository.findByGroupAndUser(groupId, userId);
    if (existingMember) {
      throw new Error('User is already a member of this group');
    }

    // Validate member limit
    if (group.settings.memberLimit && group.metadata.memberCount >= group.settings.memberLimit) {
      throw new Error('Group has reached member limit');
    }

    // Check join policy
    const canJoin = await this.validateJoinPolicy(group, userId, addedBy);
    if (!canJoin.allowed) {
      throw new Error(`Cannot join group: ${canJoin.reason}`);
    }

    // Create member record
    const member: GroupMember = {
      id: this.generateMemberId(),
      userId,
      user,
      role,
      joinedAt: new Date(),
      joinedBy: addedBy,
      status: group.settings.joinPolicy === 'approval_required' ? 'pending' : 'active',
      permissions: await this.getGroupRolePermissions(role),
      metadata: {
        invitedBy: addedBy !== userId ? addedBy : undefined,
        invitedAt: addedBy !== userId ? new Date() : undefined,
        contributionScore: 0
      }
    };

    // Save member
    const savedMember = await this.memberRepository.create(member);

    // Update group stats
    await this.updateGroupMemberCount(groupId, 1);

    // Send notifications
    await this.notifyGroupMembership(groupId, userId, 'added', addedBy);

    // Apply group permissions to user
    await this.applyGroupPermissionsToUser(userId, groupId);

    // Log audit event
    await this.auditService.log({
      action: 'member_added',
      resourceType: 'group_member',
      resourceId: savedMember.id,
      userId,
      performedBy: addedBy,
      details: {
        groupName: group.name,
        role,
        status: member.status
      }
    });

    return savedMember;
  }

  async removeMemberFromGroup(groupId: string, userId: string, removedBy: string, reason?: string): Promise<void> {
    const member = await this.memberRepository.findByGroupAndUser(groupId, userId);
    if (!member) {
      throw new Error('User is not a member of this group');
    }

    // Check permissions
    const canRemove = await this.canRemoveMember(removedBy, member);
    if (!canRemove.allowed) {
      throw new Error(`Cannot remove member: ${canRemove.reason}`);
    }

    // Prevent removing last owner
    if (member.role === 'owner') {
      const ownerCount = await this.getGroupOwnerCount(groupId);
      if (ownerCount <= 1) {
        throw new Error('Cannot remove the last owner of the group');
      }
    }

    // Remove member
    await this.memberRepository.delete(member.id);

    // Update group stats
    await this.updateGroupMemberCount(groupId, -1);

    // Remove group permissions from user
    await this.removeGroupPermissionsFromUser(userId, groupId);

    // Send notifications
    await this.notifyGroupMembership(groupId, userId, 'removed', removedBy, reason);

    // Log audit event
    await this.auditService.log({
      action: 'member_removed',
      resourceType: 'group_member',
      resourceId: member.id,
      userId,
      performedBy: removedBy,
      details: {
        groupName: member.group?.name,
        role: member.role,
        reason
      }
    });
  }

  async updateMemberRole(groupId: string, userId: string, newRole: GroupRole, updatedBy: string): Promise<GroupMember> {
    const member = await this.memberRepository.findByGroupAndUser(groupId, userId);
    if (!member) {
      throw new Error('User is not a member of this group');
    }

    // Check permissions
    const canUpdateRole = await this.canUpdateMemberRole(updatedBy, member, newRole);
    if (!canUpdateRole.allowed) {
      throw new Error(`Cannot update role: ${canUpdateRole.reason}`);
    }

    const oldRole = member.role;
    
    // Prevent removing last owner
    if (oldRole === 'owner' && newRole !== 'owner') {
      const ownerCount = await this.getGroupOwnerCount(groupId);
      if (ownerCount <= 1) {
        throw new Error('Cannot change role of the last owner');
      }
    }

    // Update member role and permissions
    member.role = newRole;
    member.permissions = await this.getGroupRolePermissions(newRole);
    
    const updatedMember = await this.memberRepository.update(member.id, member);

    // Update user permissions
    await this.refreshUserGroupPermissions(userId);

    // Send notifications
    await this.notifyRoleChange(groupId, userId, oldRole, newRole, updatedBy);

    // Log audit event
    await this.auditService.log({
      action: 'member_role_updated',
      resourceType: 'group_member',
      resourceId: member.id,
      userId,
      performedBy: updatedBy,
      details: {
        groupName: member.group?.name,
        oldRole,
        newRole
      }
    });

    return updatedMember;
  }

  async createAutoSegment(segmentData: CreateSegmentData, createdBy: string): Promise<UserGroup> {
    // Validate segment rules
    const validation = await this.validateSegmentRules(segmentData.rules);
    if (!validation.valid) {
      throw new Error(`Segment validation failed: ${validation.errors.join(', ')}`);
    }

    // Create segment as a special type of group
    const segment = await this.createGroup({
      ...segmentData,
      type: 'custom',
      category: 'system',
      settings: {
        ...segmentData.settings,
        autoAssignment: segmentData.rules.map(rule => ({
          type: 'segment_rule',
          conditions: rule.conditions,
          actions: [{ type: 'add_to_group', value: null }] // Will be set after creation
        }))
      }
    }, createdBy);

    // Execute initial segmentation
    await this.executeSegmentation(segment.id);

    // Schedule periodic re-segmentation if configured
    if (segmentData.autoRefresh) {
      await this.scheduleSegmentRefresh(segment.id, segmentData.refreshInterval || '1d');
    }

    return segment;
  }

  async executeSegmentation(groupId: string): Promise<SegmentationResult> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    const results: SegmentationResult = {
      groupId,
      totalEvaluated: 0,
      added: [],
      removed: [],
      unchanged: 0,
      errors: []
    };

    // Get all users for evaluation
    const allUsers = await this.getAllActiveUsers();
    results.totalEvaluated = allUsers.length;

    // Get current group members
    const currentMembers = new Set(
      (await this.getGroupMembers(groupId)).map(m => m.userId)
    );

    for (const user of allUsers) {
      try {
        const shouldBeMember = await this.evaluateUserForGroup(user, group);
        const isMember = currentMembers.has(user.id);

        if (shouldBeMember && !isMember) {
          // Add user to group
          await this.addMemberToGroup(groupId, user.id, 'member', 'system');
          results.added.push(user.id);
        } else if (!shouldBeMember && isMember) {
          // Remove user from group
          await this.removeMemberFromGroup(groupId, user.id, 'system', 'Automatic segmentation');
          results.removed.push(user.id);
        } else {
          results.unchanged++;
        }
      } catch (error) {
        results.errors.push({
          userId: user.id,
          error: error.message
        });
      }
    }

    // Log segmentation results
    await this.auditService.log({
      action: 'segmentation_executed',
      resourceType: 'group',
      resourceId: groupId,
      performedBy: 'system',
      details: results
    });

    return results;
  }

  async bulkCommunicate(groupId: string, message: BulkMessage, sentBy: string): Promise<CommunicationResult> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    // Check permissions
    const canCommunicate = await this.canCommunicateWithGroup(sentBy, groupId);
    if (!canCommunicate.allowed) {
      throw new Error(`Cannot send message: ${canCommunicate.reason}`);
    }

    // Get active group members
    const members = await this.getActiveGroupMembers(groupId);
    
    // Filter members based on message targeting
    const targetMembers = await this.filterMembersForMessage(members, message.targeting);

    // Send message
    const result = await this.communicationService.sendBulkMessage({
      ...message,
      recipients: targetMembers.map(m => m.userId),
      groupId,
      sentBy
    });

    // Log communication
    await this.auditService.log({
      action: 'bulk_communication_sent',
      resourceType: 'group',
      resourceId: groupId,
      performedBy: sentBy,
      details: {
        messageType: message.type,
        recipientCount: targetMembers.length,
        subject: message.subject
      }
    });

    return result;
  }

  private async evaluateUserForGroup(user: User, group: UserGroup): Promise<boolean> {
    for (const rule of group.rules) {
      if (!rule.isActive) continue;

      const ruleResult = await this.evaluateRule(rule, user);
      if (ruleResult) {
        return true; // Any matching rule includes the user
      }
    }

    return false;
  }

  private async evaluateRule(rule: GroupRule, user: User): Promise<boolean> {
    for (const condition of rule.conditions) {
      const conditionResult = await this.evaluateCondition(condition, user);
      if (!conditionResult) {
        return false; // All conditions must be true
      }
    }

    return true;
  }

  private async evaluateCondition(condition: RuleCondition, user: User): Promise<boolean> {
    let actualValue: any;

    // Get the actual value based on the field
    switch (condition.field) {
      case 'user.department':
        actualValue = user.profile?.department;
        break;
      case 'user.jobTitle':
        actualValue = user.profile?.jobTitle;
        break;
      case 'user.location':
        actualValue = user.profile?.location;
        break;
      case 'user.joinDate':
        actualValue = user.createdAt;
        break;
      case 'user.lastLogin':
        actualValue = user.lastLogin;
        break;
      case 'user.roles':
        actualValue = user.roles.map(r => r.slug);
        break;
      case 'user.tags':
        actualValue = user.metadata.tags;
        break;
      default:
        // Custom field
        if (condition.field.startsWith('custom.')) {
          const fieldName = condition.field.replace('custom.', '');
          actualValue = user.profile?.customFields?.find(f => f.key === fieldName)?.value;
        } else {
          return false;
        }
    }

    // Evaluate based on operator
    return this.evaluateConditionOperator(condition.operator, actualValue, condition.value);
  }

  private evaluateConditionOperator(operator: string, actualValue: any, expectedValue: any): boolean {
    switch (operator) {
      case 'equals':
        return actualValue === expectedValue;
      case 'not_equals':
        return actualValue !== expectedValue;
      case 'contains':
        return Array.isArray(actualValue) && actualValue.includes(expectedValue);
      case 'not_contains':
        return Array.isArray(actualValue) && !actualValue.includes(expectedValue);
      case 'starts_with':
        return typeof actualValue === 'string' && actualValue.startsWith(expectedValue);
      case 'ends_with':
        return typeof actualValue === 'string' && actualValue.endsWith(expectedValue);
      case 'greater_than':
        return actualValue > expectedValue;
      case 'less_than':
        return actualValue < expectedValue;
      case 'between':
        return actualValue >= expectedValue.min && actualValue <= expectedValue.max;
      case 'in':
        return Array.isArray(expectedValue) && expectedValue.includes(actualValue);
      case 'not_in':
        return Array.isArray(expectedValue) && !expectedValue.includes(actualValue);
      case 'regex':
        return new RegExp(expectedValue).test(actualValue);
      case 'is_null':
        return actualValue == null;
      case 'is_not_null':
        return actualValue != null;
      default:
        return false;
    }
  }

  async getGroupAnalytics(groupId: string, timeRange: DateRange): Promise<GroupAnalytics> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    const analytics = await this.calculateGroupAnalytics(groupId, timeRange);
    
    return {
      group: {
        id: group.id,
        name: group.name,
        type: group.type,
        memberCount: group.metadata.memberCount
      },
      timeRange,
      membership: {
        totalMembers: analytics.totalMembers,
        newMembers: analytics.newMembers,
        leftMembers: analytics.leftMembers,
        growthRate: analytics.membershipGrowthRate,
        retentionRate: analytics.retentionRate,
        churnRate: analytics.churnRate
      },
      activity: {
        activeMembers: analytics.activeMembers,
        averageActivityScore: analytics.averageActivityScore,
        topContributors: analytics.topContributors,
        engagementRate: analytics.engagementRate,
        contentCreated: analytics.contentCreated
      },
      communication: {
        messagesExchanged: analytics.messagesExchanged,
        emailsSent: analytics.emailsSent,
        responseRate: analytics.responseRate,
        averageResponseTime: analytics.averageResponseTime
      },
      insights: await this.generateGroupInsights(analytics)
    };
  }
}

interface CreateGroupData {
  name: string;
  slug: string;
  description: string;
  type: GroupType;
  category?: GroupCategory;
  color?: string;
  icon?: string;
  parentId?: string;
  permissions?: string[];
  settings?: Partial<GroupSettings>;
  rules?: CreateRuleData[];
  tags?: string[];
  customFields?: CustomField[];
  externalIds?: Record<string, string>;
  initialMembers?: string[];
}

interface CreateSegmentData extends CreateGroupData {
  rules: CreateRuleData[];
  autoRefresh?: boolean;
  refreshInterval?: string; // e.g., '1d', '1w', '1m'
}

interface CreateRuleData {
  name: string;
  type: RuleType;
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority?: number;
}

interface RuleCondition {
  field: string;
  operator: string;
  value: any;
  description?: string;
}

interface RuleAction {
  type: string;
  value: any;
  description?: string;
}

interface SegmentationResult {
  groupId: string;
  totalEvaluated: number;
  added: string[];
  removed: string[];
  unchanged: number;
  errors: Array<{
    userId: string;
    error: string;
  }>;
}

interface BulkMessage {
  type: 'email' | 'notification' | 'sms';
  subject: string;
  content: string;
  targeting?: MessageTargeting;
  scheduling?: {
    sendAt?: Date;
    timezone?: string;
  };
  template?: string;
  variables?: Record<string, any>;
}

interface MessageTargeting {
  roles?: GroupRole[];
  status?: MemberStatus[];
  joinedAfter?: Date;
  joinedBefore?: Date;
  lastActiveAfter?: Date;
  tags?: string[];
}

interface GroupAnalytics {
  group: {
    id: string;
    name: string;
    type: GroupType;
    memberCount: number;
  };
  timeRange: DateRange;
  membership: {
    totalMembers: number;
    newMembers: number;
    leftMembers: number;
    growthRate: number;
    retentionRate: number;
    churnRate: number;
  };
  activity: {
    activeMembers: number;
    averageActivityScore: number;
    topContributors: string[];
    engagementRate: number;
    contentCreated: number;
  };
  communication: {
    messagesExchanged: number;
    emailsSent: number;
    responseRate: number;
    averageResponseTime: number; // in minutes
  };
  insights: GroupInsight[];
}

interface GroupInsight {
  type: 'growth' | 'engagement' | 'retention' | 'activity';
  severity: 'info' | 'warning' | 'success';
  title: string;
  description: string;
  recommendation?: string;
  impact: 'low' | 'medium' | 'high';
}

type RuleType = 'inclusion' | 'exclusion' | 'assignment' | 'notification';
```

---

## 🎨 **User Groups Interface**

### **Groups Management Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│ 👥 User Groups                        [Create Group] [Auto Segment] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Group Categories ─────────────────────────────────┐   │
│ │ 🏢 Departments (5 groups, 234 members)            │   │
│ │ ├─ Marketing (45 members)                          │   │
│ │ ├─ Engineering (67 members)                        │   │
│ │ ├─ Sales (38 members)                              │   │
│ │ ├─ Support (29 members)                            │   │
│ │ └─ HR (15 members)                                 │   │
│ │                                                   │   │
│ │ 👨‍💼 Teams (8 groups, 156 members)                   │   │
│ │ ├─ Frontend Team (12 members)                      │   │
│ │ ├─ Backend Team (18 members)                       │   │
│ │ ├─ DevOps Team (8 members)                         │   │
│ │ ├─ Content Team (23 members)                       │   │
│ │ └─ [+3 more teams...]                              │   │
│ │                                                   │   │
│ │ 📋 Projects (12 groups, 89 members)               │   │
│ │ ├─ Website Redesign (15 members)                   │   │
│ │ ├─ Mobile App (12 members)                         │   │
│ │ ├─ API v2 (8 members)                              │   │
│ │ └─ [+9 more projects...]                           │   │
│ │                                                   │   │
│ │ 🎯 Auto Segments (3 groups, 345 members)          │   │
│ │ ├─ New Users (67 members) 🔄 Auto-refresh         │   │
│ │ ├─ Power Users (123 members) 🔄 Auto-refresh      │   │
│ │ └─ Inactive Users (155 members) 🔄 Auto-refresh   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Selected Group: Marketing ────────────────────────┐   │
│ │ 🎨 Marketing Department                            │   │
│ │ 45 members • Public • Open join policy            │   │
│ │                                                   │   │
│ │ Description: Marketing team responsible for brand  │   │
│ │ management, campaigns, and growth strategies.      │   │
│ │                                                   │   │
│ │ 👥 Recent Members:                                 │   │
│ │ • John Smith (Marketing Manager) - 2 days ago     │   │
│ │ • Sarah Wilson (Content Specialist) - 1 week ago  │   │
│ │ • Mike Chen (SEO Analyst) - 2 weeks ago           │   │
│ │                                                   │   │
│ │ 📊 Activity: High (85% engagement rate)           │   │
│ │ 📈 Growth: +8 members this month (+22%)           │   │
│ │                                                   │   │
│ │ [View Members] [Send Message] [Edit Group] [Analytics] │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Quick Actions ────────────────────────────────────┐   │
│ │ 📧 Bulk Communication:                             │   │
│ │ • Send announcement to all departments             │   │
│ │ • Newsletter to active members                     │   │
│ │ • Welcome message to new users                     │   │
│ │                                                   │   │
│ │ 🔄 Auto-Segmentation:                              │   │
│ │ • Refresh all segments now                         │   │
│ │ • Create new segment based on activity            │   │
│ │ • Update segment rules                             │   │
│ │                                                   │   │
│ │ 📊 Analytics:                                      │   │
│ │ • Group engagement report                          │   │
│ │ • Membership growth trends                         │   │
│ │ • Cross-group analysis                             │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### **Group Creation/Edit Interface:**
```
┌─────────────────────────────────────────────────────────┐
│ ✏️ Create New Group                       [Save] [Cancel] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Basic Information ────────────────────────────────┐   │
│ │ Group Name: [Frontend Development Team___________] │   │
│ │ Slug: [frontend-dev-team__________________] (Auto) │   │
│ │ Type: [Team ▼] Category: [Functional ▼]           │   │
│ │                                                   │   │
│ │ Description:                                       │   │
│ │ ┌─────────────────────────────────────────────────┐ │   │
│ │ │ Cross-functional team responsible for frontend  │ │   │
│ │ │ development, UI/UX implementation, and user     │ │   │
│ │ │ experience optimization.                        │ │   │
│ │ └─────────────────────────────────────────────────┘ │   │
│ │                                                   │   │
│ │ Parent Group: [Engineering Department ▼] (Optional)│   │
│ │ Color: [🔵] Icon: [💻] Tags: [frontend, ui, react] │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Group Settings ───────────────────────────────────┐   │
│ │ Visibility: [Public ▼]                             │   │
│ │ • Public: Visible to all users                     │   │
│ │ • Private: Members only                            │   │
│ │ • Hidden: Invite only                              │   │
│ │                                                   │   │
│ │ Join Policy: [Approval Required ▼]                 │   │
│ │ • Open: Anyone can join                            │   │
│ │ • Approval Required: Admin approval needed         │   │
│ │ • Invite Only: Members must be invited             │   │
│ │ • Closed: No new members                           │   │
│ │                                                   │   │
│ │ Member Limit: [25___] (0 = unlimited)             │   │
│ │                                                   │   │
│ │ Communication:                                     │   │
│ │ ☑ Email notifications  ☑ Slack integration        │   │
│ │ ☑ Internal messaging   ☐ SMS notifications        │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Permissions & Roles ──────────────────────────────┐   │
│ │ Group Permissions:                                 │   │
│ │ ☑ Create team content     ☑ Edit team content     │   │
│ │ ☑ Access team resources   ☑ Manage team calendar  │   │
│ │ ☑ View team analytics     ☐ Admin team settings   │   │
│ │                                                   │   │
│ │ Member Roles:                                      │   │
│ │ 👑 Owner: Full group control                       │   │
│ │ 🛡️ Admin: Manage members and settings              │   │
│ │ 🎯 Moderator: Moderate content and discussions     │   │
│ │ 👤 Member: Standard group access                   │   │
│ │ 👁️ Guest: Limited read-only access                 │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Auto-Assignment Rules ────────────────────────────┐   │
│ │ ☑ Enable auto-assignment                           │   │
│ │                                                   │   │
│ │ Rule 1: Add users when                             │   │
│ │ • Department = "Engineering"                       │   │
│ │ • Job Title contains "Frontend"                    │   │
│ │ • Skills include "React" OR "Vue"                  │   │
│ │                                                   │   │
│ │ Rule 2: Remove users when                          │   │
│ │ • Department changes from "Engineering"            │   │
│ │ • Last login > 90 days ago                         │   │
│ │                                                   │   │
│ │ [Add Rule] [Test Rules] [Import from Template]    │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Initial Members ──────────────────────────────────┐   │
│ │ Add members to this group:                         │   │
│ │                                                   │   │
│ │ 🔍 Search users: [john@company.com__] [Search]     │   │
│ │                                                   │   │
│ │ Selected Members:                                  │   │
│ │ • John Doe (john.doe@company.com) - Owner         │   │
│ │ • Sarah Smith (sarah.smith@company.com) - Admin   │   │
│ │ • Mike Johnson (mike.j@company.com) - Member      │   │
│ │                                                   │   │
│ │ [Import from CSV] [Import from Another Group]     │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### **Auto-Segmentation Builder:**
```
┌─────────────────────────────────────────────────────────┐
│ 🎯 Auto-Segment Builder: Power Users      [Save] [Test] [Cancel] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Segment Definition ───────────────────────────────┐   │
│ │ Segment Name: [Power Users________________]        │   │
│ │ Description:                                       │   │
│ │ ┌─────────────────────────────────────────────────┐ │   │
│ │ │ Highly engaged users who actively use the       │ │   │
│ │ │ platform and create valuable content.          │ │   │
│ │ └─────────────────────────────────────────────────┘ │   │
│ │                                                   │   │
│ │ Auto-refresh: [Daily ▼] at [2:00 AM ▼]            │   │
│ │ ☑ Send notification on membership changes         │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Segmentation Rules ───────────────────────────────┐   │
│ │ Users will be included if they match ALL of:       │   │
│ │                                                   │   │
│ │ Rule 1: Activity Level                             │   │
│ │ • Last login: [within 7 days ▼]                   │   │
│ │ • Login frequency: [≥ 3 times per week ▼]         │   │
│ │ • Session duration: [≥ 30 minutes average ▼]      │   │
│ │                                                   │   │
│ │ Rule 2: Content Creation                           │   │
│ │ • Posts created: [≥ 5 in last month ▼]            │   │
│ │ • Comments posted: [≥ 10 in last month ▼]         │   │
│ │ • Content quality score: [≥ 4.0 ▼]                │   │
│ │                                                   │   │
│ │ Rule 3: Engagement                                 │   │
│ │ • Profile completeness: [≥ 80% ▼]                 │   │
│ │ • Social interactions: [≥ 20 likes/shares ▼]      │   │
│ │ • Feature usage: [Uses ≥ 5 different features ▼]  │   │
│ │                                                   │   │
│ │ Exclusion Rules:                                   │   │
│ │ • Account status: [not suspended/banned ▼]        │   │
│ │ • User type: [not test account ▼]                 │   │
│ │                                                   │   │
│ │ [Add Rule] [Add Exclusion] [Load Template]        │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Preview Results ──────────────────────────────────┐   │
│ │ 🔍 Testing rules against current users...          │   │
│ │                                                   │   │
│ │ ✅ 123 users match the criteria                    │   │
│ │ ❌ 1,234 users don't match                         │   │
│ │ ⚠️ 12 users have incomplete data                   │   │
│ │                                                   │   │
│ │ Top matching users:                                │   │
│ │ • John Doe (95% match score)                      │   │
│ │ • Sarah Smith (92% match score)                   │   │
│ │ • Mike Johnson (88% match score)                  │   │
│ │ • [Show all 123 matches...]                       │   │
│ │                                                   │   │
│ │ Segment will be updated: Daily at 2:00 AM         │   │
│ │ Estimated processing time: 2-3 minutes            │   │
│ │                                                   │   │
│ │ [View Details] [Export List] [Schedule Test Run]  │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Group management
GET    /api/groups                       // List all groups
POST   /api/groups                       // Create new group
GET    /api/groups/{id}                  // Get group details
PUT    /api/groups/{id}                  // Update group
DELETE /api/groups/{id}                  // Delete group

// Group membership
GET    /api/groups/{id}/members          // Get group members
POST   /api/groups/{id}/members          // Add member to group
DELETE /api/groups/{id}/members/{userId} // Remove member from group
PUT    /api/groups/{id}/members/{userId} // Update member role

// Group communication
POST   /api/groups/{id}/messages         // Send message to group
GET    /api/groups/{id}/messages         // Get group messages
POST   /api/groups/{id}/announcements    // Send announcement

// Auto-segmentation
POST   /api/groups/segments              // Create auto-segment
PUT    /api/groups/segments/{id}         // Update segment rules
POST   /api/groups/segments/{id}/execute // Execute segmentation
GET    /api/groups/segments/{id}/preview // Preview segment results

// Group analytics
GET    /api/groups/{id}/analytics        // Get group analytics
GET    /api/groups/{id}/activity         // Get group activity
GET    /api/groups/analytics/overview    // Get overview analytics
```

### **Database Schema:**
```sql
-- Groups
CREATE TABLE user_groups (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  color VARCHAR(7) DEFAULT '#6b7280',
  icon VARCHAR(50) DEFAULT 'users',
  parent_id UUID REFERENCES user_groups(id) ON DELETE SET NULL,
  settings JSONB NOT NULL,
  rules JSONB DEFAULT '[]',
  metadata JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Group members
CREATE TABLE group_members (
  id UUID PRIMARY KEY,
  group_id UUID REFERENCES user_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  permissions JSONB DEFAULT '[]',
  joined_at TIMESTAMP DEFAULT NOW(),
  joined_by UUID REFERENCES users(id) ON DELETE SET NULL,
  left_at TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  UNIQUE(group_id, user_id)
);

-- Group permissions
CREATE TABLE group_permissions (
  id UUID PRIMARY KEY,
  group_id UUID REFERENCES user_groups(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  granted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, permission_id)
);

-- Group activity log
CREATE TABLE group_activity (
  id UUID PRIMARY KEY,
  group_id UUID REFERENCES user_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Group communications
CREATE TABLE group_communications (
  id UUID PRIMARY KEY,
  group_id UUID REFERENCES user_groups(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL,
  subject VARCHAR(255),
  content TEXT NOT NULL,
  targeting JSONB,
  recipients JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'sent',
  sent_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Segmentation jobs
CREATE TABLE segmentation_jobs (
  id UUID PRIMARY KEY,
  group_id UUID REFERENCES user_groups(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  results JSONB,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_groups_slug ON user_groups(slug);
CREATE INDEX idx_user_groups_type ON user_groups(type);
CREATE INDEX idx_user_groups_parent ON user_groups(parent_id);
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_group_members_status ON group_members(status);
CREATE INDEX idx_group_permissions_group ON group_permissions(group_id);
CREATE INDEX idx_group_activity_group ON group_activity(group_id);
CREATE INDEX idx_group_activity_user ON group_activity(user_id);
CREATE INDEX idx_group_communications_group ON group_communications(group_id);
CREATE INDEX idx_segmentation_jobs_group ON segmentation_jobs(group_id);
CREATE INDEX idx_segmentation_jobs_status ON segmentation_jobs(status);
```

---

## 🔗 **Related Documentation**

- **[User Management](./management.md)** - User CRUD operations integration
- **[Roles & Permissions](./roles.md)** - Group-based permissions
- **[Authentication](./authentication.md)** - Group access control
- **[Communication Tools](./communication.md)** - Group messaging systems
- **[User Analytics](../01_analytics/user-analytics.md)** - Group analytics integration

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
