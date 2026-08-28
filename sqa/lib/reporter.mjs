/**
 * SquadCart Console SQA — Shared Reporter
 * File: sqa/lib/reporter.mjs
 */

export const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  sections: [],
  _currentSection: null,
};

const PASS = '\x1b[32m✓\x1b[0m';
const FAIL = '\x1b[31m✗\x1b[0m';
const SKIP = '\x1b[33m⊘\x1b[0m';

export function section(name) {
  results._currentSection = { name, tests: [] };
  results.sections.push(results._currentSection);
  console.log(`\n\x1b[1m\x1b[34m▸ ${name}\x1b[0m`);
}

export function pass(name, detail = '') {
  results.passed++;
  const t = { status: 'pass', name, detail };
  results._currentSection?.tests.push(t);
  console.log(`  ${PASS} ${name}${detail ? ` \x1b[90m(${detail})\x1b[0m` : ''}`);
}

export function fail(name, detail = '') {
  results.failed++;
  const t = { status: 'fail', name, detail };
  results._currentSection?.tests.push(t);
  console.log(`  ${FAIL} \x1b[31m${name}\x1b[0m${detail ? ` \x1b[90m(${detail})\x1b[0m` : ''}`);
}

export function skip(name, reason = '') {
  results.skipped++;
  const t = { status: 'skip', name, detail: reason };
  results._currentSection?.tests.push(t);
  console.log(`  ${SKIP} \x1b[33m${name}\x1b[0m${reason ? ` \x1b[90m(${reason})\x1b[0m` : ''}`);
}
