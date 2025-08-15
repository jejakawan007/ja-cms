# 📋 Analytics Reports System

> **Sistem Pelaporan Analytics Komprehensif JA-CMS**  
> Custom reports, automated scheduling, dan advanced data visualization

---

## 📋 **Deskripsi**

Analytics Reports System menyediakan kemampuan untuk membuat, mengelola, dan mendistribusikan laporan analytics yang komprehensif. Sistem ini mendukung custom reports, automated scheduling, berbagai format export, dan advanced visualizations untuk membantu decision making yang data-driven.

---

## ⭐ **Core Features**

### **1. 📊 Site Analytics Reports**

#### **Traffic Analytics:**
```typescript
interface TrafficAnalytics {
  overview: {
    totalPageViews: number;
    uniqueVisitors: number;
    sessions: number;
    averageSessionDuration: number;
    bounceRate: number;
    newVsReturning: {
      newVisitors: number;
      returningVisitors: number;
    };
  };
  traffic: {
    sources: TrafficSource[];
    channels: TrafficChannel[];
    referrers: Referrer[];
  };
  geography: {
    countries: CountryData[];
    cities: CityData[];
  };
  technology: {
    browsers: BrowserData[];
    operatingSystems: OSData[];
    devices: DeviceData[];
    screenResolutions: ScreenData[];
  };
  timeRange: {
    start: Date;
    end: Date;
  };
}

interface TrafficSource {
  source: string;
  medium: string;
  sessions: number;
  percentage: number;
  bounceRate: number;
  avgSessionDuration: number;
}
```

#### **Content Analytics:**
```typescript
interface ContentAnalytics {
  pages: PageAnalytics[];
  posts: PostAnalytics[];
  categories: CategoryAnalytics[];
  tags: TagAnalytics[];
  search: SearchAnalytics;
}

interface PageAnalytics {
  id: string;
  title: string;
  url: string;
  pageViews: number;
  uniquePageViews: number;
  averageTimeOnPage: number;
  bounceRate: number;
  exitRate: number;
  socialShares: SocialShareData;
  comments: number;
  conversions: number;
}

interface SearchAnalytics {
  topSearchTerms: SearchTerm[];
  noResultsSearches: SearchTerm[];
  searchResultsClicks: number;
  averageResultsPerSearch: number;
  searchToContentRatio: number;
}
```

### **2. 👥 User Behavior Reports**

#### **User Journey Analysis:**
```typescript
interface UserAnalytics {
  demographics: {
    ageGroups: AgeGroupData[];
    genders: GenderData[];
    interests: InterestData[];
  };
  behavior: {
    sessions: SessionData[];
    journeys: UserJourney[];
    events: EventData[];
    conversions: ConversionData[];
  };
  segmentation: {
    segments: UserSegment[];
    cohorts: CohortData[];
  };
}

interface UserJourney {
  sessionId: string;
  userId?: string;
  path: PageVisit[];
  duration: number;
  converted: boolean;
  conversionValue?: number;
}

interface PageVisit {
  page: string;
  timestamp: Date;
  duration: number;
  events: string[];
}
```

### **3. 🚀 Performance Reports**

#### **Site Performance Metrics:**
```typescript
interface PerformanceAnalytics {
  coreWebVitals: {
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
    firstContentfulPaint: number;
  };
  loadTimes: {
    averagePageLoad: number;
    serverResponseTime: number;
    domContentLoaded: number;
    timeToInteractive: number;
  };
  errors: {
    count404: number;
    count500: number;
    jsErrors: JSError[];
    brokenLinks: string[];
  };
  uptime: {
    availability: number;
    downtimeEvents: DowntimeEvent[];
    responseTime: number;
  };
}
```

### **4. 📋 Custom Report Builder**

#### **Report Configuration:**
```typescript
interface Report {
  id: string;
  name: string;
  description: string;
  type: 'dashboard' | 'scheduled' | 'custom';
  config: ReportConfig;
  schedule?: ReportSchedule;
  recipients?: string[];
  lastGenerated?: Date;
  createdBy: string;
  createdAt: Date;
}

interface ReportConfig {
  dateRange: DateRange;
  metrics: string[];
  dimensions: string[];
  filters: ReportFilter[];
  visualization: 'table' | 'chart' | 'graph';
  format: 'pdf' | 'excel' | 'csv' | 'json';
}

interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  timezone: string;
}
```

