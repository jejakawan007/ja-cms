# 🏗️ Architecture Diagrams

> **Diagram Arsitektur Sistem JA-CMS**  
> Visual representation of system architecture for each feature category

---

## 📋 **Overview**

Dokumen ini menyediakan diagram arsitektur visual untuk setiap kategori fitur dalam JA-CMS. Setiap diagram menunjukkan flow data, komponen utama, dan interaksi antar sistem untuk memudahkan pemahaman dan development.

---

## 📊 **1. Analytics System Architecture**

### **Analytics Data Flow:**

```mermaid
graph TD
    A[User Request] --> B[Next.js Frontend]
    B --> C[API Gateway]
    C --> D[Authentication Middleware]
    D --> E[Route Handler]
    
    E --> F[Analytics Service]
    F --> G[Data Collector]
    F --> H[Event Processor]
    F --> I[Real-time Engine]
    
    G --> J[(PostgreSQL)]
    H --> K[(Redis Cache)]
    I --> L[WebSocket Server]
    
    J --> M[Analytics Database]
    M --> N[Page Views Table]
    M --> O[User Sessions Table]
    M --> P[Events Table]
    
    K --> Q[Real-time Data]
    L --> R[Dashboard Updates]
    
    F --> S[Report Generator]
    S --> T[PDF Reports]
    S --> U[CSV Exports]
    
    subgraph "Frontend Components"
        B --> V[Dashboard Component]
        B --> W[Charts Component]
        B --> X[Real-time Widget]
    end
    
    subgraph "Backend Services"
        F --> Y[Metrics Calculator]
        F --> Z[Trend Analyzer]
        F --> AA[Alert Manager]
    end
    
    subgraph "Data Storage"
        J
        K
        BB[(File Storage)]
    end
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style F fill:#e8f5e8
    style J fill:#fff3e0
    style K fill:#ffebee
```

### **Real-time Analytics Flow:**

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Analytics API
    participant R as Redis
    participant W as WebSocket
    participant D as Dashboard
    
    U->>F: Page Visit
    F->>A: Track Event
    A->>R: Store Real-time Data
    A->>W: Broadcast Update
    W->>D: Push Live Data
    D->>F: Update Charts
    F->>U: Show Live Stats
    
    Note over A,R: Event processing happens<br/>in background
    
    A->>A: Process Metrics
    A->>R: Update Aggregates
    A->>W: Send Processed Data
```

---

## 📝 **2. Content Management Architecture**

### **Content Management Flow:**

```mermaid
graph TD
    A[Content Editor] --> B[Rich Text Editor]
    B --> C[Content API]
    C --> D[Validation Layer]
    D --> E[Content Service]
    
    E --> F[Post Management]
    E --> G[Page Management]
    E --> H[Category System]
    E --> I[Tag System]
    
    F --> J[(Posts Table)]
    G --> K[(Pages Table)]
    H --> L[(Categories Table)]
    I --> M[(Tags Table)]
    
    E --> N[SEO Service]
    E --> O[Version Control]
    E --> P[Workflow Engine]
    
    N --> Q[Meta Generation]
    O --> R[(Revisions Table)]
    P --> S[Approval Process]
    
    subgraph "Content Types"
        F --> T[Blog Posts]
        F --> U[News Articles]
        G --> V[Static Pages]
        G --> W[Landing Pages]
    end
    
    subgraph "Content Features"
        N --> X[Auto SEO]
        O --> Y[Version History]
        P --> Z[Publishing Workflow]
    end
    
    subgraph "Database Layer"
        J
        K
        L
        M
        R
        AA[(Media Relations)]
    end
    
    style A fill:#e3f2fd
    style E fill:#e8f5e8
    style J fill:#fff3e0
```

### **Content Publishing Workflow:**

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> InReview: Submit for Review
    Draft --> Published: Direct Publish (Admin)
    InReview --> Draft: Request Changes
    InReview --> Approved: Approve Content
    Approved --> Published: Publish Content
    Published --> Archived: Archive Post
    Archived --> Published: Restore Post
    Published --> Draft: Unpublish
    
    Draft: 📝 Draft<br/>Editable by Author
    InReview: 👀 In Review<br/>Pending Approval
    Approved: ✅ Approved<br/>Ready to Publish
    Published: 🌐 Published<br/>Live on Website
    Archived: 📦 Archived<br/>Hidden from Public
```

---

## 🎨 **3. Media Management Architecture**

### **Media Processing Pipeline:**

