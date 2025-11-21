/**
 * Accessibility Testing Script
 * Runs automated accessibility tests on the application
 */

const { AxePuppeteer } = require('@axe-core/puppeteer');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Pages to test
const PAGES_TO_TEST = [
  { name: 'Dashboard', url: '/member/dashboard' },
  { name: 'Products - BM Accounts', url: '/member/accounts/bm' },
  { name: 'Products - Personal', url: '/member/accounts/personal' },
  { name: 'Transactions', url: '/member/transactions' },
  { name: 'Top Up', url: '/member/topup' },
  { name: 'Warranty', url: '/member/warranty' },
  { name: 'API Documentation', url: '/member/api' },
  { name: 'Tutorials', url: '/member/tutorials' },
];

// Base URL
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// Results directory
const RESULTS_DIR = path.join(__dirname, '../accessibility-results');

class AccessibilityTester {
  constructor() {
    this.browser = null;
    this.results = [];
  }

  /**
   * Initialize browser
   */
  async init() {
    console.log('🚀 Starting accessibility tests...\n');
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    // Create results directory
    if (!fs.existsSync(RESULTS_DIR)) {
      fs.mkdirSync(RESULTS_DIR, { recursive: true });
    }
  }

  /**
   * Test a single page
   */
  async testPage(pageConfig) {
    const { name, url } = pageConfig;
    console.log(`Testing: ${name}`);

    const page = await this.browser.newPage();
    
    try {
      // Navigate to page
      await page.goto(`${BASE_URL}${url}`, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      // Wait for content to load
      await page.waitForTimeout(2000);

      // Run axe tests
      const results = await new AxePuppeteer(page).analyze();

      // Store results
      this.results.push({
        name,
        url,
        violations: results.violations,
        passes: results.passes.length,
        incomplete: results.incomplete.length,
        inapplicable: results.inapplicable.length,
      });

      // Log summary
      console.log(`  ✓ Passes: ${results.passes.length}`);
      console.log(`  ⚠️  Violations: ${results.violations.length}`);
      console.log(`  ❓ Incomplete: ${results.incomplete.length}\n`);

      // Save detailed results
      this.savePageResults(name, results);

    } catch (error) {
      console.error(`  ❌ Error testing ${name}:`, error.message);
      this.results.push({
        name,
        url,
        error: error.message,
      });
    } finally {
      await page.close();
    }
  }

  /**
   * Save page results to file
   */
  savePageResults(pageName, results) {
    const filename = `${pageName.toLowerCase().replace(/\s+/g, '-')}.json`;
    const filepath = path.join(RESULTS_DIR, filename);

    fs.writeFileSync(filepath, JSON.stringify(results, null, 2));
  }

  /**
   * Generate summary report
   */
  generateSummaryReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 ACCESSIBILITY TEST SUMMARY');
    console.log('='.repeat(80) + '\n');

    let totalViolations = 0;
    let totalPasses = 0;
    let criticalIssues = 0;
    let seriousIssues = 0;
    let moderateIssues = 0;
    let minorIssues = 0;

    // Calculate totals
    this.results.forEach((result) => {
      if (result.error) return;

      totalPasses += result.passes || 0;
      totalViolations += result.violations?.length || 0;

      result.violations?.forEach((violation) => {
        switch (violation.impact) {
          case 'critical':
            criticalIssues++;
            break;
          case 'serious':
            seriousIssues++;
            break;
          case 'moderate':
            moderateIssues++;
            break;
          case 'minor':
            minorIssues++;
            break;
        }
      });
    });

    // Print summary
    console.log(`Pages tested: ${this.results.length}`);
    console.log(`Total passes: ${totalPasses}`);
    console.log(`Total violations: ${totalViolations}\n`);

    console.log('Violations by severity:');
    console.log(`  🔴 Critical: ${criticalIssues}`);
    console.log(`  🟠 Serious: ${seriousIssues}`);
    console.log(`  🟡 Moderate: ${moderateIssues}`);
    console.log(`  🟢 Minor: ${minorIssues}\n`);

    // Print violations by page
    console.log('Violations by page:');
    this.results.forEach((result) => {
      if (result.error) {
        console.log(`  ❌ ${result.name}: Error - ${result.error}`);
      } else {
        const status = result.violations.length === 0 ? '✅' : '⚠️';
        console.log(`  ${status} ${result.name}: ${result.violations.length} violations`);
      }
    });

    // Print top violations
    if (totalViolations > 0) {
      console.log('\n' + '='.repeat(80));
      console.log('🔍 TOP VIOLATIONS');
      console.log('='.repeat(80) + '\n');

      const violationCounts = {};

      this.results.forEach((result) => {
        result.violations?.forEach((violation) => {
          const key = violation.id;
          if (!violationCounts[key]) {
            violationCounts[key] = {
              id: violation.id,
              description: violation.description,
              impact: violation.impact,
              count: 0,
              helpUrl: violation.helpUrl,
            };
          }
          violationCounts[key].count += violation.nodes.length;
        });
      });

      const topViolations = Object.values(violationCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      topViolations.forEach((violation, index) => {
        const impactEmoji = {
          critical: '🔴',
          serious: '🟠',
          moderate: '🟡',
          minor: '🟢',
        }[violation.impact];

        console.log(`${index + 1}. ${impactEmoji} ${violation.id} (${violation.count} instances)`);
        console.log(`   ${violation.description}`);
        console.log(`   ${violation.helpUrl}\n`);
      });
    }

    // Save summary
    const summaryPath = path.join(RESULTS_DIR, 'summary.json');
    fs.writeFileSync(
      summaryPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          totalPages: this.results.length,
          totalPasses,
          totalViolations,
          criticalIssues,
          seriousIssues,
          moderateIssues,
          minorIssues,
          results: this.results,
        },
        null,
        2
      )
    );

    console.log('='.repeat(80));
    console.log(`\n📁 Detailed results saved to: ${RESULTS_DIR}\n`);

    // Exit with error if critical or serious issues found
    if (criticalIssues > 0 || seriousIssues > 0) {
      console.log('❌ Tests failed: Critical or serious accessibility issues found\n');
      process.exit(1);
    } else if (totalViolations > 0) {
      console.log('⚠️  Tests passed with warnings: Minor accessibility issues found\n');
      process.exit(0);
    } else {
      console.log('✅ All accessibility tests passed!\n');
      process.exit(0);
    }
  }

  /**
   * Run all tests
   */
  async run() {
    try {
      await this.init();

      // Test each page
      for (const page of PAGES_TO_TEST) {
        await this.testPage(page);
      }

      // Generate summary
      this.generateSummaryReport();

    } catch (error) {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Run tests
const tester = new AccessibilityTester();
tester.run();
