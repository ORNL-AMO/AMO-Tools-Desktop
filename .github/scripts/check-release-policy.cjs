const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const { compareSemVer } = require('./check-release-version.cjs');

function previousCommit(eventName, event, parents) {
  if (eventName === 'pull_request') return event.pull_request.base.sha;
  if (!['push', 'workflow_dispatch'].includes(eventName)) {
    throw new Error(`Unsupported production event: ${eventName}`);
  }
  if (parents.length !== 2) {
    throw new Error('Production PRs must use Create a merge commit, including hotfixes.');
  }
  if (eventName === 'push' && event.before !== parents[0]) {
    throw new Error('Each master push must contain one release merge based on the preceding master commit.');
  }
  return parents[0];
}

function validateProduction({ version, previousVersion, previousSha, previousTag, currentTag, sha, eventName, runs }) {
  if (compareSemVer(version, previousVersion) <= 0) {
    throw new Error(`Release version ${version} must be greater than ${previousVersion}.`);
  }
  if (previousTag !== previousSha) {
    throw new Error(`Previous release v${previousVersion} must tag commit ${previousSha}. Complete that release first.`);
  }
  const latestRun = runs
    .filter(run => run.head_sha === previousSha && run.head_branch === 'master' &&
      ['push', 'workflow_dispatch'].includes(run.event))
    .sort((left, right) => right.run_number - left.run_number)[0];
  if (latestRun?.status !== 'completed' || latestRun.conclusion !== 'success') {
    throw new Error(`Previous release commit ${previousSha} must have a successful completed CI/CD run. Complete or retry that release first.`);
  }
  if (currentTag && (eventName === 'pull_request' || currentTag !== sha)) {
    throw new Error(`Tag v${version} already belongs to ${currentTag}. Choose a new release version.`);
  }
}

function run(command, args) {
  return execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function tagCommit(version) {
  const ref = `refs/tags/v${version}`;
  try {
    run('git', ['show-ref', '--verify', '--quiet', ref]);
  } catch (error) {
    if (error.status === 1) return '';
    throw error;
  }
  return run('git', ['rev-parse', `${ref}^{commit}`]);
}

function main(env = process.env) {
  const event = JSON.parse(fs.readFileSync(env.GITHUB_EVENT_PATH, 'utf8'));
  const sha = env.GITHUB_SHA;
  const parents = run('git', ['show', '-s', '--format=%P', sha]).split(' ').filter(Boolean);
  const previousSha = previousCommit(env.GITHUB_EVENT_NAME, event, parents);
  const version = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
  const previousVersion = JSON.parse(run('git', ['show', `${previousSha}:package.json`])).version;
  const pages = JSON.parse(run('gh', ['api', '--paginate', '--slurp',
    `repos/${env.GITHUB_REPOSITORY}/actions/workflows/main.yml/runs?head_sha=${previousSha}&per_page=100`]));
  validateProduction({
    version, previousVersion, previousSha, sha, eventName: env.GITHUB_EVENT_NAME,
    previousTag: tagCommit(previousVersion), currentTag: tagCommit(version),
    runs: pages.flatMap(page => page.workflow_runs),
  });
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { previousCommit, validateProduction };
