/**
 * Environment Variable Verification Script
 * 
 * This script verifies that all required environment variables are properly configured.
 * Run this after consolidation to ensure environment setup is correct.
 */

import { readFileSync } from 'fs';
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
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/);
    const variables = {};
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const equalIndex = trimmed.indexOf('=');
        if (equalIndex > 0) {
          const key = trimmed.substring(0, equalIndex).trim();
          const value = trimmed.substring(equalIndex + 1).trim();
          variables[key] = value;
        }
      }
    });
    
    return { exists: true, variables };
  } catch (error) {
    return { exists: false, variables: {} };
  }
}

function main() {
  log('\n=== Environment Variable Verification ===\n', 'blue');
  
  const rootDir = join(__dirname, '..');
  
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];
  
  let allPassed = true;
  
  // Check .env.example
  log('Checking .env.example...', 'blue');
  const exampleResult = checkEnvFile(join(rootDir, '.env.example'));
  
  if (!exampleResult.exists) {
    log('  ✗ File not found', 'red');
    allPassed = false;
  } else {
    log('  ✓ File exists', 'green');
    requiredVars.forEach(varName => {
      if (varName in exampleResult.variables) {
        log(`  ✓ ${varName}: Template present`, 'green');
      } else {
        log(`  ✗ ${varName}: Missing from template`, 'red');
        allPassed = false;
      }
    });
  }
  
  // Check .env.development.local (primary development file)
  log('\nChecking .env.development.local (primary)...', 'blue');
  const devResult = checkEnvFile(join(rootDir, '.env.development.local'));
  
  if (!devResult.exists) {
    log('  ✗ File not found (REQUIRED)', 'red');
    allPassed = false;
  } else {
    log('  ✓ File exists', 'green');
    
    requiredVars.forEach(varName => {
      const value = devResult.variables[varName];
      
      if (!value) {
        log(`  ✗ ${varName}: Not set`, 'red');
        allPassed = false;
      } else if (value === 'your-anon-key' || value === 'https://xxxxx.supabase.co') {
        log(`  ✗ ${varName}: Using placeholder value`, 'red');
        allPassed = false;
      } else {
        const preview = value.length > 30 ? value.substring(0, 30) + '...' : value;
        log(`  ✓ ${varName}: ${preview}`, 'green');
      }
    });
  }
  
  // Check .env.local (optional, for local overrides)
  log('\nChecking .env.local (optional)...', 'blue');
  const localResult = checkEnvFile(join(rootDir, '.env.local'));
  
  if (!localResult.exists) {
    log('  ⚠ File not found (this is optional)', 'yellow');
  } else {
    log('  ✓ File exists', 'green');
    
    requiredVars.forEach(varName => {
      const value = localResult.variables[varName];
      
      if (value && value !== 'your-anon-key' && value !== 'https://xxxxx.supabase.co') {
        const preview = value.length > 30 ? value.substring(0, 30) + '...' : value;
        log(`  ✓ ${varName}: ${preview}`, 'green');
      }
    });
  }
  
  // Summary
  log('\n=== Summary ===\n', 'blue');
  if (allPassed) {
    log('✓ All required environment variables are properly configured!', 'green');
    log('\nYou can now run the development server with: npm run dev', 'blue');
    log('\nNote: Vite will use .env.development.local for development mode.', 'blue');
  } else {
    log('✗ Some required environment variables are missing or misconfigured.', 'red');
    log('\nPlease check the errors above and update your .env files.', 'yellow');
    log('\nRequired file: .env.development.local', 'yellow');
    log('Template file: .env.example', 'yellow');
    process.exit(1);
  }
}

main();
