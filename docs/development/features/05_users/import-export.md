# 🔄 User Import/Export System

> **Advanced User Data Import/Export JA-CMS**  
> Comprehensive bulk operations dengan CSV/Excel support, data validation, dan migration tools

---

## 📋 **Deskripsi**

User Import/Export System menyediakan comprehensive tools untuk bulk user operations dalam JA-CMS. Sistem ini mendukung import/export dari berbagai format file, data validation, transformation, migration tools, dan bulk operations untuk efficient user data management.

---

## ⭐ **Core Features**

### **1. 📥 User Import System**

#### **Import Architecture:**
```typescript
interface UserImport {
  id: string;
  name: string;
  description: string;
  type: ImportType;
  source: ImportSource;
  file: ImportFile;
  mapping: FieldMapping;
  validation: ValidationConfig;
  transformation: TransformationRule[];
  options: ImportOptions;
  status: ImportStatus;
  progress: ImportProgress;
  results: ImportResults;
  metadata: ImportMetadata;
}

interface ImportFile {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  encoding: string;
  path: string;
  headers: string[];
  rowCount: number;
  preview: PreviewData;
  checksum: string;
  uploadedAt: Date;
}

interface FieldMapping {
  mappings: FieldMap[];
  unmappedFields: string[];
  customFields: CustomFieldMap[];
  defaultValues: DefaultValueMap;
  conditionalMappings: ConditionalMapping[];
}

interface FieldMap {
  sourceField: string;
  targetField: string;
  required: boolean;
  transformation?: string;
  validation?: ValidationRule;
}

interface ValidationConfig {
  rules: ValidationRule[];
  strictMode: boolean;
  skipInvalidRows: boolean;
  maxErrors: number;
  duplicateHandling: DuplicateHandling;
  emailValidation: boolean;
  phoneValidation: boolean;
  customValidation: CustomValidationRule[];
}

interface ImportOptions {
  batchSize: number;
  skipHeader: boolean;
  delimiter: string;
  encoding: string;
  dateFormat: string;
  timezone: string;
  dryRun: boolean;
  sendWelcomeEmails: boolean;
  assignDefaultRole: boolean;
  defaultRole: string;
  assignToGroups: string[];
  setStatus: UserStatus;
  notifications: NotificationSettings;
}

interface ImportProgress {
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  failedRows: number;
  skippedRows: number;
  currentBatch: number;
  totalBatches: number;
  startedAt: Date;
  estimatedCompletion?: Date;
  percentage: number;
}

interface ImportResults {
  summary: ImportSummary;
  successful: SuccessfulImport[];
  failed: FailedImport[];
  skipped: SkippedImport[];
  duplicates: DuplicateImport[];
  warnings: ImportWarning[];
  validationErrors: ValidationError[];
  logs: ImportLog[];
}

type ImportType = 'csv' | 'excel' | 'json' | 'xml' | 'api' | 'database';
type ImportSource = 'file_upload' | 'url' | 'api' | 'database' | 'integration';
type ImportStatus = 'pending' | 'validating' | 'processing' | 'completed' | 'failed' | 'cancelled';
type DuplicateHandling = 'skip' | 'update' | 'create_new' | 'merge' | 'fail';
```

