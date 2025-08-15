# 📧 User Communication Tools

> **Advanced User Communication & Messaging JA-CMS**  
> Comprehensive communication system dengan bulk messaging, notifications, dan user engagement tools

---

## 📋 **Deskripsi**

User Communication System menyediakan comprehensive tools untuk berkomunikasi dengan users dalam JA-CMS. Sistem ini mencakup email marketing, bulk messaging, push notifications, in-app messaging, automated campaigns, dan advanced targeting untuk effective user engagement dan communication.

---

## ⭐ **Core Features**

### **1. 📧 Email Communication System**

#### **Email Architecture:**
```typescript
interface EmailCommunication {
  id: string;
  type: EmailType;
  campaign: EmailCampaign;
  template: EmailTemplate;
  recipients: EmailRecipient[];
  targeting: EmailTargeting;
  content: EmailContent;
  scheduling: EmailScheduling;
  tracking: EmailTracking;
  analytics: EmailAnalytics;
  status: EmailStatus;
  metadata: EmailMetadata;
}

interface EmailCampaign {
  id: string;
  name: string;
  description: string;
  type: CampaignType;
  category: string;
  tags: string[];
  goals: CampaignGoal[];
  budget?: CampaignBudget;
  timeline: CampaignTimeline;
  automation: AutomationRule[];
  abTesting: ABTestConfig;
  compliance: ComplianceSettings;
}

interface EmailTemplate {
  id: string;
  name: string;
  type: TemplateType;
  category: string;
  layout: TemplateLayout;
  components: TemplateComponent[];
  variables: TemplateVariable[];
  styling: TemplateStyle;
  responsive: ResponsiveSettings;
  previewText: string;
  version: string;
  isActive: boolean;
}

interface EmailContent {
  subject: string;
  preheader?: string;
  htmlBody: string;
  textBody: string;
  attachments: EmailAttachment[];
  personalization: PersonalizationData;
  dynamicContent: DynamicContentRule[];
  links: TrackedLink[];
  images: EmailImage[];
  cta: CallToAction[];
}

interface EmailTargeting {
  segments: string[];
  userGroups: string[];
  filters: TargetingFilter[];
  exclusions: TargetingExclusion[];
  conditions: TargetingCondition[];
  timezone: string;
  frequency: FrequencySettings;
  preferences: PreferenceSettings;
}

interface EmailTracking {
  opens: OpenTracking[];
  clicks: ClickTracking[];
  bounces: BounceTracking[];
  unsubscribes: UnsubscribeTracking[];
  complaints: ComplaintTracking[];
  forwards: ForwardTracking[];
  conversions: ConversionTracking[];
  engagement: EngagementMetrics;
}

type EmailType = 'transactional' | 'marketing' | 'newsletter' | 'notification' | 'welcome' | 'reminder';
type CampaignType = 'one_time' | 'recurring' | 'drip' | 'trigger' | 'behavioral';
type TemplateType = 'html' | 'text' | 'mjml' | 'drag_drop';
type EmailStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled' | 'failed';
```

