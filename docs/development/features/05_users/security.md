# 🔒 User Security Features

> **Advanced User Security & Protection JA-CMS**  
> Comprehensive security features dengan fraud detection, account protection, dan compliance tools

---

## 📋 **Deskripsi**

User Security System menyediakan advanced security features untuk melindungi user accounts dan data dalam JA-CMS. Sistem ini mencakup fraud detection, account protection, privacy controls, compliance tools, dan comprehensive security monitoring untuk memastikan keamanan maksimal.

---

## ⭐ **Core Features**

### **1. 🛡️ Account Protection**

#### **Security Architecture:**
```typescript
interface UserSecurity {
  userId: string;
  passwordPolicy: PasswordPolicy;
  accountLockout: AccountLockout;
  sessionSecurity: SessionSecurity;
  deviceManagement: DeviceManagement;
  privacySettings: PrivacySettings;
  securityAlerts: SecurityAlert[];
  auditLog: SecurityAuditEntry[];
  riskScore: RiskAssessment;
  compliance: ComplianceStatus;
}

interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventReuse: number; // number of previous passwords to check
  maxAge: number; // days before password expires
  strengthRequirement: 'weak' | 'medium' | 'strong' | 'very_strong';
  customRules: PasswordRule[];
  breachCheck: boolean; // check against known breached passwords
}

interface AccountLockout {
  enabled: boolean;
  maxAttempts: number;
  lockoutDuration: number; // minutes
  progressiveLockout: boolean;
  whitelist: string[]; // IP addresses exempt from lockout
  notifyUser: boolean;
  notifyAdmins: boolean;
  autoUnlock: boolean;
}

interface SessionSecurity {
  maxSessions: number;
  sessionTimeout: number; // minutes
  idleTimeout: number; // minutes
  requireReauth: string[]; // actions requiring re-authentication
  ipValidation: boolean;
  deviceFingerprinting: boolean;
  concurrentSessionPolicy: 'allow' | 'replace' | 'deny';
  secureHeaders: boolean;
}

interface DeviceManagement {
  trustedDevices: TrustedDevice[];
  deviceLimit: number;
  requireApproval: boolean;
  autoTrust: boolean;
  trustDuration: number; // days
  deviceFingerprinting: boolean;
  locationTracking: boolean;
}

interface TrustedDevice {
  id: string;
  name: string;
  fingerprint: string;
  deviceType: string;
  browser: string;
  os: string;
  location?: DeviceLocation;
  firstSeen: Date;
  lastSeen: Date;
  trustLevel: 'low' | 'medium' | 'high';
  isTrusted: boolean;
  isActive: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'members' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  showLastSeen: boolean;
  allowDirectMessages: 'everyone' | 'contacts' | 'none';
  searchable: boolean;
  dataRetention: DataRetentionSettings;
  cookieConsent: CookieConsentSettings;
  marketingConsent: boolean;
  thirdPartySharing: boolean;
}

interface RiskAssessment {
  overallScore: number; // 0-100
  factors: RiskFactor[];
  lastAssessment: Date;
  trend: 'improving' | 'stable' | 'declining';
  recommendations: SecurityRecommendation[];
}

interface SecurityAlert {
  id: string;
  type: AlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  details: AlertDetails;
  status: 'new' | 'acknowledged' | 'resolved' | 'false_positive';
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

type AlertType = 'suspicious_login' | 'password_breach' | 'unusual_activity' | 'account_takeover' | 'data_breach' | 'policy_violation';
```

