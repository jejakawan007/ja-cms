# 🔍 Media Search & Filter System

> **Advanced Media Discovery JA-CMS**  
> AI-powered search dengan visual recognition dan smart filtering

---

## 📋 **Deskripsi**

Media Search & Filter System menyediakan capabilities yang powerful untuk menemukan media files dengan cepat dan akurat. Sistem ini dilengkapi dengan AI-powered visual search, advanced filtering, faceted search, dan smart suggestions untuk membantu users menemukan media yang mereka butuhkan.

---

## ⭐ **Core Features**

### **1. 🔍 Advanced Search Engine**

#### **Search Architecture:**
```typescript
interface MediaSearchConfig {
  engines: {
    elasticsearch: boolean;
    algolia: boolean;
    local: boolean;
  };
  features: {
    visualSearch: boolean;
    aiTagging: boolean;
    facetedSearch: boolean;
    autoComplete: boolean;
    similaritySearch: boolean;
  };
  indexing: {
    realTime: boolean;
    batchSize: number;
    updateFrequency: number; // minutes
  };
  search: {
    maxResults: number;
    fuzzyMatching: boolean;
    typoTolerance: number;
    boostFields: Record<string, number>;
  };
}

interface SearchQuery {
  query: string;
  filters: SearchFilters;
  sort: SortOptions;
  facets: string[];
  page: number;
  limit: number;
  userId?: string;
  searchType: 'text' | 'visual' | 'similarity' | 'ai';
}

interface SearchFilters {
  fileType?: string[];
  mimeType?: string[];
  size?: { min?: number; max?: number };
  dimensions?: { 
    width?: { min?: number; max?: number };
    height?: { min?: number; max?: number };
  };
  dateRange?: { start?: Date; end?: Date };
  folder?: string[];
  tags?: string[];
  author?: string[];
  color?: string[];
  orientation?: 'landscape' | 'portrait' | 'square';
  hasTransparency?: boolean;
  isAnimated?: boolean;
  duration?: { min?: number; max?: number };
  bitrate?: { min?: number; max?: number };
  customFields?: Record<string, any>;
}

interface SearchResult {
  id: string;
  file: MediaFile;
  score: number;
  highlights: SearchHighlight[];
  similarFiles?: MediaFile[];
  aiTags?: AITag[];
  matchReason: string;
}

interface SearchHighlight {
  field: string;
  fragments: string[];
  matchedTerms: string[];
}

interface AITag {
  label: string;
  confidence: number;
  category: 'object' | 'scene' | 'activity' | 'concept' | 'emotion';
  boundingBox?: BoundingBox;
}
```

