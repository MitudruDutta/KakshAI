# PDF Parsing System

Provides a unified interface supporting multiple PDF parsing providers.

## Supported Providers

### 1. unpdf (Built-in)

- **Cost**: Free, built-in
- **Features**: Basic text extraction, image extraction
- **Requirements**: None
- **Usage**: Directly upload PDF files

### 2. MinerU (Local Deployment)

- **Cost**: Free (requires self-deployment)
- **Features**:
  - Advanced text extraction (preserves Markdown layout)
  - Table recognition
  - Formula extraction (LaTeX)
  - Better OCR support
  - Multiple output formats (markdown, JSON, docx, html, latex)
- **Requirements**:
  - Deploy MinerU service (Docker or source)
  - Configure server address
- **Advantages**: Data privacy, no file size limits

## Quick Start

### Deploy MinerU (Optional)

```bash
# Docker deployment (recommended)
docker pull opendatalab/mineru:latest
docker run -d --name mineru -p 8080:8080 opendatalab/mineru:latest

# Verify
curl http://localhost:8080/api/health
```

### API Usage

#### Using unpdf (File Upload)

```typescript
const formData = new FormData();
formData.append('pdf', pdfFile);
formData.append('providerId', 'unpdf');

const response = await fetch('/api/parse-pdf', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
// result.data: ParsedPdfContent
```

#### Using MinerU (Local Service)

```typescript
const formData = new FormData();
formData.append('pdf', pdfFile);
formData.append('providerId', 'mineru');
formData.append('baseUrl', 'http://localhost:8080');

const response = await fetch('/api/parse-pdf', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
// result.data: ParsedPdfContent with imageMapping
```

## Response Format

```typescript
interface ParsedPdfContent {
  text: string; // Extracted text (Markdown for MinerU)
  images: string[]; // Base64 image array

  // Extended features (MinerU)
  tables?: Array<{
    page: number;
    data: string[][];
    caption?: string;
  }>;

  formulas?: Array<{
    page: number;
    latex: string;
    position?: { x: number; y: number; width: number; height: number };
  }>;

  layout?: Array<{
    page: number;
    type: 'title' | 'text' | 'image' | 'table' | 'formula';
    content: string;
    position?: { x: number; y: number; width: number; height: number };
  }>;

  metadata?: {
    pageCount: number;
    parser: 'unpdf' | 'mineru';
    fileName?: string;
    fileSize?: number;
    processingTime?: number;

    // For content generation pipeline (MinerU)
    imageMapping?: Record<string, string>; // img_1 -> base64 URL
    pdfImages?: Array<{
      id: string; // img_1, img_2, etc.
      src: string; // base64 data URL
      pageNumber: number; // PDF page number
      description?: string; // Image description
    }>;
  };
}
```

## Integration with Content Generation

MinerU parser integrates seamlessly with the content generation pipeline:

```typescript
// 1. Parse PDF
const parseResult = await parsePDF(
  {
    providerId: 'mineru',
    baseUrl: 'http://localhost:8080',
  },
  buffer,
);

// 2. Extract data
const pdfText = parseResult.text; // Markdown (with img_1 references)
const pdfImages = parseResult.metadata.pdfImages; // Image array
const imageMapping = parseResult.metadata.imageMapping; // Image mapping

// 3. Generate scene outlines
await generateSceneOutlinesFromRequirements(
  requirements,
  pdfText, // Markdown content
  pdfImages, // Images with page numbers
  aiCall,
);

// 4. Generate scenes (with images)
await buildSceneFromOutline(
  outline,
  aiCall,
  stageId,
  assignedImages, // Filtered from pdfImages
  imageMapping, // For resolving img_1 to actual URLs
);
```

## Image Processing Pipeline

MinerU image processing:

1. **Extract**: PDF → MinerU → Markdown + images
2. **Convert**: `![alt](images/img_1.png)` → `![alt](img_1)`
3. **Map**: Create `{ "img_1": "data:image/png;base64,..." }`
4. **Generate**: AI uses `img_1` references to generate slides
5. **Resolve**: `resolveImageIds()` replaces with actual URLs
6. **Render**: Slides display images

