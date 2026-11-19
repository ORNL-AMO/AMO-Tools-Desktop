const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { CHECKLIST_ITEMS, checkPullRequest } = require('./check-pr-template.cjs');

const script = path.join(__dirname, 'check-pr-template.cjs');
const template = fs.readFileSync(path.join(__dirname, '..', 'pull_request_template.md'), 'utf8');

const items = [
  'Changes are limited to the linked issue; unrelated problems and out-of-scope concerns are noted, not fixed, and an issue is submitted if applicable',
  'I reviewed the full diff myself, including any AI-generated code, as if another developer wrote it',
  'Tests were added or updated for changed behavior, or Changes explains why not',
  'Calculations still go through `src/app/tools-suite-api/` (no new direct Suite calls in components or services)',
  'Units, percentage conventions, and saved assessment data are unchanged, or the change is explained in Summary',
  'Visible UI changes were checked in the web app (and Electron if desktop code changed)',
  'No console logs, commented-out code, test values, customer data, or sensitive assessment inputs are included',
  'The first or last line is the bare issue number, e.g. `#8645`, or `No issue: <reason>` when there is no issue',
];
const checklist = items.map(item => `- [x] ${item}`).join('\n');

const build = ({ summary, changes = '- Something behaves differently', last = '#3493' }) =>
  `## Summary\n${summary}\n\n## Changes\n${changes}\n\n## Checklist\n${checklist}\n\n${last}\n`;

const good = {
  title: 'Issue 3493: Send flash blowdown to deaerator',
  body: build({ summary: 'Hot water from the flash tank is now reused in the deaerator, so results better match real plants.' }),
};

const rules = warnings => warnings.map(warning => warning.split(' ')[0]);

test('a complete PR has no warnings', () => {
  assert.deepEqual(checkPullRequest(good), []);
});

test('agent PR with a free-form title, empty Changes and no issue number warns T1, S3, I1', () => {
  const warnings = checkPullRequest({
    title: 'Remove unused pneumatic valve calculator code',
    body: `## Summary\nDeletes PneumaticValveComponent.\n\n## Changes\n<!-- A short bullet list -->\n\n## Checklist\n${checklist}\n\n#\n`,
  });
  assert.deepEqual(rules(warnings), ['T1', 'S3', 'I1']);
});

test('the template has exactly CHECKLIST_ITEMS checkboxes', () => {
  assert.equal(template.match(/^- \[ \]/gm).length, CHECKLIST_ITEMS);
});

test('legacy "Issue <number> - " titles are accepted', () => {
  assert.deepEqual(checkPullRequest({ ...good, title: 'Issue 3493 - Send flash blowdown to deaerator' }), []);
});

test('PRs without an issue use "No issue:" in the title and body', () => {
  const body = build({ summary: 'Updates the calculation library.', last: 'No issue: Suite RC dependency update' });
  assert.deepEqual(checkPullRequest({ title: 'No issue: Adopt Suite RC 1.2.7', body }), []);
  assert.deepEqual(rules(checkPullRequest({ title: 'No issue:', body: build({ summary: 'x', last: 'No issue:' }) })), ['T1', 'I1']);
});

test('the unfilled template warns', () => {
  const warnings = checkPullRequest({ title: 'Fix', body: template });
  assert.deepEqual(rules(warnings), ['T1', 'S1', 'S3', 'I1']);
});

test('summary of 99 words passes and 100 words warns S2', () => {
  const words = count => Array(count).fill('word').join(' ');
  assert.deepEqual(checkPullRequest({ ...good, body: build({ summary: words(99) }) }), []);
  assert.deepEqual(rules(checkPullRequest({ ...good, body: build({ summary: words(100) }) })), ['S2']);
});

test('missing headings and deleted checklist items warn H1 and C1', () => {
  assert.deepEqual(rules(checkPullRequest({ ...good, body: '#3493\n' })), ['H1', 'H1', 'H1']);
  const fewer = good.body.replace(`- [x] ${items[0]}\n`, '');
  assert.deepEqual(rules(checkPullRequest({ ...good, body: fewer })), ['C1']);
});

test('issue number may be the first line instead of the last', () => {
  const body = `#3493\n\n${build({ summary: 'Reused heat.', last: '' })}`;
  assert.deepEqual(checkPullRequest({ ...good, body }), []);
});

test('draft and master PRs are skipped', () => {
  assert.deepEqual(checkPullRequest({ title: 'x', body: '', draft: true }), []);
  assert.deepEqual(checkPullRequest({ title: 'x', body: '', base: 'master' }), []);
});

test('CLI emits warnings and always exits 0', () => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'measur-pr-')), 'event.json');
  fs.writeFileSync(file, JSON.stringify({ pull_request: { title: 'bad', body: null, base: { ref: 'develop' } } }));
  const result = spawnSync(process.execPath, [script], { env: { ...process.env, GITHUB_EVENT_PATH: file }, encoding: 'utf8' });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /::warning title=PR template::T1/);
});