#### **Email Communication Service:**
```typescript
export class EmailCommunicationService {
  private emailProvider: EmailProvider;
  private templateEngine: TemplateEngine;
  private segmentationEngine: SegmentationEngine;
  private analyticsTracker: AnalyticsTracker;
  private complianceManager: ComplianceManager;
  private automationEngine: AutomationEngine;

  async sendBulkEmail(campaignData: CreateCampaignData, sentBy: string): Promise<BulkEmailResult> {
    // Validate campaign
    const validation = await this.validateCampaign(campaignData);
    if (!validation.valid) {
      throw new Error(`Campaign validation failed: ${validation.errors.join(', ')}`);
    }

    // Create campaign
    const campaign = await this.createCampaign(campaignData, sentBy);

    // Resolve recipients
    const recipients = await this.resolveRecipients(campaign.targeting);

    // Apply frequency capping and preferences
    const filteredRecipients = await this.applyEmailFilters(recipients, campaign);

    // Generate personalized content
    const personalizedEmails = await this.generatePersonalizedEmails(
      campaign,
      filteredRecipients
    );

    // Schedule or send immediately
    let result: BulkEmailResult;
    if (campaign.scheduling.sendAt && campaign.scheduling.sendAt > new Date()) {
      result = await this.scheduleEmails(campaign, personalizedEmails);
    } else {
      result = await this.sendEmails(campaign, personalizedEmails);
    }

    // Log campaign
    await this.logCampaignActivity({
      campaignId: campaign.id,
      action: 'campaign_created',
      details: {
        recipientCount: filteredRecipients.length,
        scheduledFor: campaign.scheduling.sendAt
      },
      performedBy: sentBy
    });

    return result;
  }

  async createEmailTemplate(templateData: CreateTemplateData, createdBy: string): Promise<EmailTemplate> {
    // Validate template
    const validation = await this.validateTemplate(templateData);
    if (!validation.valid) {
      throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
    }

    // Process template components
    const processedComponents = await this.processTemplateComponents(templateData.components);

    // Generate responsive CSS
    const responsiveCSS = await this.generateResponsiveCSS(templateData.styling);

    // Create template
    const template: EmailTemplate = {
      id: this.generateTemplateId(),
      name: templateData.name,
      type: templateData.type,
      category: templateData.category,
      layout: templateData.layout,
      components: processedComponents,
      variables: templateData.variables || [],
      styling: {
        ...templateData.styling,
        generatedCSS: responsiveCSS
      },
      responsive: templateData.responsive || this.getDefaultResponsiveSettings(),
      previewText: templateData.previewText,
      version: '1.0.0',
      isActive: true
    };

    // Save template
    const savedTemplate = await this.templateRepository.create(template);

    // Generate preview
    await this.generateTemplatePreview(savedTemplate);

    // Test template
    if (templateData.testEmail) {
      await this.sendTemplateTest(savedTemplate, templateData.testEmail);
    }

    return savedTemplate;
  }

  async setupEmailAutomation(automationData: CreateAutomationData, createdBy: string): Promise<EmailAutomation> {
    // Validate automation rules
    const validation = await this.validateAutomationRules(automationData.rules);
    if (!validation.valid) {
      throw new Error(`Automation validation failed: ${validation.errors.join(', ')}`);
    }

    // Create automation workflow
    const automation: EmailAutomation = {
      id: this.generateAutomationId(),
      name: automationData.name,
      description: automationData.description,
      type: automationData.type,
      trigger: automationData.trigger,
      rules: automationData.rules,
      actions: automationData.actions,
      conditions: automationData.conditions || [],
      scheduling: automationData.scheduling,
      targeting: automationData.targeting,
      isActive: automationData.isActive || false,
      stats: this.initializeAutomationStats(),
      metadata: {
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    // Save automation
    const savedAutomation = await this.automationRepository.create(automation);

    // Register triggers
    await this.automationEngine.registerTriggers(savedAutomation);

    // Start automation if active
    if (savedAutomation.isActive) {
      await this.automationEngine.startAutomation(savedAutomation.id);
    }

    return savedAutomation;
  }

  async trackEmailEngagement(emailId: string, trackingData: EmailTrackingData): Promise<void> {
    const email = await this.emailRepository.findById(emailId);
    if (!email) {
      throw new Error('Email not found');
    }

    // Process tracking event
    switch (trackingData.event) {
      case 'open':
        await this.trackEmailOpen(email, trackingData);
        break;
      case 'click':
        await this.trackEmailClick(email, trackingData);
        break;
      case 'bounce':
        await this.trackEmailBounce(email, trackingData);
        break;
      case 'unsubscribe':
        await this.trackEmailUnsubscribe(email, trackingData);
        break;
      case 'complaint':
        await this.trackEmailComplaint(email, trackingData);
        break;
    }

    // Update email analytics
    await this.updateEmailAnalytics(emailId, trackingData.event);

    // Update user engagement score
    if (trackingData.userId) {
      await this.updateUserEngagementScore(trackingData.userId, trackingData.event);
    }

    // Trigger automation rules
    await this.automationEngine.processEngagementEvent(email, trackingData);
  }

  private async resolveRecipients(targeting: EmailTargeting): Promise<EmailRecipient[]> {
    let recipients: User[] = [];

    // Get users from segments
    if (targeting.segments && targeting.segments.length > 0) {
      const segmentUsers = await this.segmentationEngine.getUsersFromSegments(targeting.segments);
      recipients.push(...segmentUsers);
    }

    // Get users from groups
    if (targeting.userGroups && targeting.userGroups.length > 0) {
      const groupUsers = await this.getUsersFromGroups(targeting.userGroups);
      recipients.push(...groupUsers);
    }

    // Apply filters
    if (targeting.filters && targeting.filters.length > 0) {
      recipients = await this.applyTargetingFilters(recipients, targeting.filters);
    }

    // Apply conditions
    if (targeting.conditions && targeting.conditions.length > 0) {
      recipients = await this.applyTargetingConditions(recipients, targeting.conditions);
    }

    // Remove exclusions
    if (targeting.exclusions && targeting.exclusions.length > 0) {
      recipients = await this.applyTargetingExclusions(recipients, targeting.exclusions);
    }

    // Remove duplicates
    const uniqueRecipients = this.removeDuplicateRecipients(recipients);

    // Convert to EmailRecipient format
    return uniqueRecipients.map(user => ({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      preferences: user.preferences,
      timezone: user.profile?.timezone || targeting.timezone || 'UTC',
      personalizationData: this.extractPersonalizationData(user)
    }));
  }

  private async generatePersonalizedEmails(
    campaign: EmailCampaign,
    recipients: EmailRecipient[]
  ): Promise<PersonalizedEmail[]> {
    const template = await this.templateEngine.getTemplate(campaign.templateId);
    const personalizedEmails: PersonalizedEmail[] = [];

    for (const recipient of recipients) {
      // Generate personalized content
      const personalizedContent = await this.templateEngine.render(template, {
        user: recipient,
        campaign,
        personalization: recipient.personalizationData
      });

      // Apply dynamic content rules
      const dynamicContent = await this.applyDynamicContentRules(
        personalizedContent,
        recipient,
        campaign.content.dynamicContent
      );

      // Generate tracking links
      const trackedLinks = await this.generateTrackedLinks(
        dynamicContent,
        campaign.id,
        recipient.userId
      );

      personalizedEmails.push({
        recipientId: recipient.userId,
        email: recipient.email,
        subject: await this.personalizeSubject(campaign.content.subject, recipient),
        htmlBody: trackedLinks.htmlBody,
        textBody: trackedLinks.textBody,
        trackingPixel: await this.generateTrackingPixel(campaign.id, recipient.userId),
        unsubscribeLink: await this.generateUnsubscribeLink(recipient.userId),
        metadata: {
          campaignId: campaign.id,
          recipientTimezone: recipient.timezone,
          personalizationApplied: true
        }
      });
    }

    return personalizedEmails;
  }

  async getEmailAnalytics(campaignId: string, timeRange: DateRange): Promise<EmailAnalytics> {
    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Get basic metrics
    const basicMetrics = await this.calculateBasicMetrics(campaignId, timeRange);

    // Get engagement metrics
    const engagementMetrics = await this.calculateEngagementMetrics(campaignId, timeRange);

    // Get conversion metrics
    const conversionMetrics = await this.calculateConversionMetrics(campaignId, timeRange);

    // Get device/client metrics
    const deviceMetrics = await this.calculateDeviceMetrics(campaignId, timeRange);

    // Get geographic metrics
    const geoMetrics = await this.calculateGeographicMetrics(campaignId, timeRange);

    // Get time-based metrics
    const timeMetrics = await this.calculateTimeBasedMetrics(campaignId, timeRange);

    return {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        type: campaign.type
      },
      timeRange,
      basic: basicMetrics,
      engagement: engagementMetrics,
      conversions: conversionMetrics,
      devices: deviceMetrics,
      geography: geoMetrics,
      timing: timeMetrics,
      trends: await this.calculateEmailTrends(campaignId, timeRange),
      insights: await this.generateEmailInsights(basicMetrics, engagementMetrics)
    };
  }
}

interface CreateCampaignData {
  name: string;
  description: string;
  type: CampaignType;
  templateId: string;
  targeting: EmailTargeting;
  content: Partial<EmailContent>;
  scheduling: EmailScheduling;
  abTesting?: ABTestConfig;
}

interface CreateTemplateData {
  name: string;
  type: TemplateType;
  category: string;
  layout: TemplateLayout;
  components: TemplateComponent[];
  variables?: TemplateVariable[];
  styling: TemplateStyle;
  responsive?: ResponsiveSettings;
  previewText: string;
  testEmail?: string;
}

interface CreateAutomationData {
  name: string;
  description: string;
  type: AutomationType;
  trigger: AutomationTrigger;
  rules: AutomationRule[];
  actions: AutomationAction[];
  conditions?: AutomationCondition[];
  scheduling: AutomationScheduling;
  targeting: EmailTargeting;
  isActive?: boolean;
}

interface BulkEmailResult {
  campaignId: string;
  status: 'sent' | 'scheduled' | 'failed';
  recipientCount: number;
  successCount: number;
  failureCount: number;
  scheduledFor?: Date;
  estimatedDelivery?: Date;
  errors: EmailError[];
}

interface PersonalizedEmail {
  recipientId: string;
  email: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  trackingPixel: string;
  unsubscribeLink: string;
  metadata: EmailMetadata;
}

interface EmailAnalytics {
  campaign: {
    id: string;
    name: string;
    type: CampaignType;
  };
  timeRange: DateRange;
  basic: BasicEmailMetrics;
  engagement: EngagementMetrics;
  conversions: ConversionMetrics;
  devices: DeviceMetrics;
  geography: GeographicMetrics;
  timing: TimeBasedMetrics;
  trends: EmailTrends;
  insights: EmailInsight[];
}

interface BasicEmailMetrics {
  sent: number;
  delivered: number;
  bounced: number;
  opens: number;
  uniqueOpens: number;
  clicks: number;
  uniqueClicks: number;
  unsubscribes: number;
  complaints: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  clickToOpenRate: number;
  unsubscribeRate: number;
  complaintRate: number;
}

type AutomationType = 'welcome' | 'drip' | 'behavioral' | 'transactional' | 'reminder';
```

