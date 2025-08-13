# 🔍 Security Monitoring System

> **Sistem Monitoring Keamanan Real-time JA-CMS**  
> Comprehensive security monitoring with threat detection and incident response

---

## 📋 **Deskripsi**

Security Monitoring System menyediakan real-time monitoring dan threat detection untuk melindungi JA-CMS dari berbagai ancaman keamanan. Sistem ini mencakup intrusion detection, vulnerability scanning, malware detection, dan automated incident response.

---

## ⭐ **Core Features**

### **1. 🚨 Threat Detection Engine**

#### **Security Event Structure:**
```typescript
interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: SecurityEventSource;
  target: SecurityEventTarget;
  details: SecurityEventDetails;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  timestamp: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  automated: boolean;
  confidence: number; // 0-100
  tags: string[];
}

type SecurityEventType = 
  | 'login_failure'
  | 'brute_force_attempt'
  | 'suspicious_activity'
  | 'file_change_unauthorized'
  | 'sql_injection_attempt'
  | 'xss_attempt'
  | 'csrf_attempt'
  | 'malware_detected'
  | 'vulnerability_found'
  | 'privilege_escalation'
  | 'data_exfiltration'
  | 'ddos_attempt'
  | 'account_takeover';

interface SecurityEventSource {
  ipAddress: string;
  userAgent: string;
  userId?: string;
  sessionId?: string;
  location?: GeoLocation;
  isp?: string;
  isProxy?: boolean;
  isTor?: boolean;
  reputation: SecurityReputation;
}

interface SecurityEventTarget {
  type: 'user' | 'file' | 'endpoint' | 'database' | 'system';
  identifier: string;
  resource?: string;
  action?: string;
}

interface SecurityReputation {
  score: number; // -100 to 100
  sources: string[];
  lastUpdated: Date;
  categories: ('malware' | 'phishing' | 'spam' | 'botnet')[];
}
```