#### **User Security Service:**
```typescript
export class UserSecurityService {
  private fraudDetectionEngine: FraudDetectionEngine;
  private passwordService: PasswordService;
  private sessionManager: SessionManager;
  private deviceManager: DeviceManager;
  private auditLogger: SecurityAuditLogger;
  private riskEngine: RiskAssessmentEngine;
  private complianceManager: ComplianceManager;

  async assessUserRisk(userId: string, context?: SecurityContext): Promise<RiskAssessment> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Collect risk factors
    const riskFactors = await this.collectRiskFactors(userId, context);
    
    // Calculate risk score
    const riskScore = await this.riskEngine.calculateRisk(riskFactors);
    
    // Generate recommendations
    const recommendations = await this.generateSecurityRecommendations(riskFactors, riskScore);
    
    // Determine trend
    const previousAssessment = await this.getLastRiskAssessment(userId);
    const trend = this.calculateRiskTrend(riskScore, previousAssessment?.overallScore);

    const assessment: RiskAssessment = {
      overallScore: riskScore,
      factors: riskFactors,
      lastAssessment: new Date(),
      trend,
      recommendations
    };

    // Store assessment
    await this.storeRiskAssessment(userId, assessment);

    // Trigger alerts if high risk
    if (riskScore > 80) {
      await this.createSecurityAlert(userId, {
        type: 'account_takeover',
        severity: 'high',
        title: 'High Risk Account Activity',
        description: `User account shows high risk indicators (score: ${riskScore})`,
        details: { riskFactors, assessment }
      });
    }

    return assessment;
  }

  async detectSuspiciousLogin(loginAttempt: LoginAttempt): Promise<SuspiciousLoginResult> {
    const detection: SuspiciousLoginResult = {
      isSuspicious: false,
      riskScore: 0,
      reasons: [],
      recommendations: [],
      requiresVerification: false
    };

    // Check IP reputation
    const ipReputation = await this.checkIPReputation(loginAttempt.ipAddress);
    if (ipReputation.isBlacklisted || ipReputation.riskScore > 70) {
      detection.isSuspicious = true;
      detection.riskScore += 30;
      detection.reasons.push('Suspicious IP address');
      detection.requiresVerification = true;
    }

    // Check location anomaly
    const locationAnomaly = await this.checkLocationAnomaly(loginAttempt.userId, loginAttempt.location);
    if (locationAnomaly.isAnomalous) {
      detection.isSuspicious = true;
      detection.riskScore += locationAnomaly.severity * 10;
      detection.reasons.push(`Unusual location: ${locationAnomaly.description}`);
      
      if (locationAnomaly.severity > 7) {
        detection.requiresVerification = true;
      }
    }

    // Check device fingerprint
    const deviceCheck = await this.checkDeviceFingerprint(loginAttempt.userId, loginAttempt.deviceFingerprint);
    if (!deviceCheck.isKnown) {
      detection.riskScore += 20;
      detection.reasons.push('New or unknown device');
      
      if (!deviceCheck.isSimilar) {
        detection.isSuspicious = true;
        detection.requiresVerification = true;
      }
    }

    // Check time pattern
    const timeAnomaly = await this.checkTimePattern(loginAttempt.userId, loginAttempt.timestamp);
    if (timeAnomaly.isUnusual) {
      detection.riskScore += 15;
      detection.reasons.push('Unusual login time');
    }

    // Check velocity (multiple attempts)
    const velocityCheck = await this.checkLoginVelocity(loginAttempt.userId, loginAttempt.ipAddress);
    if (velocityCheck.isExcessive) {
      detection.isSuspicious = true;
      detection.riskScore += 40;
      detection.reasons.push('Multiple rapid login attempts');
      detection.requiresVerification = true;
    }

    // Generate recommendations
    if (detection.isSuspicious) {
      detection.recommendations = await this.generateLoginSecurityRecommendations(detection);
    }

    // Log suspicious activity
    if (detection.isSuspicious) {
      await this.auditLogger.logSuspiciousActivity({
        userId: loginAttempt.userId,
        type: 'suspicious_login',
        details: detection,
        ipAddress: loginAttempt.ipAddress,
        userAgent: loginAttempt.userAgent,
        timestamp: loginAttempt.timestamp
      });
    }

    return detection;
  }

  async enforcePasswordPolicy(userId: string, newPassword: string): Promise<PasswordValidationResult> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const policy = await this.getPasswordPolicy(userId);
    const validation: PasswordValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      strength: 'weak',
      score: 0
    };

    // Length check
    if (newPassword.length < policy.minLength) {
      validation.isValid = false;
      validation.errors.push(`Password must be at least ${policy.minLength} characters`);
    }
    if (newPassword.length > policy.maxLength) {
      validation.isValid = false;
      validation.errors.push(`Password must not exceed ${policy.maxLength} characters`);
    }

    // Character requirements
    if (policy.requireUppercase && !/[A-Z]/.test(newPassword)) {
      validation.isValid = false;
      validation.errors.push('Password must contain at least one uppercase letter');
    }
    if (policy.requireLowercase && !/[a-z]/.test(newPassword)) {
      validation.isValid = false;
      validation.errors.push('Password must contain at least one lowercase letter');
    }
    if (policy.requireNumbers && !/\d/.test(newPassword)) {
      validation.isValid = false;
      validation.errors.push('Password must contain at least one number');
    }
    if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      validation.isValid = false;
      validation.errors.push('Password must contain at least one special character');
    }

    // Password reuse check
    if (policy.preventReuse > 0) {
      const isReused = await this.checkPasswordReuse(userId, newPassword, policy.preventReuse);
      if (isReused) {
        validation.isValid = false;
        validation.errors.push(`Password cannot be one of the last ${policy.preventReuse} passwords`);
      }
    }

    // Breach check
    if (policy.breachCheck) {
      const isBreached = await this.checkPasswordBreach(newPassword);
      if (isBreached) {
        validation.isValid = false;
        validation.errors.push('This password has been found in known data breaches');
      }
    }

    // Custom rules
    for (const rule of policy.customRules) {
      const ruleResult = await this.evaluatePasswordRule(newPassword, rule);
      if (!ruleResult.passed) {
        validation.isValid = false;
        validation.errors.push(ruleResult.message);
      }
    }

    // Calculate strength
    validation.strength = this.calculatePasswordStrength(newPassword);
    validation.score = this.calculatePasswordScore(newPassword);

    // Strength requirement check
    const strengthLevels = ['weak', 'medium', 'strong', 'very_strong'];
    const requiredLevel = strengthLevels.indexOf(policy.strengthRequirement);
    const actualLevel = strengthLevels.indexOf(validation.strength);
    
    if (actualLevel < requiredLevel) {
      validation.isValid = false;
      validation.errors.push(`Password strength must be at least ${policy.strengthRequirement}`);
    }

    return validation;
  }

  async manageUserDevices(userId: string): Promise<DeviceManagement> {
    const devices = await this.deviceManager.getUserDevices(userId);
    const settings = await this.getDeviceSettings(userId);
    
    // Analyze device patterns
    for (const device of devices) {
      device.trustLevel = await this.calculateDeviceTrustLevel(device);
      
      // Check for suspicious device activity
      const suspicious = await this.checkDeviceSuspiciousActivity(device);
      if (suspicious.isSuspicious) {
        await this.createSecurityAlert(userId, {
          type: 'suspicious_login',
          severity: 'medium',
          title: 'Suspicious Device Activity',
          description: `Unusual activity detected on device: ${device.name}`,
          details: { device, suspicious }
        });
      }
    }

    // Enforce device limits
    if (settings.deviceLimit > 0 && devices.length > settings.deviceLimit) {
      const oldestDevices = devices
        .filter(d => !d.isTrusted)
        .sort((a, b) => a.lastSeen.getTime() - b.lastSeen.getTime())
        .slice(0, devices.length - settings.deviceLimit);
      
      for (const device of oldestDevices) {
        await this.deviceManager.revokeDevice(device.id);
      }
    }

    return {
      trustedDevices: devices,
      deviceLimit: settings.deviceLimit,
      requireApproval: settings.requireApproval,
      autoTrust: settings.autoTrust,
      trustDuration: settings.trustDuration,
      deviceFingerprinting: settings.deviceFingerprinting,
      locationTracking: settings.locationTracking
    };
  }

  async handleAccountLockout(userId: string, reason: LockoutReason): Promise<LockoutResult> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const lockoutSettings = await this.getAccountLockoutSettings(userId);
    if (!lockoutSettings.enabled) {
      return { locked: false, reason: 'Lockout disabled' };
    }

    // Calculate lockout duration
    let lockoutDuration = lockoutSettings.lockoutDuration;
    
    if (lockoutSettings.progressiveLockout) {
      const lockoutHistory = await this.getLockoutHistory(userId);
      const recentLockouts = lockoutHistory.filter(
        l => l.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000) // last 24 hours
      );
      
      // Progressive lockout: double duration for each recent lockout
      lockoutDuration *= Math.pow(2, recentLockouts.length);
    }

    // Apply lockout
    const lockout: AccountLockout = {
      userId,
      reason,
      lockedAt: new Date(),
      unlockAt: new Date(Date.now() + lockoutDuration * 60 * 1000),
      isActive: true,
      attemptCount: await this.getFailedAttemptCount(userId)
    };

    await this.applyAccountLockout(lockout);

    // Send notifications
    if (lockoutSettings.notifyUser) {
      await this.notifyUserLockout(userId, lockout);
    }
    if (lockoutSettings.notifyAdmins) {
      await this.notifyAdminsLockout(userId, lockout);
    }

    // Log security event
    await this.auditLogger.logSecurityEvent({
      userId,
      type: 'account_locked',
      severity: 'medium',
      details: lockout,
      timestamp: new Date()
    });

    return {
      locked: true,
      reason: reason,
      unlockAt: lockout.unlockAt,
      duration: lockoutDuration
    };
  }

  async checkComplianceStatus(userId: string): Promise<ComplianceStatus> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const compliance: ComplianceStatus = {
      gdpr: await this.checkGDPRCompliance(userId),
      ccpa: await this.checkCCPACompliance(userId),
      coppa: await this.checkCOPPACompliance(userId),
      pci: await this.checkPCICompliance(userId),
      hipaa: await this.checkHIPAACompliance(userId),
      lastCheck: new Date(),
      overallStatus: 'compliant'
    };

    // Determine overall status
    const statuses = Object.values(compliance).filter(v => typeof v === 'object' && v.status);
    const hasNonCompliant = statuses.some(s => s.status === 'non_compliant');
    const hasPartial = statuses.some(s => s.status === 'partial');

    if (hasNonCompliant) {
      compliance.overallStatus = 'non_compliant';
    } else if (hasPartial) {
      compliance.overallStatus = 'partial';
    }

    return compliance;
  }

  private async collectRiskFactors(userId: string, context?: SecurityContext): Promise<RiskFactor[]> {
    const factors: RiskFactor[] = [];

    // Login patterns
    const loginPattern = await this.analyzeLoginPatterns(userId);
    if (loginPattern.isAnomalous) {
      factors.push({
        type: 'login_pattern',
        severity: loginPattern.severity,
        description: loginPattern.description,
        score: loginPattern.riskScore
      });
    }

    // Device security
    const deviceSecurity = await this.analyzeDeviceSecurity(userId);
    factors.push({
      type: 'device_security',
      severity: deviceSecurity.severity,
      description: deviceSecurity.description,
      score: deviceSecurity.riskScore
    });

    // Password security
    const passwordSecurity = await this.analyzePasswordSecurity(userId);
    factors.push({
      type: 'password_security',
      severity: passwordSecurity.severity,
      description: passwordSecurity.description,
      score: passwordSecurity.riskScore
    });

    // Account age and activity
    const accountActivity = await this.analyzeAccountActivity(userId);
    factors.push({
      type: 'account_activity',
      severity: accountActivity.severity,
      description: accountActivity.description,
      score: accountActivity.riskScore
    });

    // Privacy settings
    const privacyRisk = await this.analyzePrivacySettings(userId);
    factors.push({
      type: 'privacy_settings',
      severity: privacyRisk.severity,
      description: privacyRisk.description,
      score: privacyRisk.riskScore
    });

    return factors;
  }

  private calculatePasswordStrength(password: string): 'weak' | 'medium' | 'strong' | 'very_strong' {
    let score = 0;

    // Length bonus
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 25;
    if (password.length >= 16) score += 25;

    // Character variety
    if (/[a-z]/.test(password)) score += 5;
    if (/[A-Z]/.test(password)) score += 5;
    if (/\d/.test(password)) score += 5;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 10;

    // Pattern checks
    if (!/(.)\1{2,}/.test(password)) score += 5; // No repeated characters
    if (!/123|abc|qwe/i.test(password)) score += 5; // No common sequences

    if (score >= 85) return 'very_strong';
    if (score >= 70) return 'strong';
    if (score >= 50) return 'medium';
    return 'weak';
  }
}

interface LoginAttempt {
  userId: string;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint: string;
  location?: GeoLocation;
  timestamp: Date;
  success: boolean;
}

interface SuspiciousLoginResult {
  isSuspicious: boolean;
  riskScore: number;
  reasons: string[];
  recommendations: string[];
  requiresVerification: boolean;
}

interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very_strong';
  score: number;
}

interface ComplianceStatus {
  gdpr: ComplianceCheck;
  ccpa: ComplianceCheck;
  coppa: ComplianceCheck;
  pci: ComplianceCheck;
  hipaa: ComplianceCheck;
  lastCheck: Date;
  overallStatus: 'compliant' | 'partial' | 'non_compliant';
}

interface ComplianceCheck {
  status: 'compliant' | 'partial' | 'non_compliant';
  lastCheck: Date;
  issues: string[];
  recommendations: string[];
}

interface RiskFactor {
  type: string;
  severity: number; // 1-10
  description: string;
  score: number; // contribution to overall risk
}

interface SecurityRecommendation {
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  action: string;
  estimatedImpact: string;
}

type LockoutReason = 'failed_attempts' | 'suspicious_activity' | 'admin_action' | 'security_breach';
```

