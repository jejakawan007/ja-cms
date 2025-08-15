# 🔗 Plugin Hooks & API System

> **Advanced Plugin Integration JA-CMS**  
> Comprehensive hooks system dengan event-driven architecture dan powerful API integration

---

## 📋 **Deskripsi**

Plugin Hooks & API System menyediakan comprehensive integration framework untuk JA-CMS plugins dengan advanced hook system, event-driven architecture, powerful API endpoints, dan secure plugin communication untuk memungkinkan seamless plugin integration dan extensibility.

---

## ⭐ **Core Features**

### **1. 🎣 Advanced Hook System**

#### **Hook System Architecture:**
```typescript
interface HookSystem {
  hooks: Map<string, Hook>;
  filters: Map<string, Filter>;
  actions: Map<string, Action>;
  events: Map<string, Event>;
  middleware: Map<string, Middleware>;
  interceptors: Map<string, Interceptor>;
  scheduler: HookScheduler;
  priorityManager: PriorityManager;
}

interface Hook {
  name: string;
  type: HookType;
  description: string;
  parameters: HookParameter[];
  returnType: HookReturnType;
  callbacks: HookCallback[];
  middleware: HookMiddleware[];
  priority: number;
  async: boolean;
  deprecated: boolean;
  version: string;
  category: HookCategory;
  tags: string[];
  documentation: HookDocumentation;
  examples: HookExample[];
  metadata: HookMetadata;
}

interface HookCallback {
  id: string;
  pluginId: string;
  callback: Function;
  priority: number;
  async: boolean;
  conditions: HookCondition[];
  timeout: number;
  retries: number;
  errorHandler?: ErrorHandler;
  metadata: CallbackMetadata;
  registeredAt: Date;
  lastExecuted?: Date;
  executionCount: number;
  averageExecutionTime: number;
}

interface HookParameter {
  name: string;
  type: ParameterType;
  description: string;
  required: boolean;
  default?: any;
  validation?: ValidationRule[];
  examples: any[];
}

interface HookCondition {
  type: ConditionType;
  field: string;
  operator: ConditionOperator;
  value: any;
  negated: boolean;
}

interface Filter extends Hook {
  type: 'filter';
  initialValue: any;
  modifiable: boolean;
  chainable: boolean;
}

interface Action extends Hook {
  type: 'action';
  blocking: boolean;
  cancellable: boolean;
  bubbles: boolean;
}

interface Event extends Hook {
  type: 'event';
  bubbles: boolean;
  cancellable: boolean;
  defaultPrevented: boolean;
  propagationStopped: boolean;
  data: EventData;
}

type HookType = 'filter' | 'action' | 'event' | 'middleware';
type HookCategory = 'content' | 'user' | 'system' | 'ui' | 'api' | 'database' | 'security' | 'performance';
type ParameterType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function' | 'any';
type ConditionType = 'user_role' | 'user_capability' | 'post_type' | 'page_template' | 'custom';
type ConditionOperator = 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'greater' | 'less';
```