## Configuration

### Global Settings

```typescript
import { useSettingsStore } from '@/lib/store/settings';

useSettingsStore.setState({
  pdfProviderId: 'mineru',
  pdfProvidersConfig: {
    mineru: {
      baseUrl: 'http://localhost:8080',
      apiKey: 'optional-if-needed',
    },
  },
});
```

### Per-Request Configuration

```typescript
// Override global settings in API calls
formData.append('providerId', 'mineru');
formData.append('baseUrl', 'http://your-server:8080');
formData.append('apiKey', 'optional');
```

## Adding New Providers

### 1. Define Provider

`lib/pdf/constants.ts`:

```typescript
export const PDF_PROVIDERS = {
  myProvider: {
    id: 'myProvider',
    name: 'My Provider',
    requiresApiKey: true,
    features: ['text', 'images'],
  },
};
```

### 2. Implement Parser

`lib/pdf/pdf-providers.ts`:

```typescript
async function parseWithMyProvider(
  config: PDFParserConfig,
  pdfBuffer: Buffer
): Promise<ParsedPdfContent> {
  // Implement parsing logic
  return {
    text: '...',
    images: [...],
    metadata: {
      pageCount: 0,
      parser: 'myProvider',
    },
  };
}
```

### 3. Add to Route

```typescript
switch (config.providerId) {
  case 'unpdf':
    result = await parseWithUnpdf(pdfBuffer);
    break;
  case 'mineru':
    result = await parseWithMinerU(config, pdfBuffer);
    break;
  case 'myProvider':
    result = await parseWithMyProvider(config, pdfBuffer);
    break;
}
```

## Debug Tools

Visit http://localhost:3000/debug/pdf-parser to test parsing:

- Toggle providers (unpdf/MinerU)
- Upload PDF files
- Configure server address
- View parsing results
- Check image mappings

## FAQ

### Q: Can't connect to MinerU service?

**A**: Check:

```bash
# Service status
docker ps | grep mineru

# Network connectivity
curl http://localhost:8080/api/health

# Logs
docker logs mineru
```

### Q: Images not displaying?

**A**: Ensure:

1. `imageMapping` is correctly passed to scene-stream API
2. Image ID format is correct (img_1, img_2)
3. Base64 encoding is complete

### Q: Parsing is slow?

**A**: Optimize:

```bash
# Increase Docker resources
docker run -d \
  --name mineru \
  -p 8080:8080 \
  --memory=4g \
  --cpus=2 \
  opendatalab/mineru:latest
```

### Q: unpdf vs MinerU — how to choose?

**A**: Recommendations:

| Scenario                  | Recommended |
| ------------------------- | ----------- |
| Simple PDF (text only)    | unpdf       |
| Contains tables, formulas | MinerU      |
| Need to preserve layout   | MinerU      |
| Quick testing             | unpdf       |
| Production environment    | MinerU      |
| Cannot deploy service     | unpdf       |

## Performance Tips

### MinerU Concurrent Processing

```typescript
const files = [file1, file2, file3];

const results = await Promise.all(
  files.map((file) => {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('providerId', 'mineru');
    return fetch('/api/parse-pdf', {
      method: 'POST',
      body: formData,
    }).then((r) => r.json());
  }),
);
```

### Result Caching

```typescript
// Consider caching parse results
const cacheKey = `pdf_${fileHash}`;
const cached = localStorage.getItem(cacheKey);
if (cached) {
  return JSON.parse(cached);
}
```

## References

- **MinerU GitHub**: https://github.com/opendatalab/MinerU
- **Quick Start**: `/MINERU_QUICKSTART.md`
- **Changelog**: `/MINERU_LOCAL_DEPLOYMENT.md`
- **Debug Tool**: http://localhost:3000/debug/pdf-parser