```mermaid
graph LR
    A[File Upload] --> B[Validation]
    B --> C[Virus Scan]
    C --> D[File Processing]
    
    D --> E[Image Processor]
    D --> F[Video Processor]
    D --> G[Document Processor]
    
    E --> H[Thumbnail Generation]
    E --> I[Format Conversion]
    E --> J[Compression]
    
    F --> K[Video Thumbnails]
    F --> L[Format Conversion]
    F --> M[Compression]
    
    G --> N[Text Extraction]
    G --> O[Metadata Extraction]
    
    H --> P[(Media Storage)]
    I --> P
    J --> P
    K --> P
    L --> P
    M --> P
    N --> Q[(Search Index)]
    O --> R[(Metadata DB)]
    
    P --> S[CDN Distribution]
    S --> T[Global Delivery]
    
    subgraph "Processing Queue"
        D --> U[Job Queue]
        U --> V[Worker Processes]
        V --> W[Background Jobs]
    end
    
    style A fill:#e3f2fd
    style D fill:#e8f5e8
    style P fill:#fff3e0
    style S fill:#ffebee
```

### **Media Library Organization:**

```mermaid
graph TD
    A[Media Library] --> B[Folder Structure]
    A --> C[File Management]
    A --> D[Search System]
    
    B --> E[Root Folders]
    B --> F[Nested Folders]
    B --> G[Folder Permissions]
    
    C --> H[Upload Manager]
    C --> I[Bulk Operations]
    C --> J[File Metadata]
    
    D --> K[Full-text Search]
    D --> L[Visual Search]
    D --> M[Filter System]
    
    E --> N[/images]
    E --> O[/videos]
    E --> P[/documents]
    
    N --> Q[/blog]
    N --> R[/products]
    O --> S[/tutorials]
    
    subgraph "File Types"
        T[Images: JPG, PNG, WebP]
        U[Videos: MP4, WebM]
        V[Documents: PDF, DOC]
        W[Audio: MP3, WAV]
    end
    
    subgraph "Operations"
        I --> X[Move Files]
        I --> Y[Delete Files]
        I --> Z[Tag Files]
        I --> AA[Download ZIP]
    end
    
    style A fill:#e3f2fd
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
```

---

## 🎭 **4. Theme System Architecture**

### **Theme Customization Flow:**

```mermaid
graph TD
    A[Theme Customizer] --> B[Control Panels]
    B --> C[Live Preview]
    C --> D[Setting Changes]
    D --> E[CSS Generation]
    
    E --> F[Theme Compiler]
    F --> G[CSS Variables]
    F --> H[SCSS Processing]
    F --> I[Asset Optimization]
    
    G --> J[Custom Properties]
    H --> K[Compiled Styles]
    I --> L[Minified Assets]
    
    J --> M[Browser Rendering]
    K --> M
    L --> M
    
    D --> N[Settings Storage]
    N --> O[(Customizer Settings)]
    
    subgraph "Customizer Controls"
        B --> P[Color Picker]
        B --> Q[Typography Panel]
        B --> R[Layout Options]
        B --> S[Widget Areas]
    end
    
    subgraph "Theme Assets"
        F --> T[CSS Files]
        F --> U[JS Files]
        F --> V[Font Files]
        F --> W[Image Assets]
    end
    
    subgraph "Output Generation"
        E --> X[Real-time CSS]
        E --> Y[Production Build]
        E --> Z[Cache Invalidation]
    end
    
    style A fill:#e3f2fd
    style E fill:#e8f5e8
    style N fill:#fff3e0
    style M fill:#ffebee
```

### **Theme Structure:**

```mermaid
graph LR
    A[Theme Package] --> B[Templates]
    A --> C[Assets]
    A --> D[Configuration]
    
    B --> E[Layout Templates]
    B --> F[Page Templates]
    B --> G[Component Templates]
    
    E --> H[header.tsx]
    E --> I[footer.tsx]
    E --> J[sidebar.tsx]
    
    F --> K[home.tsx]
    F --> L[post.tsx]
    F --> M[page.tsx]
    
    G --> N[card.tsx]
    G --> O[button.tsx]
    G --> P[form.tsx]
    
    C --> Q[Styles]
    C --> R[Scripts]
    C --> S[Images]
    
    Q --> T[main.scss]
    Q --> U[components.scss]
    Q --> V[variables.scss]
    
    D --> W[theme.json]
    D --> X[customizer.json]
    D --> Y[package.json]
    
    style A fill:#e3f2fd
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
```

---

## 👥 **5. User Management Architecture**

### **Authentication & Authorization Flow:**