#### **Search Service:**
```typescript
export class MediaSearchService {
  private searchEngine: SearchEngine;
  private aiVision: AIVisionService;
  private indexer: MediaIndexer;
  private analytics: SearchAnalytics;

  constructor(config: MediaSearchConfig) {
    this.searchEngine = this.initializeSearchEngine(config);
    this.aiVision = new AIVisionService();
    this.indexer = new MediaIndexer(config.indexing);
    this.analytics = new SearchAnalytics();
  }

  async search(query: SearchQuery): Promise<SearchResults> {
    // Track search query
    await this.analytics.trackSearch(query);

    // Enhance query with AI if needed
    const enhancedQuery = await this.enhanceSearchQuery(query);

    // Execute search based on type
    let results: SearchResult[];
    
    switch (query.searchType) {
      case 'visual':
        results = await this.visualSearch(enhancedQuery);
        break;
      case 'similarity':
        results = await this.similaritySearch(enhancedQuery);
        break;
      case 'ai':
        results = await this.aiSearch(enhancedQuery);
        break;
      default:
        results = await this.textSearch(enhancedQuery);
    }

    // Apply post-processing
    results = await this.postProcessResults(results, query);

    // Generate facets
    const facets = await this.generateFacets(results, query.facets);

    // Get search suggestions
    const suggestions = await this.getSearchSuggestions(query.query);

    return {
      query: enhancedQuery,
      results,
      total: results.length,
      facets,
      suggestions,
      searchTime: Date.now() - performance.now(),
      hasMore: results.length >= query.limit
    };
  }

  async textSearch(query: SearchQuery): Promise<SearchResult[]> {
    const searchParams = {
      index: 'media_files',
      body: {
        query: {
          bool: {
            must: this.buildTextQuery(query.query),
            filter: this.buildFilters(query.filters)
          }
        },
        sort: this.buildSort(query.sort),
        highlight: {
          fields: {
            filename: {},
            title: {},
            description: {},
            tags: {},
            'ai_tags.label': {}
          }
        },
        size: query.limit,
        from: (query.page - 1) * query.limit
      }
    };

    const response = await this.searchEngine.search(searchParams);
    return this.processSearchResponse(response);
  }

  async visualSearch(query: SearchQuery): Promise<SearchResult[]> {
    if (!query.imageFile && !query.imageUrl) {
      throw new Error('Visual search requires an image file or URL');
    }

    // Extract features from query image
    const queryFeatures = await this.aiVision.extractFeatures(
      query.imageFile || query.imageUrl
    );

    // Search for similar images using vector similarity
    const similarityQuery = {
      index: 'media_files',
      body: {
        query: {
          bool: {
            must: [
              {
                script_score: {
                  query: { match_all: {} },
                  script: {
                    source: "cosineSimilarity(params.query_vector, 'image_features') + 1.0",
                    params: {
                      query_vector: queryFeatures.vector
                    }
                  }
                }
              }
            ],
            filter: [
              { term: { 'file_type': 'image' } },
              ...this.buildFilters(query.filters)
            ]
          }
        },
        size: query.limit
      }
    };

    const response = await this.searchEngine.search(similarityQuery);
    return this.processSearchResponse(response);
  }

  async aiSearch(query: SearchQuery): Promise<SearchResult[]> {
    // Use AI to understand the search intent
    const searchIntent = await this.aiVision.analyzeSearchIntent(query.query);

    // Build AI-enhanced query
    const aiQuery = {
      index: 'media_files',
      body: {
        query: {
          bool: {
            should: [
              // Text matching
              ...this.buildTextQuery(query.query),
              // AI tag matching
              {
                nested: {
                  path: 'ai_tags',
                  query: {
                    bool: {
                      should: searchIntent.concepts.map(concept => ({
                        match: {
                          'ai_tags.label': {
                            query: concept.label,
                            boost: concept.confidence * 2
                          }
                        }
                      }))
                    }
                  }
                }
              },
              // Color matching
              ...(searchIntent.colors.length > 0 ? [{
                terms: {
                  'dominant_colors': searchIntent.colors,
                  boost: 1.5
                }
              }] : []),
              // Scene matching
              ...(searchIntent.scene ? [{
                match: {
                  'scene_type': {
                    query: searchIntent.scene,
                    boost: 2.0
                  }
                }
              }] : [])
            ],
            minimum_should_match: 1,
            filter: this.buildFilters(query.filters)
          }
        },
        sort: [{ _score: 'desc' }],
        size: query.limit,
        from: (query.page - 1) * query.limit
      }
    };

    const response = await this.searchEngine.search(aiQuery);
    return this.processSearchResponse(response);
  }

  async getSimilarFiles(fileId: string, limit: number = 10): Promise<MediaFile[]> {
    const file = await this.getMediaFile(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    // Get file features
    const features = await this.getFileFeatures(fileId);
    if (!features) {
      return [];
    }

    const similarityQuery = {
      index: 'media_files',
      body: {
        query: {
          bool: {
            must: [
              {
                script_score: {
                  query: { match_all: {} },
                  script: {
                    source: "cosineSimilarity(params.query_vector, 'image_features') + 1.0",
                    params: {
                      query_vector: features.vector
                    }
                  }
                }
              }
            ],
            must_not: [
              { term: { '_id': fileId } }
            ],
            filter: [
              { term: { 'file_type': file.type } }
            ]
          }
        },
        size: limit
      }
    };

    const response = await this.searchEngine.search(similarityQuery);
    return response.hits.hits.map(hit => hit._source);
  }

  async getAutoCompleteSuggestions(query: string, limit: number = 10): Promise<AutoCompleteResult[]> {
    const suggestions: AutoCompleteResult[] = [];

    // File name suggestions
    const filenameQuery = {
      index: 'media_files',
      body: {
        suggest: {
          filename_suggest: {
            prefix: query,
            completion: {
              field: 'filename_suggest',
              size: limit / 2
            }
          }
        }
      }
    };

    // Tag suggestions
    const tagQuery = {
      index: 'media_files',
      body: {
        suggest: {
          tag_suggest: {
            prefix: query,
            completion: {
              field: 'tags_suggest',
              size: limit / 2
            }
          }
        }
      }
    };

    const [filenameResponse, tagResponse] = await Promise.all([
      this.searchEngine.search(filenameQuery),
      this.searchEngine.search(tagQuery)
    ]);

    // Process filename suggestions
    filenameResponse.suggest.filename_suggest[0].options.forEach(option => {
      suggestions.push({
        text: option.text,
        type: 'filename',
        score: option._score,
        context: 'File name'
      });
    });

    // Process tag suggestions
    tagResponse.suggest.tag_suggest[0].options.forEach(option => {
      suggestions.push({
        text: option.text,
        type: 'tag',
        score: option._score,
        context: 'Tag'
      });
    });

    // Sort by score and return top results
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async indexMediaFile(file: MediaFile): Promise<void> {
    // Extract searchable content
    const searchableContent = await this.extractSearchableContent(file);

    // Generate AI tags if image/video
    let aiTags: AITag[] = [];
    if (file.mimeType.startsWith('image/') || file.mimeType.startsWith('video/')) {
      aiTags = await this.aiVision.generateTags(file.url);
    }

    // Extract visual features for similarity search
    let visualFeatures: any = null;
    if (file.mimeType.startsWith('image/')) {
      visualFeatures = await this.aiVision.extractFeatures(file.url);
    }

    // Create search document
    const document = {
      id: file.id,
      filename: file.filename,
      title: file.title,
      description: file.description,
      alt: file.alt,
      caption: file.caption,
      tags: file.tags.map(tag => tag.name),
      file_type: this.categorizeFileType(file.mimeType),
      mime_type: file.mimeType,
      size: file.size,
      width: file.width,
      height: file.height,
      duration: file.duration,
      folder_path: file.folder?.path || '',
      author: {
        id: file.author.id,
        name: file.author.name
      },
      created_at: file.createdAt,
      updated_at: file.updatedAt,
      ai_tags: aiTags,
      image_features: visualFeatures?.vector,
      dominant_colors: visualFeatures?.colors,
      scene_type: visualFeatures?.scene,
      searchable_content: searchableContent,
      // Suggestion fields
      filename_suggest: {
        input: [file.filename, ...file.filename.split(/[\s\-_\.]+/)],
        weight: 10
      },
      tags_suggest: {
        input: file.tags.map(tag => tag.name),
        weight: 8
      }
    };

    // Index document
    await this.searchEngine.index({
      index: 'media_files',
      id: file.id,
      body: document
    });
  }

  async reindexAllMedia(): Promise<void> {
    console.log('Starting media reindexing...');
    
    const batchSize = 100;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const files = await this.getMediaFiles({ limit: batchSize, offset });
      
      if (files.length === 0) {
        hasMore = false;
        break;
      }

      // Index files in batch
      const operations = [];
      for (const file of files) {
        operations.push({ index: { _index: 'media_files', _id: file.id } });
        operations.push(await this.createSearchDocument(file));
      }

      if (operations.length > 0) {
        await this.searchEngine.bulk({ body: operations });
      }

      offset += batchSize;
      console.log(`Indexed ${offset} files...`);
    }

    console.log('Media reindexing completed');
  }

  private buildTextQuery(query: string): any[] {
    if (!query.trim()) {
      return [{ match_all: {} }];
    }

    return [
      {
        multi_match: {
          query,
          fields: [
            'filename^3',
            'title^2',
            'description',
            'alt',
            'caption',
            'tags^2',
            'searchable_content'
          ],
          type: 'best_fields',
          fuzziness: 'AUTO'
        }
      }
    ];
  }

  private buildFilters(filters: SearchFilters): any[] {
    const esFilters: any[] = [];

    if (filters.fileType && filters.fileType.length > 0) {
      esFilters.push({ terms: { file_type: filters.fileType } });
    }

    if (filters.mimeType && filters.mimeType.length > 0) {
      esFilters.push({ terms: { mime_type: filters.mimeType } });
    }

    if (filters.size) {
      const sizeRange: any = {};
      if (filters.size.min !== undefined) sizeRange.gte = filters.size.min;
      if (filters.size.max !== undefined) sizeRange.lte = filters.size.max;
      esFilters.push({ range: { size: sizeRange } });
    }

    if (filters.dimensions) {
      if (filters.dimensions.width) {
        const widthRange: any = {};
        if (filters.dimensions.width.min !== undefined) widthRange.gte = filters.dimensions.width.min;
        if (filters.dimensions.width.max !== undefined) widthRange.lte = filters.dimensions.width.max;
        esFilters.push({ range: { width: widthRange } });
      }

      if (filters.dimensions.height) {
        const heightRange: any = {};
        if (filters.dimensions.height.min !== undefined) heightRange.gte = filters.dimensions.height.min;
        if (filters.dimensions.height.max !== undefined) heightRange.lte = filters.dimensions.height.max;
        esFilters.push({ range: { height: heightRange } });
      }
    }

    if (filters.dateRange) {
      const dateRange: any = {};
      if (filters.dateRange.start) dateRange.gte = filters.dateRange.start;
      if (filters.dateRange.end) dateRange.lte = filters.dateRange.end;
      esFilters.push({ range: { created_at: dateRange } });
    }

    if (filters.folder && filters.folder.length > 0) {
      esFilters.push({ terms: { 'folder.id': filters.folder } });
    }

    if (filters.tags && filters.tags.length > 0) {
      esFilters.push({ terms: { tags: filters.tags } });
    }

    if (filters.author && filters.author.length > 0) {
      esFilters.push({ terms: { 'author.id': filters.author } });
    }

    if (filters.orientation) {
      const orientationFilter = this.buildOrientationFilter(filters.orientation);
      if (orientationFilter) {
        esFilters.push(orientationFilter);
      }
    }

    if (filters.hasTransparency !== undefined) {
      esFilters.push({ term: { has_transparency: filters.hasTransparency } });
    }

    return esFilters;
  }

  private buildOrientationFilter(orientation: string): any | null {
    switch (orientation) {
      case 'landscape':
        return { script: { script: "doc['width'].value > doc['height'].value" } };
      case 'portrait':
        return { script: { script: "doc['height'].value > doc['width'].value" } };
      case 'square':
        return { script: { script: "doc['width'].value == doc['height'].value" } };
      default:
        return null;
    }
  }

  private async generateFacets(results: SearchResult[], requestedFacets: string[]): Promise<SearchFacet[]> {
    const facets: SearchFacet[] = [];

    if (requestedFacets.includes('file_type')) {
      facets.push(await this.generateFileTypeFacet(results));
    }

    if (requestedFacets.includes('size')) {
      facets.push(await this.generateSizeFacet(results));
    }

    if (requestedFacets.includes('date')) {
      facets.push(await this.generateDateFacet(results));
    }

    if (requestedFacets.includes('tags')) {
      facets.push(await this.generateTagsFacet(results));
    }

    if (requestedFacets.includes('folder')) {
      facets.push(await this.generateFolderFacet(results));
    }

    return facets;
  }

  private async extractSearchableContent(file: MediaFile): Promise<string> {
    let content = [
      file.filename,
      file.title,
      file.description,
      file.alt,
      file.caption,
      ...file.tags.map(tag => tag.name)
    ].filter(Boolean).join(' ');

    // Extract text from documents if possible
    if (file.mimeType === 'application/pdf') {
      const pdfText = await this.extractPDFText(file.url);
      content += ' ' + pdfText;
    }

    // Add metadata
    if (file.metadata) {
      Object.values(file.metadata).forEach(value => {
        if (typeof value === 'string') {
          content += ' ' + value;
        }
      });
    }

    return content;
  }
}

interface SearchResults {
  query: SearchQuery;
  results: SearchResult[];
  total: number;
  facets: SearchFacet[];
  suggestions: string[];
  searchTime: number;
  hasMore: boolean;
}

interface SearchFacet {
  name: string;
  label: string;
  type: 'terms' | 'range' | 'date_histogram';
  values: FacetValue[];
}

interface FacetValue {
  value: string | number;
  label: string;
  count: number;
  selected: boolean;
}

interface AutoCompleteResult {
  text: string;
  type: 'filename' | 'tag' | 'folder' | 'author';
  score: number;
  context: string;
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

### **2. 🤖 AI-Powered Visual Search**

#### **Computer Vision Integration:**
```typescript
export class AIVisionService {
  private visionClient: VisionClient;
  private mlModel: MLModel;
  private featureExtractor: FeatureExtractor;

