const assert = require('node:assert/strict');
const test = require('node:test');
const check = require('./check-production-state.cjs');

const context = { repo: { owner: 'example', repo: 'measur' }, sha: 'current', ref: 'refs/heads/master', eventName: 'push' };
const run = (sha, overrides = {}) => ({
  head_sha: sha, head_branch: 'master', status: 'completed', conclusion: 'success', event: 'push', ...overrides,
});
const notFound = () => { throw Object.assign(new Error('Not found'), { status: 404 }); };
function client(pages = [], statuses = {}, release = null, tagSha = 'current') {
  return {
    paginate: { iterator: async function* () { for (const runs of pages) yield { data: { workflow_runs: runs } }; } },
    rest: {
      actions: { listWorkflowRuns() {} },
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