### **2. 🔔 Push Notification System**

#### **Push Notification Architecture:**
```typescript
interface PushNotification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  image?: string;
  badge?: string;
  sound?: string;
  vibrate?: number[];
  data?: Record<string, any>;
  actions?: NotificationAction[];
  targeting: PushTargeting;
  scheduling: NotificationScheduling;
  tracking: PushTracking;
  status: NotificationStatus;
}

interface PushTargeting {
  userIds?: string[];
  segments?: string[];
  groups?: string[];
  devices?: DeviceTarget[];
  platforms?: Platform[];
  locations?: LocationTarget[];
  conditions?: TargetingCondition[];
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
  url?: string;
  requireInteraction?: boolean;
}

interface PushTracking {
  sent: number;
  delivered: number;
  clicked: number;
  dismissed: number;
  failed: number;
  deliveryRate: number;
  clickRate: number;
  engagementRate: number;
}

type Platform = 'web' | 'android' | 'ios' | 'desktop';
type NotificationStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
```

#### **Push Notification Service:**
```typescript
export class PushNotificationService {
  private webPushProvider: WebPushProvider;
  private fcmProvider: FCMProvider;
  private apnsProvider: APNSProvider;
  private segmentationEngine: SegmentationEngine;

  async sendPushNotification(notificationData: CreatePushNotificationData, sentBy: string): Promise<PushNotificationResult> {
    // Validate notification
    const validation = await this.validatePushNotification(notificationData);
    if (!validation.valid) {
      throw new Error(`Push notification validation failed: ${validation.errors.join(', ')}`);
    }

    // Create notification
    const notification = await this.createPushNotification(notificationData, sentBy);

    // Resolve target devices
    const targetDevices = await this.resolveTargetDevices(notification.targeting);

    // Group devices by platform
    const devicesByPlatform = this.groupDevicesByPlatform(targetDevices);

    // Send to each platform
    const results = await Promise.allSettled([
      this.sendWebPush(notification, devicesByPlatform.web || []),
      this.sendFCMPush(notification, devicesByPlatform.android || []),
      this.sendAPNSPush(notification, devicesByPlatform.ios || [])
    ]);

    // Aggregate results
    const aggregatedResult = this.aggregatePushResults(results);

    // Update notification status
    await this.updateNotificationStatus(notification.id, aggregatedResult);

    return aggregatedResult;
  }

  private async sendWebPush(notification: PushNotification, devices: Device[]): Promise<WebPushResult> {
    const results: WebPushResult = {
      platform: 'web',
      sent: 0,
      delivered: 0,
      failed: 0,
      errors: []
    };

    for (const device of devices) {
      try {
        const payload = {
          title: notification.title,
          body: notification.body,
          icon: notification.icon,
          image: notification.image,
          badge: notification.badge,
          data: {
            ...notification.data,
            notificationId: notification.id,
            url: notification.actions?.[0]?.url
          },
          actions: notification.actions,
          requireInteraction: notification.actions && notification.actions.length > 0
        };

        await this.webPushProvider.send(device.subscription, JSON.stringify(payload));
        results.sent++;
        results.delivered++; // Web push doesn't provide delivery confirmation
      } catch (error) {
        results.failed++;
        results.errors.push({
          deviceId: device.id,
          error: error.message
        });
      }
    }

    return results;
  }
}
```

