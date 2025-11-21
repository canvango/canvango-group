# Image Optimization Quick Reference

## Components

### OptimizedImage (Recommended)

```tsx
import { OptimizedImage } from '@/shared/components';

// Basic
<OptimizedImage src="/img.jpg" alt="Description" width={800} height={600} />

// Responsive
<OptimizedImage src="/img.jpg" alt="Description" width={800} height={600} responsive />

// Priority (above fold)
<OptimizedImage src="/hero.jpg" alt="Hero" width={1920} height={1080} priority />

// Custom placeholder
<OptimizedImage src="/img.jpg" alt="Description" width={800} height={600} placeholder="blur" />
```

### LazyImage (Simple)

```tsx
import { LazyImage } from '@/shared/components';

<LazyImage src="/img.jpg" alt="Description" />
```

## Utilities

### Preload Critical Images

```tsx
import { preloadImages } from '@/shared/utils';

useEffect(() => {
  preloadImages(['/logo.svg', '/hero.webp']);
}, []);
```

### Get Best Format

```tsx
import { getBestImageFormat } from '@/shared/utils';

const format = getBestImageFormat(); // 'avif' | 'webp' | 'jpg'
```

### Build Optimized URL

```tsx
import { buildOptimizedImageUrl } from '@/shared/utils';

const url = buildOptimizedImageUrl('/img.jpg', {
  width: 800,
  quality: 85,
  format: 'webp'
});
```

## Best Practices

### ✅ Do

- Compress images before adding to project
- Use OptimizedImage for automatic format selection
- Specify width and height to prevent layout shift
- Use priority for above-the-fold images
- Implement lazy loading for below-the-fold images
- Provide meaningful alt text
- Use SVG for icons and logos

### ❌ Don't

- Serve oversized images
- Skip alt text
- Use JPG/PNG when WebP/AVIF is better
- Load all images eagerly
- Forget to specify dimensions

## Image Sizes

| Size | Width | Use Case |
|------|-------|----------|
| thumbnail | 150px | Avatars, small previews |
| small | 320px | Mobile images |
| medium | 640px | Tablet images |
| large | 1024px | Desktop images |
| xlarge | 1920px | Hero banners |

## Format Priority

1. **AVIF** - Best compression (80% quality)
2. **WebP** - Good compression (85% quality)
3. **JPG** - Universal fallback (85% quality)

## Common Patterns

### Product Card

```tsx
<OptimizedImage
  src={product.image}
  alt={product.title}
  width={400}
  height={300}
  className="rounded-lg"
/>
```

### Hero Banner

```tsx
<OptimizedImage
  src="/hero.jpg"
  alt="Welcome"
  width={1920}
  height={600}
  priority
  responsive
  sizes="100vw"
/>
```

### Avatar

```tsx
<OptimizedImage
  src={user.avatar}
  alt={user.name}
  width={150}
  height={150}
  className="rounded-full"
/>
```

### Gallery

```tsx
{images.map(img => (
  <OptimizedImage
    key={img.id}
    src={img.url}
    alt={img.title}
    width={600}
    height={400}
    responsive
  />
))}
```

## Tools

- **Compress**: TinyPNG, Squoosh, ImageOptim
- **Convert**: Convertio, CloudConvert
- **Test**: Lighthouse, PageSpeed Insights
- **Analyze**: `node scripts/analyze-images.js`

## Checklist

- [ ] Images compressed (< 500KB)
- [ ] Modern formats (WebP/AVIF)
- [ ] Lazy loading enabled
- [ ] Priority for critical images
- [ ] Dimensions specified
- [ ] Alt text provided
- [ ] Responsive images for large assets
- [ ] SVG for icons

## Performance Targets

- **First Contentful Paint**: < 1.8s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Image Size**: < 500KB per image
- **Total Image Weight**: < 2MB per page