#### **Real-time Threat Detection:**
```typescript
export class ThreatDetectionEngine {
  private rules: SecurityRule[] = [];
  private eventBuffer: SecurityEvent[] = [];
  private alertThresholds: Map<string, AlertThreshold> = new Map();

  constructor(
    private eventProcessor: SecurityEventProcessor,
    private alertManager: SecurityAlertManager,
    private ipReputationService: IPReputationService
  ) {
    this.loadSecurityRules();
    this.startEventProcessing();
  }

  async processEvent(event: SecurityEvent): Promise<void> {
    // Enrich event with additional data
    await this.enrichEvent(event);

    // Add to buffer for pattern analysis
    this.eventBuffer.push(event);
    this.maintainBufferSize();

    // Apply security rules
    const matchedRules = await this.evaluateRules(event);
    
    for (const rule of matchedRules) {
      await this.handleRuleMatch(rule, event);
    }

    // Check for patterns across multiple events
    await this.analyzePatterns(event);

    // Store event
    await this.storeEvent(event);
  }

  private async enrichEvent(event: SecurityEvent): Promise<void> {
    // IP reputation check
    const reputation = await this.ipReputationService.checkIP(event.source.ipAddress);
    event.source.reputation = reputation;

    // Geolocation
    if (!event.source.location) {
      event.source.location = await this.getGeolocation(event.source.ipAddress);
    }

    // User behavior analysis
    if (event.source.userId) {
      const userContext = await this.getUserContext(event.source.userId);
      event.details = { ...event.details, userContext };
    }

    // Threat intelligence
    const threatIntel = await this.getThreatIntelligence(event);
    if (threatIntel) {
      event.details = { ...event.details, threatIntel };
      event.confidence = Math.max(event.confidence, threatIntel.confidence);
    }
  }

  private async evaluateRules(event: SecurityEvent): Promise<SecurityRule[]> {
    const matchedRules: SecurityRule[] = [];

    for (const rule of this.rules) {
      if (await this.evaluateRule(rule, event)) {
        matchedRules.push(rule);
      }
    }

    return matchedRules;
  }

  private async evaluateRule(rule: SecurityRule, event: SecurityEvent): Promise<boolean> {
    // Check event type match
    if (rule.eventTypes.length > 0 && !rule.eventTypes.includes(event.type)) {
      return false;
    }

    // Check severity threshold
    if (this.getSeverityScore(event.severity) < this.getSeverityScore(rule.minSeverity)) {
      return false;
    }

    // Evaluate conditions
    for (const condition of rule.conditions) {
      if (!(await this.evaluateCondition(condition, event))) {
        return false;
      }
    }

    return true;
  }

  private async evaluateCondition(condition: RuleCondition, event: SecurityEvent): Promise<boolean> {
    switch (condition.type) {
      case 'ip_reputation':
        return event.source.reputation.score <= condition.threshold;
      
      case 'failed_login_count':
        const recentFailures = await this.getRecentFailedLogins(
          event.source.ipAddress, 
          condition.timeWindow
        );
        return recentFailures >= condition.threshold;
      
      case 'request_rate':
        const requestCount = await this.getRequestCount(
          event.source.ipAddress,
          condition.timeWindow
        );
        return requestCount >= condition.threshold;
      
      case 'suspicious_user_agent':
        return this.isSuspiciousUserAgent(event.source.userAgent);
      
      case 'geo_anomaly':
        return await this.isGeographicAnomaly(event);
      
      case 'file_integrity':
        return await this.checkFileIntegrity(condition.files);
      
      default:
        return false;
    }
  }

  private async handleRuleMatch(rule: SecurityRule, event: SecurityEvent): Promise<void> {
    // Create alert
    const alert = await this.alertManager.createAlert({
      ruleId: rule.id,
      events: [event],
      severity: this.calculateAlertSeverity(rule, event),
      description: this.generateAlertDescription(rule, event)
    });

    // Execute automated responses
    for (const action of rule.actions) {
      await this.executeAction(action, event, alert);
    }

    // Notify security team
    if (rule.notify) {
      await this.sendNotification(rule, event, alert);
    }
  }

  private async executeAction(action: SecurityAction, event: SecurityEvent, alert: SecurityAlert): Promise<void> {
    switch (action.type) {
      case 'block_ip':
        await this.blockIP(event.source.ipAddress, action.duration);
        break;
      
      case 'lock_account':
        if (event.source.userId) {
          await this.lockUserAccount(event.source.userId, action.duration);
        }
        break;
      
      case 'quarantine_file':
        if (event.target.type === 'file') {
          await this.quarantineFile(event.target.identifier);
        }
        break;
      
      case 'invalidate_sessions':
        if (event.source.userId) {
          await this.invalidateUserSessions(event.source.userId);
        }
        break;
      
      case 'increase_monitoring':
        await this.increaseMonitoringLevel(event.source.ipAddress);
        break;
      
      case 'webhook':
        await this.callWebhook(action.url, { event, alert });
        break;
    }
  }

  private async analyzePatterns(currentEvent: SecurityEvent): Promise<void> {
    // Analyze recent events for patterns
    const recentEvents = this.getRecentEvents(300); // Last 5 minutes
    
    // DDoS detection
    await this.detectDDoSPattern(recentEvents, currentEvent);
    
    // Coordinated attack detection
    await this.detectCoordinatedAttack(recentEvents, currentEvent);
    
    // Account enumeration detection
    await this.detectAccountEnumeration(recentEvents, currentEvent);
    
    // Data exfiltration detection
    await this.detectDataExfiltration(recentEvents, currentEvent);
  }

  private async detectDDoSPattern(events: SecurityEvent[], currentEvent: SecurityEvent): Promise<void> {
    // Group events by IP and time window
    const timeWindow = 60; // 1 minute
    const threshold = 100; // requests per minute
    
    const now = new Date();
    const windowStart = new Date(now.getTime() - timeWindow * 1000);
    
    const recentRequests = events.filter(event => 
      event.timestamp >= windowStart && 
      event.type === 'suspicious_activity'
    );
    
    const ipCounts = new Map<string, number>();
    
    recentRequests.forEach(event => {
      const count = ipCounts.get(event.source.ipAddress) || 0;
      ipCounts.set(event.source.ipAddress, count + 1);
    });
    
    // Check for DDoS pattern
    for (const [ip, count] of ipCounts.entries()) {
      if (count >= threshold) {
        await this.createDDoSAlert(ip, count, timeWindow);
      }
    }
  }

  private async detectCoordinatedAttack(events: SecurityEvent[], currentEvent: SecurityEvent): Promise<void> {
    // Look for multiple IPs targeting same resources
    const timeWindow = 300; // 5 minutes
    const minIPs = 5;
    const minEvents = 20;
    
    const now = new Date();
    const windowStart = new Date(now.getTime() - timeWindow * 1000);
    
    const recentAttacks = events.filter(event =>
      event.timestamp >= windowStart &&
      ['sql_injection_attempt', 'xss_attempt', 'brute_force_attempt'].includes(event.type)
    );
    
    // Group by target
    const targetGroups = new Map<string, SecurityEvent[]>();
    
    recentAttacks.forEach(event => {
      const targetKey = `${event.target.type}:${event.target.identifier}`;
      const group = targetGroups.get(targetKey) || [];
      group.push(event);
      targetGroups.set(targetKey, group);
    });
    
    // Check for coordinated attacks
    for (const [target, targetEvents] of targetGroups.entries()) {
      const uniqueIPs = new Set(targetEvents.map(e => e.source.ipAddress));
      
      if (uniqueIPs.size >= minIPs && targetEvents.length >= minEvents) {
        await this.createCoordinatedAttackAlert(target, targetEvents);
      }
    }
  }
}

interface SecurityRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  eventTypes: SecurityEventType[];
  minSeverity: 'low' | 'medium' | 'high' | 'critical';
  conditions: RuleCondition[];
  actions: SecurityAction[];
  notify: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

interface RuleCondition {
  type: 'ip_reputation' | 'failed_login_count' | 'request_rate' | 'suspicious_user_agent' | 'geo_anomaly' | 'file_integrity';
  threshold: number;
  timeWindow?: number; // seconds
  files?: string[];
  comparison?: 'greater' | 'less' | 'equal';
}

interface SecurityAction {
  type: 'block_ip' | 'lock_account' | 'quarantine_file' | 'invalidate_sessions' | 'increase_monitoring' | 'webhook';
  duration?: number; // seconds
  url?: string; // for webhook
  parameters?: Record<string, any>;
}
```

