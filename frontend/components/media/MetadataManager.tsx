'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Save,
  Edit,
  Trash2,
  Search,
  Tag,
  User,
  Camera,
  Settings,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';

import { formatFileSize } from '@/lib/utils/media-utils';

interface MediaMetadata {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  basic: {
    title: string;
    description: string;
    alt: string;
    caption: string;
    keywords: string[];
  };
  technical: {
    width?: number;
    height?: number;
    format: string;
    colorSpace: string;
    bitDepth: number;
    compression: string;
  };
  exif: {
    camera: string;
    lens: string;
    aperture: string;
    shutterSpeed: string;
    iso: number;
    focalLength: number;
    dateTaken: string;
    gps?: {
      latitude: number;
      longitude: number;
    };
  };
  custom: Record<string, string>;
  tags: string[];
  collections: string[];
  permissions: {
    public: boolean;
    downloadable: boolean;
    editable: boolean;
  };
}

const mockMetadata: MediaMetadata[] = [
  {
    id: '1',
    fileName: 'hero-image.jpg',
    fileType: 'image/jpeg',
    fileSize: 2.5 * 1024 * 1024,
    basic: {
      title: 'Hero Image for Homepage',
      description: 'Beautiful landscape photography for the main hero section',
      alt: 'Mountain landscape with sunset',
      caption: 'Stunning mountain view at golden hour',
      keywords: ['landscape', 'mountains', 'sunset', 'nature', 'hero']
    },
    technical: {
      width: 1920,
      height: 1080,
      format: 'JPEG',
      colorSpace: 'sRGB',
      bitDepth: 8,
      compression: 'JPEG'
    },
    exif: {
      camera: 'Canon EOS R5',
      lens: 'RF 24-70mm f/2.8L IS USM',
      aperture: 'f/8',
      shutterSpeed: '1/125s',
      iso: 100,
      focalLength: 35,
      dateTaken: '2024-01-15T10:30:00Z',
      gps: {
        latitude: 40.7128,
        longitude: -74.0060
      }
    },
    custom: {
      'Project': 'Website Redesign',
      'Client': 'TechCorp',
      'Usage Rights': 'Commercial'
    },
    tags: ['hero', 'landscape', 'sunset', 'mountains'],
    collections: ['Website Assets', 'Landscape Photography'],
    permissions: {
      public: true,
      downloadable: true,
      editable: true
    }
  },
  {
    id: '2',
    fileName: 'product-video.mp4',
    fileType: 'video/mp4',
    fileSize: 15 * 1024 * 1024,
    basic: {
      title: 'Product Demonstration Video',
      description: 'How to use our latest product features',
      alt: 'Product demonstration video',
      caption: 'Step-by-step guide to product features',
      keywords: ['product', 'demo', 'tutorial', 'features']
    },
    technical: {
      width: 1920,
      height: 1080,
      format: 'MP4',
      colorSpace: 'sRGB',
      bitDepth: 8,
      compression: 'H.264'
    },
    exif: {
      camera: 'iPhone 15 Pro',
      lens: 'Built-in',
      aperture: 'f/1.8',
      shutterSpeed: '1/60s',
      iso: 200,
      focalLength: 26,
      dateTaken: '2024-01-14T15:20:00Z'
    },
    custom: {
      'Duration': '2:30',
      'Language': 'English',
      'Subtitles': 'Available'
    },
    tags: ['product', 'video', 'tutorial', 'demo'],
    collections: ['Product Media', 'Tutorials'],
    permissions: {
      public: true,
      downloadable: false,
      editable: true
    }
  }
];

