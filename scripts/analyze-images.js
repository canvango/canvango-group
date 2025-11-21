/**
 * Image Analysis Script
 * Analyzes images in the project and provides optimization recommendations
 */

const fs = require('fs');
const path = require('path');

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg'];
const MAX_FILE_SIZE = 500 * 1024; // 500KB
const RECOMMENDED_FORMATS = ['webp', 'avif'];

class ImageAnalyzer {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.images = [];
    this.issues = [];
  }

  /**
   * Scan directory for images
   */
  scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Skip node_modules and other build directories
        if (!['node_modules', 'dist', 'build', '.git'].includes(file)) {
          this.scanDirectory(filePath);
        }
      } else {
        const ext = path.extname(file).toLowerCase();
        if (IMAGE_EXTENSIONS.includes(ext)) {
          this.analyzeImage(filePath, stat);
        }
      }
    });
  }

  /**
   * Analyze individual image
   */
  analyzeImage(filePath, stat) {
    const relativePath = path.relative(this.rootDir, filePath);
    const ext = path.extname(filePath).toLowerCase().slice(1);
    const size = stat.size;

    const image = {
      path: relativePath,
      format: ext,
      size: size,
      sizeKB: (size / 1024).toFixed(2),
      sizeMB: (size / (1024 * 1024)).toFixed(2),
    };

    this.images.push(image);

    // Check for issues
    if (size > MAX_FILE_SIZE) {
      this.issues.push({
        type: 'large-file',
        severity: 'warning',
        path: relativePath,
        message: `File size (${image.sizeKB}KB) exceeds recommended maximum (${MAX_FILE_SIZE / 1024}KB)`,
        recommendation: 'Compress this image or convert to WebP/AVIF format',
      });
    }

    if (['jpg', 'jpeg', 'png'].includes(ext) && size > 100 * 1024) {
      this.issues.push({
        type: 'format',
        severity: 'info',
        path: relativePath,
        message: `Consider converting to modern format (WebP/AVIF)`,
        recommendation: `Convert ${ext.toUpperCase()} to WebP or AVIF for better compression`,
      });
    }
  }

  /**
   * Generate report
   */
  generateReport() {
    console.log('\n📊 IMAGE ANALYSIS REPORT\n');
    console.log('='.repeat(80));

    // Summary
    console.log('\n📈 SUMMARY\n');
    console.log(`Total images found: ${this.images.length}`);
    
    const totalSize = this.images.reduce((sum, img) => sum + img.size, 0);
    console.log(`Total size: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
    
    const avgSize = totalSize / this.images.length;
    console.log(`Average size: ${(avgSize / 1024).toFixed(2)} KB`);

    // Format breakdown
    console.log('\n📁 FORMAT BREAKDOWN\n');
    const formatCounts = {};
    const formatSizes = {};
    
    this.images.forEach((img) => {
      formatCounts[img.format] = (formatCounts[img.format] || 0) + 1;
      formatSizes[img.format] = (formatSizes[img.format] || 0) + img.size;
    });

    Object.entries(formatCounts).forEach(([format, count]) => {
      const size = (formatSizes[format] / (1024 * 1024)).toFixed(2);
      console.log(`  ${format.toUpperCase()}: ${count} files (${size} MB)`);
    });

    // Largest files
    console.log('\n🔍 LARGEST FILES\n');
    const largest = [...this.images]
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);

    largest.forEach((img, index) => {
      console.log(`  ${index + 1}. ${img.path} (${img.sizeKB} KB)`);
    });

    // Issues
    if (this.issues.length > 0) {
      console.log('\n⚠️  ISSUES FOUND\n');
      
      const warnings = this.issues.filter((i) => i.severity === 'warning');
      const infos = this.issues.filter((i) => i.severity === 'info');

      if (warnings.length > 0) {
        console.log(`  Warnings: ${warnings.length}`);
        warnings.slice(0, 5).forEach((issue) => {
          console.log(`    ⚠️  ${issue.path}`);
          console.log(`       ${issue.message}`);
          console.log(`       💡 ${issue.recommendation}\n`);
        });
        
        if (warnings.length > 5) {
          console.log(`    ... and ${warnings.length - 5} more warnings\n`);
        }
      }

      if (infos.length > 0) {
        console.log(`  Info: ${infos.length}`);
        console.log(`    💡 ${infos.length} images could benefit from modern formats\n`);
      }
    } else {
      console.log('\n✅ NO ISSUES FOUND\n');
      console.log('  All images are optimized!\n');
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS\n');
    
    const jpgPngCount = this.images.filter((img) => 
      ['jpg', 'jpeg', 'png'].includes(img.format)
    ).length;
    
    if (jpgPngCount > 0) {
      console.log(`  1. Convert ${jpgPngCount} JPG/PNG images to WebP or AVIF`);
      console.log('     - Use tools like Squoosh, TinyPNG, or Sharp');
      console.log('     - Expected size reduction: 25-50%\n');
    }

    const largeFiles = this.images.filter((img) => img.size > MAX_FILE_SIZE);
    if (largeFiles.length > 0) {
      console.log(`  2. Compress ${largeFiles.length} large images`);
      console.log('     - Target size: < 500KB per image');
      console.log('     - Use compression tools or reduce dimensions\n');
    }

    console.log('  3. Implement lazy loading for all images');
    console.log('     - Use OptimizedImage component');
    console.log('     - Set priority={true} for above-the-fold images\n');

    console.log('  4. Add responsive images with srcset');
    console.log('     - Generate multiple sizes for large images');
    console.log('     - Use responsive={true} prop\n');

    console.log('='.repeat(80));
    console.log('\n✨ Analysis complete!\n');
  }

  /**
   * Run analysis
   */
  run() {
    console.log('🔍 Scanning for images...\n');
    this.scanDirectory(this.rootDir);
    this.generateReport();
  }
}

// Run analyzer
const rootDir = process.cwd();
const analyzer = new ImageAnalyzer(rootDir);
analyzer.run();