  async generateTags(imageUrl: string): Promise<AITag[]> {
    const tags: AITag[] = [];

    // Object detection
    const objects = await this.detectObjects(imageUrl);
    tags.push(...objects.map(obj => ({
      label: obj.name,
      confidence: obj.confidence,
      category: 'object' as const,
      boundingBox: obj.boundingBox
    })));

    // Scene detection
    const scene = await this.detectScene(imageUrl);
    if (scene.confidence > 0.7) {
      tags.push({
        label: scene.label,
        confidence: scene.confidence,
        category: 'scene'
      });
    }

    // Activity detection
    const activities = await this.detectActivities(imageUrl);
    tags.push(...activities.map(activity => ({
      label: activity.name,
      confidence: activity.confidence,
      category: 'activity' as const
    })));

    // Emotion detection (for faces)
    const emotions = await this.detectEmotions(imageUrl);
    tags.push(...emotions.map(emotion => ({
      label: emotion.emotion,
      confidence: emotion.confidence,
      category: 'emotion' as const
    })));

    // Concept detection
    const concepts = await this.detectConcepts(imageUrl);
    tags.push(...concepts.map(concept => ({
      label: concept.name,
      confidence: concept.confidence,
      category: 'concept' as const
    })));

    return tags.filter(tag => tag.confidence > 0.5);
  }