### **2. 📊 Security Dashboard & Analytics**

#### **Real-time Security Dashboard:**
```typescript
export class SecurityDashboard {
  private eventStream: EventSource;
  private metricsCollector: SecurityMetricsCollector;
  private chartRenderer: ChartRenderer;

  constructor() {
    this.setupRealTimeUpdates();
    this.initializeDashboard();
  }

  private setupRealTimeUpdates() {
    this.eventStream = new EventSource('/api/security/events/stream');
    
    this.eventStream.onmessage = (event) => {
      const securityEvent = JSON.parse(event.data);
      this.updateDashboard(securityEvent);
    };

    this.eventStream.onerror = (error) => {
      console.error('Security event stream error:', error);
      setTimeout(() => this.reconnectStream(), 5000);
    };
  }

  private async initializeDashboard() {
    // Load initial metrics
    const metrics = await this.metricsCollector.getCurrentMetrics();
    
    // Render security overview
    this.renderSecurityOverview(metrics);
    
    // Render threat map
    this.renderThreatMap(metrics.threats);
    
    // Render event timeline
    this.renderEventTimeline(metrics.recentEvents);
    
    // Render security score
    this.renderSecurityScore(metrics.securityScore);
    
    // Render active alerts
    this.renderActiveAlerts(metrics.activeAlerts);
  }

  private updateDashboard(event: SecurityEvent) {
    // Update real-time counters
    this.updateEventCounters(event);
    
    // Update threat map
    this.updateThreatMap(event);
    
    // Update timeline
    this.addEventToTimeline(event);
    
    // Update security score if needed
    if (this.affectsSecurityScore(event)) {
      this.recalculateSecurityScore();
    }
    
    // Show alert notification if critical
    if (event.severity === 'critical') {
      this.showCriticalAlert(event);
    }
  }

  private renderSecurityOverview(metrics: SecurityMetrics) {
    const overviewHTML = `
      <div class="security-overview">
        <div class="metric-card">
          <div class="metric-value">${metrics.eventsToday}</div>
          <div class="metric-label">Events Today</div>
          <div class="metric-change ${metrics.eventsChange >= 0 ? 'positive' : 'negative'}">
            ${metrics.eventsChange >= 0 ? '+' : ''}${metrics.eventsChange}%
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-value">${metrics.activeThreats}</div>
          <div class="metric-label">Active Threats</div>
          <div class="threat-level ${this.getThreatLevelClass(metrics.threatLevel)}">
            ${metrics.threatLevel}
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-value">${metrics.blockedIPs}</div>
          <div class="metric-label">Blocked IPs</div>
          <div class="metric-change">Last 24h</div>
        </div>
        
        <div class="metric-card">
          <div class="metric-value">${metrics.securityScore}/100</div>
          <div class="metric-label">Security Score</div>
          <div class="score-indicator">
            <div class="score-bar" style="width: ${metrics.securityScore}%"></div>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('security-overview')!.innerHTML = overviewHTML;
  }

  private renderThreatMap(threats: ThreatLocation[]) {
    // Initialize world map
    const mapContainer = document.getElementById('threat-map')!;
    
    // Use a mapping library like Leaflet or D3.js
    const map = new ThreatMap(mapContainer);
    
    threats.forEach(threat => {
      map.addThreat({
        lat: threat.latitude,
        lng: threat.longitude,
        severity: threat.severity,
        count: threat.count,
        country: threat.country,
        details: threat.details
      });
    });
    
    map.render();
  }

  private renderEventTimeline(events: SecurityEvent[]) {
    const timelineHTML = events.map(event => `
      <div class="timeline-event ${event.severity}">
        <div class="event-time">${this.formatTime(event.timestamp)}</div>
        <div class="event-icon">${this.getEventIcon(event.type)}</div>
        <div class="event-details">
          <div class="event-title">${this.getEventTitle(event)}</div>
          <div class="event-source">${event.source.ipAddress}</div>
        </div>
        <div class="event-actions">
          <button onclick="viewEventDetails('${event.id}')">Details</button>
        </div>
      </div>
    `).join('');
    
    document.getElementById('event-timeline')!.innerHTML = timelineHTML;
  }
}