```mermaid
graph TD
    A[Login Request] --> B[Auth Middleware]
    B --> C[Credential Validation]
    C --> D[Password Verification]
    D --> E[2FA Check]
    
    E --> F[JWT Generation]
    F --> G[Session Creation]
    G --> H[User Context]
    
    H --> I[Permission Check]
    I --> J[Role Validation]
    J --> K[Resource Access]
    
    C --> L[(User Database)]
    E --> M[(2FA Storage)]
    G --> N[(Session Store)]
    I --> O[(Permissions DB)]
    
    subgraph "Authentication Methods"
        P[Email/Password]
        Q[Magic Link]
        R[OAuth (Google/GitHub)]
        S[WebAuthn]
    end
    
    subgraph "Security Features"
        T[Rate Limiting]
        U[Brute Force Protection]
        V[Account Lockout]
        W[Session Management]
    end
    
    subgraph "User Roles"
        X[Super Admin]
        Y[Admin]
        Z[Editor]
        AA[Author]
        BB[Subscriber]
    end
    
    style A fill:#e3f2fd
    style B fill:#f3e5f5
    style F fill:#e8f5e8
    style L fill:#fff3e0
```

### **Role-Based Access Control (RBAC):**

```mermaid
graph TD
    A[User] --> B[Assigned Roles]
    B --> C[Role Permissions]
    C --> D[Resource Access]
    
    B --> E[Admin Role]
    B --> F[Editor Role]
    B --> G[Author Role]
    
    E --> H[Full System Access]
    F --> I[Content Management]
    G --> J[Own Content Only]
    
    H --> K[User Management]
    H --> L[System Settings]
    H --> M[All Content]
    
    I --> N[Edit All Posts]
    I --> O[Publish Content]
    I --> P[Manage Media]
    
    J --> Q[Create Posts]
    J --> R[Edit Own Posts]
    J --> S[Upload Media]
    
    subgraph "Permission Types"
        T[Create]
        U[Read]
        V[Update]
        W[Delete]
    end
    
    subgraph "Resources"
        X[Posts]
        Y[Pages]
        Z[Users]
        AA[Settings]
        BB[Media]
    end
    
    style A fill:#e3f2fd
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
```

---

## 🛡️ **6. Security Monitoring Architecture**

### **Security Event Processing:**

```mermaid
graph TD
    A[Security Events] --> B[Event Collector]
    B --> C[Event Classifier]
    C --> D[Threat Detection]
    D --> E[Risk Assessment]
    
    E --> F[Alert Generator]
    F --> G[Incident Creation]
    G --> H[Response Automation]
    
    B --> I[(Event Storage)]
    D --> J[Rule Engine]
    E --> K[ML Models]
    F --> L[Notification System]
    
    H --> M[Block IP]
    H --> N[Lock Account]
    H --> O[Quarantine File]
    H --> P[Notify Admin]
    
    subgraph "Event Sources"
        Q[Login Attempts]
        R[File Changes]
        S[API Requests]
        T[System Logs]
    end
    
    subgraph "Detection Methods"
        U[Signature-based]
        V[Anomaly Detection]
        W[Behavioral Analysis]
        X[Threat Intelligence]
    end
    
    subgraph "Response Actions"
        M
        N
        O
        P
        Y[Evidence Collection]
    end
    
    style A fill:#e3f2fd
    style D fill:#f3e5f5
    style H fill:#e8f5e8
    style I fill:#fff3e0
```

### **Security Dashboard Data Flow:**

```mermaid
graph LR
    A[Security Events] --> B[Data Aggregator]
    B --> C[Metrics Calculator]
    C --> D[Dashboard API]
    D --> E[Real-time Updates]
    
    B --> F[Threat Map]
    B --> G[Event Timeline]
    B --> H[Alert Summary]
    
    C --> I[Security Score]
    C --> J[Trend Analysis]
    C --> K[Risk Metrics]
    
    E --> L[WebSocket Server]
    L --> M[Dashboard Client]
    M --> N[Live Charts]
    
    subgraph "Data Sources"
        O[Security Events]
        P[System Logs]
        Q[Threat Intel]
        R[User Activity]
    end
    
    subgraph "Visualizations"
        F --> S[Geographic Map]
        G --> T[Event Timeline]
        N --> U[Real-time Charts]
        H --> V[Alert Cards]
    end
    
    style A fill:#e3f2fd
    style C fill:#f3e5f5
    style E fill:#e8f5e8
    style M fill:#fff3e0
```

---

## ⚙️ **7. System Integration Architecture**

### **Overall System Architecture:**

