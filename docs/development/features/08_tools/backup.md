# 💾 Backup & Restore System

> **Sistem Backup & Restore Komprehensif JA-CMS**  
> Complete backup solution with automated scheduling and disaster recovery

---

## 📋 **Deskripsi**

Backup & Restore System adalah sistem perlindungan data yang comprehensive untuk JA-CMS. Sistem ini menyediakan automated backup scheduling, incremental backup, cloud storage integration, dan disaster recovery capabilities untuk memastikan data safety dan business continuity.

---

## ⭐ **Core Features**

### **1. 💾 Automated Backup System**

#### **Backup Types:**
- **Full Backup**: Complete site backup (database + files)
- **Incremental Backup**: Only changed files since last backup
- **Database Backup**: Database-only backup dengan compression
- **File Backup**: Files-only backup (media, themes, plugins)
- **Selective Backup**: Choose specific components to backup

**Backup Configuration:**
```typescript
interface BackupConfig {
  id: string;
  name: string;
  description?: string;
  type: 'full' | 'incremental' | 'database' | 'files' | 'selective';
  enabled: boolean;
  schedule: BackupSchedule;
  storage: BackupStorage[];
  retention: RetentionPolicy;
  compression: {
    enabled: boolean;
    algorithm: 'gzip' | 'bzip2' | 'lzma';
    level: number; // 1-9
  };
  encryption: {
    enabled: boolean;
    algorithm: 'aes256' | 'chacha20';
    keyDerivation: 'pbkdf2' | 'scrypt';
  };
  verification: boolean;
  notifications: NotificationConfig;
  createdAt: Date;
  updatedAt: Date;
}

interface BackupSchedule {
  frequency: 'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  time?: string; // HH:MM format
  dayOfWeek?: number; // 0-6, Sunday = 0
  dayOfMonth?: number; // 1-31
  timezone: string;
  maxConcurrent: number; // max concurrent backup jobs
}

interface RetentionPolicy {
  keepDaily: number; // days to keep daily backups
  keepWeekly: number; // weeks to keep weekly backups  
  keepMonthly: number; // months to keep monthly backups
  keepYearly: number; // years to keep yearly backups
  maxTotalBackups: number; // absolute maximum backups
  autoCleanup: boolean;
}
```

#### **Storage Options:**
```typescript
interface BackupStorage {
  id: string;
  name: string;
  type: 'local' | 's3' | 'gcs' | 'azure' | 'ftp' | 'sftp';
  enabled: boolean;
  primary: boolean; // primary storage location
  config: StorageConfig;
  testConnection?: boolean;
  lastTested?: Date;
}

// S3 Storage Config
interface S3StorageConfig {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string; // for S3-compatible services
  pathPrefix?: string; // folder prefix
  storageClass: 'STANDARD' | 'STANDARD_IA' | 'GLACIER' | 'DEEP_ARCHIVE';
}

// Local Storage Config
interface LocalStorageConfig {
  path: string;
  maxSize: number; // in bytes
  permissions: string; // file permissions
}
```

### **2. 🔄 Backup Execution Engine**

#### **Backup Job Processing:**
```typescript
interface BackupJob {
  id: string;
  configId: string;
  name: string;
  type: BackupType;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: {
    currentStep: string;
    totalSteps: number;
    completedSteps: number;
    percentage: number;
    processedFiles: number;
    totalFiles: number;
    processedSize: number; // bytes
    totalSize: number; // bytes
    speed: number; // bytes per second
    eta: number; // estimated time remaining in seconds
  };
  startedAt?: Date;
  completedAt?: Date;
  duration?: number; // seconds
  result?: BackupResult;
  error?: string;
  logs: BackupLog[];
  createdBy: string;
  createdAt: Date;
}

interface BackupResult {
  success: boolean;
  backupFile: {
    filename: string;
    size: number;
    path: string;
    checksum: string;
    compressionRatio: number;
  };
  statistics: {
    filesBackedUp: number;
    foldersBackedUp: number;
    databaseTables: number;
    totalSize: number;
    compressedSize: number;
    duration: number;
  };
  storageLocations: {
    storage: string;
    path: string;
    uploaded: boolean;
    error?: string;
  }[];
  verification: {
    verified: boolean;
    checksumMatch: boolean;
    error?: string;
  };
}
```