#### **Report Builder Implementation:**
```typescript
export class ReportBuilder {
  private config: ReportConfig;
  private dataProcessor: AnalyticsDataProcessor;

  constructor() {
    this.config = this.getDefaultConfig();
    this.dataProcessor = new AnalyticsDataProcessor();
  }

  setDateRange(start: Date, end: Date): ReportBuilder {
    this.config.dateRange = { start, end };
    return this;
  }

  addMetric(metric: string): ReportBuilder {
    if (!this.config.metrics.includes(metric)) {
      this.config.metrics.push(metric);
    }
    return this;
  }

  addDimension(dimension: string): ReportBuilder {
    if (!this.config.dimensions.includes(dimension)) {
      this.config.dimensions.push(dimension);
    }
    return this;
  }

  addFilter(filter: ReportFilter): ReportBuilder {
    this.config.filters.push(filter);
    return this;
  }

  setVisualization(type: 'table' | 'chart' | 'graph'): ReportBuilder {
    this.config.visualization = type;
    return this;
  }

  setFormat(format: 'pdf' | 'excel' | 'csv' | 'json'): ReportBuilder {
    this.config.format = format;
    return this;
  }

  async generate(): Promise<ReportResult> {
    // Validate configuration
    this.validateConfig();

    // Fetch data based on configuration
    const rawData = await this.dataProcessor.fetchData(this.config);

    // Process and format data
    const processedData = await this.dataProcessor.processData(rawData, this.config);

    // Generate visualization
    const visualization = await this.generateVisualization(processedData);

    // Export in requested format
    const exportedFile = await this.exportReport(processedData, visualization);

    return {
      success: true,
      data: processedData,
      visualization,
      file: exportedFile,
      generatedAt: new Date()
    };
  }

  private async generateVisualization(data: any): Promise<Visualization> {
    switch (this.config.visualization) {
      case 'chart':
        return this.generateChart(data);
      case 'graph':
        return this.generateGraph(data);
      case 'table':
        return this.generateTable(data);
      default:
        return this.generateTable(data);
    }
  }

  private async exportReport(data: any, visualization: Visualization): Promise<ExportedFile> {
    switch (this.config.format) {
      case 'pdf':
        return this.exportToPDF(data, visualization);
      case 'excel':
        return this.exportToExcel(data);
      case 'csv':
        return this.exportToCSV(data);
      case 'json':
        return this.exportToJSON(data);
      default:
        return this.exportToJSON(data);
    }
  }
}
```

### **5. ⏰ Scheduled Reports**

#### **Report Scheduling System:**
```typescript
export class ReportScheduler {
  private cron: CronJob;
  private reportQueue: Queue;

  constructor() {
    this.reportQueue = new Queue('report-generation');
    this.setupCronJobs();
  }

  scheduleReport(report: Report): void {
    if (!report.schedule) return;

    const cronExpression = this.buildCronExpression(report.schedule);
    
    const job = new CronJob(cronExpression, async () => {
      await this.generateAndSendReport(report);
    }, null, true, report.schedule.timezone);

    // Store job reference for management
    this.storeCronJob(report.id, job);
  }

  private buildCronExpression(schedule: ReportSchedule): string {
    const { frequency, time, dayOfWeek, dayOfMonth } = schedule;
    const [hour, minute] = time.split(':').map(Number);

    switch (frequency) {
      case 'daily':
        return `${minute} ${hour} * * *`;
      case 'weekly':
        return `${minute} ${hour} * * ${dayOfWeek}`;
      case 'monthly':
        return `${minute} ${hour} ${dayOfMonth} * *`;
      default:
        throw new Error(`Unsupported frequency: ${frequency}`);
    }
  }

  private async generateAndSendReport(report: Report): Promise<void> {
    try {
      // Add to queue for processing
      await this.reportQueue.add('generate-report', {
        reportId: report.id,
        scheduledAt: new Date()
      });

      // Log successful scheduling
      console.log(`Report ${report.name} scheduled for generation`);
    } catch (error) {
      console.error(`Failed to schedule report ${report.name}:`, error);
    }
  }

  async processReportGeneration(job: any): Promise<void> {
    const { reportId, scheduledAt } = job.data;
    
    try {
      // Get report configuration
      const report = await this.getReportById(reportId);
      if (!report) {
        throw new Error(`Report ${reportId} not found`);
      }

      // Generate report
      const builder = new ReportBuilder();
      const result = await builder
        .setDateRange(this.calculateDateRange(report.config.dateRange))
        .addMetrics(report.config.metrics)
        .addDimensions(report.config.dimensions)
        .setFormat(report.config.format)
        .generate();

      // Send to recipients
      if (report.recipients && report.recipients.length > 0) {
        await this.sendReportToRecipients(report, result);
      }

      // Update last generated timestamp
      await this.updateReportLastGenerated(reportId, new Date());

    } catch (error) {
      console.error(`Failed to generate report ${reportId}:`, error);
      throw error;
    }
  }

  private async sendReportToRecipients(report: Report, result: ReportResult): Promise<void> {
    const emailService = new EmailService();
    
    for (const recipient of report.recipients!) {
      await emailService.sendEmail({
        to: recipient,
        subject: `Analytics Report: ${report.name}`,
        template: 'analytics-report',
        data: {
          reportName: report.name,
          generatedAt: result.generatedAt,
          summary: this.generateReportSummary(result.data)
        },
        attachments: [{
          filename: `${report.name}-${format(result.generatedAt, 'yyyy-MM-dd')}.${report.config.format}`,
          content: result.file.buffer
        }]
      });
    }
  }
}
```