  async extractFeatures(imageUrl: string): Promise<ImageFeatures> {
    // Extract visual features for similarity search
    const features = await this.featureExtractor.extract(imageUrl);
    
    // Extract color information
    const colors = await this.extractDominantColors(imageUrl);
    
    // Detect scene type
    const scene = await this.detectScene(imageUrl);

    return {
      vector: features.vector,
      colors: colors.map(c => c.hex),
      scene: scene.label,
      texture: features.texture,
      composition: features.composition
    };
  }

  async analyzeSearchIntent(query: string): Promise<SearchIntent> {
    // Use NLP to understand search intent
    const nlpResult = await this.nlpService.analyze(query);
    
    const intent: SearchIntent = {
      concepts: [],
      colors: [],
      scene: null,
      objects: [],
      emotions: [],
      style: null
    };

    // Extract concepts
    for (const entity of nlpResult.entities) {
      if (entity.type === 'CONCEPT') {
        intent.concepts.push({
          label: entity.text,
          confidence: entity.confidence
        });
      }
    }

    // Extract colors
    const colorMatches = query.match(/\b(red|blue|green|yellow|orange|purple|pink|black|white|gray|brown)\b/gi);
    if (colorMatches) {
      intent.colors = colorMatches.map(color => color.toLowerCase());
    }

    // Extract scene types
    const sceneKeywords = ['indoor', 'outdoor', 'nature', 'city', 'beach', 'mountain', 'forest', 'office', 'home'];
    const sceneMatch = sceneKeywords.find(keyword => 
      query.toLowerCase().includes(keyword)
    );
    if (sceneMatch) {
      intent.scene = sceneMatch;
    }

    // Extract objects
    const objectKeywords = ['person', 'people', 'car', 'dog', 'cat', 'tree', 'building', 'food', 'animal'];
    intent.objects = objectKeywords.filter(keyword => 
      query.toLowerCase().includes(keyword)
    );

    return intent;
  }