#### **Backup Process Implementation:**
```typescript
export class BackupEngine {
  async executeBackup(config: BackupConfig): Promise<BackupJob> {
    const job = await this.createBackupJob(config);
    
    try {
      await this.updateJobStatus(job.id, 'running');
      
      // Step 1: Prepare backup
      await this.prepareBackup(job);
      
      // Step 2: Create backup based on type
      switch (config.type) {
        case 'full':
          await this.createFullBackup(job);
          break;
        case 'database':
          await this.createDatabaseBackup(job);
          break;
        case 'files':
          await this.createFileBackup(job);
          break;
        case 'incremental':
          await this.createIncrementalBackup(job);
          break;
      }
      
      // Step 3: Compress if enabled
      if (config.compression.enabled) {
        await this.compressBackup(job, config.compression);
      }
      
      // Step 4: Encrypt if enabled
      if (config.encryption.enabled) {
        await this.encryptBackup(job, config.encryption);
      }
      
      // Step 5: Upload to storage locations
      await this.uploadToStorage(job, config.storage);
      
      // Step 6: Verify backup integrity
      if (config.verification) {
        await this.verifyBackup(job);
      }
      
      // Step 7: Cleanup old backups
      await this.cleanupOldBackups(config);
      
      // Step 8: Send notifications
      await this.sendNotifications(job, config.notifications);
      
      await this.updateJobStatus(job.id, 'completed');
      return job;
      
    } catch (error) {
      await this.handleBackupError(job, error);
      throw error;
    }
  }

  private async createDatabaseBackup(job: BackupJob): Promise<void> {
    const dumpFile = `${job.id}_database.sql`;
    const dumpPath = path.join(this.tempDir, dumpFile);
    
    // PostgreSQL dump
    const dumpCommand = `pg_dump ${process.env.DATABASE_URL} > ${dumpPath}`;
    
    await this.updateJobProgress(job.id, {
      currentStep: 'Creating database dump',
      percentage: 20
    });
    
    await this.executeCommand(dumpCommand);
    
    // Verify dump file
    const stats = await fs.stat(dumpPath);
    if (stats.size === 0) {
      throw new Error('Database dump is empty');
    }
    
    job.result = {
      ...job.result,
      backupFile: {
        filename: dumpFile,
        size: stats.size,
        path: dumpPath,
        checksum: await this.calculateChecksum(dumpPath)
      }
    };
  }

  private async createFileBackup(job: BackupJob): Promise<void> {
    const archiveFile = `${job.id}_files.tar`;
    const archivePath = path.join(this.tempDir, archiveFile);
    
    // Paths to backup
    const backupPaths = [
      'uploads/',
      'themes/',
      'plugins/',
      'config/'
    ];
    
    await this.updateJobProgress(job.id, {
      currentStep: 'Creating file archive',
      percentage: 30
    });
    
    // Create tar archive
    const tar = require('tar');
    await tar.create(
      {
        file: archivePath,
        cwd: process.cwd(),
        onProgress: (entry) => {
          // Update progress based on files processed
          this.updateFileProgress(job.id, entry);
        }
      },
      backupPaths
    );
    
    const stats = await fs.stat(archivePath);
    job.result = {
      ...job.result,
      backupFile: {
        filename: archiveFile,
        size: stats.size,
        path: archivePath,
        checksum: await this.calculateChecksum(archivePath)
      }
    };
  }
}
```

### **3. 🔄 Restore System**

#### **Restore Options:**
- **Full Restore**: Complete site restoration
- **Selective Restore**: Choose specific components
- **Point-in-time Restore**: Restore to specific backup
- **Preview Changes**: See what will be restored
- **Rollback Protection**: Create backup before restore

**Restore Process:**
```typescript
interface RestoreJob {
  id: string;
  backupId: string;
  type: 'full' | 'database' | 'files' | 'selective';
  options: RestoreOptions;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: RestoreProgress;
  preRestoreBackup?: string; // backup created before restore
  startedAt?: Date;
  completedAt?: Date;
  result?: RestoreResult;
  error?: string;
}

interface RestoreOptions {
  overwriteExisting: boolean;
  restoreDatabase: boolean;
  restoreFiles: boolean;
  restoreConfig: boolean;
  selectiveItems?: string[]; // specific files/tables to restore
  targetPath?: string; // for file restoration
  createPreRestoreBackup: boolean;
  skipVerification: boolean;
}

export class RestoreEngine {
  async executeRestore(backupId: string, options: RestoreOptions): Promise<RestoreJob> {
    const backup = await this.getBackup(backupId);
    const job = await this.createRestoreJob(backup, options);
    
    try {
      // Step 1: Create pre-restore backup if requested
      if (options.createPreRestoreBackup) {
        const preBackup = await this.createPreRestoreBackup();
        job.preRestoreBackup = preBackup.id;
      }
      
      // Step 2: Download and verify backup
      await this.downloadAndVerifyBackup(backup);
      
      // Step 3: Extract backup
      await this.extractBackup(backup, job);
      
      // Step 4: Restore based on type
      if (options.restoreDatabase) {
        await this.restoreDatabase(backup, job);
      }
      
      if (options.restoreFiles) {
        await this.restoreFiles(backup, job, options);
      }
      
      // Step 5: Verify restoration
      if (!options.skipVerification) {
        await this.verifyRestore(job);
      }
      
      // Step 6: Cleanup temporary files
      await this.cleanupTempFiles(job);
      
      await this.updateJobStatus(job.id, 'completed');
      return job;
      
    } catch (error) {
      await this.handleRestoreError(job, error);
      throw error;
    }
  }
}
```