export function MetadataManager() {
  const [metadata, setMetadata] = useState<MediaMetadata[]>(mockMetadata);
  const [selectedFile, setSelectedFile] = useState<MediaMetadata | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  const filteredMetadata = metadata.filter(item =>
    item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.basic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.basic.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (item: MediaMetadata) => {
    setSelectedFile(item);
    setIsEditing(true);
  };

  const handleSave = (updatedMetadata: MediaMetadata) => {
    setMetadata(prev => prev.map(item => 
      item.id === updatedMetadata.id ? updatedMetadata : item
    ));
    setIsEditing(false);
    setSelectedFile(null);
  };

  const handleDelete = (id: string) => {
    setMetadata(prev => prev.filter(item => item.id !== id));
    if (selectedFile?.id === id) {
      setSelectedFile(null);
      setIsEditing(false);
    }
  };



  const exportMetadata = () => {
    const dataStr = JSON.stringify(metadata, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'media-metadata.json';
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Metadata Manager</h2>
          <p className="text-muted-foreground">
            Manage and edit metadata for your media files
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowSensitiveData(!showSensitiveData)}
          >
            {showSensitiveData ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide Sensitive Data
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show Sensitive Data
              </>
            )}
          </Button>
          <Button variant="outline" onClick={exportMetadata}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search files, titles, descriptions, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Files List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Media Files ({filteredMetadata.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredMetadata.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedFile?.id === item.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedFile(item)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.fileName}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {item.basic.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {formatFileSize(item.fileSize)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.technical.format}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(item);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metadata Details */}
        <div className="lg:col-span-2">
          {selectedFile ? (
            <div className="space-y-4">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={selectedFile.basic.title}
                        onChange={(e) => setSelectedFile(prev => prev ? {
                          ...prev,
                          basic: { ...prev.basic, title: e.target.value }
                        } : null)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alt">Alt Text</Label>
                      <Input
                        id="alt"
                        value={selectedFile.basic.alt}
                        onChange={(e) => setSelectedFile(prev => prev ? {
                          ...prev,
                          basic: { ...prev.basic, alt: e.target.value }
                        } : null)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={selectedFile.basic.description}
                      onChange={(e) => setSelectedFile(prev => prev ? {
                        ...prev,
                        basic: { ...prev.basic, description: e.target.value }
                      } : null)}
                      disabled={!isEditing}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="caption">Caption</Label>
                    <Input
                      id="caption"
                      value={selectedFile.basic.caption}
                      onChange={(e) => setSelectedFile(prev => prev ? {
                        ...prev,
                        basic: { ...prev.basic, caption: e.target.value }
                      } : null)}
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Technical Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Technical Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Dimensions</Label>
                      <p className="font-medium">
                        {selectedFile.technical.width} × {selectedFile.technical.height}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Format</Label>
                      <p className="font-medium">{selectedFile.technical.format}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Color Space</Label>
                      <p className="font-medium">{selectedFile.technical.colorSpace}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Bit Depth</Label>
                      <p className="font-medium">{selectedFile.technical.bitDepth} bit</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* EXIF Data */}
              {selectedFile.exif && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      EXIF Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Camera</Label>
                        <p className="font-medium">{selectedFile.exif.camera}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Aperture</Label>
                        <p className="font-medium">{selectedFile.exif.aperture}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Shutter Speed</Label>
                        <p className="font-medium">{selectedFile.exif.shutterSpeed}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">ISO</Label>
                        <p className="font-medium">{selectedFile.exif.iso}</p>
                      </div>
                      {selectedFile.exif.gps && showSensitiveData && (
                        <>
                          <div>
                            <Label className="text-xs text-muted-foreground">Latitude</Label>
                            <p className="font-medium">{selectedFile.exif.gps.latitude}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Longitude</Label>
                            <p className="font-medium">{selectedFile.exif.gps.longitude}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tags and Collections */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Tags & Collections
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Tags</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedFile.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Collections</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedFile.collections.map((collection, index) => (
                        <Badge key={index} variant="outline">
                          {collection}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Permissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Permissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        selectedFile.permissions.public ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm">Public</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        selectedFile.permissions.downloadable ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm">Downloadable</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        selectedFile.permissions.editable ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm">Editable</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={() => handleSave(selectedFile)}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setSelectedFile(metadata.find(item => item.id === selectedFile.id) || null);
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Metadata
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No file selected</h3>
                <p className="text-muted-foreground">
                  Select a file from the list to view and edit its metadata
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