#### **User Import Service:**
```typescript
export class UserImportService {
  private fileProcessor: FileProcessor;
  private validationEngine: ValidationEngine;
  private transformationEngine: TransformationEngine;
  private userService: UserManagementService;
  private progressTracker: ProgressTracker;
  private notificationService: NotificationService;

  async createImport(importData: CreateImportData, createdBy: string): Promise<UserImport> {
    // Validate import configuration
    const validation = await this.validateImportConfig(importData);
    if (!validation.valid) {
      throw new Error(`Import configuration invalid: ${validation.errors.join(', ')}`);
    }

    // Process uploaded file
    const processedFile = await this.fileProcessor.processFile(importData.file);

    // Create import record
    const userImport: UserImport = {
      id: this.generateImportId(),
      name: importData.name,
      description: importData.description,
      type: importData.type,
      source: importData.source,
      file: processedFile,
      mapping: importData.mapping,
      validation: importData.validation,
      transformation: importData.transformation || [],
      options: this.mergeDefaultOptions(importData.options),
      status: 'pending',
      progress: this.initializeProgress(processedFile.rowCount),
      results: this.initializeResults(),
      metadata: {
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    // Save import
    const savedImport = await this.importRepository.create(userImport);

    // Start processing if not dry run
    if (!userImport.options.dryRun) {
      await this.startImportProcessing(savedImport.id);
    }

    return savedImport;
  }

  async processImport(importId: string): Promise<ImportResults> {
    const userImport = await this.importRepository.findById(importId);
    if (!userImport) {
      throw new Error('Import not found');
    }

    try {
      // Update status
      await this.updateImportStatus(importId, 'validating');

      // Validate data
      const validationResults = await this.validateImportData(userImport);
      if (!validationResults.isValid && userImport.validation.strictMode) {
        throw new Error(`Validation failed: ${validationResults.errors.length} errors found`);
      }

      // Update status
      await this.updateImportStatus(importId, 'processing');

      // Process in batches
      const results = await this.processBatches(userImport, validationResults);

      // Update final status
      await this.updateImportStatus(importId, 'completed');

      // Send completion notification
      if (userImport.options.notifications.onCompletion) {
        await this.sendCompletionNotification(userImport, results);
      }

      return results;

    } catch (error) {
      await this.updateImportStatus(importId, 'failed');
      await this.logImportError(importId, error);
      throw error;
    }
  }

  private async processBatches(userImport: UserImport, validationResults: ValidationResults): Promise<ImportResults> {
    const results: ImportResults = this.initializeResults();
    const batchSize = userImport.options.batchSize;
    const totalRows = userImport.file.rowCount - (userImport.options.skipHeader ? 1 : 0);
    const totalBatches = Math.ceil(totalRows / batchSize);

    // Read file data
    const fileData = await this.fileProcessor.readFileData(userImport.file);
    let currentRow = userImport.options.skipHeader ? 1 : 0;

    for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
      const batchStart = currentRow;
      const batchEnd = Math.min(currentRow + batchSize, fileData.length);
      const batchData = fileData.slice(batchStart, batchEnd);

      // Process batch
      const batchResults = await this.processBatch(userImport, batchData, batchStart);
      
      // Merge results
      results.successful.push(...batchResults.successful);
      results.failed.push(...batchResults.failed);
      results.skipped.push(...batchResults.skipped);
      results.duplicates.push(...batchResults.duplicates);
      results.warnings.push(...batchResults.warnings);

      // Update progress
      currentRow = batchEnd;
      await this.updateProgress(userImport.id, {
        processedRows: currentRow,
        currentBatch: batchNum + 1,
        percentage: Math.round((currentRow / totalRows) * 100)
      });

      // Small delay to prevent overwhelming the system
      if (batchNum < totalBatches - 1) {
        await this.delay(100);
      }
    }

    // Calculate summary
    results.summary = this.calculateImportSummary(results);

    return results;
  }

  private async processBatch(userImport: UserImport, batchData: any[], startRow: number): Promise<BatchResults> {
    const batchResults: BatchResults = {
      successful: [],
      failed: [],
      skipped: [],
      duplicates: [],
      warnings: []
    };

    for (let i = 0; i < batchData.length; i++) {
      const rowData = batchData[i];
      const rowNumber = startRow + i + 1;

      try {
        // Transform data
        const transformedData = await this.transformRowData(rowData, userImport.mapping, userImport.transformation);

        // Validate transformed data
        const validation = await this.validateRowData(transformedData, userImport.validation);
        if (!validation.isValid) {
          if (userImport.validation.skipInvalidRows) {
            batchResults.skipped.push({
              rowNumber,
              data: transformedData,
              reason: 'Validation failed',
              errors: validation.errors
            });
            continue;
          } else {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
          }
        }

        // Check for duplicates
        const duplicateCheck = await this.checkDuplicate(transformedData);
        if (duplicateCheck.isDuplicate) {
          const handled = await this.handleDuplicate(
            duplicateCheck.existingUser,
            transformedData,
            userImport.validation.duplicateHandling,
            rowNumber
          );
          
          if (handled.action === 'skip') {
            batchResults.skipped.push({
              rowNumber,
              data: transformedData,
              reason: 'Duplicate user',
              existingUserId: duplicateCheck.existingUser.id
            });
            continue;
          } else if (handled.action === 'update') {
            batchResults.duplicates.push({
              rowNumber,
              data: transformedData,
              action: 'updated',
              existingUserId: duplicateCheck.existingUser.id,
              updatedUser: handled.user
            });
            continue;
          }
        }

        // Create user
        const createdUser = await this.userService.createUser(transformedData, userImport.metadata.createdBy);

        // Apply post-creation actions
        await this.applyPostCreationActions(createdUser, userImport.options);

        batchResults.successful.push({
          rowNumber,
          data: transformedData,
          user: createdUser
        });

      } catch (error) {
        batchResults.failed.push({
          rowNumber,
          data: rowData,
          error: error.message,
          details: error.stack
        });
      }
    }

    return batchResults;
  }

  private async transformRowData(rowData: any, mapping: FieldMapping, transformations: TransformationRule[]): Promise<any> {
    const transformedData: any = {};

    // Apply field mappings
    for (const fieldMap of mapping.mappings) {
      let value = this.getValueFromRow(rowData, fieldMap.sourceField);
      
      // Apply field-level transformation
      if (fieldMap.transformation) {
        value = await this.applyTransformation(value, fieldMap.transformation);
      }
      
      this.setValueInObject(transformedData, fieldMap.targetField, value);
    }

    // Apply default values
    for (const [field, defaultValue] of Object.entries(mapping.defaultValues)) {
      if (!transformedData[field] || transformedData[field] === '') {
        transformedData[field] = defaultValue;
      }
    }

    // Apply custom field mappings
    if (mapping.customFields.length > 0) {
      transformedData.profile = transformedData.profile || {};
      transformedData.profile.customFields = [];
      
      for (const customField of mapping.customFields) {
        const value = this.getValueFromRow(rowData, customField.sourceField);
        if (value !== null && value !== undefined && value !== '') {
          transformedData.profile.customFields.push({
            key: customField.targetField,
            value: await this.applyTransformation(value, customField.transformation)
          });
        }
      }
    }

    // Apply global transformations
    for (const transformation of transformations) {
      transformedData = await this.applyGlobalTransformation(transformedData, transformation);
    }

    return transformedData;
  }

  async generateImportTemplate(templateConfig: ImportTemplateConfig): Promise<ImportTemplate> {
    const template: ImportTemplate = {
      id: this.generateTemplateId(),
      name: templateConfig.name,
      description: templateConfig.description,
      format: templateConfig.format,
      headers: [],
      sampleData: [],
      instructions: [],
      validation: templateConfig.validation || this.getDefaultValidation(),
      metadata: {
        createdAt: new Date(),
        version: '1.0.0'
      }
    };

    // Generate headers based on user fields
    const userFields = await this.getUserFields();
    template.headers = this.generateTemplateHeaders(userFields, templateConfig.includeCustomFields);

    // Generate sample data
    template.sampleData = this.generateSampleData(template.headers, templateConfig.sampleRows || 3);

    // Generate instructions
    template.instructions = this.generateImportInstructions(template.headers, template.validation);

    return template;
  }

  async previewImport(file: Express.Multer.File, options: PreviewOptions): Promise<ImportPreview> {
    // Process file
    const processedFile = await this.fileProcessor.processFile(file);

    // Read first few rows for preview
    const previewData = await this.fileProcessor.readFileData(processedFile, 0, options.previewRows || 10);

    // Auto-detect field mappings
    const suggestedMappings = await this.suggestFieldMappings(processedFile.headers);

    // Validate preview data
    const validationResults = await this.validatePreviewData(previewData, options.validation);

    return {
      file: {
        name: processedFile.originalName,
        size: processedFile.size,
        rowCount: processedFile.rowCount,
        headers: processedFile.headers
      },
      preview: previewData,
      suggestedMappings,
      validation: validationResults,
      statistics: {
        emptyFields: this.countEmptyFields(previewData),
        duplicateEmails: this.countDuplicateEmails(previewData),
        invalidEmails: this.countInvalidEmails(previewData),
        missingRequired: this.countMissingRequired(previewData, suggestedMappings)
      }
    };
  }
}

interface CreateImportData {
  name: string;
  description: string;
  type: ImportType;
  source: ImportSource;
  file: Express.Multer.File;
  mapping: FieldMapping;
  validation: ValidationConfig;
  transformation?: TransformationRule[];
  options: ImportOptions;
}

interface BatchResults {
  successful: SuccessfulImport[];
  failed: FailedImport[];
  skipped: SkippedImport[];
  duplicates: DuplicateImport[];
  warnings: ImportWarning[];
}

interface ImportPreview {
  file: {
    name: string;
    size: number;
    rowCount: number;
    headers: string[];
  };
  preview: any[];
  suggestedMappings: FieldMap[];
  validation: ValidationResults;
  statistics: PreviewStatistics;
}

interface PreviewStatistics {
  emptyFields: { [field: string]: number };
  duplicateEmails: number;
  invalidEmails: number;
  missingRequired: { [field: string]: number };
}
```