---

## 🎨 **Reports Interface**

### **Report Builder Interface:**
```
┌─────────────────────────────────────────────────────────┐
│ 📋 Report Builder                         [Save] [Generate] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Report Configuration ─────────────────────────────┐   │
│ │ Report Name: [Monthly Analytics Report_________]   │   │
│ │ Description: [Comprehensive monthly overview___]   │   │
│ │ Date Range: [Last 30 days ▼]                      │   │
│ │ Custom Range: [Jan 1, 2024] to [Jan 31, 2024]    │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Metrics Selection ────────────────────────────────┐   │
│ │ ☑ Page Views        ☑ Unique Visitors             │   │
│ │ ☑ Sessions          ☑ Bounce Rate                 │   │
│ │ ☑ Avg Session Time  ☐ Conversion Rate             │   │
│ │ ☐ Social Shares     ☐ Download Count              │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Dimensions & Filters ─────────────────────────────┐   │
│ │ Group by: [Page ▼] [Country ▼] [Device ▼]         │   │
│ │ Filters:                                           │   │
│ │ • Traffic Source: [All ▼]                         │   │
│ │ • Device Type: [All ▼]                            │   │
│ │ • Country: [All ▼]                                │   │
│ │ [+ Add Filter]                                     │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Output Options ───────────────────────────────────┐   │
│ │ Visualization: ○ Table ○ Chart ○ Graph            │   │
│ │ Format: ○ PDF ○ Excel ○ CSV ○ JSON                │   │
│ │ Schedule: ☐ Enable scheduling                      │   │
│ │   Frequency: [Monthly ▼] Time: [09:00]            │   │
│ │   Recipients: [admin@example.com_______________]   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Preview ──────────────────────────────────────────┐   │
│ │ [Loading preview...] or [Chart/Table preview]      │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### **Reports Management:**
```
┌─────────────────────────────────────────────────────────┐
│ 📋 Reports Management               [New Report] [Import] │
├─────────────────────────────────────────────────────────┤
│ [Search reports...] [All ▼] [Scheduled ▼] [My Reports ▼] │
├─────────────────────────────────────────────────────────┤
│ Name                    Type      Schedule    Last Run   │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📊 Monthly Overview    Custom     Monthly     Jan 1   │ │
│ │ 📈 Traffic Report      Standard   Weekly      Jan 8   │ │
│ │ 📄 Content Analysis    Custom     Daily       Jan 9   │ │
│ │ 🚀 Performance Report  Standard   Manual      Jan 5   │ │
│ │ 👥 User Behavior       Custom     Bi-weekly   Jan 3   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─ Report Templates ─────────────────────────────────┐   │
│ │ 📊 Executive Summary   📈 Traffic Analysis         │   │
│ │ 📄 Content Performance 🚀 Site Performance        │   │
│ │ 👥 User Demographics   💰 Conversion Tracking      │   │
│ │ 📱 Mobile Analytics    🔍 SEO Report               │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ Showing 1-10 of 23 reports                   [1][2][3] │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Reports management
GET    /api/reports                    // List all reports
POST   /api/reports                    // Create new report
GET    /api/reports/{id}               // Get report details
PUT    /api/reports/{id}               // Update report
DELETE /api/reports/{id}               // Delete report

// Report generation
POST   /api/reports/{id}/generate      // Generate report
GET    /api/reports/{id}/status        // Get generation status
GET    /api/reports/{id}/download      // Download generated report

// Report scheduling
POST   /api/reports/{id}/schedule      // Schedule report
DELETE /api/reports/{id}/schedule      // Unschedule report
GET    /api/reports/scheduled          // List scheduled reports

// Report templates
GET    /api/report-templates           // List templates
POST   /api/report-templates           // Create template
GET    /api/report-templates/{id}      // Get template
```

### **Database Schema:**
```sql
-- Reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  config JSONB NOT NULL,
  schedule JSONB,
  recipients TEXT[],
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_generated TIMESTAMP
);