### **3. 💬 In-App Messaging System**

#### **In-App Message Architecture:**
```typescript
interface InAppMessage {
  id: string;
  type: MessageType;
  title: string;
  content: string;
  cta?: CallToAction;
  styling: MessageStyling;
  targeting: MessageTargeting;
  triggers: MessageTrigger[];
  scheduling: MessageScheduling;
  frequency: FrequencySettings;
  analytics: MessageAnalytics;
  status: MessageStatus;
}

interface MessageTrigger {
  type: TriggerType;
  conditions: TriggerCondition[];
  delay?: number; // seconds
  priority: number;
}

interface MessageStyling {
  position: MessagePosition;
  theme: 'light' | 'dark' | 'auto';
  colors: ColorScheme;
  animation: AnimationConfig;
  responsive: boolean;
}

type MessageType = 'banner' | 'modal' | 'toast' | 'tooltip' | 'sidebar' | 'fullscreen';
type TriggerType = 'page_view' | 'time_spent' | 'scroll_depth' | 'element_click' | 'user_action' | 'api_event';
type MessagePosition = 'top' | 'bottom' | 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
```

---

## 🎨 **Communication Interface**

### **Email Campaign Builder:**
```
┌─────────────────────────────────────────────────────────┐
│ 📧 Email Campaign Builder                 [Save] [Send] [Preview] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Campaign Setup ───────────────────────────────────┐   │
│ │ Campaign Name: [Holiday Sale 2023_______________]  │   │
│ │ Type: [Marketing ▼] Category: [Promotional ▼]     │   │
│ │ Description:                                       │   │
│ │ ┌─────────────────────────────────────────────────┐ │   │
│ │ │ Holiday promotional campaign featuring our      │ │   │
│ │ │ best deals and special offers for the season.  │ │   │
│ │ └─────────────────────────────────────────────────┘ │   │
│ │                                                   │   │
│ │ Template: [Holiday Template ▼] [Edit] [Preview]   │   │
│ │ From: [noreply@company.com ▼] Name: [Company___]   │   │
│ │ Reply-to: [support@company.com_________________]   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Content Editor ───────────────────────────────────┐   │
│ │ Subject: [🎄 Holiday Sale - Up to 50% Off!_____]   │   │
│ │ Preheader: [Don't miss our biggest sale of the ye] │   │
│ │                                                   │   │
│ │ ┌─ Email Content ─────────────────────────────────┐ │   │
│ │ │ [Visual Editor] [HTML] [Text]                  │ │   │
│ │ │                                               │ │   │
│ │ │ ┌─────────────────────────────────────────────┐ │ │   │
│ │ │ │ 🎄 Holiday Sale                             │ │ │   │
│ │ │ │ Up to 50% Off Everything!                   │ │ │   │
│ │ │ │                                             │ │ │   │
│ │ │ │ Hi {{firstName}},                           │ │ │   │
│ │ │ │                                             │ │ │   │
│ │ │ │ The holidays are here and we're celebrat... │ │ │   │
│ │ │ │                                             │ │ │   │
│ │ │ │ [Shop Now] [View Deals]                     │ │ │   │
│ │ │ └─────────────────────────────────────────────┘ │ │   │
│ │ │                                               │ │   │
│ │ │ Variables: {{firstName}} {{lastName}} {{city}} │ │   │
│ │ │ [Insert Variable] [Add Dynamic Content]        │ │   │
│ │ └─────────────────────────────────────────────────┘ │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Audience Targeting ───────────────────────────────┐   │
│ │ Recipients: 2,456 users selected                   │   │
│ │                                                   │   │
│ │ Target Segments:                                   │   │
│ │ ☑ Active Customers (1,234 users)                  │   │
│ │ ☑ Newsletter Subscribers (2,100 users)            │   │
│ │ ☐ VIP Members (156 users)                         │   │
│ │                                                   │   │
│ │ Additional Filters:                                │   │
│ │ • Location: [United States ▼]                     │   │
│ │ • Last purchase: [Within 6 months ▼]              │   │
│ │ • Email engagement: [High/Medium ▼]               │   │
│ │                                                   │   │
│ │ Exclusions:                                        │   │
│ │ ☑ Unsubscribed users                               │   │
│ │ ☑ Bounced emails (last 30 days)                   │   │
│ │ ☑ Recent campaign recipients (last 3 days)        │   │
│ │                                                   │   │
│ │ [Preview Recipients] [Import List] [Export List]  │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Scheduling & Testing ─────────────────────────────┐   │
│ │ Send Options:                                      │   │
│ │ ○ Send immediately                                 │   │
│ │ ● Schedule for later                               │   │
│ │   Date: [Dec 15, 2023 ▼] Time: [10:00 AM ▼]       │   │
│ │   Timezone: [Recipient's timezone ▼]              │   │
│ │                                                   │   │
│ │ A/B Testing:                                       │   │
│ │ ☑ Enable A/B testing                              │   │
│ │ Test: [Subject line ▼] Split: [50/50 ▼]           │   │
│ │ Winner selection: [Automatic after 2 hours ▼]     │   │
│ │                                                   │   │
│ │ Test Sends:                                        │   │
│ │ [Send Test] to: [admin@company.com_____________]   │   │
│ │                                                   │   │
│ │ [Schedule Campaign] [Send Now] [Save Draft]       │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### **Communication Analytics Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│ 📊 Communication Analytics            [Export] [Refresh] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Overview Metrics ─────────────────────────────────┐   │
│ │ 📧 Email Performance (Last 30 days)               │   │
│ │ • Campaigns sent: 12 (+3 vs previous month)       │   │
│ │ • Total emails: 45,678 (+12.5%)                   │   │
│ │ • Delivery rate: 98.2% (+0.3%)                    │   │
│ │ • Open rate: 24.7% (+2.1%)                        │   │
│ │ • Click rate: 3.8% (+0.5%)                        │   │
│ │ • Unsubscribe rate: 0.2% (-0.1%)                  │   │
│ │                                                   │   │
│ │ 🔔 Push Notifications                              │   │
│ │ • Notifications sent: 156,789 (+8.2%)             │   │
│ │ • Delivery rate: 94.5% (-1.2%)                    │   │
│ │ • Click rate: 12.3% (+3.4%)                       │   │
│ │ • Opt-out rate: 0.5% (-0.2%)                      │   │
│ │                                                   │   │
│ │ 💬 In-App Messages                                 │   │
│ │ • Messages shown: 89,456 (+15.6%)                 │   │
│ │ • Engagement rate: 18.9% (+4.2%)                  │   │
│ │ • Conversion rate: 5.7% (+1.8%)                   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Campaign Performance ─────────────────────────────┐   │
│ │ Top Performing Campaigns:                          │   │
│ │                                                   │   │
│ │ 1. Holiday Sale 2023                              │   │
│ │    📧 45,678 sent • 32.1% open • 6.8% click       │   │
│ │    💰 $12,450 revenue • ROI: 340%                 │   │
│ │    [View Details] [Clone Campaign]                │   │
│ │                                                   │   │
│ │ 2. Welcome Series - Part 1                        │   │
│ │    📧 8,934 sent • 58.3% open • 12.4% click       │   │
│ │    👥 1,234 conversions • 13.8% conversion rate   │   │
│ │    [View Details] [Edit Automation]               │   │
│ │                                                   │   │
│ │ 3. Product Update Announcement                     │   │
│ │    📧 23,456 sent • 28.7% open • 4.2% click       │   │
│ │    📈 2,345 feature adoptions • 10% adoption rate │   │
│ │    [View Details] [Send Follow-up]                │   │
│ │                                                   │   │
│ │ [View All Campaigns] [Performance Trends]         │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Audience Insights ────────────────────────────────┐   │
│ │ 📈 Engagement Trends:                              │   │
│ │                                                   │   │
│ │ Open Rates by Day:                                 │   │
│ │ Mon ████████░░ 28.3%                               │   │
│ │ Tue ██████████ 32.1%                               │   │
│ │ Wed █████████░ 29.8%                               │   │
│ │ Thu ██████████ 31.4%                               │   │
│ │ Fri ████████░░ 26.9%                               │   │
│ │ Sat ██████░░░░ 22.1%                               │   │
│ │ Sun █████░░░░░ 19.7%                               │   │
│ │                                                   │   │
│ │ Best Send Times:                                   │   │
│ │ • 10:00 AM - 11:00 AM (34.2% open rate)           │   │
│ │ • 2:00 PM - 3:00 PM (31.8% open rate)             │   │
│ │ • 7:00 PM - 8:00 PM (29.1% open rate)             │   │
│ │                                                   │   │
│ │ Top Performing Segments:                           │   │
│ │ • VIP Customers: 42.1% open, 8.9% click           │   │
│ │ • New Subscribers: 38.7% open, 7.2% click         │   │
│ │ • Active Users: 28.3% open, 4.1% click            │   │
│ │                                                   │   │
│ │ [Segment Analysis] [Send Time Optimizer]          │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Email campaigns
GET    /api/communications/email/campaigns     // List campaigns
POST   /api/communications/email/campaigns     // Create campaign
GET    /api/communications/email/campaigns/{id} // Get campaign
PUT    /api/communications/email/campaigns/{id} // Update campaign
POST   /api/communications/email/campaigns/{id}/send // Send campaign
DELETE /api/communications/email/campaigns/{id} // Delete campaign

// Email templates
GET    /api/communications/email/templates     // List templates
POST   /api/communications/email/templates     // Create template
GET    /api/communications/email/templates/{id} // Get template
PUT    /api/communications/email/templates/{id} // Update template
POST   /api/communications/email/templates/{id}/preview // Preview template

// Push notifications
POST   /api/communications/push/send          // Send push notification
GET    /api/communications/push/history       // Get push history
POST   /api/communications/push/subscribe     // Subscribe device
DELETE /api/communications/push/unsubscribe   // Unsubscribe device

// In-app messages
GET    /api/communications/inapp/messages     // Get in-app messages
POST   /api/communications/inapp/messages     // Create in-app message
PUT    /api/communications/inapp/messages/{id} // Update message
POST   /api/communications/inapp/messages/{id}/trigger // Trigger message

// Analytics
GET    /api/communications/analytics/overview  // Get overview analytics
GET    /api/communications/analytics/campaigns/{id} // Get campaign analytics
GET    /api/communications/analytics/engagement // Get engagement analytics
```