### **2. 📤 User Export System**

#### **Export Architecture:**
```typescript
interface UserExport {
  id: string;
  name: string;
  description: string;
  type: ExportType;
  format: ExportFormat;
  query: ExportQuery;
  fields: ExportField[];
  options: ExportOptions;
  filters: ExportFilter[];
  sorting: ExportSorting[];
  status: ExportStatus;
  progress: ExportProgress;
  result: ExportResult;
  metadata: ExportMetadata;
}

interface ExportQuery {
  userIds?: string[];
  segments?: string[];
  groups?: string[];
  roles?: string[];
  status?: UserStatus[];
  createdAfter?: Date;
  createdBefore?: Date;
  lastLoginAfter?: Date;
  lastLoginBefore?: Date;
  customFilters?: CustomFilter[];
}

interface ExportField {
  field: string;
  label: string;
  type: FieldType;
  transformation?: string;
  includeEmpty: boolean;
  customFormat?: string;
}

interface ExportOptions {
  includeHeaders: boolean;
  dateFormat: string;
  timezone: string;
  encoding: string;
  delimiter?: string; // for CSV
  compression: CompressionType;
  encryption: EncryptionConfig;
  chunkSize: number;
  includeMetadata: boolean;
  anonymize: AnonymizationConfig;
}

type ExportType = 'full' | 'partial' | 'filtered' | 'custom';
type ExportFormat = 'csv' | 'excel' | 'json' | 'xml' | 'pdf';
type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
type CompressionType = 'none' | 'gzip' | 'zip';
```

