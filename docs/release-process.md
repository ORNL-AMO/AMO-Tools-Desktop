# MEASUR release process

This guide covers the web and Electron release pipeline for maintainers. The workflow files are authoritative for runner labels, action versions, artifact retention, packaging commands, and secret names. The release sequencing follows [VERIFI PR #2742](https://github.com/ORNL-AMO/VERIFI/pull/2742); MEASUR retains its own build scripts and installer jobs.

## Release invariant

Production web deployment must wait for both the production web bundle and the complete desktop workflow to succeed in the **same workflow run and commit**.

```text
Release policy + tests ─┬─ Web build ──────────────────────────┐
                       └─ Desktop build                       │
                          ├─ macOS bundle/sign/notarize       │
                          ├─ Windows bundle → sign            │
                          └─ Linux bundle                     │
                             → collect/validate assets        │
                             → draft GitHub Release ──────────┴─ Production web deploy
```

A desktop failure, cancellation, missing asset, or unexpected skip prevents production web deployment. The existing production site is untouched until deployment starts. Development web deployment is independent of the intentionally skipped desktop workflow.

The gate requires a **draft** GitHub Release, not publication. Production web can therefore become live before a maintainer publishes the desktop release. Only maintainers review and publish releases; release notes remain manually prepared.

## Triggers and required checks

The caller is [`main.yml`](../.github/workflows/main.yml).

| Trigger | Checks and behavior |
| --- | --- |
| PR to `develop`, `master`, or `epic-*` | Tests and version metadata validation; PRs to `master` also check production version and preceding release. No deployment or installers. |
| Push to `develop` | Policy and tests, then development web build/deploy. |
| Push to `master` | Full production policy and tests, parallel web/desktop builds, then gated production deployment. |
| Manual main workflow on `develop` | Same development flow as a push. |
| Manual main workflow on `master` | Same production flow and policy as a push, for release recovery. |
| Manual main workflow on another branch or a tag | No release jobs. |
| Separate QA / QA 2 dispatch | Existing independent QA builds and destinations. |

The reusable [`pr_checks.yml`](../.github/workflows/pr_checks.yml) runs Angular tests, workflow gate tests, compressed-air fixture/privacy checks, the complete calculation-regression corpus, and process-flow tests. Production builds require both `release-policy` and `pr-checks` to succeed. Release helper tests also run in the policy job without installing application dependencies.

Protect `develop` and `master` with required PR reviews, resolved conversations, no force pushes/deletion, and required checks. After the new checks first appear in GitHub, configure **`release-policy`** and **`pr-checks / unit-tests`** as required checks (confirm the exact displayed contexts). Keep existing review requirements. The pipeline itself also requires these jobs before building release artifacts.

## Version and branch policy

- `develop` is the integration branch. Every push to `master` is one intentional release, including workflow and documentation changes; do not merge unrelated administrative changes directly into `master`.
- Root `package.json`, `package-lock.json.version`, and `package-lock.json.packages[""].version` must agree and contain valid SemVer. Nested package versions are independent.
- Each production release must increase by SemVer precedence relative to the preceding `master` version. Build metadata alone does not advance a version.
- The preceding `master` commit must have its matching `v<version>` tag and a successful completed production CI/CD run. The latest production run for that commit must succeed; a PR run does not qualify.
- Complete and publish the preceding draft before the next release: its version tag must exist and point to the preceding commit. Never move an existing release tag to satisfy the check.
- Use **Create a merge commit** for promotion and hotfix PRs into `master`. Squash/rebase/direct commits are not accepted by production CI. Each push must add exactly one release merge with its first parent equal to the previous `master` head.
- Manual production dispatch uses the current merge commit's first parent as the preceding production commit. It does not bypass version, tag, or preceding-run checks.
- A conflicting current-version tag blocks release. An existing tag for the same run commit is allowed when retrying that release. New release tags target the immutable run SHA, not the moving branch.
- Immediately before draft creation and production deployment, the production-state action checks production runs and their previous attempts for a newer descendant commit that has completed successfully. A later failed, cancelled, or still-running rerun cannot erase an earlier successful attempt's evidence. Historical reruns cannot replace a newer completed production release. API errors, unavailable attempt history, or divergent histories fail closed. These checks run inside the mutating jobs so failed-job retries cannot bypass them by reusing an earlier successful policy job.
- Published installer releases are immutable to this pipeline: a full rerun cannot replace their assets. Same-commit installer retries are permitted while the release remains a draft; web-only retries do not modify the published release.

Development builds append the commit SHA to the version. Keep the base development version until the next release target is approved; no immediate post-release version bump is required. Do not dispatch historical runs as a rollback mechanism.

## Normal release

1. Confirm the release epic/milestone scope and QA approvals. Put deferred issues in a later release.
2. Open a release-preparation PR into `develop`, updating the root package and lockfile versions to the approved next version. Include release notes and any required preparation.
3. Merge preparation after review and checks, then open the promotion PR from `develop` to `master`. Corrections return through `develop` first.
4. Confirm the preceding production release is complete, its tag matches the preceding `master` commit, and the promotion passes required checks.
5. Select **Create a merge commit** and merge the promotion. Do not advance `master` again until this release completes.
6. Monitor policy/tests, web compilation, and all installer jobs. Signing uses the existing Apple secrets and the self-hosted `cs` runner for Windows.
7. Confirm the draft contains the Windows installer, universal macOS DMG/ZIP, Linux AppImage/archive, and associated updater metadata/blockmaps. The asset validator rejects missing or empty required files.
8. Confirm production web deploy starts only after the complete desktop workflow succeeds. Verify the deployed version and representative web/WASM calculations.
9. Install and launch the desktop packages, including Intel and Apple Silicon Macs. Verify installer identity/version, saved-data access, and representative calculations. Review the manually prepared release notes and publish the draft.

The existing `v1.9.0` production tag and successful CI run provided the initial baseline when this policy was introduced. The first subsequent release must advance beyond it; no bootstrap bypass is provided.

## Emergency patch

1. Branch from the current `master`, implement the smallest reviewed fix, and advance the root package and lockfile patch version.
2. Open a hotfix PR to `master`, reference the incident, and pass the same policy/tests. The preceding release must still be complete.
3. Merge using **Create a merge commit**, then follow the normal installer, deployment, verification, and publication steps.
4. Immediately forward-port the fix into `develop` through a PR or deliberate cherry-pick. Resolve version conflicts without losing the fix or lowering the planned next release version.

## Concurrency and failure recovery

Production runs share `measur-production-release` with `queue: max`; running releases and queued releases are not automatically cancelled by newer runs. GitHub does not guarantee commit ordering from concurrency alone. The preceding-release guard prevents a later release from overtaking an unfinished or failed predecessor. Development and PR runs remain independent.

- If policy or tests fail, release builds do not run. Fix the issue before promotion where possible.
- If a preceding tag/run is missing or unsuccessful, complete the earlier release first, then rerun the blocked later workflow. Never replace its tag or skip the guard.
- If packaging, signing, notarization, upload, asset validation, or draft creation fails, production web stays at its existing version. Resolve infrastructure/credential problems and rerun failed jobs and their dependents for the same commit.
- If recovery requires source changes to an already failed release commit, the strict sequence rule deliberately blocks a new release from bypassing it. Escalate to maintainers for a reviewed recovery change; do not silently weaken policy or rewrite release history.
- If web deployment fails after draft creation, rerun failed deployment jobs while `web-dist` is retained. Confirm the desktop gate still reports success for the same run.
- After artifacts expire, rerun the **entire original workflow**, or manually dispatch on the matching current branch commit, while its desktop release is still a draft. A published release's installers cannot be replaced; if its web artifact has expired, use a maintainer-reviewed recovery procedure rather than rebuilding over published assets. Never substitute files from another run/commit.
- If runs start out of sequence, complete the earlier release and rerun the blocked later run. Cancel an obsolete queued release deliberately only after deciding how to resolve its sequence requirement.

Desktop artifacts retain their existing one-day lifetime; the web build retains its existing three-day lifetime. Always check the upload steps for current values before choosing retry scope.

[`template_deploy.yml`](../.github/workflows/template_deploy.yml) downloads artifacts into a unique temporary staging directory, checks the application entrypoint, and creates a dated/SHA-labelled archive of the existing web directory when a backup directory is configured. It replaces deployment contents using only staged files, never other files from the persistent runner workspace. Staging is cleaned even on failure. Windows signing likewise isolates files in a temporary directory, passes secrets through environment variables, and cleans up on failure. Production and development retain backup behavior; QA retains its existing configuration. Rollback is manual: a maintainer selects the correct backup and restores it using the infrastructure team's server-access procedure, then verifies the site. Deployment replacement is not atomic; a failure during replacement can still require restoring the backup. No automated restore or desktop downgrade is introduced here.

## macOS hosted runner

MEASUR pins macOS packaging to **`macos-26`**, an Apple Silicon hosted runner, and explicitly installs the Node version from the project. The application still targets universal Intel/Apple Silicon installers. Changing the build OS does not intentionally change the supported application OS versions.

The job checks the executable for `x86_64` and `arm64`, verifies its signature, requires Apple's notarization response to be `Accepted`, and staples/validates the DMG ticket. Launch testing on both architectures remains a maintainer verification step, including representative Electron/WASM behavior and the supported older OS versions.

GitHub retires `macos-14` on **November 2, 2026**, with earlier brownouts. See the [retirement notice](https://github.blog/changelog/2026-10-01-github-actions-macos-14-runner-image-retirement/) and [runner reference](https://docs.github.com/en/actions/reference/runners/github-hosted-runners). VERIFI's runner migration is separate.

## Validating pipeline changes

Run from the repository root:

```sh
node --test .github/scripts/*.test.cjs .github/actions/check-production-state/*.test.cjs .github/tests/*.test.cjs
node .github/scripts/check-release-version.cjs metadata
actionlint
npm test -- --watch=false --no-progress
npm run test:ca-regression-tests:fixtures
npm run test:ca-regression-tests:full
npm --prefix process-flow-diagram-component test
npm run build-prod-web
npm run build-prod-desktop-ci
```

The workflow gate tests need application dependencies installed. Older actionlint versions may reject GitHub's supported `concurrency.queue` key; with actionlint 1.7.12, use `actionlint -ignore 'unexpected key "queue" for "concurrency" section'` to suppress only that known parser limitation. Do not remove production queuing to accommodate an older validator.

Before declaring rollout complete, observe a controlled production run, verify the graph and asset set, smoke-test the new macOS packages on both architectures, confirm production's deployed commit/version, and confirm branch protection requires the new checks. Local tests cannot prove hosted signing, notarization, runner credentials, or deployment-server behavior.
