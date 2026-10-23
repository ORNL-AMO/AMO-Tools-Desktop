const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');
const { previousCommit, validateProduction } = require('./check-release-policy.cjs');

const valid = {
  version: '1.9.1', previousVersion: '1.9.0', previousSha: 'previous',
  previousTag: 'previous', currentTag: '', sha: 'current', eventName: 'push',
  runs: [{ head_sha: 'previous', head_branch: 'master', event: 'push', run_number: 10, status: 'completed', conclusion: 'success' }],
};

test('push, promotion PR and manual recovery identify the same preceding commit', () => {
  assert.equal(previousCommit('push', { before: 'previous' }, ['previous', 'topic']), 'previous');
  assert.equal(previousCommit('pull_request', { pull_request: { base: { sha: 'previous' } } }, []), 'previous');
  assert.equal(previousCommit('workflow_dispatch', {}, ['previous', 'topic']), 'previous');
  assert.throws(() => previousCommit('workflow_dispatch', {}, ['previous']), /merge commit/);
  assert.throws(() => previousCommit('push', { before: 'older' }, ['previous', 'topic']), /one release merge/);
});

test('valid production releases and same-commit retries pass', () => {
  assert.doesNotThrow(() => validateProduction(valid));
  for (const eventName of ['push', 'workflow_dispatch']) {
    assert.doesNotThrow(() => validateProduction({ ...valid, eventName, currentTag: 'current' }));
  }
});

test('versions must advance, including manual runs', () => {
  for (const version of ['1.9.0', '1.8.9', '1.9.0+build.1']) {
    assert.throws(() => validateProduction({ ...valid, version, eventName: 'workflow_dispatch' }), /must be greater/);
  }
});

test('missing and conflicting tags block release', () => {
  for (const previousTag of ['', 'unrelated']) {
    assert.throws(() => validateProduction({ ...valid, previousTag }), /must tag commit/);
  }
  assert.throws(() => validateProduction({ ...valid, currentTag: 'unrelated' }), /already belongs/);
  assert.throws(() => validateProduction({ ...valid, eventName: 'pull_request', currentTag: 'current' }), /already belongs/);
});

test('failed, cancelled, skipped, incomplete and missing preceding runs block release', () => {
  for (const conclusion of ['failure', 'cancelled', 'skipped', null]) {
    assert.throws(() => validateProduction({ ...valid, runs: [{ ...valid.runs[0], conclusion }] }), /successful completed/);
  }
  assert.throws(() => validateProduction({ ...valid, runs: [] }), /successful completed/);
  assert.throws(() => validateProduction({ ...valid, runs: [{ ...valid.runs[0], status: 'in_progress' }] }), /successful completed/);
  assert.throws(() => validateProduction({ ...valid, runs: [{ ...valid.runs[0], event: 'pull_request' }] }), /successful completed/);
});

test('the latest production run controls recovery, not PRs or older successes', () => {
  const newer = { ...valid.runs[0], run_number: 11, event: 'workflow_dispatch', conclusion: 'failure' };
  assert.throws(() => validateProduction({ ...valid, runs: [...valid.runs, newer] }), /successful completed/);
  assert.doesNotThrow(() => validateProduction({ ...valid, runs: [...valid.runs, { ...newer, conclusion: 'success' }] }));
});

test('CLI validates real merge parents, tags and versions for all production entry points', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'measur-policy-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', args, { cwd: directory, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  git('init', '-q', '--initial-branch=master');
  git('config', 'user.name', 'Release policy test');
  git('config', 'user.email', 'release-test@example.invalid');
  git('config', 'commit.gpgsign', 'false');
  fs.writeFileSync(path.join(directory, 'package.json'), JSON.stringify({ version: '1.9.0' }));
  git('add', 'package.json');
  git('commit', '-qm', 'Previous release');
  const previousSha = git('rev-parse', 'HEAD');
  git('tag', 'v1.9.0');
  git('checkout', '-qb', 'release');
  fs.writeFileSync(path.join(directory, 'package.json'), JSON.stringify({ version: '1.9.1' }));
  git('commit', '-qam', 'Prepare release');
  git('checkout', '-q', 'master');
  git('merge', '--no-ff', '-m', 'Promote release', 'release');
  const sha = git('rev-parse', 'HEAD');

  const bin = path.join(directory, 'bin');
  fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin, 'gh'), `#!${process.execPath}\nprocess.stdout.write(process.env.FIXTURE_RUNS);\n`, { mode: 0o755 });
  const eventPath = path.join(directory, 'event.json');
  fs.writeFileSync(eventPath, JSON.stringify({ before: previousSha, pull_request: { base: { sha: previousSha } } }));
  const env = {
    ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}`,
    GITHUB_EVENT_PATH: eventPath, GITHUB_SHA: sha, GITHUB_REPOSITORY: 'example/measur',
    FIXTURE_RUNS: JSON.stringify([{ workflow_runs: [{ ...valid.runs[0], head_sha: previousSha }] }]),
  };
  const check = eventName => spawnSync(process.execPath, [path.join(__dirname, 'check-release-policy.cjs')], {
    cwd: directory, env: { ...env, GITHUB_EVENT_NAME: eventName }, encoding: 'utf8',
  });
  for (const eventName of ['push', 'pull_request', 'workflow_dispatch']) {
    const result = check(eventName);
    assert.equal(result.status, 0, result.stderr);
  }
  git('tag', 'v1.9.1');
  assert.equal(check('workflow_dispatch').status, 0);
  assert.match(check('pull_request').stderr, /already belongs/);
  git('tag', '-d', 'v1.9.0');
  assert.match(check('workflow_dispatch').stderr, /must tag commit/);
});