#### **User Export Service:**
```typescript
export class UserExportService {
  private queryBuilder: QueryBuilder;
  private dataFormatter: DataFormatter;
  private fileGenerator: FileGenerator;
  private encryptionService: EncryptionService;
  private compressionService: CompressionService;

  async createExport(exportData: CreateExportData, createdBy: string): Promise<UserExport> {
    // Validate export configuration
    const validation = await this.validateExportConfig(exportData);
    if (!validation.valid) {
      throw new Error(`Export configuration invalid: ${validation.errors.join(', ')}`);
    }

    // Create export record
    const userExport: UserExport = {
      id: this.generateExportId(),
      name: exportData.name,
      description: exportData.description,
      type: exportData.type,
      format: exportData.format,
      query: exportData.query,
      fields: exportData.fields,
      options: this.mergeDefaultExportOptions(exportData.options),
      filters: exportData.filters || [],
      sorting: exportData.sorting || [],
      status: 'pending',
      progress: this.initializeExportProgress(),
      result: this.initializeExportResult(),
      metadata: {
        createdBy,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    };

    // Save export
    const savedExport = await this.exportRepository.create(userExport);

    // Start processing
    await this.startExportProcessing(savedExport.id);

    return savedExport;
  }

  async processExport(exportId: string): Promise<ExportResult> {
    const userExport = await this.exportRepository.findById(exportId);
    if (!userExport) {
      throw new Error('Export not found');
    }

    try {
      // Update status
      await this.updateExportStatus(exportId, 'processing');

      // Build query
      const query = await this.queryBuilder.buildUserQuery(userExport.query, userExport.filters);

      // Get total count
      const totalCount = await this.queryBuilder.getQueryCount(query);
      await this.updateExportProgress(exportId, { totalRecords: totalCount });

      // Process in chunks
      const result = await this.processExportChunks(userExport, query);

      // Update status
      await this.updateExportStatus(exportId, 'completed');

      return result;

    } catch (error) {
      await this.updateExportStatus(exportId, 'failed');
      throw error;
    }
  }

  private async processExportChunks(userExport: UserExport, query: any): Promise<ExportResult> {
    const chunkSize = userExport.options.chunkSize;
    const totalRecords = userExport.progress.totalRecords;
    const totalChunks = Math.ceil(totalRecords / chunkSize);

    let allData: any[] = [];
    let processedRecords = 0;

    for (let chunkNum = 0; chunkNum < totalChunks; chunkNum++) {
      const offset = chunkNum * chunkSize;
      
      // Get chunk data
      const chunkData = await this.queryBuilder.executeQuery(query, chunkSize, offset);
      
      // Transform data
      const transformedData = await this.transformExportData(chunkData, userExport.fields);
      
      // Apply anonymization if configured
      const finalData = userExport.options.anonymize.enabled 
        ? await this.anonymizeData(transformedData, userExport.options.anonymize)
        : transformedData;
      
      allData.push(...finalData);
      processedRecords += chunkData.length;

      // Update progress
      await this.updateExportProgress(userExport.id, {
        processedRecords,
        currentChunk: chunkNum + 1,
        percentage: Math.round((processedRecords / totalRecords) * 100)
      });
    }

    // Generate file
    const fileResult = await this.generateExportFile(allData, userExport);

    return {
      recordCount: allData.length,
      file: fileResult,
      downloadUrl: await this.generateDownloadUrl(fileResult.path),
      expiresAt: userExport.metadata.expiresAt,
      checksum: fileResult.checksum
    };
  }

  private async generateExportFile(data: any[], userExport: UserExport): Promise<ExportFile> {
    let fileContent: Buffer;
    let mimeType: string;
    let extension: string;

    // Generate content based on format
    switch (userExport.format) {
      case 'csv':
        fileContent = await this.fileGenerator.generateCSV(data, userExport.options);
        mimeType = 'text/csv';
        extension = 'csv';
        break;
      case 'excel':
        fileContent = await this.fileGenerator.generateExcel(data, userExport.options);
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        extension = 'xlsx';
        break;
      case 'json':
        fileContent = await this.fileGenerator.generateJSON(data, userExport.options);
        mimeType = 'application/json';
        extension = 'json';
        break;
      case 'xml':
        fileContent = await this.fileGenerator.generateXML(data, userExport.options);
        mimeType = 'application/xml';
        extension = 'xml';
        break;
      default:
        throw new Error(`Unsupported export format: ${userExport.format}`);
    }

    // Apply compression if configured
    if (userExport.options.compression !== 'none') {
      fileContent = await this.compressionService.compress(fileContent, userExport.options.compression);
      extension = `${extension}.${userExport.options.compression === 'gzip' ? 'gz' : 'zip'}`;
      mimeType = 'application/octet-stream';
    }

    // Apply encryption if configured
    if (userExport.options.encryption.enabled) {
      fileContent = await this.encryptionService.encrypt(fileContent, userExport.options.encryption);
      extension = `${extension}.encrypted`;
    }

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `users_export_${userExport.id}_${timestamp}.${extension}`;

    // Save file
    const filePath = await this.saveExportFile(filename, fileContent);

    return {
      path: filePath,
      filename,
      size: fileContent.length,
      mimeType,
      checksum: await this.calculateChecksum(fileContent),
      createdAt: new Date()
    };
  }

  async scheduleRecurringExport(scheduleData: RecurringExportData, createdBy: string): Promise<RecurringExport> {
    const recurringExport: RecurringExport = {
      id: this.generateRecurringExportId(),
      name: scheduleData.name,
      description: scheduleData.description,
      exportConfig: scheduleData.exportConfig,
      schedule: scheduleData.schedule,
      recipients: scheduleData.recipients,
      isActive: true,
      lastRun: null,
      nextRun: this.calculateNextRun(scheduleData.schedule),
      runCount: 0,
      metadata: {
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    // Save recurring export
    const savedRecurringExport = await this.recurringExportRepository.create(recurringExport);

    // Schedule first run
    await this.scheduleExportJob(savedRecurringExport);

    return savedRecurringExport;
  }
}

interface CreateExportData {
  name: string;
  description: string;
  type: ExportType;
  format: ExportFormat;
  query: ExportQuery;
  fields: ExportField[];
  options: ExportOptions;
  filters?: ExportFilter[];
  sorting?: ExportSorting[];
}

interface ExportResult {
  recordCount: number;
  file: ExportFile;
  downloadUrl: string;
  expiresAt: Date;
  checksum: string;
}

interface ExportFile {
  path: string;
  filename: string;
  size: number;
  mimeType: string;
  checksum: string;
  createdAt: Date;
}

interface RecurringExportData {
  name: string;
  description: string;
  exportConfig: CreateExportData;
  schedule: ScheduleConfig;
  recipients: string[];
}
```