### **Database Schema:**
```sql
-- Email campaigns
CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  category VARCHAR(100),
  template_id UUID,
  content JSONB NOT NULL,
  targeting JSONB NOT NULL,
  scheduling JSONB,
  status VARCHAR(20) DEFAULT 'draft',
  stats JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP
);

-- Email templates
CREATE TABLE email_templates (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  category VARCHAR(100),
  layout JSONB NOT NULL,
  components JSONB NOT NULL,
  variables JSONB DEFAULT '[]',
  styling JSONB NOT NULL,
  responsive JSONB NOT NULL,
  preview_text VARCHAR(255),
  version VARCHAR(20) DEFAULT '1.0.0',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Email sends (individual emails)
CREATE TABLE email_sends (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  html_body TEXT,
  text_body TEXT,
  personalization_data JSONB,
  status VARCHAR(20) DEFAULT 'pending',
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  bounced_at TIMESTAMP,
  unsubscribed_at TIMESTAMP,
  tracking_data JSONB DEFAULT '{}'
);

-- Push notifications
CREATE TABLE push_notifications (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  icon VARCHAR(500),
  image VARCHAR(500),
  data JSONB,
  actions JSONB DEFAULT '[]',
  targeting JSONB NOT NULL,
  scheduling JSONB,
  status VARCHAR(20) DEFAULT 'draft',
  stats JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP
);

-- Push subscriptions
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint VARCHAR(500) NOT NULL,
  p256dh_key VARCHAR(255),
  auth_key VARCHAR(255),
  platform VARCHAR(20) NOT NULL,
  device_info JSONB,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP DEFAULT NOW(),
  last_used TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- In-app messages
CREATE TABLE inapp_messages (
  id UUID PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  content TEXT NOT NULL,
  cta JSONB,
  styling JSONB NOT NULL,
  targeting JSONB NOT NULL,
  triggers JSONB NOT NULL,
  scheduling JSONB,
  frequency JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  stats JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Communication analytics
CREATE TABLE communication_events (
  id UUID PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- email_open, email_click, push_click, etc.
  communication_id UUID NOT NULL,
  communication_type VARCHAR(20) NOT NULL, -- email, push, inapp
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_created_by ON email_campaigns(created_by);
CREATE INDEX idx_email_templates_type ON email_templates(type);
CREATE INDEX idx_email_templates_active ON email_templates(is_active);
CREATE INDEX idx_email_sends_campaign ON email_sends(campaign_id);
CREATE INDEX idx_email_sends_user ON email_sends(user_id);
CREATE INDEX idx_email_sends_status ON email_sends(status);
CREATE INDEX idx_push_notifications_status ON push_notifications(status);
CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_active ON push_subscriptions(is_active);
CREATE INDEX idx_inapp_messages_status ON inapp_messages(status);
CREATE INDEX idx_communication_events_type ON communication_events(type);
CREATE INDEX idx_communication_events_user ON communication_events(user_id);
CREATE INDEX idx_communication_events_created_at ON communication_events(created_at);
```

---

## 🔗 **Related Documentation**

- **[User Management](./management.md)** - User targeting dan segmentation
- **[User Groups](./groups.md)** - Group-based communication
- **[User Analytics](../01_analytics/user-analytics.md)** - Communication analytics
- **[System Settings](../07_system/)** - Communication configuration
- **[Security System](../06_security/)** - Communication security

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