  async findSimilarImages(queryImageUrl: string, limit: number = 20): Promise<SimilarImage[]> {
    // Extract features from query image
    const queryFeatures = await this.extractFeatures(queryImageUrl);
    
    // Search for similar images in the index
    const searchQuery = {
      index: 'media_files',
      body: {
        query: {
          bool: {
            must: [
              {
                script_score: {
                  query: { 
                    bool: {
                      filter: [{ term: { file_type: 'image' } }]
                    }
                  },
                  script: {
                    source: `
                      double similarity = cosineSimilarity(params.query_vector, 'image_features');
                      double colorSimilarity = 0.0;
                      if (doc['dominant_colors'].size() > 0) {
                        for (color in params.query_colors) {
                          if (doc['dominant_colors'].contains(color)) {
                            colorSimilarity += 0.1;
                          }
                        }
                      }
                      return similarity + colorSimilarity;
                    `,
                    params: {
                      query_vector: queryFeatures.vector,
                      query_colors: queryFeatures.colors
                    }
                  }
                }
              }
            ]
          }
        },
        size: limit
      }
    };

    const response = await this.searchEngine.search(searchQuery);
    
    return response.hits.hits.map(hit => ({
      file: hit._source,
      similarity: hit._score,
      matchedFeatures: this.identifyMatchedFeatures(queryFeatures, hit._source)
    }));
  }

  async detectDuplicateImages(threshold: number = 0.95): Promise<DuplicateGroup[]> {
    const duplicateGroups: DuplicateGroup[] = [];
    const processedFiles = new Set<string>();
    
    // Get all image files
    const images = await this.getAllImageFiles();
    
    for (const image of images) {
      if (processedFiles.has(image.id)) {
        continue;
      }

      // Find similar images
      const similar = await this.findSimilarImages(image.url, 50);
      const duplicates = similar.filter(s => s.similarity >= threshold);

      if (duplicates.length > 0) {
        const group: DuplicateGroup = {
          id: this.generateGroupId(),
          original: image,
          duplicates: duplicates.map(d => d.file),
          averageSimilarity: duplicates.reduce((sum, d) => sum + d.similarity, 0) / duplicates.length,
          potentialSavings: duplicates.reduce((sum, d) => sum + d.file.size, 0)
        };

        duplicateGroups.push(group);
        
        // Mark all files in group as processed
        processedFiles.add(image.id);
        duplicates.forEach(d => processedFiles.add(d.file.id));
      }
    }

    return duplicateGroups;
  }

  private async detectObjects(imageUrl: string): Promise<DetectedObject[]> {
    try {
      const response = await this.visionClient.objectDetection({
        image: { source: { imageUri: imageUrl } }
      });

      return response.localizedObjectAnnotations.map(annotation => ({
        name: annotation.name,
        confidence: annotation.score,
        boundingBox: {
          x: annotation.boundingPoly.normalizedVertices[0].x,
          y: annotation.boundingPoly.normalizedVertices[0].y,
          width: annotation.boundingPoly.normalizedVertices[2].x - annotation.boundingPoly.normalizedVertices[0].x,
          height: annotation.boundingPoly.normalizedVertices[2].y - annotation.boundingPoly.normalizedVertices[0].y
        }
      }));
    } catch (error) {
      console.error('Object detection failed:', error);
      return [];
    }
  }

  private async detectScene(imageUrl: string): Promise<{ label: string; confidence: number }> {
    try {
      const response = await this.visionClient.labelDetection({
        image: { source: { imageUri: imageUrl } }
      });

      // Find the most likely scene label
      const sceneLabels = response.labelAnnotations.filter(label => 
        ['indoor', 'outdoor', 'nature', 'urban', 'landscape', 'portrait'].includes(label.description.toLowerCase())
      );

      if (sceneLabels.length > 0) {
        const topScene = sceneLabels[0];
        return {
          label: topScene.description,
          confidence: topScene.score
        };
      }

      return { label: 'unknown', confidence: 0 };
    } catch (error) {
      console.error('Scene detection failed:', error);
      return { label: 'unknown', confidence: 0 };
    }
  }

  private async extractDominantColors(imageUrl: string): Promise<ColorInfo[]> {
    try {
      const response = await this.visionClient.imageProperties({
        image: { source: { imageUri: imageUrl } }
      });

      return response.imagePropertiesAnnotation.dominantColors.colors.map(color => ({
        red: color.color.red || 0,
        green: color.color.green || 0,
        blue: color.color.blue || 0,
        hex: this.rgbToHex(color.color.red || 0, color.color.green || 0, color.color.blue || 0),
        score: color.score,
        pixelFraction: color.pixelFraction
      }));
    } catch (error) {
      console.error('Color extraction failed:', error);
      return [];
    }
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return "#" + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  }
}

interface ImageFeatures {
  vector: number[];
  colors: string[];
  scene: string;
  texture: any;
  composition: any;
}

interface SearchIntent {
  concepts: { label: string; confidence: number }[];
  colors: string[];
  scene: string | null;
  objects: string[];
  emotions: string[];
  style: string | null;
}

interface SimilarImage {
  file: MediaFile;
  similarity: number;
  matchedFeatures: string[];
}

interface DuplicateGroup {
  id: string;
  original: MediaFile;
  duplicates: MediaFile[];
  averageSimilarity: number;
  potentialSavings: number;
}

interface DetectedObject {
  name: string;
  confidence: number;
  boundingBox: BoundingBox;
}

interface ColorInfo {
  red: number;
  green: number;
  blue: number;
  hex: string;
  score: number;
  pixelFraction: number;
}
```

### **3. 📊 Search Analytics & Insights**

#### **Search Performance Tracking:**
```typescript
export class SearchAnalyticsService {
  async trackSearch(query: SearchQuery, results: SearchResults, userId?: string): Promise<void> {
    const searchEvent = {
      query: query.query,
      searchType: query.searchType,
      filters: query.filters,
      resultCount: results.total,
      searchTime: results.searchTime,
      userId,
      timestamp: new Date(),
      hasResults: results.total > 0,
      clickedResults: [], // Will be populated by click tracking
      sessionId: this.getSessionId()
    };

    await this.prisma.searchLog.create({
      data: searchEvent
    });

    // Update search statistics
    await this.updateSearchStatistics(query, results);
  }