interface SecurityMetrics {
  eventsToday: number;
  eventsChange: number;
  activeThreats: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  blockedIPs: number;
  securityScore: number;
  threats: ThreatLocation[];
  recentEvents: SecurityEvent[];
  activeAlerts: SecurityAlert[];
}

interface ThreatLocation {
  latitude: number;
  longitude: number;
  country: string;
  severity: string;
  count: number;
  details: any;
}
```

### **3. 🤖 Automated Incident Response**

#### **Incident Response System:**
```typescript
export class IncidentResponseSystem {
  private responsePlaybooks: Map<string, ResponsePlaybook> = new Map();
  private incidentQueue: IncidentQueue;
  private escalationRules: EscalationRule[] = [];

  constructor(
    private notificationService: NotificationService,
    private actionExecutor: SecurityActionExecutor
  ) {
    this.loadResponsePlaybooks();
    this.initializeIncidentQueue();
  }

  async handleSecurityIncident(incident: SecurityIncident): Promise<void> {
    // Classify incident
    const classification = await this.classifyIncident(incident);
    
    // Select appropriate playbook
    const playbook = this.selectPlaybook(classification);
    
    if (playbook) {
      // Execute automated response
      await this.executePlaybook(playbook, incident);
    }
    
    // Check escalation rules
    await this.checkEscalation(incident);
    
    // Add to incident queue
    await this.incidentQueue.addIncident(incident);
    
    // Generate incident report
    await this.generateIncidentReport(incident);
  }

  private async executePlaybook(playbook: ResponsePlaybook, incident: SecurityIncident): Promise<void> {
    const executionContext = {
      incident,
      startTime: new Date(),
      actions: []
    };

    for (const step of playbook.steps) {
      try {
        await this.executePlaybookStep(step, executionContext);
        
        // Log successful action
        executionContext.actions.push({
          step: step.name,
          status: 'success',
          timestamp: new Date()
        });
        
        // Check if we should continue
        if (step.continueOnSuccess === false) {
          break;
        }
        
      } catch (error) {
        // Log failed action
        executionContext.actions.push({
          step: step.name,
          status: 'failed',
          error: error.message,
          timestamp: new Date()
        });
        
        // Handle failure
        if (step.continueOnFailure === false) {
          await this.handlePlaybookFailure(playbook, step, error, executionContext);
          break;
        }
      }
    }

    // Log playbook execution
    await this.logPlaybookExecution(playbook, executionContext);
  }

  private async executePlaybookStep(step: PlaybookStep, context: PlaybookExecutionContext): Promise<void> {
    switch (step.type) {
      case 'block_ip':
        await this.actionExecutor.blockIP(
          context.incident.source.ipAddress,
          step.parameters.duration
        );
        break;
        
      case 'isolate_user':
        if (context.incident.source.userId) {
          await this.actionExecutor.isolateUser(
            context.incident.source.userId,
            step.parameters.reason
          );
        }
        break;
        
      case 'quarantine_files':
        const files = step.parameters.files || context.incident.affectedFiles;
        for (const file of files) {
          await this.actionExecutor.quarantineFile(file);
        }
        break;
        
      case 'notify_team':
        await this.notificationService.notifySecurityTeam({
          incident: context.incident,
          urgency: step.parameters.urgency,
          message: step.parameters.message
        });
        break;
        
      case 'create_snapshot':
        await this.actionExecutor.createSystemSnapshot({
          reason: `Security incident: ${context.incident.id}`,
          metadata: context.incident
        });
        break;
        
      case 'collect_evidence':
        await this.collectDigitalEvidence(context.incident);
        break;
        
      case 'reset_passwords':
        const affectedUsers = step.parameters.users || await this.getAffectedUsers(context.incident);
        for (const userId of affectedUsers) {
          await this.actionExecutor.forcePasswordReset(userId);
        }
        break;
    }
  }