### **2. 🔍 Fraud Detection Engine**

#### **Fraud Detection System:**
```typescript
export class FraudDetectionEngine {
  private mlModel: MachineLearningModel;
  private ruleEngine: RuleEngine;
  private behaviorAnalyzer: BehaviorAnalyzer;
  private anomalyDetector: AnomalyDetector;

  async detectFraud(userId: string, activity: UserActivity): Promise<FraudDetectionResult> {
    const detection: FraudDetectionResult = {
      isFraudulent: false,
      confidence: 0,
      riskScore: 0,
      indicators: [],
      recommendations: []
    };

    // Rule-based detection
    const ruleResults = await this.ruleEngine.evaluate(userId, activity);
    detection.indicators.push(...ruleResults.indicators);
    detection.riskScore += ruleResults.riskScore;

    // ML-based detection
    const mlResults = await this.mlModel.predict(userId, activity);
    detection.confidence = mlResults.confidence;
    detection.riskScore += mlResults.riskScore;
    detection.indicators.push(...mlResults.indicators);

    // Behavior analysis
    const behaviorResults = await this.behaviorAnalyzer.analyze(userId, activity);
    detection.riskScore += behaviorResults.riskScore;
    detection.indicators.push(...behaviorResults.indicators);

    // Anomaly detection
    const anomalyResults = await this.anomalyDetector.detect(userId, activity);
    detection.riskScore += anomalyResults.riskScore;
    detection.indicators.push(...anomalyResults.indicators);

    // Determine if fraudulent
    detection.isFraudulent = detection.riskScore > 70 || detection.confidence > 0.8;

    // Generate recommendations
    if (detection.isFraudulent || detection.riskScore > 50) {
      detection.recommendations = await this.generateFraudRecommendations(detection);
    }

    return detection;
  }

  async detectAccountTakeover(userId: string, loginData: LoginData): Promise<TakeoverDetectionResult> {
    const signals: TakeoverSignal[] = [];
    let riskScore = 0;

    // Check for credential stuffing patterns
    const credentialStuffing = await this.detectCredentialStuffing(loginData);
    if (credentialStuffing.detected) {
      signals.push({
        type: 'credential_stuffing',
        severity: 'high',
        description: 'Multiple credential combinations attempted',
        confidence: credentialStuffing.confidence
      });
      riskScore += 40;
    }

    // Check for impossible travel
    const impossibleTravel = await this.detectImpossibleTravel(userId, loginData);
    if (impossibleTravel.detected) {
      signals.push({
        type: 'impossible_travel',
        severity: 'critical',
        description: impossibleTravel.description,
        confidence: impossibleTravel.confidence
      });
      riskScore += 50;
    }

    // Check for behavioral anomalies
    const behaviorChange = await this.detectBehaviorChange(userId, loginData);
    if (behaviorChange.detected) {
      signals.push({
        type: 'behavior_change',
        severity: 'medium',
        description: behaviorChange.description,
        confidence: behaviorChange.confidence
      });
      riskScore += 25;
    }

    // Check for device/browser anomalies
    const deviceAnomaly = await this.detectDeviceAnomaly(userId, loginData);
    if (deviceAnomaly.detected) {
      signals.push({
        type: 'device_anomaly',
        severity: 'medium',
        description: deviceAnomaly.description,
        confidence: deviceAnomaly.confidence
      });
      riskScore += 20;
    }

    return {
      detected: riskScore > 60,
      riskScore,
      signals,
      recommendations: riskScore > 60 ? await this.generateTakeoverRecommendations(signals) : []
    };
  }

  private async detectCredentialStuffing(loginData: LoginData): Promise<DetectionResult> {
    // Check for rapid-fire login attempts with different credentials
    const recentAttempts = await this.getRecentLoginAttempts(loginData.ipAddress, '5m');
    
    if (recentAttempts.length > 10) {
      const uniqueCredentials = new Set(recentAttempts.map(a => `${a.username}:${a.passwordHash}`));
      
      if (uniqueCredentials.size > 5) {
        return {
          detected: true,
          confidence: Math.min(0.9, uniqueCredentials.size / 10),
          description: `${uniqueCredentials.size} different credential combinations in 5 minutes`
        };
      }
    }

    return { detected: false, confidence: 0 };
  }

  private async detectImpossibleTravel(userId: string, loginData: LoginData): Promise<DetectionResult> {
    const lastLogin = await this.getLastSuccessfulLogin(userId);
    
    if (!lastLogin || !lastLogin.location || !loginData.location) {
      return { detected: false, confidence: 0 };
    }

    const distance = this.calculateDistance(lastLogin.location, loginData.location);
    const timeDiff = (loginData.timestamp.getTime() - lastLogin.timestamp.getTime()) / 1000 / 3600; // hours
    
    // Maximum possible speed (commercial flight + transit time)
    const maxSpeed = 600; // mph
    const minTimeRequired = distance / maxSpeed;
    
    if (timeDiff < minTimeRequired && distance > 100) {
      return {
        detected: true,
        confidence: Math.min(0.95, (minTimeRequired - timeDiff) / minTimeRequired),
        description: `Travel from ${lastLogin.location.city} to ${loginData.location.city} (${distance.toFixed(0)} miles) in ${timeDiff.toFixed(1)} hours`
      };
    }

    return { detected: false, confidence: 0 };
  }
}

interface FraudDetectionResult {
  isFraudulent: boolean;
  confidence: number;
  riskScore: number;
  indicators: FraudIndicator[];
  recommendations: string[];
}

interface TakeoverDetectionResult {
  detected: boolean;
  riskScore: number;
  signals: TakeoverSignal[];
  recommendations: string[];
}

interface FraudIndicator {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  confidence: number;
}

interface TakeoverSignal {
  type: 'credential_stuffing' | 'impossible_travel' | 'behavior_change' | 'device_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  confidence: number;
}
```

