const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { spawnSync } = require('node:child_process');
const os = require('node:os');
// js-yaml is installed with the existing Angular/Karma toolchain.
const yaml = require('js-yaml');

const workflows = path.resolve(__dirname, '../workflows');
const main = yaml.load(fs.readFileSync(path.join(workflows, 'main.yml'), 'utf8'));
const desktop = yaml.load(fs.readFileSync(path.join(workflows, 'release_desktop.yml'), 'utf8'));

function context(branch, event = 'push') {
  return { event_name: event, ref: `refs/heads/${branch}`, ref_name: branch, ref_type: 'branch', base_ref: '' };
}

// Evaluate the expressions stored in the workflows, rather than a copy of the gate.
function matches(expression, github, needs = {}, cancelled = false) {
  const evaluate = new Function('github', 'needs', 'always', 'cancelled', 'startsWith', `return (${expression});`);
  return evaluate(github, needs, () => true, () => cancelled, (value, prefix) => value.startsWith(prefix));
}

test('production requires successful web and desktop results for push and dispatch', () => {
  for (const event of ['push', 'workflow_dispatch']) {
    for (const web of ['success', 'failure', 'cancelled', 'skipped']) {
      for (const desktop of ['success', 'failure', 'cancelled', 'skipped']) {
        const needs = { web_build: { result: web }, desktop: { result: desktop } };
        assert.equal(matches(main.jobs.web_deploy.if, context('master', event), needs), web === 'success' && desktop === 'success');
        assert.equal(matches(main.jobs.web_deploy.if, context('master', event), needs, true), false);
      }
    }
  }
});

test('development deploys with desktop skipped, while PRs and unrelated refs never deploy', () => {
  const needs = { web_build: { result: 'success' }, desktop: { result: 'skipped' } };
  for (const event of ['push', 'workflow_dispatch']) {
    assert.equal(matches(main.jobs.web_deploy.if, context('develop', event), needs), true);
    assert.equal(matches(main.jobs.web_deploy.if, context('feature', event), needs), false);
  }
  assert.equal(matches(main.jobs.web_deploy.if, context('master', 'pull_request'), needs), false);
  assert.equal(matches(main.jobs.web_deploy.if, context('develop'), { ...needs, web_build: { result: 'failure' } }), false);
});

test('tests and policy cover supported PRs and release branches; PRs cannot build releases', () => {
  for (const branch of ['master', 'develop']) {
    for (const event of ['push', 'workflow_dispatch']) {
      for (const job of ['pr-checks', 'release-policy', 'web_build']) {
        assert.equal(matches(main.jobs[job].if, context(branch, event)), true);
      }
      assert.equal(matches(main.jobs.desktop.if, context(branch, event)), branch === 'master');
    }
  }
  for (const base_ref of ['master', 'develop', 'epic-release']) {
    const github = { ...context('123/merge', 'pull_request'), base_ref };
    assert.equal(matches(main.jobs['pr-checks'].if, github), true);
    assert.equal(matches(main.jobs['release-policy'].if, github), true);
    assert.equal(matches(main.jobs.web_build.if, github), false);
    assert.equal(matches(main.jobs.desktop.if, github), false);
  }
  for (const job of ['pr-checks', 'release-policy', 'web_build', 'desktop']) {
    assert.equal(matches(main.jobs[job].if, { ...context('master', 'workflow_dispatch'), ref_type: 'tag', ref: 'refs/tags/master' }), false);
  }
});

test('build dependencies gate releases and all installer stages gate draft creation', () => {
  for (const job of ['web_build', 'desktop']) {
    assert.deepEqual(main.jobs[job].needs, ['release-policy', 'pr-checks']);
  }
  assert.deepEqual(main.jobs.web_deploy.needs, ['web_build', 'desktop']);
  assert.deepEqual(desktop.jobs.release.needs, ['build', 'bundle_macos', 'bundle_win', 'bundle_linux', 'sign_win']);
  assert.deepEqual(desktop.jobs.sign_win.needs, ['bundle_win']);
  for (const job of Object.values(desktop.jobs)) {
    assert.equal(matches(job.if, context('master', 'workflow_dispatch')), true);
    assert.equal(matches(job.if, context('master', 'pull_request')), false);
    assert.equal(matches(job.if, context('develop')), false);
  }
});

test('web deploy consumes the caller artifact and QA retains its independent artifact', () => {
  const deploy = yaml.load(fs.readFileSync(path.join(workflows, 'deploy_web.yml'), 'utf8'));
  assert.equal(main.jobs.web_build.with['artifact-name'], 'web-dist');
  for (const job of Object.values(deploy.jobs)) assert.equal(job.with['artifact-name'], 'web-dist');
  for (const filename of ['release_qa.yml', 'release_qa2.yml']) {
    const qa = yaml.load(fs.readFileSync(path.join(workflows, filename), 'utf8'));
    assert.equal(qa.jobs.call_build.with['artifact-name'], 'dist');
    assert.equal(qa.jobs['call_deploy-qa'].with['artifact-name'], 'dist');
  }
});

test('the draft job fails explicitly for a failed or unexpectedly skipped desktop stage', () => {
  const step = desktop.jobs.release.steps[0];
  const results = Object.fromEntries(Object.keys(step.env).map(key => [key, 'success']));
  const check = env => spawnSync('bash', ['-e', '-c', step.run], { env, encoding: 'utf8' });
  assert.equal(check(results).status, 0);
  for (const stage of Object.keys(results)) {
    for (const result of ['failure', 'skipped', 'cancelled', '']) {
      assert.equal(check({ ...results, [stage]: result }).status, 1, `${stage}: ${result}`);
    }
  }
});

test('deployment moves only staged artifacts and preserves the configured backup', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'measur-deployment-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const staging = path.join(directory, 'staging');
  const workspace = path.join(directory, 'workspace');
  const deploy = path.join(directory, 'web');
  const destination = path.join(deploy, 'measur');
  const backup = path.join(directory, 'backups');
  const bin = path.join(directory, 'bin');
  for (const dir of [staging, workspace, destination, backup, bin]) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(bin, 'chgrp'), '#!/bin/sh\nexit 0\n', { mode: 0o755 });
  fs.writeFileSync(path.join(staging, 'index.html'), 'new app');
  fs.writeFileSync(path.join(workspace, 'stale.js'), 'must not deploy');
  fs.writeFileSync(path.join(destination, 'old.js'), 'old app');
  const template = yaml.load(fs.readFileSync(path.join(workflows, 'template_deploy.yml'), 'utf8'));
  const script = template.jobs.deploy.steps.find(step => step.name === 'Deploy').run;
  const env = { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}`, STAGING_DIR: staging,
    APP_DIR: 'measur', DEPLOY_DIR: deploy, BACKUP_DIR: backup, GITHUB_SHA: '1234567890' };
  const run = changes => spawnSync('bash', ['-e', '-c', script], { cwd: workspace, env: { ...env, ...changes }, encoding: 'utf8' });
  // Invalid targets and an empty artifact fail before altering the installed app.
  for (const changes of [{ APP_DIR: '../measur' }, { DEPLOY_DIR: '' }, { STAGING_DIR: workspace }]) {
    assert.notEqual(run(changes).status, 0);
    assert.equal(fs.readFileSync(path.join(destination, 'old.js'), 'utf8'), 'old app');
  }
  const result = run({});
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(fs.readdirSync(destination), ['index.html']);
  assert.equal(fs.existsSync(path.join(workspace, 'stale.js')), true);
  assert.equal(fs.readdirSync(backup).length, 1);
});