-- Report executions
CREATE TABLE report_executions (
  id UUID PRIMARY KEY,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  file_path TEXT,
  file_size INTEGER,
  error_message TEXT,
  execution_time INTEGER, -- milliseconds
  generated_by UUID REFERENCES users(id)
);

-- Report templates
CREATE TABLE report_templates (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  config JSONB NOT NULL,
  preview_image TEXT,
  is_system BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  usage_count INTEGER DEFAULT 0
);

-- Scheduled jobs
CREATE TABLE scheduled_jobs (
  id UUID PRIMARY KEY,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  job_id VARCHAR(255) UNIQUE, -- cron job ID
  schedule JSONB NOT NULL,
  enabled BOOLEAN DEFAULT true,
  last_run TIMESTAMP,
  next_run TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Report Export Services:**
```typescript
export class ReportExportService {
  async exportToPDF(data: any, visualization: Visualization): Promise<ExportedFile> {
    const pdf = new PDFDocument();
    const stream = new PassThrough();
    
    pdf.pipe(stream);
    
    // Add header
    pdf.fontSize(20).text('Analytics Report', 50, 50);
    pdf.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80);
    
    // Add summary
    if (data.summary) {
      pdf.fontSize(16).text('Executive Summary', 50, 120);
      pdf.fontSize(11).text(data.summary, 50, 140, { width: 500 });
    }
    
    // Add charts/tables
    let yPosition = 200;
    if (visualization.charts) {
      for (const chart of visualization.charts) {
        pdf.fontSize(14).text(chart.title, 50, yPosition);
        // Add chart image or table data
        yPosition += 200;
      }
    }
    
    pdf.end();
    
    const buffer = await this.streamToBuffer(stream);
    
    return {
      filename: `report-${Date.now()}.pdf`,
      buffer,
      mimeType: 'application/pdf',
      size: buffer.length
    };
  }

  async exportToExcel(data: any): Promise<ExportedFile> {
    const workbook = new ExcelJS.Workbook();
    
    // Summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.addRow(['Metric', 'Value', 'Change']);
    
    if (data.metrics) {
      Object.entries(data.metrics).forEach(([key, value]: [string, any]) => {
        summarySheet.addRow([
          key,
          value.current,
          value.change ? `${value.change > 0 ? '+' : ''}${value.change}%` : 'N/A'
        ]);
      });
    }
    
    // Detailed data sheets
    if (data.details) {
      Object.entries(data.details).forEach(([sheetName, sheetData]: [string, any]) => {
        const sheet = workbook.addWorksheet(sheetName);
        
        if (Array.isArray(sheetData) && sheetData.length > 0) {
          // Add headers
          const headers = Object.keys(sheetData[0]);
          sheet.addRow(headers);
          
          // Add data rows
          sheetData.forEach(row => {
            sheet.addRow(headers.map(header => row[header]));
          });
        }
      });
    }
    
    const buffer = await workbook.xlsx.writeBuffer();
    
    return {
      filename: `report-${Date.now()}.xlsx`,
      buffer: Buffer.from(buffer),
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: buffer.byteLength
    };
  }

  async exportToCSV(data: any): Promise<ExportedFile> {
    let csvContent = '';
    
    // Add summary data
    if (data.summary) {
      csvContent += 'Summary\n';
      csvContent += 'Metric,Value,Change\n';
      
      Object.entries(data.summary).forEach(([key, value]: [string, any]) => {
        csvContent += `"${key}","${value.current}","${value.change || 'N/A'}"\n`;
      });
      
      csvContent += '\n';
    }
    
    // Add detailed data
    if (data.details && Array.isArray(data.details)) {
      const headers = Object.keys(data.details[0] || {});
      csvContent += headers.join(',') + '\n';
      
      data.details.forEach((row: any) => {
        const values = headers.map(header => `"${row[header] || ''}"`);
        csvContent += values.join(',') + '\n';
      });
    }
    
    const buffer = Buffer.from(csvContent, 'utf8');
    
    return {
      filename: `report-${Date.now()}.csv`,
      buffer,
      mimeType: 'text/csv',
      size: buffer.length
    };
  }
}

interface ExportedFile {
  filename: string;
  buffer: Buffer;
  mimeType: string;
  size: number;
}
```

---

## 🔗 **Related Documentation**

- **[Analytics Dashboard](./dashboard.md)** - Real-time analytics dashboard
- **[Data Collection](../06_security/monitoring.md)** - Analytics data security
- **[User Management](../05_users/)** - User analytics and segmentation
- **[Performance Monitoring](../08_tools/)** - Site performance analytics

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
