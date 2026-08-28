#!/usr/bin/env node
/**
 * SquadCart Console SQA — Main Test Runner
 * File: sqa/run.mjs
 *
 * Runs Selenium frontend tests for the admin console, then generates:
 *   - Terminal summary
 *   - sqa/reports/report.md  (Markdown)
 *   - sqa/reports/report.html (HTML)
 *
 * Usage: node sqa/run.mjs
 */

import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));

const startTime = Date.now();

console.log('\n\x1b[1m\x1b[35m══════════════════════════════════════════\x1b[0m');
console.log('\x1b[1m\x1b[35m  SquadCart Console SQA Automation\x1b[0m');
console.log('\x1b[1m\x1b[35m══════════════════════════════════════════\x1b[0m');
console.log(`  Started: ${new Date().toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' })}`);
console.log(`  Target:  ${process.env.SQA_CONSOLE_URL ?? 'https://console.squadcart.app'}`);

let frontResults = { passed: 0, failed: 0, skipped: 0, sections: [] };

console.log('\n\x1b[1m\x1b[36m┌─ FRONTEND TESTS (Selenium) ─────────────┐\x1b[0m');
try {
  const mod = await import('./frontend.test.mjs');
  frontResults = mod.default;
} catch (err) {
  console.error('\x1b[31mFrontend test suite crashed:\x1b[0m', err.message);
}

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
const total   = frontResults.passed + frontResults.failed + frontResults.skipped;
const score = total > 0 ? Math.round((frontResults.passed / (total - frontResults.skipped)) * 100) : 0;

console.log('\n\x1b[1m\x1b[35m══════════════════════════════════════════\x1b[0m');
console.log('\x1b[1m  RESULTS SUMMARY\x1b[0m');
console.log('\x1b[1m\x1b[35m══════════════════════════════════════════\x1b[0m');
console.log(`  \x1b[32m✓ Passed:  ${frontResults.passed}\x1b[0m`);
console.log(`  \x1b[31m✗ Failed:  ${frontResults.failed}\x1b[0m`);
console.log(`  \x1b[33m⊘ Skipped: ${frontResults.skipped}\x1b[0m`);
console.log(`  Total:    ${total}`);
console.log(`  Score:    ${score}%`);
console.log(`  Duration: ${elapsed}s\n`);

mkdirSync(resolve(__dir, 'reports'), { recursive: true });
const now = new Date().toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' });

// Markdown
const md = [
  `# SquadCart Console SQA Report`,
  `> Generated: ${now} | Duration: ${elapsed}s`,
  '',
  `## Summary`,
  `| | Count |`,
  `|---|---|`,
  `| ✅ Passed | **${frontResults.passed}** |`,
  `| ❌ Failed | **${frontResults.failed}** |`,
  `| ⊘ Skipped | ${frontResults.skipped} |`,
  `| Total | ${total} |`,
  `| **Score** | **${score}%** |`,
  '',
  frontResults.failed === 0 ? `> ✅ All tests passed! 🎉` : `> ⚠️ ${frontResults.failed} test(s) failed.`,
  '',
  `---`,
  ...frontResults.sections.map(sec => [
    `### ${sec.name}`,
    `| Status | Test | Detail |`,
    `|---|---|---|`,
    ...sec.tests.map(t => `| ${t.status === 'pass' ? '✅' : t.status === 'fail' ? '❌' : '⊘'} | ${t.name} | ${t.detail} |`),
    '',
  ].join('\n')),
].join('\n');
writeFileSync(resolve(__dir, 'reports/report.md'), md, 'utf8');

// HTML
const badgeColor = score >= 90 ? '#16a34a' : score >= 70 ? '#d97706' : '#dc2626';
const rows = frontResults.sections.flatMap(sec => [
  `<tr class="section-header"><td colspan="4">▸ ${sec.name}</td></tr>`,
  ...sec.tests.map(t => {
    const cls = t.status === 'pass' ? 'pass' : t.status === 'fail' ? 'fail' : 'skip';
    const icon = t.status === 'pass' ? '✓' : t.status === 'fail' ? '✗' : '⊘';
    return `<tr class="${cls}"><td>${icon}</td><td>${t.name}</td><td>${t.detail}</td><td class="badge ${cls}">${t.status.toUpperCase()}</td></tr>`;
  }),
]).join('\n');

const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Console SQA Report</title><style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:sans-serif;background:#f9f9fb;color:#18181b;padding:32px 16px;}.container{max-width:900px;margin:0 auto;}h1{font-size:24px;font-weight:700;}table{width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;margin-bottom:32px;}th{background:#f4f4f8;text-align:left;padding:10px;}td{padding:10px;border-bottom:1px solid #f0f0f4;}tr.section-header td{background:#f9f9fb;font-weight:700;}tr.pass{color:#16a34a;}tr.fail{color:#dc2626;}tr.skip{color:#d97706;}.score{display:inline-block;background:${badgeColor};color:#fff;padding:8px 16px;border-radius:8px;font-weight:bold;margin-bottom:20px;}</style></head><body><div class="container"><h1>⚡ Console SQA Report</h1><p style="margin-bottom:20px;color:#71717a;">${now}</p><div class="score">Score: ${score}%</div><table><thead><tr><th></th><th>Test Name</th><th>Detail</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div></body></html>`;
writeFileSync(resolve(__dir, 'reports/report.html'), html, 'utf8');

console.log(`  📄 Reports saved: sqa/reports/report.html, sqa/reports/report.md\n`);
process.exit(frontResults.failed > 0 ? 1 : 0);