  private async collectDigitalEvidence(incident: SecurityIncident): Promise<void> {
    const evidence: DigitalEvidence = {
      incidentId: incident.id,
      timestamp: new Date(),
      items: []
    };

    // Collect system logs
    const systemLogs = await this.collectSystemLogs(incident.timestamp);
    evidence.items.push({
      type: 'system_logs',
      data: systemLogs,
      hash: await this.calculateHash(systemLogs)
    });

    // Collect network traffic
    if (incident.source.ipAddress) {
      const networkData = await this.collectNetworkTraffic(
        incident.source.ipAddress,
        incident.timestamp
      );
      evidence.items.push({
        type: 'network_traffic',
        data: networkData,
        hash: await this.calculateHash(networkData)
      });
    }

    // Collect file system changes
    const fileChanges = await this.collectFileSystemChanges(incident.timestamp);
    evidence.items.push({
      type: 'file_changes',
      data: fileChanges,
      hash: await this.calculateHash(fileChanges)
    });

    // Store evidence securely
    await this.storeEvidence(evidence);
  }
}

interface ResponsePlaybook {
  id: string;
  name: string;
  description: string;
  triggerConditions: PlaybookTrigger[];
  steps: PlaybookStep[];
  priority: number;
  autoExecute: boolean;
  requiresApproval: boolean;
  createdBy: string;
  createdAt: Date;
  lastUsed?: Date;
}

interface PlaybookStep {
  name: string;
  type: 'block_ip' | 'isolate_user' | 'quarantine_files' | 'notify_team' | 'create_snapshot' | 'collect_evidence' | 'reset_passwords';
  parameters: Record<string, any>;
  continueOnSuccess: boolean;
  continueOnFailure: boolean;
  timeout: number; // seconds
}

interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'contained' | 'resolved';
  source: SecurityEventSource;
  events: SecurityEvent[];
  affectedSystems: string[];
  affectedUsers: string[];
  affectedFiles: string[];
  timeline: IncidentTimelineEntry[];
  assignedTo?: string;
  createdAt: Date;
  resolvedAt?: Date;
}
```

---

## 🎨 **Security Dashboard Interface**

### **Main Security Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│ 🛡️ Security Dashboard                    [🔄] [⚙️] [📊] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Overview ──────────┐ ┌─ Threat Level ──────────────┐  │
│ │ 🚨 Events Today     │ │ Current Level: 🟡 MEDIUM    │  │
│ │ 1,247 (+12%)        │ │ ┌─────────────────────────┐  │  │
│ │                     │ │ │ ████████░░░ 75%         │  │  │
│ │ 🔒 Active Threats   │ │ └─────────────────────────┘  │  │
│ │ 23 threats          │ │ Last Assessment: 2h ago     │  │
│ │                     │ │ Next Scan: 4h               │  │
│ │ 🚫 Blocked IPs      │ │                             │  │
│ │ 156 addresses       │ └─────────────────────────────┘  │
│ │                     │                                  │
│ │ 📊 Security Score   │ ┌─ Active Alerts ─────────────┐  │
│ │ 87/100 ✅          │ │ 🔴 Critical: 2               │  │
│ └─────────────────────┘ │ 🟠 High: 5                  │  │
│                         │ 🟡 Medium: 12               │  │
│ ┌─ Recent Events ─────┐ │ 🟢 Low: 8                   │  │
│ │ 14:23 🔴 SQL Inject │ │ [View All Alerts]           │  │
│ │ 14:20 🟠 Brute Force│ └─────────────────────────────┘  │
│ │ 14:18 🟡 Suspicious │                                  │
│ │ 14:15 🟢 Login Fail │ ┌─ Threat Map ────────────────┐  │
│ │ [View Timeline]     │ │ 🗺️ [Interactive World Map]  │  │
│ └─────────────────────┘ │    • 🔴 High threat regions │  │
│                         │    • 🟡 Medium threats      │  │
│ [🚨 Incident Response] [📋 Generate Report] [⚙️ Settings] │
└─────────────────────────────────────────────────────────┘
```