---

## 🎨 **Import/Export Interface**

### **User Import Interface:**
```
┌─────────────────────────────────────────────────────────┐
│ 📥 User Import                           [Help] [Templates] │
├─────────────────────────────────────────────────────────┤
│ ┌─ File Upload ──────────────────────────────────────┐   │
│ │ 📁 Upload File:                                    │   │
│ │ ┌─────────────────────────────────────────────────┐ │   │
│ │ │ [📎 Choose File] or drag and drop here          │ │   │
│ │ │                                                │ │   │
│ │ │ Supported formats: CSV, Excel (.xlsx, .xls),   │ │   │
│ │ │ JSON, XML                                       │ │   │
│ │ │ Maximum file size: 50MB                        │ │   │
│ │ │ Maximum records: 100,000                       │ │   │
│ │ └─────────────────────────────────────────────────┘ │   │
│ │                                                   │   │
│ │ Selected: users_import_2023.csv (2.3MB, 5,678 rows) │   │
│ │ [Remove] [Preview] [Download Template]            │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Field Mapping ────────────────────────────────────┐   │
│ │ Map CSV columns to user fields:                    │   │
│ │                                                   │   │
│ │ CSV Column          → User Field      Required     │   │
│ │ first_name         → [First Name ▼]   ✅          │   │
│ │ last_name          → [Last Name ▼]    ✅          │   │
│ │ email_address      → [Email ▼]        ✅          │   │
│ │ phone              → [Phone ▼]        ❌          │   │
│ │ department         → [Department ▼]   ❌          │   │
│ │ job_title          → [Job Title ▼]    ❌          │   │
│ │ hire_date          → [Custom Field ▼] ❌          │   │
│ │ (unmapped)         → [Skip ▼]         -           │   │
│ │                                                   │   │
│ │ Default Values:                                    │   │
│ │ Status: [Active ▼] Role: [Subscriber ▼]           │   │
│ │ Group: [New Employees ▼] [+ Add Group]            │   │
│ │                                                   │   │
│ │ [Auto-Map Fields] [Save Mapping] [Load Mapping]   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Import Options ───────────────────────────────────┐   │
│ │ Validation Settings:                               │   │
│ │ ☑ Strict validation mode                           │   │
│ │ ☑ Skip invalid rows                                │   │
│ │ ☑ Validate email format                            │   │
│ │ ☑ Validate phone format                            │   │
│ │ Max errors before stopping: [100___]              │   │
│ │                                                   │   │
│ │ Duplicate Handling:                                │   │
│ │ ● Skip duplicates                                  │   │
│ │ ○ Update existing users                            │   │
│ │ ○ Create new users with suffix                     │   │
│ │ ○ Fail on duplicates                               │   │
│ │                                                   │   │
│ │ Post-Import Actions:                               │   │
│ │ ☑ Send welcome emails                              │   │
│ │ ☑ Assign default role                              │   │
│ │ ☑ Add to specified groups                          │   │
│ │ ☐ Force password reset                             │   │
│ │                                                   │   │
│ │ Processing:                                        │   │
│ │ Batch size: [500___] records per batch            │   │
│ │ ☑ Run as dry run first (preview only)             │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Preview & Validation ─────────────────────────────┐   │
│ │ 🔍 Import Preview (first 10 rows):                 │   │
│ │                                                   │   │
│ │ ✅ John Doe | john.doe@company.com | Marketing     │   │
│ │ ✅ Jane Smith | jane.smith@company.com | Sales     │   │
│ │ ⚠️  Mike Johnson | mike.johnson@ | Engineering     │   │
│ │    Warning: Invalid email format                  │   │
│ │ ✅ Sarah Wilson | sarah.w@company.com | HR         │   │
│ │ ❌ Bob Brown | bob.brown@company.com | Marketing   │   │
│ │    Error: Duplicate email address                 │   │
│ │                                                   │   │
│ │ Validation Summary:                                │   │
│ │ • Total rows: 5,678                               │   │
│ │ • Valid rows: 5,234 (92.2%)                       │   │
│ │ • Invalid rows: 234 (4.1%)                        │   │
│ │ • Duplicates: 210 (3.7%)                          │   │
│ │                                                   │   │
│ │ [View All Errors] [Download Error Report]         │   │
│ │                                                   │   │
│ │ [Start Import] [Run Dry Run] [Cancel]             │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### **User Export Interface:**
```
┌─────────────────────────────────────────────────────────┐
│ 📤 User Export                          [History] [Schedule] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Export Configuration ─────────────────────────────┐   │
│ │ Export Name: [User Export Dec 2023_____________]   │   │
│ │ Description:                                       │   │
│ │ ┌─────────────────────────────────────────────────┐ │   │
│ │ │ Monthly export of all active users with their  │ │   │
│ │ │ contact information and group memberships.     │ │   │
│ │ └─────────────────────────────────────────────────┘ │   │
│ │                                                   │   │
│ │ Export Type: [Filtered ▼] Format: [Excel ▼]       │   │
│ │ Encoding: [UTF-8 ▼] Compression: [ZIP ▼]          │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ User Selection ───────────────────────────────────┐   │
│ │ 👥 Users to Export: 2,456 users selected          │   │
│ │                                                   │   │
│ │ Filter by Status:                                  │   │
│ │ ☑ Active (2,234)   ☐ Inactive (156)              │   │
│ │ ☐ Suspended (45)   ☐ Pending (21)                │   │
│ │                                                   │   │
│ │ Filter by Role:                                    │   │
│ │ ☑ All Roles                                        │   │
│ │ ☐ Specific: [Administrator ▼] [+ Add Role]        │   │
│ │                                                   │   │
│ │ Filter by Group:                                   │   │
│ │ ☑ All Groups                                       │   │
│ │ ☐ Specific: [Marketing ▼] [+ Add Group]           │   │
│ │                                                   │   │
│ │ Date Range:                                        │   │
│ │ Created: [Jan 1, 2023 ▼] to [Dec 31, 2023 ▼]      │   │
│ │ Last Login: [Any time ▼]                           │   │
│ │                                                   │   │
│ │ Advanced Filters:                                  │   │
│ │ • Email verified: [Any ▼]                          │   │
│ │ • 2FA enabled: [Any ▼]                             │   │
│ │ • Has profile picture: [Any ▼]                     │   │
│ │                                                   │   │
│ │ [Preview Selection] [Save Filter] [Load Filter]   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Field Selection ──────────────────────────────────┐   │
│ │ 📋 Fields to Export:                               │   │
│ │                                                   │   │
│ │ Basic Information:                                 │   │
│ │ ☑ User ID          ☑ Username        ☑ Email      │   │
│ │ ☑ First Name       ☑ Last Name       ☑ Display Name│   │
│ │ ☑ Status           ☑ Email Verified  ☐ Avatar URL │   │
│ │                                                   │   │
│ │ Profile Information:                               │   │
│ │ ☑ Phone            ☑ Company         ☑ Job Title  │   │
│ │ ☑ Department       ☑ Location        ☐ Bio        │   │
│ │ ☐ Website          ☐ Social Links    ☐ Skills     │   │
│ │                                                   │   │
│ │ System Information:                                │   │
│ │ ☑ Created Date     ☑ Last Login      ☑ Login Count│   │
│ │ ☐ Last Updated     ☐ Password Changed ☐ 2FA Status│   │
│ │                                                   │   │
│ │ Relationships:                                     │   │
│ │ ☑ Roles            ☑ Groups          ☐ Permissions│   │
│ │ ☐ Created By       ☐ Manager         ☐ Team       │   │
│ │                                                   │   │
│ │ Custom Fields:                                     │   │
│ │ ☑ Employee ID      ☑ Hire Date       ☐ Salary     │   │
│ │ ☐ Performance      ☐ Notes           ☐ Tags       │   │
│ │                                                   │   │
│ │ [Select All] [Select None] [Save Template]        │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Export Options ───────────────────────────────────┐   │
│ │ File Options:                                      │   │
│ │ ☑ Include headers                                  │   │
│ │ ☑ Include metadata sheet                           │   │
│ │ Date format: [YYYY-MM-DD ▼]                        │   │
│ │ Timezone: [User's timezone ▼]                     │   │
│ │                                                   │   │
│ │ Privacy & Security:                                │   │
│ │ ☐ Anonymize personal data                          │   │
│ │ ☐ Encrypt file with password                       │   │
│ │ ☐ Remove sensitive fields                          │   │
│ │                                                   │   │
│ │ Delivery:                                          │   │
│ │ ● Download link (expires in 7 days)               │   │
│ │ ○ Email to: [admin@company.com______________]      │   │
│ │ ○ Save to server folder                            │   │
│ │                                                   │   │
│ │ [Start Export] [Schedule Export] [Cancel]         │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Import operations
POST   /api/users/import                 // Create new import
GET    /api/users/import/{id}            // Get import status
POST   /api/users/import/{id}/process    // Start import processing
DELETE /api/users/import/{id}            // Cancel import
GET    /api/users/import/{id}/results    // Get import results
POST   /api/users/import/preview         // Preview import file
GET    /api/users/import/templates       // Get import templates

// Export operations
POST   /api/users/export                 // Create new export
GET    /api/users/export/{id}            // Get export status
GET    /api/users/export/{id}/download   // Download export file
DELETE /api/users/export/{id}            // Delete export
POST   /api/users/export/schedule        // Schedule recurring export
GET    /api/users/export/history         // Get export history

// Bulk operations
POST   /api/users/bulk/update            // Bulk update users
POST   /api/users/bulk/delete            // Bulk delete users
POST   /api/users/bulk/assign-roles      // Bulk assign roles
POST   /api/users/bulk/assign-groups     // Bulk assign groups
```

### **Database Schema:**
```sql
-- User imports
CREATE TABLE user_imports (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  source VARCHAR(50) NOT NULL,
  file_info JSONB NOT NULL,
  mapping JSONB NOT NULL,
  validation JSONB NOT NULL,
  transformation JSONB DEFAULT '[]',
  options JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  progress JSONB DEFAULT '{}',
  results JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- User exports
CREATE TABLE user_exports (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  format VARCHAR(20) NOT NULL,
  query JSONB NOT NULL,
  fields JSONB NOT NULL,
  options JSONB NOT NULL,
  filters JSONB DEFAULT '[]',
  sorting JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'pending',
  progress JSONB DEFAULT '{}',
  result JSONB DEFAULT '{}',
  file_path VARCHAR(500),
  download_url VARCHAR(500),
  expires_at TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Import/Export logs
CREATE TABLE import_export_logs (
  id UUID PRIMARY KEY,
  operation_type VARCHAR(20) NOT NULL, -- import, export
  operation_id UUID NOT NULL,
  level VARCHAR(20) NOT NULL, -- info, warning, error
  message TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Recurring exports
CREATE TABLE recurring_exports (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  export_config JSONB NOT NULL,
  schedule JSONB NOT NULL,
  recipients JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_run TIMESTAMP,
  next_run TIMESTAMP,
  run_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- File uploads (temporary storage)
CREATE TABLE file_uploads (
  id UUID PRIMARY KEY,
  original_name VARCHAR(255) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  path VARCHAR(500) NOT NULL,
  size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  checksum VARCHAR(64),
  metadata JSONB DEFAULT '{}',
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Indexes for performance
CREATE INDEX idx_user_imports_status ON user_imports(status);
CREATE INDEX idx_user_imports_created_by ON user_imports(created_by);
CREATE INDEX idx_user_imports_created_at ON user_imports(created_at);
CREATE INDEX idx_user_exports_status ON user_exports(status);
CREATE INDEX idx_user_exports_created_by ON user_exports(created_by);
CREATE INDEX idx_user_exports_expires_at ON user_exports(expires_at);
CREATE INDEX idx_import_export_logs_operation ON import_export_logs(operation_type, operation_id);
CREATE INDEX idx_import_export_logs_created_at ON import_export_logs(created_at);
CREATE INDEX idx_recurring_exports_active ON recurring_exports(is_active);
CREATE INDEX idx_recurring_exports_next_run ON recurring_exports(next_run);
CREATE INDEX idx_file_uploads_expires_at ON file_uploads(expires_at);
CREATE INDEX idx_file_uploads_uploaded_by ON file_uploads(uploaded_by);
```

---

## 🔗 **Related Documentation**

- **[User Management](./management.md)** - User CRUD operations integration
- **[User Groups](./groups.md)** - Group import/export
- **[Roles & Permissions](./roles.md)** - Role assignment during import
- **[User Analytics](../01_analytics/user-analytics.md)** - Import/export analytics
- **[System Settings](../07_system/)** - Import/export configuration

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