---

## 🎨 **Backup Management Interface**

### **Backup Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│ 💾 Backup & Restore                  [New Backup] [Settings] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Backup Status ────────────────────────────────────┐   │
│ │ Last Backup: ✅ Jan 9, 2024 02:00 (Success)       │   │
│ │ Next Backup: 📅 Jan 10, 2024 02:00 (Full)         │   │
│ │ Storage Used: 15.2 GB / 100 GB (15%)               │   │
│ │ Total Backups: 47 backups                          │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Recent Backups ───────────────────────────────────┐   │
│ │ 💾 Full Backup - Jan 9, 2024 02:00                 │   │
│ │    Size: 2.1 GB | Duration: 5m 23s | ✅ Success   │   │
│ │    [Download] [Restore] [Details]                   │   │
│ │                                                     │   │
│ │ 📊 Database - Jan 8, 2024 14:30                    │   │
│ │    Size: 45 MB | Duration: 1m 12s | ✅ Success     │   │
│ │    [Download] [Restore] [Details]                   │   │
│ │                                                     │   │
│ │ 📁 Files - Jan 8, 2024 08:00                       │   │
│ │    Size: 1.8 GB | Duration: 3m 45s | ✅ Success    │   │
│ │    [Download] [Restore] [Details]                   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Quick Actions ────────────────────────────────────┐   │
│ │ [🚀 Backup Now] [📅 Schedule] [⚙️ Configure]       │   │
│ │ [📥 Restore] [🗑️ Cleanup] [📊 Storage]             │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### **Backup Configuration:**
```
┌─────────────────────────────────────────────────────────┐
│ ⚙️ Backup Configuration                    [Save] [Test] │
├─────────────────────────────────────────────────────────┤
│ ┌─ General Settings ─────────────────────────────────┐   │
│ │ Backup Name: [Daily Full Backup_______________]    │   │
│ │ Type: [Full Backup ▼]                             │   │
│ │ ☑ Enable automatic backups                        │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Schedule ─────────────────────────────────────────┐   │
│ │ Frequency: [Daily ▼]                               │   │
│ │ Time: [02:00] Timezone: [UTC ▼]                    │   │
│ │ Max Concurrent: [1___] backups                     │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Storage Locations ────────────────────────────────┐   │
│ │ ☑ Local Storage (/var/backups)                     │   │
│ │ ☑ Amazon S3 (backup-bucket)                        │   │
│ │ ☐ Google Cloud Storage                             │   │
│ │ ☐ Azure Blob Storage                               │   │
│ │ [Add Storage Location]                             │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Retention Policy ─────────────────────────────────┐   │
│ │ Keep Daily: [7___] days                            │   │
│ │ Keep Weekly: [4___] weeks                          │   │
│ │ Keep Monthly: [12__] months                        │   │
│ │ Keep Yearly: [5___] years                          │   │
│ │ ☑ Auto-cleanup old backups                         │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Advanced Options ─────────────────────────────────┐   │
│ │ ☑ Compression (gzip)                               │   │
│ │ ☑ Encryption (AES-256)                             │   │
│ │ ☑ Verify backup integrity                          │   │
│ │ ☑ Email notifications                              │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Backup management
GET    /api/backups                    // List backups with pagination
POST   /api/backups                    // Create new backup
GET    /api/backups/{id}               // Get backup details
DELETE /api/backups/{id}               // Delete backup
POST   /api/backups/{id}/restore       // Restore from backup
GET    /api/backups/{id}/download      // Download backup file

// Backup jobs
GET    /api/backup-jobs                // List backup jobs
GET    /api/backup-jobs/{id}           // Get job status
POST   /api/backup-jobs/{id}/cancel    // Cancel running job
GET    /api/backup-jobs/{id}/logs      // Get job logs

// Backup configuration
GET    /api/backup-configs             // List backup configs
POST   /api/backup-configs             // Create backup config
PUT    /api/backup-configs/{id}        // Update config
DELETE /api/backup-configs/{id}        // Delete config
POST   /api/backup-configs/{id}/test   // Test backup config

// Storage management
GET    /api/backup-storage             // List storage locations
POST   /api/backup-storage             // Add storage location
POST   /api/backup-storage/{id}/test   // Test storage connection
```