### **Incident Response Panel:**
```
┌─ Incident Response ─────────────────────────────────────┐
│ 🚨 Security Incident #INC-2024-0109-001                │
├─────────────────────────────────────────────────────────┤
│ Status: 🔴 ACTIVE        Severity: CRITICAL             │
│ Created: 14:23 UTC       Assigned: Security Team       │
│                                                         │
│ 📋 Incident Summary                                     │
│ SQL Injection attack detected from 192.168.1.100       │
│ Multiple failed attempts on user login endpoint         │
│ Potential data exfiltration attempt                     │
│                                                         │
│ 🎯 Affected Systems                                     │
│ • User authentication service                           │
│ • User database (read access)                           │
│ • Session management                                    │
│                                                         │
│ 🤖 Automated Response (In Progress)                     │
│ ✅ IP address blocked (192.168.1.100)                  │
│ ✅ User sessions invalidated                            │
│ ⏳ Database integrity check                             │
│ ⏳ Evidence collection                                  │
│ ⏳ Security team notification                           │
│                                                         │
│ 📊 Timeline                                             │
│ 14:23 - Initial detection                               │
│ 14:23 - Automated blocking activated                    │
│ 14:24 - Incident created                                │
│ 14:25 - Response playbook executed                      │
│                                                         │
│ [📝 Add Note] [👤 Assign] [📋 Generate Report]         │
│ [✅ Mark Resolved] [🔄 Run Playbook] [📞 Escalate]     │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Security monitoring
GET    /api/security/dashboard          // Get dashboard data
GET    /api/security/events/stream      // Real-time event stream
GET    /api/security/events             // List security events
POST   /api/security/events/{id}/resolve // Resolve security event
GET    /api/security/threats            // Get threat intelligence
POST   /api/security/scan               // Trigger security scan

// Incident management
GET    /api/security/incidents          // List incidents
POST   /api/security/incidents          // Create incident
GET    /api/security/incidents/{id}     // Get incident details
PUT    /api/security/incidents/{id}     // Update incident
POST   /api/security/incidents/{id}/respond // Execute response action

// Security rules
GET    /api/security/rules              // List security rules
POST   /api/security/rules              // Create security rule
PUT    /api/security/rules/{id}         // Update rule
DELETE /api/security/rules/{id}         // Delete rule
POST   /api/security/rules/{id}/test    // Test rule

// IP management
GET    /api/security/blocked-ips        // List blocked IPs
POST   /api/security/block-ip           // Block IP address
DELETE /api/security/blocked-ips/{ip}   // Unblock IP address
GET    /api/security/ip-reputation/{ip} // Get IP reputation
```

### **Database Schema:**
```sql
-- Security events
CREATE TABLE security_events (
  id UUID PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  source_ip INET NOT NULL,
  source_user_id UUID REFERENCES users(id),
  target_type VARCHAR(50),
  target_identifier VARCHAR(255),
  details JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'open',
  confidence INTEGER DEFAULT 0,
  automated BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_security_events_type (type),
  INDEX idx_security_events_severity (severity),
  INDEX idx_security_events_source_ip (source_ip),
  INDEX idx_security_events_created_at (created_at)
);

-- Security incidents
CREATE TABLE security_incidents (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  severity VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'open',
  assigned_to UUID REFERENCES users(id),
  affected_systems TEXT[],
  affected_users UUID[],
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  INDEX idx_security_incidents_status (status),
  INDEX idx_security_incidents_severity (severity)
);

-- Blocked IPs
CREATE TABLE security_blocked_ips (
  ip INET PRIMARY KEY,
  reason TEXT NOT NULL,
  blocked_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  blocked_by UUID REFERENCES users(id),
  automated BOOLEAN DEFAULT false,
  INDEX idx_blocked_ips_expires_at (expires_at)
);

-- Security rules
CREATE TABLE security_rules (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT true,
  event_types VARCHAR(50)[],
  min_severity VARCHAR(20) DEFAULT 'low',
  conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  priority INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔗 **Related Documentation**

- **[User Authentication](../05_users/authentication.md)** - Authentication security
- **[System Maintenance](../08_tools/maintenance.md)** - System health monitoring
- **[Backup & Recovery](../08_tools/backup.md)** - Data protection
- **[API Security](../../DEVELOPMENT_STANDARDS.md#api-standards)** - API security standards

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
