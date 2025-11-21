# Image Optimization Guide

This guide covers best practices for optimizing images in the Member Area application.

## Overview

Image optimization is crucial for:
- **Performance**: Faster page load times
- **User Experience**: Quicker content display
- **Bandwidth**: Reduced data usage
- **SEO**: Better search engine rankings

## Components

### OptimizedImage

The `OptimizedImage` component automatically handles:
- Format selection (AVIF → WebP → JPG)
- Lazy loading
- Responsive images
- Blur placeholders

```tsx
import OptimizedImage from '@/shared/components/OptimizedImage';

// Basic usage
<OptimizedImage
  src="/images/product.jpg"
  alt="Product image"
  width={800}
  height={600}
/>

// With responsive images
<OptimizedImage
  src="/images/hero.jpg"
  alt="Hero banner"
  width={1920}
  height={1080}
  responsive
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// Priority loading (above the fold)
<OptimizedImage
  src="/images/logo.png"
  alt="Company logo"
  width={200}
  height={60}
  priority
/>
```

### LazyImage

For simpler lazy loading without format optimization:

```tsx
import LazyImage from '@/shared/components/LazyImage';

<LazyImage
  src="/images/thumbnail.jpg"
  alt="Thumbnail"
  className="rounded-lg"
/>
```

## Image Formats

### Format Priority

1. **AVIF** - Best compression, newest format
2. **WebP** - Good compression, wide support
3. **JPG** - Universal fallback

### When to Use Each Format

- **AVIF/WebP**: Photos, complex images
- **PNG**: Logos, icons with transparency
- **SVG**: Simple icons, logos (vector)
- **JPG**: Photos without transparency

## Optimization Strategies

### 1. Compress Images

Before adding images to the project:

```bash
# Using ImageOptim (Mac)
imageoptim image.jpg

# Using TinyPNG (Online)
# Visit https://tinypng.com

# Using sharp (Node.js)
npm install sharp
```

Example compression script:

```javascript
// scripts/compress-images.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function compressImage(inputPath, outputPath) {
  await sharp(inputPath)
    .jpeg({ quality: 85, progressive: true })
    .webp({ quality: 85 })
    .avif({ quality: 80 })
    .toFile(outputPath);
}
```

### 2. Use Appropriate Sizes

Don't serve oversized images:

```tsx
// ❌ Bad: Serving 4K image for thumbnail
<img src="/images/product-4k.jpg" width="150" height="150" />

// ✅ Good: Using appropriately sized image
<OptimizedImage
  src="/images/product-thumbnail.jpg"
  width={150}
  height={150}
  alt="Product"
/>
```

### 3. Implement Lazy Loading

Load images only when needed:

```tsx
// ✅ Lazy load images below the fold
<OptimizedImage
  src="/images/gallery-1.jpg"
  alt="Gallery image"
  width={600}
  height={400}
/>

// ✅ Priority load above the fold
<OptimizedImage
  src="/images/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  priority
/>
```

### 4. Use Responsive Images

Serve different sizes for different screens:

```tsx
<OptimizedImage
  src="/images/banner.jpg"
  alt="Banner"
  width={1920}
  height={600}
  responsive
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
/>
```

### 5. Preload Critical Images

For images that must load immediately:

```tsx
import { preloadImages } from '@/shared/utils/image-optimization';

// In component or app initialization
useEffect(() => {
  preloadImages([
    '/images/logo.svg',
    '/images/hero.webp',
  ]);
}, []);
```

## Image Sizes Reference

Standard sizes defined in `image-config.ts`:

| Size | Width | Use Case |
|------|-------|----------|
| thumbnail | 150px | Product thumbnails, avatars |
| small | 320px | Mobile images |
| medium | 640px | Tablet images |
| large | 1024px | Desktop images |
| xlarge | 1920px | Hero images, banners |

## Best Practices

### 1. Always Provide Alt Text

```tsx
// ❌ Bad
<img src="/image.jpg" alt="" />

// ✅ Good
<OptimizedImage
  src="/image.jpg"
  alt="Product showcase featuring blue widgets"
/>
```

### 2. Specify Dimensions

Prevents layout shift:

```tsx
// ❌ Bad: No dimensions
<img src="/image.jpg" alt="Product" />

// ✅ Good: Explicit dimensions
<OptimizedImage
  src="/image.jpg"
  alt="Product"
  width={800}
  height={600}
/>
```

### 3. Use Placeholders

Improve perceived performance:

```tsx
<OptimizedImage
  src="/image.jpg"
  alt="Product"
  width={800}
  height={600}
  placeholder="blur" // Shows blur while loading
/>
```

### 4. Optimize for Connection Speed

The system automatically adjusts quality based on connection:

- **Slow 2G**: 50% quality
- **2G**: 60% quality
- **3G**: 70% quality
- **4G**: 85% quality

### 5. Use SVG for Icons

```tsx
// ✅ Good: SVG for icons
<img src="/icons/check.svg" alt="" aria-hidden="true" />

// Or inline SVG
<svg>...</svg>
```

## Performance Checklist

- [ ] All images compressed before adding to project
- [ ] Images converted to WebP/AVIF where appropriate
- [ ] Lazy loading enabled for below-the-fold images
- [ ] Priority loading for above-the-fold images
- [ ] Responsive images with srcset for large images
- [ ] Alt text provided for all meaningful images
- [ ] Dimensions specified to prevent layout shift
- [ ] SVG used for icons and simple graphics
- [ ] Critical images preloaded
- [ ] No images larger than 500KB

## Tools and Resources

### Compression Tools

- **TinyPNG**: https://tinypng.com
- **Squoosh**: https://squoosh.app
- **ImageOptim**: https://imageoptim.com (Mac)
- **Sharp**: https://sharp.pixelplumbing.com (Node.js)

### Testing Tools

- **Lighthouse**: Built into Chrome DevTools
- **WebPageTest**: https://webpagetest.org
- **PageSpeed Insights**: https://pagespeed.web.dev

### Format Converters

- **Convertio**: https://convertio.co
- **CloudConvert**: https://cloudconvert.com
- **AVIF Converter**: https://avif.io

## Common Issues

### Issue: Images Not Loading

**Solution**: Check browser support and fallbacks

```tsx
// Ensure fallback is provided
<picture>
  <source srcSet="/image.avif" type="image/avif" />
  <source srcSet="/image.webp" type="image/webp" />
  <img src="/image.jpg" alt="Fallback" />
</picture>
```

### Issue: Layout Shift

**Solution**: Always specify dimensions

```tsx
<OptimizedImage
  src="/image.jpg"
  alt="Product"
  width={800}
  height={600}
  className="w-full h-auto" // Responsive but maintains aspect ratio
/>
```

### Issue: Slow Loading

**Solution**: Implement lazy loading and compression

```tsx
<OptimizedImage
  src="/large-image.jpg"
  alt="Large image"
  width={1920}
  height={1080}
  quality={80} // Reduce quality for faster loading
/>
```

## Migration Guide

### From Standard img to OptimizedImage

```tsx
// Before
<img
  src="/images/product.jpg"
  alt="Product"
  className="w-full rounded-lg"
/>

// After
<OptimizedImage
  src="/images/product.jpg"
  alt="Product"
  width={800}
  height={600}
  className="w-full rounded-lg"
  responsive
/>
```

### From LazyImage to OptimizedImage

```tsx
// Before
<LazyImage
  src="/images/product.jpg"
  alt="Product"
/>

// After
<OptimizedImage
  src="/images/product.jpg"
  alt="Product"
  width={800}
  height={600}
/>
```

## Examples

### Product Card Image

```tsx
<OptimizedImage
  src={product.image}
  alt={product.title}
  width={400}
  height={300}
  className="rounded-lg object-cover"
  placeholder="blur"
/>
```

### Hero Banner

```tsx
<OptimizedImage
  src="/images/hero.jpg"
  alt="Welcome to Canvango Group"
  width={1920}
  height={600}
  priority
  responsive
  sizes="100vw"
  className="w-full h-auto"
/>
```

### Avatar/Thumbnail

```tsx
<OptimizedImage
  src={user.avatar}
  alt={user.name}
  width={150}
  height={150}
  className="rounded-full"
/>
```

### Gallery Grid

```tsx
{images.map((image) => (
  <OptimizedImage
    key={image.id}
    src={image.url}
    alt={image.title}
    width={600}
    height={400}
    responsive
    className="rounded-lg"
  />
))}
```

## Summary

- Use `OptimizedImage` for automatic format selection and optimization
- Compress all images before adding to project
- Implement lazy loading for below-the-fold images
- Use priority loading for critical above-the-fold images
- Provide responsive images with srcset for large images
- Always specify dimensions to prevent layout shift
- Use SVG for icons and simple graphics
- Test with Lighthouse and fix any image-related issues