#### **Hook Manager Service:**
```typescript
export class HookManagerService {
  private hooks: Map<string, Hook>;
  private callbacks: Map<string, HookCallback[]>;
  private middleware: Map<string, HookMiddleware[]>;
  private eventEmitter: EventEmitter;
  private priorityManager: PriorityManager;
  private scheduler: HookScheduler;
  private metricsCollector: HookMetricsCollector;
  private securityValidator: HookSecurityValidator;

  constructor() {
    this.hooks = new Map();
    this.callbacks = new Map();
    this.middleware = new Map();
    this.eventEmitter = new EventEmitter();
    this.priorityManager = new PriorityManager();
    this.scheduler = new HookScheduler();
    this.metricsCollector = new HookMetricsCollector();
    this.securityValidator = new HookSecurityValidator();
    
    this.initializeBuiltinHooks();
  }

  async addFilter(
    hookName: string, 
    callback: Function, 
    priority: number = 10, 
    pluginId?: string
  ): Promise<string> {
    try {
      // Validate hook exists
      const hook = this.hooks.get(hookName);
      if (!hook || hook.type !== 'filter') {
        throw new Error(`Filter hook '${hookName}' not found`);
      }

      // Validate callback
      const validation = await this.validateCallback(callback, hook);
      if (!validation.valid) {
        throw new Error(`Invalid callback: ${validation.errors.join(', ')}`);
      }

      // Security check
      const securityCheck = await this.securityValidator.validateCallback(callback, pluginId);
      if (!securityCheck.safe) {
        throw new Error(`Security validation failed: ${securityCheck.reason}`);
      }

      // Create callback entry
      const callbackEntry: HookCallback = {
        id: this.generateCallbackId(),
        pluginId: pluginId || 'unknown',
        callback,
        priority,
        async: this.isAsyncFunction(callback),
        conditions: [],
        timeout: hook.async ? 5000 : 1000,
        retries: 0,
        metadata: {
          registeredBy: pluginId,
          registrationTime: new Date()
        },
        registeredAt: new Date(),
        executionCount: 0,
        averageExecutionTime: 0
      };

      // Add to callbacks
      if (!this.callbacks.has(hookName)) {
        this.callbacks.set(hookName, []);
      }
      
      const callbacks = this.callbacks.get(hookName)!;
      callbacks.push(callbackEntry);
      
      // Sort by priority
      callbacks.sort((a, b) => a.priority - b.priority);

      // Log registration
      await this.metricsCollector.recordHookRegistration(hookName, callbackEntry);

      return callbackEntry.id;

    } catch (error) {
      console.error(`Failed to add filter ${hookName}:`, error);
      throw error;
    }
  }

  async addAction(
    hookName: string, 
    callback: Function, 
    priority: number = 10, 
    pluginId?: string
  ): Promise<string> {
    try {
      // Validate hook exists
      const hook = this.hooks.get(hookName);
      if (!hook || hook.type !== 'action') {
        throw new Error(`Action hook '${hookName}' not found`);
      }

      // Validate callback
      const validation = await this.validateCallback(callback, hook);
      if (!validation.valid) {
        throw new Error(`Invalid callback: ${validation.errors.join(', ')}`);
      }

      // Security check
      const securityCheck = await this.securityValidator.validateCallback(callback, pluginId);
      if (!securityCheck.safe) {
        throw new Error(`Security validation failed: ${securityCheck.reason}`);
      }

      // Create callback entry
      const callbackEntry: HookCallback = {
        id: this.generateCallbackId(),
        pluginId: pluginId || 'unknown',
        callback,
        priority,
        async: this.isAsyncFunction(callback),
        conditions: [],
        timeout: hook.async ? 10000 : 5000,
        retries: 1,
        metadata: {
          registeredBy: pluginId,
          registrationTime: new Date()
        },
        registeredAt: new Date(),
        executionCount: 0,
        averageExecutionTime: 0
      };

      // Add to callbacks
      if (!this.callbacks.has(hookName)) {
        this.callbacks.set(hookName, []);
      }
      
      const callbacks = this.callbacks.get(hookName)!;
      callbacks.push(callbackEntry);
      
      // Sort by priority
      callbacks.sort((a, b) => a.priority - b.priority);

      // Log registration
      await this.metricsCollector.recordHookRegistration(hookName, callbackEntry);

      return callbackEntry.id;

    } catch (error) {
      console.error(`Failed to add action ${hookName}:`, error);
      throw error;
    }
  }

  async applyFilters(hookName: string, value: any, ...args: any[]): Promise<any> {
    const startTime = Date.now();
    let currentValue = value;

    try {
      // Get hook definition
      const hook = this.hooks.get(hookName);
      if (!hook || hook.type !== 'filter') {
        console.warn(`Filter hook '${hookName}' not found`);
        return currentValue;
      }

      // Get callbacks
      const callbacks = this.callbacks.get(hookName) || [];
      if (callbacks.length === 0) {
        return currentValue;
      }

      // Apply middleware first
      const middlewareResult = await this.applyMiddleware(hookName, 'before', currentValue, ...args);
      if (middlewareResult.modified) {
        currentValue = middlewareResult.value;
      }

      // Execute callbacks in priority order
      for (const callbackEntry of callbacks) {
        try {
          // Check conditions
          if (callbackEntry.conditions.length > 0) {
            const conditionsMet = await this.evaluateConditions(callbackEntry.conditions, ...args);
            if (!conditionsMet) {
              continue;
            }
          }

          const callbackStartTime = Date.now();
          
          // Execute callback with timeout
          const result = await this.executeCallbackWithTimeout(
            callbackEntry.callback,
            callbackEntry.timeout,
            currentValue,
            ...args
          );

          // Update current value if callback returned something
          if (result !== undefined) {
            currentValue = result;
          }

          // Update metrics
          const executionTime = Date.now() - callbackStartTime;
          await this.updateCallbackMetrics(callbackEntry, executionTime, true);

        } catch (error) {
          console.error(`Filter callback error in ${hookName}:`, error);
          
          // Update error metrics
          await this.updateCallbackMetrics(callbackEntry, 0, false, error);
          
          // Continue with other callbacks unless hook is critical
          if (!hook.metadata?.critical) {
            continue;
          } else {
            throw error;
          }
        }
      }

      // Apply after middleware
      const afterMiddlewareResult = await this.applyMiddleware(hookName, 'after', currentValue, ...args);
      if (afterMiddlewareResult.modified) {
        currentValue = afterMiddlewareResult.value;
      }

      // Record hook execution metrics
      const totalExecutionTime = Date.now() - startTime;
      await this.metricsCollector.recordHookExecution(hookName, totalExecutionTime, callbacks.length);

      return currentValue;

    } catch (error) {
      console.error(`Filter execution failed for ${hookName}:`, error);
      
      // Record error metrics
      await this.metricsCollector.recordHookError(hookName, error);
      
      // Return original value on error
      return value;
    }
  }

  async doAction(hookName: string, ...args: any[]): Promise<void> {
    const startTime = Date.now();

    try {
      // Get hook definition
      const hook = this.hooks.get(hookName);
      if (!hook || hook.type !== 'action') {
        console.warn(`Action hook '${hookName}' not found`);
        return;
      }

      // Get callbacks
      const callbacks = this.callbacks.get(hookName) || [];
      if (callbacks.length === 0) {
        return;
      }

      // Apply middleware first
      await this.applyMiddleware(hookName, 'before', undefined, ...args);

      // Execute callbacks
      const actionHook = hook as Action;
      
      if (actionHook.blocking) {
        // Execute sequentially
        for (const callbackEntry of callbacks) {
          await this.executeActionCallback(callbackEntry, hookName, ...args);
        }
      } else {
        // Execute in parallel
        const callbackPromises = callbacks.map(callbackEntry => 
          this.executeActionCallback(callbackEntry, hookName, ...args)
        );
        
        await Promise.allSettled(callbackPromises);
      }

      // Apply after middleware
      await this.applyMiddleware(hookName, 'after', undefined, ...args);

      // Record hook execution metrics
      const totalExecutionTime = Date.now() - startTime;
      await this.metricsCollector.recordHookExecution(hookName, totalExecutionTime, callbacks.length);

    } catch (error) {
      console.error(`Action execution failed for ${hookName}:`, error);
      
      // Record error metrics
      await this.metricsCollector.recordHookError(hookName, error);
      
      // Re-throw if hook is critical
      const hook = this.hooks.get(hookName);
      if (hook?.metadata?.critical) {
        throw error;
      }
    }
  }

  async emitEvent(eventName: string, data: any = {}): Promise<EventResult> {
    const event: Event = {
      name: eventName,
      type: 'event',
      description: `Event: ${eventName}`,
      parameters: [],
      returnType: 'void',
      callbacks: [],
      middleware: [],
      priority: 0,
      async: true,
      deprecated: false,
      version: '1.0.0',
      category: 'system',
      tags: [],
      documentation: { description: '', examples: [] },
      examples: [],
      metadata: {},
      bubbles: true,
      cancellable: false,
      defaultPrevented: false,
      propagationStopped: false,
      data
    };

    try {
      // Get event listeners
      const callbacks = this.callbacks.get(eventName) || [];
      
      // Execute event callbacks
      const results: EventCallbackResult[] = [];
      
      for (const callbackEntry of callbacks) {
        try {
          const result = await this.executeEventCallback(callbackEntry, event);
          results.push(result);
          
          // Check if propagation should stop
          if (result.stopPropagation) {
            break;
          }
        } catch (error) {
          results.push({
            callbackId: callbackEntry.id,
            success: false,
            error: error.message,
            stopPropagation: false
          });
        }
      }

      return {
        eventName,
        success: true,
        callbackResults: results,
        data: event.data
      };

    } catch (error) {
      console.error(`Event emission failed for ${eventName}:`, error);
      return {
        eventName,
        success: false,
        error: error.message,
        callbackResults: [],
        data
      };
    }
  }

  async removeHook(hookName: string, callbackId?: string, pluginId?: string): Promise<boolean> {
    try {
      const callbacks = this.callbacks.get(hookName);
      if (!callbacks) {
        return false;
      }

      let removed = false;

      if (callbackId) {
        // Remove specific callback
        const index = callbacks.findIndex(cb => cb.id === callbackId);
        if (index !== -1) {
          callbacks.splice(index, 1);
          removed = true;
        }
      } else if (pluginId) {
        // Remove all callbacks from plugin
        const initialLength = callbacks.length;
        const filteredCallbacks = callbacks.filter(cb => cb.pluginId !== pluginId);
        this.callbacks.set(hookName, filteredCallbacks);
        removed = filteredCallbacks.length < initialLength;
      } else {
        // Remove all callbacks
        this.callbacks.delete(hookName);
        removed = true;
      }

      // Log removal
      if (removed) {
        await this.metricsCollector.recordHookRemoval(hookName, callbackId, pluginId);
      }

      return removed;

    } catch (error) {
      console.error(`Failed to remove hook ${hookName}:`, error);
      return false;
    }
  }

  private async executeActionCallback(
    callbackEntry: HookCallback, 
    hookName: string, 
    ...args: any[]
  ): Promise<void> {
    try {
      // Check conditions
      if (callbackEntry.conditions.length > 0) {
        const conditionsMet = await this.evaluateConditions(callbackEntry.conditions, ...args);
        if (!conditionsMet) {
          return;
        }
      }

      const callbackStartTime = Date.now();
      
      // Execute callback with timeout
      await this.executeCallbackWithTimeout(
        callbackEntry.callback,
        callbackEntry.timeout,
        ...args
      );

      // Update metrics
      const executionTime = Date.now() - callbackStartTime;
      await this.updateCallbackMetrics(callbackEntry, executionTime, true);

    } catch (error) {
      console.error(`Action callback error in ${hookName}:`, error);
      
      // Update error metrics
      await this.updateCallbackMetrics(callbackEntry, 0, false, error);
      
      // Re-throw if callback has error handler
      if (callbackEntry.errorHandler) {
        try {
          await callbackEntry.errorHandler(error, hookName, args);
        } catch (handlerError) {
          console.error(`Error handler failed:`, handlerError);
        }
      }
    }
  }

  private async executeCallbackWithTimeout(
    callback: Function,
    timeout: number,
    ...args: any[]
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Callback timeout after ${timeout}ms`));
      }, timeout);

      try {
        const result = callback(...args);
        
        if (result instanceof Promise) {
          result
            .then(value => {
              clearTimeout(timeoutId);
              resolve(value);
            })
            .catch(error => {
              clearTimeout(timeoutId);
              reject(error);
            });
        } else {
          clearTimeout(timeoutId);
          resolve(result);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  private initializeBuiltinHooks(): void {
    // Content hooks
    this.registerHook({
      name: 'content.before_save',
      type: 'filter',
      description: 'Filter content before saving to database',
      parameters: [
        { name: 'content', type: 'object', description: 'Content object', required: true, examples: [] },
        { name: 'context', type: 'object', description: 'Save context', required: false, examples: [] }
      ],
      returnType: 'object',
      callbacks: [],
      middleware: [],
      priority: 10,
      async: true,
      deprecated: false,
      version: '1.0.0',
      category: 'content',
      tags: ['content', 'save', 'validation'],
      documentation: {
        description: 'This hook allows plugins to modify content before it is saved to the database.',
        examples: [
          {
            title: 'Add metadata to content',
            code: `
              addFilter('content.before_save', (content, context) => {
                return {
                  ...content,
                  metadata: {
                    ...content.metadata,
                    processed_at: new Date().toISOString()
                  }
                };
              });
            `
          }
        ]
      },
      examples: [],
      metadata: { critical: true }
    });

    this.registerHook({
      name: 'content.after_save',
      type: 'action',
      description: 'Execute actions after content is saved',
      parameters: [
        { name: 'content', type: 'object', description: 'Saved content object', required: true, examples: [] },
        { name: 'isNew', type: 'boolean', description: 'Whether content is newly created', required: true, examples: [] }
      ],
      returnType: 'void',
      callbacks: [],
      middleware: [],
      priority: 10,
      async: true,
      deprecated: false,
      version: '1.0.0',
      category: 'content',
      tags: ['content', 'save', 'notification'],
      documentation: {
        description: 'This hook is triggered after content has been successfully saved to the database.',
        examples: [
          {
            title: 'Send notification on new content',
            code: `
              addAction('content.after_save', async (content, isNew) => {
                if (isNew) {
                  await sendNotification({
                    type: 'new_content',
                    title: content.title,
                    author: content.author
                  });
                }
              });
            `
          }
        ]
      },
      examples: [],
      metadata: {}
    });

    // User hooks
    this.registerHook({
      name: 'user.before_login',
      type: 'filter',
      description: 'Filter user credentials before authentication',
      parameters: [
        { name: 'credentials', type: 'object', description: 'Login credentials', required: true, examples: [] },
        { name: 'request', type: 'object', description: 'HTTP request object', required: false, examples: [] }
      ],
      returnType: 'object',
      callbacks: [],
      middleware: [],
      priority: 10,
      async: true,
      deprecated: false,
      version: '1.0.0',
      category: 'user',
      tags: ['user', 'authentication', 'security'],
      documentation: {
        description: 'This hook allows plugins to modify or validate user credentials before authentication.',
        examples: [
          {
            title: 'Add rate limiting',
            code: `
              addFilter('user.before_login', async (credentials, request) => {
                const rateLimitCheck = await checkRateLimit(request.ip);
                if (!rateLimitCheck.allowed) {
                  throw new Error('Rate limit exceeded');
                }
                return credentials;
              });
            `
          }
        ]
      },
      examples: [],
      metadata: { critical: true }
    });

    // System hooks
    this.registerHook({
      name: 'system.init',
      type: 'action',
      description: 'Execute actions during system initialization',
      parameters: [
        { name: 'config', type: 'object', description: 'System configuration', required: true, examples: [] }
      ],
      returnType: 'void',
      callbacks: [],
      middleware: [],
      priority: 10,
      async: true,
      deprecated: false,
      version: '1.0.0',
      category: 'system',
      tags: ['system', 'initialization', 'startup'],
      documentation: {
        description: 'This hook is triggered during system initialization, allowing plugins to set up their components.',
        examples: [
          {
            title: 'Initialize plugin services',
            code: `
              addAction('system.init', async (config) => {
                await initializePluginServices();
                await connectToExternalAPI();
              });
            `
          }
        ]
      },
      examples: [],
      metadata: {}
    });

    // UI hooks
    this.registerHook({
      name: 'admin.menu',
      type: 'filter',
      description: 'Filter admin menu items',
      parameters: [
        { name: 'menuItems', type: 'array', description: 'Array of menu items', required: true, examples: [] },
        { name: 'user', type: 'object', description: 'Current user object', required: false, examples: [] }
      ],
      returnType: 'array',
      callbacks: [],
      middleware: [],
      priority: 10,
      async: false,
      deprecated: false,
      version: '1.0.0',
      category: 'ui',
      tags: ['ui', 'admin', 'menu'],
      documentation: {
        description: 'This hook allows plugins to add or modify admin menu items.',
        examples: [
          {
            title: 'Add custom menu item',
            code: `
              addFilter('admin.menu', (menuItems, user) => {
                if (user.hasCapability('manage_plugins')) {
                  menuItems.push({
                    id: 'my-plugin-menu',
                    title: 'My Plugin',
                    url: '/admin/my-plugin',
                    icon: 'plugin-icon',
                    position: 100
                  });
                }
                return menuItems;
              });
            `
          }
        ]
      },
      examples: [],
      metadata: {}
    });
  }

  private registerHook(hook: Hook): void {
    this.hooks.set(hook.name, hook);
  }
}

interface EventResult {
  eventName: string;
  success: boolean;
  error?: string;
  callbackResults: EventCallbackResult[];
  data: any;
}

interface EventCallbackResult {
  callbackId: string;
  success: boolean;
  error?: string;
  stopPropagation: boolean;
}

interface HookDocumentation {
  description: string;
  examples: HookExample[];
}

interface HookExample {
  title: string;
  code: string;
  description?: string;
}
```

### **2. 🌐 Plugin API Framework**

#### **Plugin API Architecture:**
```typescript
interface PluginAPIFramework {
  endpoints: Map<string, APIEndpoint>;
  middleware: APIMiddleware[];
  authentication: APIAuthentication;
  authorization: APIAuthorization;
  rateLimit: APIRateLimit;
  validation: APIValidation;
  documentation: APIDocumentation;
  versioning: APIVersioning;
}

interface APIEndpoint {
  id: string;
  path: string;
  method: HTTPMethod;
  handler: EndpointHandler;
  middleware: EndpointMiddleware[];
  authentication: AuthenticationConfig;
  authorization: AuthorizationConfig;
  validation: ValidationConfig;
  rateLimit: RateLimitConfig;
  documentation: EndpointDocumentation;
  version: string;
  deprecated: boolean;
  pluginId: string;
  registeredAt: Date;
}

interface EndpointHandler {
  (request: PluginAPIRequest, response: PluginAPIResponse): Promise<any>;
}

interface PluginAPIRequest {
  method: string;
  path: string;
  params: Record<string, string>;
  query: Record<string, any>;
  body: any;
  headers: Record<string, string>;
  user?: User;
  plugin?: Plugin;
  context: RequestContext;
  files?: UploadedFile[];
}

interface PluginAPIResponse {
  status(code: number): PluginAPIResponse;
  json(data: any): PluginAPIResponse;
  send(data: any): PluginAPIResponse;
  header(name: string, value: string): PluginAPIResponse;
  cookie(name: string, value: string, options?: CookieOptions): PluginAPIResponse;
  redirect(url: string, status?: number): PluginAPIResponse;
  download(path: string, filename?: string): PluginAPIResponse;
  render(template: string, data?: any): PluginAPIResponse;
}

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
```

#### **Plugin API Manager:**
```typescript
export class PluginAPIManager {
  private endpoints: Map<string, APIEndpoint>;
  private middleware: Map<string, APIMiddleware>;
  private router: Router;
  private rateLimiter: RateLimiter;
  private validator: APIValidator;
  private authenticator: APIAuthenticator;
  private authorizer: APIAuthorizer;
  private documentationGenerator: APIDocumentationGenerator;

  constructor() {
    this.endpoints = new Map();
    this.middleware = new Map();
    this.router = Router();
    this.rateLimiter = new RateLimiter();
    this.validator = new APIValidator();
    this.authenticator = new APIAuthenticator();
    this.authorizer = new APIAuthorizer();
    this.documentationGenerator = new APIDocumentationGenerator();
    
    this.setupRouter();
  }

  async registerEndpoint(endpoint: APIEndpoint): Promise<void> {
    try {
      // Validate endpoint configuration
      const validation = await this.validateEndpoint(endpoint);
      if (!validation.valid) {
        throw new Error(`Invalid endpoint: ${validation.errors.join(', ')}`);
      }

      // Check for conflicts
      const conflictCheck = await this.checkEndpointConflicts(endpoint);
      if (conflictCheck.hasConflict) {
        throw new Error(`Endpoint conflict: ${conflictCheck.reason}`);
      }

      // Register endpoint
      const endpointKey = `${endpoint.method}:${endpoint.path}`;
      this.endpoints.set(endpointKey, endpoint);

      // Add route to router
      const routeHandler = this.createRouteHandler(endpoint);
      
      switch (endpoint.method) {
        case 'GET':
          this.router.get(endpoint.path, routeHandler);
          break;
        case 'POST':
          this.router.post(endpoint.path, routeHandler);
          break;
        case 'PUT':
          this.router.put(endpoint.path, routeHandler);
          break;
        case 'PATCH':
          this.router.patch(endpoint.path, routeHandler);
          break;
        case 'DELETE':
          this.router.delete(endpoint.path, routeHandler);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${endpoint.method}`);
      }

      // Update API documentation
      await this.documentationGenerator.addEndpoint(endpoint);

      console.log(`Registered API endpoint: ${endpoint.method} ${endpoint.path} (Plugin: ${endpoint.pluginId})`);

    } catch (error) {
      console.error(`Failed to register endpoint ${endpoint.method} ${endpoint.path}:`, error);
      throw error;
    }
  }

  async unregisterEndpoint(method: HTTPMethod, path: string): Promise<boolean> {
    try {
      const endpointKey = `${method}:${path}`;
      const endpoint = this.endpoints.get(endpointKey);
      
      if (!endpoint) {
        return false;
      }

      // Remove from endpoints map
      this.endpoints.delete(endpointKey);

      // Remove from documentation
      await this.documentationGenerator.removeEndpoint(endpoint);

      console.log(`Unregistered API endpoint: ${method} ${path}`);
      return true;

    } catch (error) {
      console.error(`Failed to unregister endpoint ${method} ${path}:`, error);
      return false;
    }
  }

  async unregisterPluginEndpoints(pluginId: string): Promise<number> {
    let unregisteredCount = 0;

    try {
      const pluginEndpoints = Array.from(this.endpoints.values())
        .filter(endpoint => endpoint.pluginId === pluginId);

      for (const endpoint of pluginEndpoints) {
        const success = await this.unregisterEndpoint(endpoint.method, endpoint.path);
        if (success) {
          unregisteredCount++;
        }
      }

      console.log(`Unregistered ${unregisteredCount} endpoints for plugin: ${pluginId}`);
      return unregisteredCount;

    } catch (error) {
      console.error(`Failed to unregister endpoints for plugin ${pluginId}:`, error);
      return unregisteredCount;
    }
  }

  private createRouteHandler(endpoint: APIEndpoint): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      
      try {
        // Create plugin API request/response objects
        const pluginRequest = this.createPluginRequest(req, endpoint);
        const pluginResponse = this.createPluginResponse(res);

        // Apply rate limiting
        if (endpoint.rateLimit) {
          const rateLimitResult = await this.rateLimiter.checkLimit(
            pluginRequest,
            endpoint.rateLimit
          );
          
          if (!rateLimitResult.allowed) {
            return res.status(429).json({
              error: 'Rate limit exceeded',
              retryAfter: rateLimitResult.retryAfter
            });
          }
        }

        // Authentication
        if (endpoint.authentication.required) {
          const authResult = await this.authenticator.authenticate(
            pluginRequest,
            endpoint.authentication
          );
          
          if (!authResult.authenticated) {
            return res.status(401).json({
              error: 'Authentication required',
              message: authResult.message
            });
          }
          
          pluginRequest.user = authResult.user;
        }

        // Authorization
        if (endpoint.authorization.required) {
          const authzResult = await this.authorizer.authorize(
            pluginRequest,
            endpoint.authorization
          );
          
          if (!authzResult.authorized) {
            return res.status(403).json({
              error: 'Insufficient permissions',
              message: authzResult.message
            });
          }
        }

        // Input validation
        if (endpoint.validation) {
          const validationResult = await this.validator.validate(
            pluginRequest,
            endpoint.validation
          );
          
          if (!validationResult.valid) {
            return res.status(400).json({
              error: 'Validation failed',
              details: validationResult.errors
            });
          }
        }

        // Execute middleware
        for (const middleware of endpoint.middleware) {
          await middleware.execute(pluginRequest, pluginResponse);
        }

        // Execute endpoint handler
        const result = await endpoint.handler(pluginRequest, pluginResponse);

        // Handle response if not already sent
        if (!pluginResponse.headersSent) {
          if (result !== undefined) {
            pluginResponse.json(result);
          }
        }

        // Log successful request
        const duration = Date.now() - startTime;
        console.log(`API request completed: ${endpoint.method} ${endpoint.path} (${duration}ms)`);

      } catch (error) {
        console.error(`API endpoint error: ${endpoint.method} ${endpoint.path}:`, error);
        
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Internal server error',
            message: error.message
          });
        }
      }
    };
  }

  private createPluginRequest(req: Request, endpoint: APIEndpoint): PluginAPIRequest {
    return {
      method: req.method,
      path: req.path,
      params: req.params,
      query: req.query,
      body: req.body,
      headers: req.headers as Record<string, string>,
      context: {
        endpoint,
        startTime: Date.now(),
        requestId: this.generateRequestId()
      },
      files: req.files as UploadedFile[]
    };
  }

  private createPluginResponse(res: Response): PluginAPIResponse {
    return {
      status: (code: number) => {
        res.status(code);
        return this.createPluginResponse(res);
      },
      
      json: (data: any) => {
        res.json(data);
        return this.createPluginResponse(res);
      },
      
      send: (data: any) => {
        res.send(data);
        return this.createPluginResponse(res);
      },
      
      header: (name: string, value: string) => {
        res.header(name, value);
        return this.createPluginResponse(res);
      },
      
      cookie: (name: string, value: string, options?: CookieOptions) => {
        res.cookie(name, value, options);
        return this.createPluginResponse(res);
      },
      
      redirect: (url: string, status?: number) => {
        res.redirect(status || 302, url);
        return this.createPluginResponse(res);
      },
      
      download: (path: string, filename?: string) => {
        res.download(path, filename);
        return this.createPluginResponse(res);
      },
      
      render: (template: string, data?: any) => {
        res.render(template, data);
        return this.createPluginResponse(res);
      }
    };
  }

  async generateAPIDocumentation(): Promise<APIDocumentation> {
    return this.documentationGenerator.generate(Array.from(this.endpoints.values()));
  }

  getRegisteredEndpoints(pluginId?: string): APIEndpoint[] {
    const endpoints = Array.from(this.endpoints.values());
    
    if (pluginId) {
      return endpoints.filter(endpoint => endpoint.pluginId === pluginId);
    }
    
    return endpoints;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

interface RequestContext {
  endpoint: APIEndpoint;
  startTime: number;
  requestId: string;
}

interface AuthenticationConfig {
  required: boolean;
  methods: AuthMethod[];
  scopes?: string[];
}

interface AuthorizationConfig {
  required: boolean;
  permissions: string[];
  roles?: string[];
}

interface ValidationConfig {
  body?: ValidationSchema;
  params?: ValidationSchema;
  query?: ValidationSchema;
  headers?: ValidationSchema;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: PluginAPIRequest) => string;
}

type AuthMethod = 'bearer' | 'api_key' | 'session' | 'basic';
```

---

## 🎨 **Hook System Interface**

### **Hook Browser & Documentation:**
```
┌─────────────────────────────────────────────────────────┐
│ 🔗 Plugin Hooks & API Browser              [Search] [Filter] │
├─────────────────────────────────────────────────────────┤
│ [All Hooks ▼] [Filters ▼] [Actions ▼] [Events ▼]       │
├─────────────────────────────────────────────────────────┤
│ ┌─ Available Hooks ──────────────────────────────────┐   │
│ │ 🎣 content.before_save                    Filter    │   │
│ │    Modify content before saving to database        │   │
│ │    Parameters: content (object), context (object)  │   │
│ │    [View Docs] [Examples] [Test Hook]              │   │
│ │                                                   │   │
│ │ 🎣 content.after_save                     Action    │   │
│ │    Execute actions after content is saved          │   │
│ │    Parameters: content (object), isNew (boolean)   │   │
│ │    [View Docs] [Examples] [Test Hook]              │   │
│ │                                                   │   │
│ │ 🎣 user.before_login                      Filter    │   │
│ │    Filter user credentials before authentication   │   │
│ │    Parameters: credentials (object), request       │   │
│ │    [View Docs] [Examples] [Test Hook]              │   │
│ │                                                   │   │
│ │ 🎣 admin.menu                            Filter    │   │
│ │    Add or modify admin menu items                  │   │
│ │    Parameters: menuItems (array), user (object)    │   │
│ │    [View Docs] [Examples] [Test Hook]              │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Hook Usage Statistics ────────────────────────────┐   │
│ │ Most Used Hooks:                                   │   │
│ │ 1. content.before_save     (45 plugins)           │   │
│ │ 2. admin.menu             (32 plugins)           │   │
│ │ 3. user.after_login       (28 plugins)           │   │
│ │ 4. content.after_save     (25 plugins)           │   │
│ │ 5. system.init            (23 plugins)           │   │
│ │                                                   │   │
│ │ Performance Metrics:                               │   │
│ │ • Average execution time: 12ms                     │   │
│ │ • Success rate: 99.2%                             │   │
│ │ • Total executions today: 15,234                  │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### **API Endpoint Documentation:**
```
┌─────────────────────────────────────────────────────────┐
│ 🌐 Plugin API Documentation                    [Export] [Test] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Endpoint: POST /api/plugin/seo/analyze ───────────┐   │
│ │ Plugin: SEO Master Pro v2.1.0                      │   │
│ │ Description: Analyze page content for SEO issues   │   │
│ │                                                   │   │
│ │ Authentication: Bearer token required              │   │
│ │ Rate Limit: 100 requests/hour                      │   │
│ │                                                   │   │
│ │ Request Body:                                      │   │
│ │ {                                                  │   │
│ │   "url": "string (required)",                      │   │
│ │   "content": "string (optional)",                  │   │
│ │   "options": {                                     │   │
│ │     "checkImages": "boolean (default: true)",      │   │
│ │     "checkLinks": "boolean (default: true)"        │   │
│ │   }                                               │   │
│ │ }                                                  │   │
│ │                                                   │   │
│ │ Response (200 OK):                                 │   │
│ │ {                                                  │   │
│ │   "score": 85,                                     │   │
│ │   "issues": [                                      │   │
│ │     {                                             │   │
│ │       "type": "missing_meta_description",          │   │
│ │       "severity": "warning",                       │   │
│ │       "message": "Page is missing meta description"│   │
│ │     }                                             │   │
│ │   ],                                              │   │
│ │   "suggestions": ["Add meta description", ...]     │   │
│ │ }                                                  │   │
│ │                                                   │   │
│ │ [Try It Out] [Copy cURL] [View Examples]          │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Available Endpoints ──────────────────────────────┐   │
│ │ 🌐 GET    /api/plugin/seo/config                   │   │
│ │ 🌐 POST   /api/plugin/seo/analyze                  │   │
│ │ 🌐 GET    /api/plugin/seo/reports                  │   │
│ │ 🌐 POST   /api/plugin/seo/sitemap                  │   │
│ │ 🌐 DELETE /api/plugin/seo/cache                    │   │
│ │                                                   │   │
│ │ Filter by: [All ▼] [GET ▼] [POST ▼] [Plugin ▼]    │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Hook management
GET    /api/hooks                          // List available hooks
GET    /api/hooks/{name}                   // Get hook details
GET    /api/hooks/{name}/callbacks         // List hook callbacks
POST   /api/hooks/{name}/callbacks         // Register callback
DELETE /api/hooks/{name}/callbacks/{id}    // Remove callback
GET    /api/hooks/{name}/metrics           // Hook execution metrics

// Plugin API management
GET    /api/plugin-api/endpoints           // List plugin endpoints
POST   /api/plugin-api/endpoints           // Register endpoint
DELETE /api/plugin-api/endpoints/{id}      // Unregister endpoint
GET    /api/plugin-api/documentation       // Get API documentation
POST   /api/plugin-api/test                // Test endpoint

// Event system
POST   /api/events/emit                    // Emit event
GET    /api/events/listeners               // List event listeners
POST   /api/events/listeners               // Register event listener
DELETE /api/events/listeners/{id}          // Remove event listener

// Hook testing and debugging
POST   /api/hooks/test                     // Test hook execution
GET    /api/hooks/debug                    // Debug hook execution
GET    /api/hooks/performance              // Performance analysis
POST   /api/hooks/trace                    // Trace hook execution
```

### **Database Schema:**
```sql
-- Hook definitions
CREATE TABLE hooks (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL,
  description TEXT,
  parameters JSONB DEFAULT '[]',
  return_type VARCHAR(50),
  category VARCHAR(50),
  tags TEXT[],
  documentation JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  version VARCHAR(50) DEFAULT '1.0.0',
  deprecated BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Hook callbacks
CREATE TABLE hook_callbacks (
  id UUID PRIMARY KEY,
  hook_name VARCHAR(255) REFERENCES hooks(name) ON DELETE CASCADE,
  plugin_id UUID REFERENCES plugins(id) ON DELETE CASCADE,
  callback_id VARCHAR(255) NOT NULL,
  priority INTEGER DEFAULT 10,
  async BOOLEAN DEFAULT false,
  conditions JSONB DEFAULT '[]',
  timeout INTEGER DEFAULT 5000,
  retries INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  registered_at TIMESTAMP DEFAULT NOW(),
  last_executed TIMESTAMP,
  execution_count INTEGER DEFAULT 0,
  average_execution_time DECIMAL(10,3) DEFAULT 0
);

-- Plugin API endpoints
CREATE TABLE plugin_api_endpoints (
  id UUID PRIMARY KEY,
  plugin_id UUID REFERENCES plugins(id) ON DELETE CASCADE,
  path VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  handler_name VARCHAR(255) NOT NULL,
  middleware JSONB DEFAULT '[]',
  authentication JSONB DEFAULT '{}',
  authorization JSONB DEFAULT '{}',
  validation JSONB DEFAULT '{}',
  rate_limit JSONB DEFAULT '{}',
  documentation JSONB DEFAULT '{}',
  version VARCHAR(50) DEFAULT '1.0.0',
  deprecated BOOLEAN DEFAULT false,
  registered_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(path, method)
);

-- Hook execution metrics
CREATE TABLE hook_metrics (
  id UUID PRIMARY KEY,
  hook_name VARCHAR(255) NOT NULL,
  execution_time DECIMAL(10,3) NOT NULL,
  callback_count INTEGER NOT NULL,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  executed_at TIMESTAMP DEFAULT NOW()
);

-- API request logs
CREATE TABLE api_request_logs (
  id UUID PRIMARY KEY,
  endpoint_id UUID REFERENCES plugin_api_endpoints(id),
  plugin_id UUID REFERENCES plugins(id),
  method VARCHAR(10) NOT NULL,
  path VARCHAR(255) NOT NULL,
  status_code INTEGER NOT NULL,
  response_time DECIMAL(10,3) NOT NULL,
  user_id UUID REFERENCES users(id),
  ip_address INET,
  user_agent TEXT,
  request_size INTEGER,
  response_size INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Event listeners
CREATE TABLE event_listeners (
  id UUID PRIMARY KEY,
  event_name VARCHAR(255) NOT NULL,
  plugin_id UUID REFERENCES plugins(id) ON DELETE CASCADE,
  callback_id VARCHAR(255) NOT NULL,
  priority INTEGER DEFAULT 10,
  conditions JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  registered_at TIMESTAMP DEFAULT NOW(),
  execution_count INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX idx_hooks_name ON hooks(name);
CREATE INDEX idx_hooks_type ON hooks(type);
CREATE INDEX idx_hooks_category ON hooks(category);
CREATE INDEX idx_hook_callbacks_hook_name ON hook_callbacks(hook_name);
CREATE INDEX idx_hook_callbacks_plugin_id ON hook_callbacks(plugin_id);
CREATE INDEX idx_hook_callbacks_priority ON hook_callbacks(priority);
CREATE INDEX idx_plugin_api_endpoints_plugin_id ON plugin_api_endpoints(plugin_id);
CREATE INDEX idx_plugin_api_endpoints_path_method ON plugin_api_endpoints(path, method);
CREATE INDEX idx_hook_metrics_hook_name ON hook_metrics(hook_name);
CREATE INDEX idx_hook_metrics_executed_at ON hook_metrics(executed_at);
CREATE INDEX idx_api_request_logs_endpoint_id ON api_request_logs(endpoint_id);
CREATE INDEX idx_api_request_logs_created_at ON api_request_logs(created_at);
CREATE INDEX idx_event_listeners_event_name ON event_listeners(event_name);
```

---

## 🔗 **Related Documentation**

- **[Plugin System](./plugins.md)** - Core plugin architecture
- **[Marketplace](./marketplace.md)** - Plugin distribution platform  
- **[Development Tools](./development.md)** - Plugin development framework
- **[Security System](../06_security/)** - Plugin security validation
- **[API Schemas](../API_SCHEMAS.md)** - Complete API reference

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