---

## 🎨 **User Security Interface**

### **Security Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│ 🔒 Account Security                    [Security Scan] [Settings] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Security Overview ────────────────────────────────┐   │
│ │ 🛡️ Security Score: 85/100 (Good)                   │   │
│ │ ████████░░ Improving trend (+5 this month)         │   │
│ │                                                   │   │
│ │ ✅ Password: Strong (last changed 45 days ago)     │   │
│ │ ✅ 2FA: Enabled (Authenticator app)               │   │
│ │ ⚠️ Trusted Devices: 5/5 (at limit)                │   │
│ │ ✅ Recent Activity: Normal patterns                │   │
│ │ ⚠️ Privacy Settings: Some data publicly visible    │   │
│ │                                                   │   │
│ │ Last security scan: 2 days ago                     │   │
│ │ Next automatic scan: In 5 days                     │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Security Alerts ──────────────────────────────────┐   │
│ │ 🚨 2 active alerts requiring attention             │   │
│ │                                                   │   │
│ │ ⚠️ New device login detected                       │   │
│ │    iPhone 14 from New York, NY                    │   │
│ │    Dec 21, 2023 at 2:30 PM                        │   │
│ │    [Trust Device] [Block Device] [More Info]      │   │
│ │                                                   │   │
│ │ ⚠️ Password found in data breach                   │   │
│ │    Your password was found in the "DataCorp2023"  │   │
│ │    breach. Change it immediately.                  │   │
│ │    [Change Password] [Dismiss] [Learn More]       │   │
│ │                                                   │   │
│ │ [View All Alerts] [Alert Settings]                │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Trusted Devices ──────────────────────────────────┐   │
│ │ 💻 MacBook Pro (Current device)                    │   │
│ │    macOS 14.1 • Chrome 119 • Trusted             │   │
│ │    Last used: Now • Location: San Francisco, CA   │   │
│ │                                                   │   │
│ │ 📱 iPhone 14 Pro                                   │   │
│ │    iOS 17.1 • Safari • Trusted                    │   │
│ │    Last used: 2 hours ago • Location: SF, CA      │   │
│ │    [Remove] [View Details]                         │   │
│ │                                                   │   │
│ │ 📱 iPhone 14 (New)                                 │   │
│ │    iOS 17.2 • Safari • Pending approval           │   │
│ │    First seen: 2 hours ago • Location: NY, NY     │   │
│ │    [Trust] [Block] [View Details]                  │   │
│ │                                                   │   │
│ │ [+2 more devices...] [Manage All Devices]         │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Recent Security Activity ─────────────────────────┐   │
│ │ Dec 21, 2:30 PM - New device login (iPhone 14)    │   │
│ │ Dec 20, 9:15 AM - Password changed                │   │
│ │ Dec 19, 3:45 PM - 2FA backup codes regenerated   │   │
│ │ Dec 18, 11:20 AM - Trusted device added (iPad)    │   │
│ │ Dec 17, 4:30 PM - Security scan completed         │   │
│ │                                                   │   │
│ │ [View Full Activity Log] [Download Report]        │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### **Privacy Settings Interface:**
```
┌─────────────────────────────────────────────────────────┐
│ 🔐 Privacy & Data Control               [Save] [Reset] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Profile Visibility ───────────────────────────────┐   │
│ │ Who can see your profile:                          │   │
│ │ ○ Everyone (Public)                                │   │
│ │ ● Members only                                     │   │
│ │ ○ Private (Only me)                                │   │
│ │                                                   │   │
│ │ Contact Information:                               │   │
│ │ ☐ Show email address                               │   │
│ │ ☐ Show phone number                                │   │
│ │ ☑ Show last seen status                            │   │
│ │ ☑ Allow direct messages from anyone               │   │
│ │                                                   │   │
│ │ Search & Discovery:                                │   │
│ │ ☑ Make profile searchable                          │   │
│ │ ☑ Appear in member directories                     │   │
│ │ ☐ Allow search engines to index profile           │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Data Collection & Usage ──────────────────────────┐   │
│ │ Analytics & Tracking:                              │   │
│ │ ☑ Allow usage analytics collection                 │   │
│ │ ☑ Enable personalized recommendations             │   │
│ │ ☐ Share anonymized data for research              │   │
│ │ ☐ Allow behavioral tracking                       │   │
│ │                                                   │   │
│ │ Marketing & Communications:                        │   │
│ │ ☑ Receive product updates                          │   │
│ │ ☐ Receive marketing emails                         │   │
│ │ ☑ Receive security notifications                   │   │
│ │ ☐ Allow third-party promotional content           │   │
│ │                                                   │   │
│ │ Cookie Preferences:                                │   │
│ │ ☑ Essential cookies (Required)                     │   │
│ │ ☑ Functional cookies                               │   │
│ │ ☐ Analytics cookies                                │   │
│ │ ☐ Marketing cookies                                │   │
│ │                                                   │   │
│ │ [Manage Cookie Settings] [View Cookie Policy]     │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Data Rights & Control ────────────────────────────┐   │
│ │ Your Data Rights (GDPR/CCPA):                      │   │
│ │                                                   │   │
│ │ 📥 Data Export                                     │   │
│ │ Download all your personal data in JSON format    │   │
│ │ [Request Data Export] (Last: Never)               │   │
│ │                                                   │   │
│ │ 🗑️ Data Deletion                                   │   │
│ │ Permanently delete your account and all data      │   │
│ │ [Request Account Deletion] (Irreversible)         │   │
│ │                                                   │   │
│ │ ✏️ Data Correction                                  │   │
│ │ Request correction of inaccurate personal data    │   │
│ │ [Request Data Correction]                          │   │
│ │                                                   │   │
│ │ ⏸️ Data Processing                                  │   │
│ │ Restrict processing of your personal data         │   │
│ │ [Request Processing Restriction]                   │   │
│ │                                                   │   │
│ │ Data Retention:                                    │   │
│ │ • Account data: Kept while account is active      │   │
│ │ • Activity logs: 90 days                          │   │
│ │ • Security logs: 1 year                           │   │
│ │ • Backup data: 30 days after deletion             │   │
│ │                                                   │   │
│ │ [View Privacy Policy] [Contact Data Protection]   │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Security assessment
GET    /api/users/{id}/security/assessment // Get security risk assessment
POST   /api/users/{id}/security/scan       // Run security scan
GET    /api/users/{id}/security/alerts     // Get security alerts
POST   /api/users/{id}/security/alerts/{alertId}/resolve // Resolve alert

// Device management
GET    /api/users/{id}/devices             // Get user devices
POST   /api/users/{id}/devices/{deviceId}/trust // Trust device
DELETE /api/users/{id}/devices/{deviceId}  // Remove device
PUT    /api/users/{id}/devices/settings    // Update device settings

// Password security
POST   /api/users/{id}/password/validate   // Validate password
POST   /api/users/{id}/password/check-breach // Check password breach
GET    /api/users/{id}/password/policy     // Get password policy
POST   /api/users/{id}/password/generate   // Generate secure password

// Fraud detection
POST   /api/security/fraud/detect          // Detect fraud
POST   /api/security/fraud/report          // Report fraudulent activity
GET    /api/security/fraud/patterns        // Get fraud patterns

// Compliance
GET    /api/users/{id}/compliance          // Get compliance status
POST   /api/users/{id}/data-export         // Request data export
POST   /api/users/{id}/data-deletion       // Request data deletion
PUT    /api/users/{id}/privacy-settings    // Update privacy settings
```

