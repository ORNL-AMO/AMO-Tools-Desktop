const assert = require('node:assert/strict');
const test = require('node:test');
const check = require('./check-production-state.cjs');

const context = { repo: { owner: 'example', repo: 'measur' }, sha: 'current', ref: 'refs/heads/master', eventName: 'push' };
const run = (sha, overrides = {}) => ({
  id: 1, run_attempt: 1, head_sha: sha, head_branch: 'master', status: 'completed', conclusion: 'success', event: 'push', ...overrides,
});
const notFound = () => { throw Object.assign(new Error('Not found'), { status: 404 }); };
function client(pages = [], statuses = {}, release = null, tagSha = 'current', attempts = {}) {
  return {
    paginate: { iterator: async function* (_endpoint, parameters) {
      assert.equal(parameters.status, undefined, 'failed reruns must remain discoverable');
      for (const runs of pages) yield { data: runs };
    } },
    rest: {
      actions: {
        listWorkflowRuns() {},
        getWorkflowRunAttempt: async ({ run_id, attempt_number }) => {
          const attempt = attempts[`${run_id}:${attempt_number}`];
          assert.ok(attempt, `Unexpected attempt lookup: ${run_id}:${attempt_number}`);
          return { data: attempt };
        },
      },
      git: { getRef: async () => tagSha ? { data: { object: { sha: tagSha } } } : notFound() },
      repos: {
        compareCommitsWithBasehead: async ({ basehead }) => ({ data: { status: statuses[basehead.split('...')[1]] || 'behind' } }),
        getCommit: async () => tagSha ? { data: { sha: tagSha } } : notFound(),
        getReleaseByTag: async () => release ? { data: release } : notFound(),
      },
    },
  };
}

test('initial production release and same-commit deployment retry pass', async () => {
  await check({ github: client([[run('previous'), run('current')]]), context });
  await check({ github: client(), context: { ...context, eventName: 'workflow_dispatch' }, releaseTag: 'v1.9.1' });
  const newRelease = client([], {}, null, null);
  newRelease.rest.repos.getCommit = async () => { throw Object.assign(new Error('No commit found for SHA'), { status: 422 }); };
  await check({ github: newRelease, context, releaseTag: 'v1.9.1' });
});

test('a successful descendant blocks old reruns, including later API pages', async () => {
  const github = client([[run('previous')], [run('newer')]], { newer: 'ahead' });
  await assert.rejects(check({ github, context }), /newer production commit/);
});

test('newer successful deployment remains protected after its published-release rerun fails', async () => {
  const newer = run('newer', { id: 42, run_attempt: 2, conclusion: 'failure' });
  const github = client([[run('previous')], [newer]], { newer: 'ahead' }, null, 'current', {
    '42:1': run('newer', { id: 42 }),
  });
  await assert.rejects(check({ github, context }), /newer production commit/);
});

test('earlier success survives multiple failed, cancelled or still-running reruns', async () => {
  for (const overrides of [
    { conclusion: 'failure' }, { conclusion: 'cancelled' }, { status: 'in_progress', conclusion: null },
  ]) {
    const newer = run('newer', { id: 42, run_attempt: 3, ...overrides });
    const github = client([[newer]], { newer: 'ahead' }, null, 'current', {
      '42:2': run('newer', { id: 42, run_attempt: 2, conclusion: 'failure' }),
      '42:1': run('newer', { id: 42 }),
    });
    await assert.rejects(check({ github, context }), /newer production commit/);
  }
});

test('failed attempts alone are not deployment evidence and do not hide a separate successful run', async () => {
  const failed = run('newer', { id: 42, run_attempt: 2, conclusion: 'failure' });
  const attempts = { '42:1': run('newer', { id: 42, conclusion: 'failure' }) };
  await check({ github: client([[failed]], { newer: 'ahead' }, null, 'current', attempts), context });
  const github = client([[failed], [run('newer', { id: 43 })]], { newer: 'ahead' }, null, 'current', attempts);
  await assert.rejects(check({ github, context }), /newer production commit/);
});

test('missing or inaccessible prior attempts fail closed instead of discarding deployment evidence', async () => {
  for (const status of [404, 503]) {
    const github = client([[run('newer', { id: 42, run_attempt: 2, conclusion: 'failure' })]], { newer: 'ahead' });
    github.rest.actions.getWorkflowRunAttempt = async () => { throw Object.assign(new Error('Attempt unavailable'), { status }); };
    await assert.rejects(check({ github, context }), /Attempt unavailable/);
  }
});

test('ancestor reruns do not need attempt history to establish that this deployment is newer', async () => {
  const github = client([[run('previous', { run_attempt: 3, conclusion: 'failure' })]]);
  github.rest.actions.getWorkflowRunAttempt = async () => { throw new Error('Older attempt history unavailable'); };
  await check({ github, context });
});

test('PRs, incomplete and failed runs cannot establish production state', async () => {
  const github = client([[run('newer', { event: 'pull_request' }), run('newer', { conclusion: 'failure' }), run('newer', { status: 'in_progress' })]], { newer: 'ahead' });
  await check({ github, context });
  await assert.rejects(check({ github, context: { ...context, eventName: 'pull_request' } }), /master push/);
});

test('published releases cannot have their installer assets replaced', async () => {
  await assert.rejects(check({ github: client([], {}, { draft: false }), context, releaseTag: 'v1.9.1' }), /already published/);
  await check({ github: client([], {}, { draft: true }), context, releaseTag: 'v1.9.1' });
  // Web-only recovery remains possible after the current release is published.
  await check({ github: client([], {}, { draft: false }), context });
});

test('conflicting tags, diverged histories and API errors fail closed', async () => {
  await assert.rejects(check({ github: client([], {}, null, 'other'), context, releaseTag: 'v1.9.1' }), /another commit/);
  await assert.rejects(check({ github: client([[run('other')]], { other: 'diverged' }), context }), /diverged/);
  const github = client();
  github.rest.repos.getReleaseByTag = async () => { throw Object.assign(new Error('API unavailable'), { status: 503 }); };
  await assert.rejects(check({ github, context, releaseTag: 'v1.9.1' }), /API unavailable/);
});