```mermaid
graph TB
    A[Load Balancer] --> B[Next.js Frontend]
    A --> C[API Gateway]
    
    C --> D[Authentication Service]
    C --> E[Content Service]
    C --> F[Media Service]
    C --> G[Analytics Service]
    C --> H[Security Service]
    
    D --> I[(User Database)]
    E --> J[(Content Database)]
    F --> K[(Media Storage)]
    G --> L[(Analytics Database)]
    H --> M[(Security Database)]
    
    B --> N[React Components]
    N --> O[ShadCN/UI]
    N --> P[Custom Hooks]
    
    subgraph "Backend Services"
        D --> Q[JWT Auth]
        E --> R[CMS Engine]
        F --> S[File Processing]
        G --> T[Data Collection]
        H --> U[Threat Detection]
    end
    
    subgraph "Data Layer"
        I --> V[PostgreSQL]
        J --> V
        L --> V
        M --> V
        K --> W[File System/S3]
        X[(Redis Cache)]
    end
    
    subgraph "External Services"
        Y[CDN]
        Z[Email Service]
        AA[Cloud Storage]
        BB[Monitoring]
    end
    
    style A fill:#e3f2fd
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style V fill:#fff3e0
```

### **API Architecture:**

```mermaid
graph TD
    A[Client Request] --> B[API Gateway]
    B --> C[Rate Limiting]
    C --> D[Authentication]
    D --> E[Authorization]
    E --> F[Request Validation]
    
    F --> G[Route Handler]
    G --> H[Business Logic]
    H --> I[Data Access Layer]
    I --> J[(Database)]
    
    H --> K[External APIs]
    H --> L[Cache Layer]
    L --> M[(Redis)]
    
    G --> N[Response Formatting]
    N --> O[Error Handling]
    O --> P[API Response]
    
    subgraph "Middleware Stack"
        C --> Q[CORS]
        C --> R[Compression]
        C --> S[Logging]
        C --> T[Security Headers]
    end
    
    subgraph "API Features"
        U[RESTful Endpoints]
        V[GraphQL Support]
        W[Real-time WebSockets]
        X[File Upload]
    end
    
    subgraph "Response Types"
        Y[JSON API]
        Z[File Download]
        AA[Server-Sent Events]
        BB[WebSocket Messages]
    end
    
    style A fill:#e3f2fd
    style B fill:#f3e5f5
    style H fill:#e8f5e8
    style J fill:#fff3e0
```

---

## 📱 **8. Frontend Architecture**

### **Next.js App Structure:**

```mermaid
graph TD
    A[Next.js App] --> B[App Router]
    B --> C[Layout Components]
    B --> D[Page Components]
    B --> E[API Routes]
    
    C --> F[Root Layout]
    C --> G[Dashboard Layout]
    C --> H[Auth Layout]
    
    D --> I[Home Page]
    D --> J[Dashboard Pages]
    D --> K[Content Pages]
    D --> L[Settings Pages]
    
    E --> M[Auth API]
    E --> N[Content API]
    E --> O[Media API]
    
    subgraph "State Management"
        P[Zustand Store]
        Q[React Query]
        R[Context API]
    end
    
    subgraph "UI Components"
        S[ShadCN/UI]
        T[Custom Components]
        U[Form Components]
        V[Chart Components]
    end
    
    subgraph "Utilities"
        W[Custom Hooks]
        X[API Clients]
        Y[Type Definitions]
        Z[Utils Functions]
    end
    
    style A fill:#e3f2fd
    style B fill:#f3e5f5
    style P fill:#e8f5e8
    style S fill:#fff3e0
```

---

## 🔗 **Integration Patterns**

### **Microservices Communication:**

```mermaid
sequenceDiagram
    participant C as Client
    participant G as API Gateway
    participant A as Auth Service
    participant CS as Content Service
    participant MS as Media Service
    participant AS as Analytics Service
    
    C->>G: Request with JWT
    G->>A: Validate Token
    A-->>G: Token Valid
    
    G->>CS: Get Content
    CS->>MS: Get Media URLs
    MS-->>CS: Media Data
    CS-->>G: Content + Media
    
    G->>AS: Track Page View
    AS-->>G: Tracking Confirmed
    
    G-->>C: Complete Response
    
    Note over G,AS: Services communicate<br/>asynchronously for<br/>non-critical operations
```

---

**Diagram Legend:**
- 🟦 **Blue**: User Interface / Frontend
- 🟪 **Purple**: API / Gateway Layer  
- 🟩 **Green**: Business Logic / Services
- 🟨 **Orange**: Data Storage / Database
- 🟥 **Red**: External Services / CDN

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active