  async trackSearchClick(searchId: string, resultId: string, position: number): Promise<void> {
    await this.prisma.searchClick.create({
      data: {
        searchId,
        resultId,
        position,
        timestamp: new Date()
      }
    });

    // Update click-through rates
    await this.updateClickThroughRates(searchId, position);
  }

  async getSearchAnalytics(timeRange: DateRange): Promise<SearchAnalytics> {
    const searches = await this.getSearchLogs(timeRange);
    const clicks = await this.getSearchClicks(timeRange);

    return {
      overview: {
        totalSearches: searches.length,
        uniqueSearchers: new Set(searches.map(s => s.userId).filter(Boolean)).size,
        averageResultsPerSearch: searches.reduce((sum, s) => sum + s.resultCount, 0) / searches.length,
        averageSearchTime: searches.reduce((sum, s) => sum + s.searchTime, 0) / searches.length,
        clickThroughRate: this.calculateClickThroughRate(searches, clicks),
        noResultsRate: searches.filter(s => s.resultCount === 0).length / searches.length * 100
      },
      topQueries: await this.getTopSearchQueries(searches),
      noResultQueries: await this.getNoResultQueries(searches),
      searchTypes: this.getSearchTypeDistribution(searches),
      popularFilters: this.getPopularFilters(searches),
      searchTrends: await this.calculateSearchTrends(searches),
      performanceMetrics: await this.getPerformanceMetrics(searches)
    };
  }

  async getSearchInsights(timeRange: DateRange): Promise<SearchInsight[]> {
    const insights: SearchInsight[] = [];
    const analytics = await this.getSearchAnalytics(timeRange);

    // High no-results rate insight
    if (analytics.overview.noResultsRate > 20) {
      insights.push({
        type: 'no_results',
        severity: 'high',
        title: 'High No-Results Rate',
        description: `${analytics.overview.noResultsRate.toFixed(1)}% of searches return no results`,
        recommendation: 'Review search indexing and consider expanding search capabilities',
        impact: 'user_experience'
      });
    }

    // Low click-through rate insight
    if (analytics.overview.clickThroughRate < 30) {
      insights.push({
        type: 'low_ctr',
        severity: 'medium',
        title: 'Low Click-Through Rate',
        description: `Only ${analytics.overview.clickThroughRate.toFixed(1)}% of searches result in clicks`,
        recommendation: 'Improve search result relevance and presentation',
        impact: 'engagement'
      });
    }

    // Slow search performance insight
    if (analytics.overview.averageSearchTime > 1000) {
      insights.push({
        type: 'slow_search',
        severity: 'medium',
        title: 'Slow Search Performance',
        description: `Average search time is ${analytics.overview.averageSearchTime.toFixed(0)}ms`,
        recommendation: 'Optimize search index and query performance',
        impact: 'performance'
      });
    }

    // Popular search terms without good results
    const problematicQueries = analytics.noResultQueries.filter(q => q.frequency > 5);
    if (problematicQueries.length > 0) {
      insights.push({
        type: 'missing_content',
        severity: 'high',
        title: 'Missing Content for Popular Searches',
        description: `${problematicQueries.length} popular search terms return no results`,
        recommendation: 'Consider adding content or improving tagging for these terms',
        impact: 'content_gap'
      });
    }

    return insights;
  }

  async optimizeSearchIndex(): Promise<IndexOptimizationResult> {
    const optimization: IndexOptimizationResult = {
      actions: [],
      improvements: [],
      estimatedImpact: 0
    };

    // Analyze search patterns
    const analytics = await this.getSearchAnalytics({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      end: new Date()
    });

    // Optimize field boosting based on click patterns
    const fieldPerformance = await this.analyzeFieldPerformance();
    if (fieldPerformance.filename.ctr > fieldPerformance.description.ctr) {
      optimization.actions.push({
        type: 'boost_adjustment',
        description: 'Increase filename field boost based on higher CTR',
        impact: 'medium'
      });
    }

    // Suggest new synonyms based on failed searches
    const synonymSuggestions = await this.generateSynonymSuggestions(analytics.noResultQueries);
    if (synonymSuggestions.length > 0) {
      optimization.actions.push({
        type: 'synonym_expansion',
        description: `Add ${synonymSuggestions.length} new synonym mappings`,
        impact: 'high'
      });
    }

    // Optimize autocomplete based on popular searches
    const autocompleteSuggestions = await this.optimizeAutocomplete(analytics.topQueries);
    if (autocompleteSuggestions.length > 0) {
      optimization.actions.push({
        type: 'autocomplete_optimization',
        description: `Update autocomplete with ${autocompleteSuggestions.length} popular terms`,
        impact: 'medium'
      });
    }

    return optimization;
  }

  private calculateClickThroughRate(searches: any[], clicks: any[]): number {
    const searchesWithClicks = new Set(clicks.map(c => c.searchId)).size;
    return searches.length > 0 ? (searchesWithClicks / searches.length) * 100 : 0;
  }