### **Database Schema:**
```sql
-- Backup configurations
CREATE TABLE backup_configs (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL, -- full, incremental, database, files
  enabled BOOLEAN DEFAULT true,
  schedule JSONB NOT NULL,
  storage_locations JSONB NOT NULL,
  retention_policy JSONB NOT NULL,
  compression JSONB,
  encryption JSONB,
  verification BOOLEAN DEFAULT true,
  notifications JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Backup jobs
CREATE TABLE backup_jobs (
  id UUID PRIMARY KEY,
  config_id UUID REFERENCES backup_configs(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  progress JSONB,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration INTEGER, -- seconds
  result JSONB,
  error TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Backup files
CREATE TABLE backup_files (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES backup_jobs(id),
  filename VARCHAR(255) NOT NULL,
  size BIGINT NOT NULL,
  checksum VARCHAR(64) NOT NULL,
  compression_ratio DECIMAL(5,2),
  encrypted BOOLEAN DEFAULT false,
  storage_locations JSONB NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Backup logs
CREATE TABLE backup_logs (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES backup_jobs(id),
  level VARCHAR(10) NOT NULL, -- debug, info, warning, error
  message TEXT NOT NULL,
  context JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Storage locations
CREATE TABLE backup_storage (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL, -- local, s3, gcs, azure, ftp, sftp
  enabled BOOLEAN DEFAULT true,
  primary_storage BOOLEAN DEFAULT false,
  config JSONB NOT NULL,
  last_tested TIMESTAMP,
  test_result JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 **Advanced Features**

### **1. 📊 Backup Monitoring:**
```typescript
// Backup health monitoring
interface BackupHealth {
  lastSuccessfulBackup: Date;
  consecutiveFailures: number;
  averageBackupTime: number;
  averageBackupSize: number;
  storageUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  alerts: BackupAlert[];
}

interface BackupAlert {
  type: 'backup_failed' | 'storage_full' | 'backup_overdue' | 'verification_failed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  createdAt: Date;
  acknowledged: boolean;
}
```

### **2. 🔄 Incremental Backup Logic:**
```typescript
export class IncrementalBackupEngine {
  async createIncrementalBackup(job: BackupJob): Promise<void> {
    // Find last successful backup
    const lastBackup = await this.getLastSuccessfulBackup(job.configId);
    const lastBackupDate = lastBackup?.completedAt || new Date(0);
    
    // Find changed files since last backup
    const changedFiles = await this.findChangedFiles(lastBackupDate);
    
    // Create incremental backup
    const archivePath = await this.createIncrementalArchive(changedFiles, job);
    
    // Store metadata about incremental backup
    await this.storeIncrementalMetadata(job, {
      baseBackupId: lastBackup?.id,
      changedFiles: changedFiles.length,
      lastBackupDate
    });
  }

  private async findChangedFiles(since: Date): Promise<string[]> {
    const changedFiles: string[] = [];
    
    // Check file system changes
    const files = await this.getAllFiles();
    for (const file of files) {
      const stats = await fs.stat(file);
      if (stats.mtime > since) {
        changedFiles.push(file);
      }
    }
    
    return changedFiles;
  }
}
```

### **3. 🔐 Backup Encryption:**
```typescript
export class BackupEncryption {
  async encryptBackup(filePath: string, config: EncryptionConfig): Promise<string> {
    const encryptedPath = `${filePath}.encrypted`;
    
    // Generate encryption key from password
    const key = await this.deriveKey(config.password, config.keyDerivation);
    
    // Encrypt file
    const cipher = crypto.createCipher(config.algorithm, key);
    const input = fs.createReadStream(filePath);
    const output = fs.createWriteStream(encryptedPath);
    
    return new Promise((resolve, reject) => {
      input
        .pipe(cipher)
        .pipe(output)
        .on('finish', () => resolve(encryptedPath))
        .on('error', reject);
    });
  }

  async decryptBackup(filePath: string, config: EncryptionConfig): Promise<string> {
    const decryptedPath = filePath.replace('.encrypted', '.decrypted');
    
    const key = await this.deriveKey(config.password, config.keyDerivation);
    const decipher = crypto.createDecipher(config.algorithm, key);
    
    const input = fs.createReadStream(filePath);
    const output = fs.createWriteStream(decryptedPath);
    
    return new Promise((resolve, reject) => {
      input
        .pipe(decipher)
        .pipe(output)
        .on('finish', () => resolve(decryptedPath))
        .on('error', reject);
    });
  }
}
```

---

## 🔗 **Related Documentation**

- **[System Maintenance](./maintenance.md)** - System health monitoring
- **[Database Management](./database.md)** - Database tools
- **[Security Features](../06_security/)** - Data protection
- **[System Settings](../07_system/settings.md)** - Backup configuration

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
