/**
 * Build Verification Script
 * 
 * This script verifies that the build output is correct and ready for deployment.
 * It checks:
 * 1. All critical files and directories exist
 * 2. Compiled .js files have proper .js extensions in imports
 * 3. ES module configuration is correct
 * 
 * Run this after build to ensure deployment readiness.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath, description) {
  if (existsSync(filePath)) {
    log(`  ✓ ${description}`, 'green');
    return true;
  } else {
    log(`  ✗ ${description} - NOT FOUND`, 'red');
    return false;
  }
}

function checkDirectoryExists(dirPath, description) {
  if (existsSync(dirPath) && statSync(dirPath).isDirectory()) {
    log(`  ✓ ${description}`, 'green');
    return true;
  } else {
    log(`  ✗ ${description} - NOT FOUND`, 'red');
    return false;
  }
}

function getAllJsFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllJsFiles(filePath, fileList);
    } else if (file.endsWith('.js') && !file.endsWith('.map')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function checkImportExtensions(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/);
    const issues = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip comments
      if (trimmedLine.startsWith('//') || trimmedLine.startsWith('*') || trimmedLine.startsWith('/*')) {
        return;
      }
      
      // Match import/export statements with relative paths
      // Matches: import ... from './path'
      // Matches: export ... from './path'
      const importMatch = line.match(/(?:import|export)\s+.*?\s+from\s+['"](\.[^'"]+)['"]/);
      
      if (importMatch) {
        const importPath = importMatch[1];
        
        // Check if it's a relative import without .js extension
        if (importPath.startsWith('.') && !importPath.endsWith('.js')) {
          issues.push({
            line: index + 1,
            path: importPath,
            fullLine: line.trim()
          });
        }
      }
    });
    
    return issues;
  } catch (error) {
    return null;
  }
}

function main() {
  log('\n=== Build Verification ===\n', 'blue');
  
  const rootDir = join(__dirname, '..');
  let allPassed = true;
  
  // 1. Check Frontend Build
  log('1. Checking Frontend Build Output...', 'cyan');
  const frontendChecks = [
    checkDirectoryExists(join(rootDir, 'dist'), 'dist/ directory'),
    checkFileExists(join(rootDir, 'dist', 'index.html'), 'dist/index.html'),
  ];
  
  if (!frontendChecks.every(Boolean)) {
    allPassed = false;
  }
  
  // 2. Check Backend Build
  log('\n2. Checking Backend Build Output...', 'cyan');
  const backendChecks = [
    checkDirectoryExists(join(rootDir, 'server', 'dist'), 'server/dist/ directory'),
    checkFileExists(join(rootDir, 'server', 'dist', 'index.js'), 'server/dist/index.js'),
    checkFileExists(join(rootDir, 'server', 'dist', 'package.json'), 'server/dist/package.json'),
  ];
  
  if (!backendChecks.every(Boolean)) {
    allPassed = false;
  }
  
  // 3. Check Critical Backend Directories
  log('\n3. Checking Backend Directory Structure...', 'cyan');
  const criticalDirs = [
    'config',
    'controllers',
    'middleware',
    'models',
    'routes',
    'utils'
  ];
  
  criticalDirs.forEach(dir => {
    const dirPath = join(rootDir, 'server', 'dist', dir);
    if (!checkDirectoryExists(dirPath, `server/dist/${dir}/`)) {
      allPassed = false;
    }
  });
  
  // 4. Check Critical Backend Files
  log('\n4. Checking Critical Backend Files...', 'cyan');
  const criticalFiles = [
    'config/supabase.js',
    'config/database.js',
    'controllers/productAccount.controller.js',
    'controllers/purchase.controller.js',
    'models/productAccount.model.js',
    'models/productAccountField.model.js',
  ];
  
  criticalFiles.forEach(file => {
    const filePath = join(rootDir, 'server', 'dist', file);
    if (!checkFileExists(filePath, `server/dist/${file}`)) {
      allPassed = false;
    }
  });
  
  // 5. Check ES Module Configuration
  log('\n5. Checking ES Module Configuration...', 'cyan');
  try {
    const packageJsonPath = join(rootDir, 'server', 'dist', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    
    if (packageJson.type === 'module') {
      log('  ✓ server/dist/package.json has "type": "module"', 'green');
    } else {
      log('  ✗ server/dist/package.json missing "type": "module"', 'red');
      allPassed = false;
    }
  } catch (error) {
    log('  ✗ Could not read server/dist/package.json', 'red');
    allPassed = false;
  }
  
  // 6. Check Import Extensions in Compiled Files
  log('\n6. Checking Import Extensions in Compiled Files...', 'cyan');
  log('  Scanning for missing .js extensions in imports...', 'blue');
  
  const serverDistPath = join(rootDir, 'server', 'dist');
  if (existsSync(serverDistPath)) {
    const jsFiles = getAllJsFiles(serverDistPath);
    let filesWithIssues = 0;
    let totalIssues = 0;
    
    jsFiles.forEach(filePath => {
      const issues = checkImportExtensions(filePath);
      
      if (issues === null) {
        // Could not read file
        return;
      }
      
      if (issues.length > 0) {
        filesWithIssues++;
        totalIssues += issues.length;
        
        const relativePath = filePath.replace(rootDir, '').replace(/\\/g, '/');
        log(`\n  ✗ ${relativePath}`, 'red');
        
        issues.forEach(issue => {
          log(`    Line ${issue.line}: ${issue.path}`, 'yellow');
          log(`    ${issue.fullLine}`, 'yellow');
        });
      }
    });
    
    if (filesWithIssues === 0) {
      log('  ✓ All imports have correct .js extensions', 'green');
    } else {
      log(`\n  ✗ Found ${totalIssues} missing .js extensions in ${filesWithIssues} files`, 'red');
      allPassed = false;
    }
  } else {
    log('  ✗ server/dist directory not found', 'red');
    allPassed = false;
  }
  
  // 7. Check Serverless Entry Point
  log('\n7. Checking Serverless Entry Point...', 'cyan');
  const serverlessEntry = join(rootDir, 'server.js');
  if (checkFileExists(serverlessEntry, 'server.js (Vercel entry point)')) {
    try {
      const content = readFileSync(serverlessEntry, 'utf-8');
      
      // Check for ES module syntax
      if (content.includes('import ') || content.includes('export ')) {
        log('  ✓ Uses ES module syntax', 'green');
      } else {
        log('  ⚠ Uses CommonJS syntax (may need update)', 'yellow');
      }
      
      // Check for error handling
      if (content.includes('try') && content.includes('catch')) {
        log('  ✓ Has error handling', 'green');
      } else {
        log('  ⚠ Missing error handling', 'yellow');
      }
    } catch (error) {
      log('  ✗ Could not read server.js', 'red');
      allPassed = false;
    }
  } else {
    allPassed = false;
  }
  
  // Summary
  log('\n=== Summary ===\n', 'blue');
  if (allPassed) {
    log('✅ Build verification passed!', 'green');
    log('\nYour build is ready for deployment to Vercel.', 'green');
    log('\nNext steps:', 'blue');
    log('  1. Test locally: npm start', 'cyan');
    log('  2. Commit changes: git add . && git commit -m "Fix: Add .js extensions"', 'cyan');
    log('  3. Deploy: git push', 'cyan');
    return 0;
  } else {
    log('❌ Build verification failed!', 'red');
    log('\nPlease fix the issues above before deploying.', 'yellow');
    log('\nCommon fixes:', 'blue');
    log('  - Run: npm run build', 'cyan');
    log('  - Add .js extensions to relative imports in TypeScript files', 'cyan');
    log('  - Ensure server/dist/package.json exists with "type": "module"', 'cyan');
    process.exit(1);
  }
}

// Run the verification
try {
  const exitCode = main();
  process.exit(exitCode || 0);
} catch (error) {
  log('\n❌ Verification script error:', 'red');
  log(error.message, 'red');
  process.exit(1);
}