  private getSearchTypeDistribution(searches: any[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    searches.forEach(search => {
      const type = search.searchType || 'text';
      distribution[type] = (distribution[type] || 0) + 1;
    });

    return distribution;
  }

  private getPopularFilters(searches: any[]): FilterUsage[] {
    const filterUsage: Record<string, number> = {};
    
    searches.forEach(search => {
      if (search.filters) {
        Object.keys(search.filters).forEach(filterName => {
          if (search.filters[filterName] !== undefined && search.filters[filterName] !== null) {
            filterUsage[filterName] = (filterUsage[filterName] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(filterUsage)
      .map(([name, count]) => ({ name, count, percentage: (count / searches.length) * 100 }))
      .sort((a, b) => b.count - a.count);
  }
}

interface SearchAnalytics {
  overview: {
    totalSearches: number;
    uniqueSearchers: number;
    averageResultsPerSearch: number;
    averageSearchTime: number;
    clickThroughRate: number;
    noResultsRate: number;
  };
  topQueries: TopQuery[];
  noResultQueries: NoResultQuery[];
  searchTypes: Record<string, number>;
  popularFilters: FilterUsage[];
  searchTrends: SearchTrend[];
  performanceMetrics: PerformanceMetric[];
}

interface SearchInsight {
  type: 'no_results' | 'low_ctr' | 'slow_search' | 'missing_content';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  recommendation: string;
  impact: 'user_experience' | 'engagement' | 'performance' | 'content_gap';
}

interface IndexOptimizationResult {
  actions: OptimizationAction[];
  improvements: string[];
  estimatedImpact: number;
}

interface OptimizationAction {
  type: 'boost_adjustment' | 'synonym_expansion' | 'autocomplete_optimization';
  description: string;
  impact: 'low' | 'medium' | 'high';
}

interface FilterUsage {
  name: string;
  count: number;
  percentage: number;
}

interface TopQuery {
  query: string;
  frequency: number;
  averageResults: number;
  clickThroughRate: number;
}

interface NoResultQuery {
  query: string;
  frequency: number;
  lastSearched: Date;
}
```

---

## 🎨 **Search Interface**

### **Advanced Search Interface:**
```
┌─────────────────────────────────────────────────────────┐
│ 🔍 Media Search                        [Visual] [AI] [Filters] │
├─────────────────────────────────────────────────────────┤
│ [Search by filename, tags, description..._______________] │
│ [🔍 Search] [📷 Visual Search] [🤖 AI Search] [⚙️ Advanced] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Search Results (1,234 found) ────────────────────────┐ │
│ │ ┌─────┐ mountain-landscape.jpg                        │ │
│ │ │🏔️📷│ 2.3MB • 1920x1080 • JPEG                      │ │
│ │ └─────┘ Tags: landscape, mountain, nature            │ │
│ │         Folder: /Images/Nature • 2 days ago          │ │
│ │         AI: outdoor, scenic, blue sky                │ │
│ │                                                     │ │
│ │ ┌─────┐ sunset-beach.png                             │ │
│ │ │🌅📷│ 1.8MB • 1600x900 • PNG                        │ │
│ │ └─────┘ Tags: sunset, beach, ocean                   │ │
│ │         Folder: /Images/Travel • 1 week ago          │ │
│ │         AI: outdoor, water, golden hour              │ │
│ │                                                     │ │
│ │ ┌─────┐ city-skyline.webp                            │ │
│ │ │🏙️📷│ 945KB • 1280x720 • WebP                       │ │
│ │ └─────┘ Tags: city, urban, architecture              │ │
│ │         Folder: /Images/Urban • 3 days ago           │ │
│ │         AI: building, metropolitan, evening          │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─ Filters ──────────────────────────────────────────┐   │
│ │ File Type:        Size:           Date:             │   │
│ │ ☑ Images (892)    ☐ <1MB (234)    ☐ Today (45)     │   │
│ │ ☐ Videos (234)    ☑ 1-10MB (567)  ☑ This week (234) │   │
│ │ ☐ Audio (89)      ☐ >10MB (123)   ☐ This month (567)│   │
│ │ ☐ Documents (45)                                    │   │
│ │                                                     │   │
│ │ Dimensions:       Colors:         Folder:           │   │
│ │ Width: [___-___]  ☐ Red (45)      ☑ Nature (234)   │   │
│ │ Height:[___-___]  ☑ Blue (123)    ☐ Travel (156)   │   │
│ │ ☐ Landscape       ☐ Green (89)    ☐ Urban (78)     │   │
│ │ ☑ Portrait        ☐ Yellow (67)                     │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### **Visual Search Interface:**
```
┌─────────────────────────────────────────────────────────┐
│ 📷 Visual Search                       [Upload] [Camera] │
├─────────────────────────────────────────────────────────┤
│ ┌─ Query Image ──────────────────────────────────────┐   │
│ │                                                   │   │
│ │              📁 Drop image here                    │   │
│ │                    or                             │   │
│ │              [Browse Files]                       │   │
│ │                                                   │   │
│ │  Supported: JPG, PNG, WebP, GIF                  │   │
│ │  Max size: 10MB                                   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ AI Analysis ──────────────────────────────────────┐   │
│ │ 🤖 Detected Objects: mountain, tree, sky, lake     │   │
│ │ 🎨 Dominant Colors: Blue, Green, White             │   │
│ │ 🏞️ Scene Type: Outdoor landscape                   │   │
│ │ 📐 Composition: Rule of thirds, wide angle         │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Similar Images (89% match) ───────────────────────┐   │
│ │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐           │   │
│ │ │🏔️📷│ │🏔️📷│ │🏔️📷│ │🏔️📷│ │🏔️📷│           │   │
│ │ │ 94% │ │ 91% │ │ 89% │ │ 87% │ │ 85% │           │   │
│ │ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘           │   │
│ │                                                   │   │
│ │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐           │   │
│ │ │🏔️📷│ │🏔️📷│ │🏔️📷│ │🏔️📷│ │🏔️📷│           │   │
│ │ │ 83% │ │ 81% │ │ 79% │ │ 77% │ │ 75% │           │   │
│ │ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘           │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─ Search Options ───────────────────────────────────┐   │
│ │ Similarity: [High ████████░░] (80%+ match)         │   │
│ │ ☑ Same colors     ☑ Similar composition            │   │
│ │ ☑ Same objects    ☐ Exact duplicates only          │   │
│ │ [🔍 Find Similar] [🔄 New Search]                  │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Search operations
POST   /api/media/search                  // Text search
POST   /api/media/search/visual           // Visual search
POST   /api/media/search/similarity       // Similarity search
POST   /api/media/search/ai               // AI-powered search
GET    /api/media/search/autocomplete     // Autocomplete suggestions

// Search management
POST   /api/media/search/index            // Index media file
POST   /api/media/search/reindex          // Reindex all media
DELETE /api/media/search/index/{id}       // Remove from index
GET    /api/media/search/status           // Index status

// Search analytics
GET    /api/media/search/analytics        // Search analytics
GET    /api/media/search/insights         // Search insights
POST   /api/media/search/track-click     // Track search click
GET    /api/media/search/popular          // Popular searches

// Advanced features
POST   /api/media/search/duplicates       // Find duplicates
GET    /api/media/{id}/similar            // Get similar files
POST   /api/media/search/optimize         // Optimize search index
```

### **Database Schema:**
```sql
-- Search logs
CREATE TABLE search_logs (
  id UUID PRIMARY KEY,
  query TEXT NOT NULL,
  search_type VARCHAR(20) DEFAULT 'text',
  filters JSONB,
  result_count INTEGER DEFAULT 0,
  search_time INTEGER DEFAULT 0,
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(100),
  has_results BOOLEAN DEFAULT false,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Search clicks
CREATE TABLE search_clicks (
  id UUID PRIMARY KEY,
  search_id UUID REFERENCES search_logs(id) ON DELETE CASCADE,
  result_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  clicked_at TIMESTAMP DEFAULT NOW()
);

-- Search suggestions
CREATE TABLE search_suggestions (
  id UUID PRIMARY KEY,
  query TEXT NOT NULL,
  suggestion TEXT NOT NULL,
  frequency INTEGER DEFAULT 1,
  last_used TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(query, suggestion)
);

-- AI tags
CREATE TABLE ai_tags (
  id UUID PRIMARY KEY,
  media_file_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  confidence DECIMAL(4,3) NOT NULL,
  category VARCHAR(50) NOT NULL,
  bounding_box JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Visual features
CREATE TABLE visual_features (
  id UUID PRIMARY KEY,
  media_file_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  feature_vector REAL[],
  dominant_colors TEXT[],
  scene_type VARCHAR(100),
  texture_features JSONB,
  composition_features JSONB,
  extracted_at TIMESTAMP DEFAULT NOW()
);

-- Search analytics
CREATE TABLE search_analytics (
  id UUID PRIMARY KEY,
  date DATE NOT NULL,
  total_searches INTEGER DEFAULT 0,
  unique_searchers INTEGER DEFAULT 0,
  avg_results_per_search DECIMAL(8,2) DEFAULT 0,
  avg_search_time INTEGER DEFAULT 0,
  click_through_rate DECIMAL(5,2) DEFAULT 0,
  no_results_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(date)
);

-- Indexes for performance
CREATE INDEX idx_search_logs_query ON search_logs(query);
CREATE INDEX idx_search_logs_user ON search_logs(user_id);
CREATE INDEX idx_search_logs_created_at ON search_logs(created_at);
CREATE INDEX idx_search_clicks_search ON search_clicks(search_id);
CREATE INDEX idx_search_clicks_result ON search_clicks(result_id);
CREATE INDEX idx_ai_tags_media_file ON ai_tags(media_file_id);
CREATE INDEX idx_ai_tags_label ON ai_tags(label);
CREATE INDEX idx_visual_features_media_file ON visual_features(media_file_id);
CREATE INDEX idx_search_analytics_date ON search_analytics(date);

-- Full-text search indexes
CREATE INDEX idx_search_suggestions_query ON search_suggestions USING gin(to_tsvector('english', query));
```

---

## 🔗 **Related Documentation**

- **[Media Library](./library.md)** - File organization and management
- **[Media Upload](./upload.md)** - File indexing during upload
- **[Media Analytics](./analytics.md)** - Search performance tracking
- **[AI Features](./ai-features.md)** - AI-powered media analysis

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active

