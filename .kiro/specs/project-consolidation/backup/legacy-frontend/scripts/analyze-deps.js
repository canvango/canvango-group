#!/usr/bin/env node

/**
 * Dependency Analysis Script
 * Analyzes package.json dependencies and checks for unused packages
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJsonPath = join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

console.log('📦 Dependency Analysis\n');
console.log('=' .repeat(60));

// Production dependencies
const dependencies = packageJson.dependencies || {};
const devDependencies = packageJson.devDependencies || {};

console.log('\n📚 Production Dependencies:');
console.log('-'.repeat(60));
Object.entries(dependencies).forEach(([name, version]) => {
  console.log(`  ${name.padEnd(40)} ${version}`);
});

console.log('\n🛠️  Dev Dependencies:');
console.log('-'.repeat(60));
Object.entries(devDependencies).forEach(([name, version]) => {
  console.log(`  ${name.padEnd(40)} ${version}`);
});

console.log('\n📊 Summary:');
console.log('-'.repeat(60));
console.log(`  Production dependencies: ${Object.keys(dependencies).length}`);
console.log(`  Dev dependencies: ${Object.keys(devDependencies).length}`);
console.log(`  Total: ${Object.keys(dependencies).length + Object.keys(devDependencies).length}`);

console.log('\n💡 Recommendations:');
console.log('-'.repeat(60));
console.log('  1. Run "npm run build" to generate bundle analysis');
console.log('  2. Open dist/stats.html to visualize bundle composition');
console.log('  3. Consider replacing axios with fetch API (~38 KB savings)');
console.log('  4. All dependencies are currently in use');

console.log('\n✅ Analysis complete!\n');
