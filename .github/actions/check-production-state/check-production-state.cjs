// Runs immediately before draft creation or deployment, including failed-job
// reruns where the caller's successful release-policy job is not executed again.
module.exports = async function checkProductionState({ github, context, releaseTag = '' }) {
  const repository = context.repo;
  if (context.ref !== 'refs/heads/master' || !['push', 'workflow_dispatch'].includes(context.eventName)) {
    throw new Error('Production state checks require a master push or manual production run.');
  }

  const seen = new Set([context.sha]);
  for await (const page of github.paginate.iterator(github.rest.actions.listWorkflowRuns, {
    ...repository, workflow_id: 'main.yml', branch: 'master', per_page: 100,
  })) {
    // Octokit normalizes list endpoints such as { workflow_runs: [...] } into
    // arrays for paginate.iterator(), unlike the raw GitHub REST response.
    for (const run of page.data) {
      if (run.head_branch !== 'master' ||
          !['push', 'workflow_dispatch'].includes(run.event) || seen.has(run.head_sha)) continue;
      const comparison = await github.rest.repos.compareCommitsWithBasehead({
        ...repository, basehead: `${context.sha}...${run.head_sha}`,
      });
      // Ancestors cannot make this deployment stale; their attempt histories
      // need not remain available or consume additional API requests.
      if (['behind', 'identical'].includes(comparison.data.status)) {
        seen.add(run.head_sha);
        continue;
      }
      if (!await hasSuccessfulAttempt(github, repository, run)) continue;
      seen.add(run.head_sha);
      if (comparison.data.status === 'ahead') {
        throw new Error(`A newer production commit (${run.head_sha}) has already completed. Refusing to redeploy this older run.`);
      }
      if (!['behind', 'identical'].includes(comparison.data.status)) {
        throw new Error('Production history has diverged. A maintainer must resolve release order before deployment.');
      }
    }
  }

  if (!releaseTag) return;
  let tagExists = true;
  try {
    await github.rest.git.getRef({ ...repository, ref: `tags/${releaseTag}` });
  } catch (error) {
    if (error.status !== 404) throw error;
    tagExists = false;
  }
  if (tagExists) {
    // Resolves annotated as well as lightweight tags. A missing ref is queried
    // separately because the commits endpoint can return 422 for a new tag.
    const { data } = await github.rest.repos.getCommit({ ...repository, ref: releaseTag });
    if (data.sha !== context.sha) throw new Error(`Tag ${releaseTag} belongs to another commit.`);
  }
  try {
    const { data } = await github.rest.repos.getReleaseByTag({ ...repository, tag: releaseTag });
    if (!data.draft) {
      throw new Error(`Release ${releaseTag} is already published. Refusing to replace its installer assets. Retry only the failed web deployment instead.`);
    }
  } catch (error) {
    // GitHub's tag endpoint does not expose drafts. action-gh-release handles
    // draft discovery; an absent published release is safe for that step.
    if (error.status !== 404) throw error;
  }
};

async function hasSuccessfulAttempt(github, repository, run) {
  if (run.status === 'completed' && run.conclusion === 'success') return true;
  // A rerun replaces the run's current conclusion. An earlier successful
  // attempt remains evidence of production completion even if a later rerun
  // failed (for example because its installer release is already published).
  for (let attempt = run.run_attempt - 1; attempt >= 1; attempt--) {
    const { data } = await github.rest.actions.getWorkflowRunAttempt({
      ...repository, run_id: run.id, attempt_number: attempt,
    });
    if (data.status === 'completed' && data.conclusion === 'success') return true;
  }
  return false;
}