### **Database Schema:**
```sql
-- User security profiles
CREATE TABLE user_security_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  password_policy JSONB NOT NULL,
  account_lockout JSONB NOT NULL,
  session_security JSONB NOT NULL,
  device_management JSONB NOT NULL,
  privacy_settings JSONB NOT NULL,
  risk_score INTEGER DEFAULT 0,
  last_assessment TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Security alerts
CREATE TABLE security_alerts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  details JSONB,
  status VARCHAR(20) DEFAULT 'new',
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Trusted devices
CREATE TABLE trusted_devices (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  fingerprint VARCHAR(255) NOT NULL,
  device_type VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100),
  location JSONB,
  trust_level VARCHAR(20) DEFAULT 'medium',
  is_trusted BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  first_seen TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW()
);

-- Security audit log
CREATE TABLE security_audit_log (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(255),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  risk_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Account lockouts
CREATE TABLE account_lockouts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL,
  locked_at TIMESTAMP DEFAULT NOW(),
  unlock_at TIMESTAMP NOT NULL,
  attempt_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  unlocked_at TIMESTAMP,
  unlocked_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Fraud detection events
CREATE TABLE fraud_detection_events (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  is_fraudulent BOOLEAN NOT NULL,
  confidence DECIMAL(3,2),
  risk_score INTEGER NOT NULL,
  indicators JSONB,
  recommendations JSONB,
  ip_address INET,
  user_agent TEXT,
  detected_at TIMESTAMP DEFAULT NOW()
);

-- Compliance records
CREATE TABLE compliance_records (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  regulation VARCHAR(20) NOT NULL, -- GDPR, CCPA, etc.
  status VARCHAR(20) NOT NULL,
  last_check TIMESTAMP DEFAULT NOW(),
  issues JSONB,
  recommendations JSONB,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, regulation)
);

-- Indexes for performance
CREATE INDEX idx_user_security_profiles_user ON user_security_profiles(user_id);
CREATE INDEX idx_security_alerts_user ON security_alerts(user_id);
CREATE INDEX idx_security_alerts_status ON security_alerts(status);
CREATE INDEX idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX idx_trusted_devices_user ON trusted_devices(user_id);
CREATE INDEX idx_trusted_devices_fingerprint ON trusted_devices(fingerprint);
CREATE INDEX idx_security_audit_log_user ON security_audit_log(user_id);
CREATE INDEX idx_security_audit_log_action ON security_audit_log(action);
CREATE INDEX idx_security_audit_log_created_at ON security_audit_log(created_at);
CREATE INDEX idx_account_lockouts_user ON account_lockouts(user_id);
CREATE INDEX idx_account_lockouts_active ON account_lockouts(is_active);
CREATE INDEX idx_fraud_detection_events_user ON fraud_detection_events(user_id);
CREATE INDEX idx_fraud_detection_events_type ON fraud_detection_events(event_type);
CREATE INDEX idx_compliance_records_user ON compliance_records(user_id);
CREATE INDEX idx_compliance_records_regulation ON compliance_records(regulation);
```

---

## 🔗 **Related Documentation**

- **[User Management](./management.md)** - User CRUD operations integration
- **[Authentication](./authentication.md)** - Login security integration
- **[Roles & Permissions](./roles.md)** - Security permissions
- **[Security System](../06_security/)** - System-wide security features
- **[User Analytics](../01_analytics/user-analytics.md)** - Security analytics tracking

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
