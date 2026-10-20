// Runs immediately before draft creation or deployment, including failed-job
// reruns where the caller's successful release-policy job is not executed again.
module.exports = async function checkProductionState({ github, context, releaseTag = '' }) {
  const repository = context.repo;
  if (context.ref !== 'refs/heads/master' || !['push', 'workflow_dispatch'].includes(context.eventName)) {
    throw new Error('Production state checks require a master push or manual production run.');
  }

  const seen = new Set([context.sha]);
  for await (const page of github.paginate.iterator(github.rest.actions.listWorkflowRuns, {
    ...repository, workflow_id: 'main.yml', branch: 'master', status: 'success', per_page: 100,
  })) {
    for (const run of page.data.workflow_runs) {
      if (run.head_branch !== 'master' || run.status !== 'completed' || run.conclusion !== 'success' ||
          !['push', 'workflow_dispatch'].includes(run.event) || seen.has(run.head_sha)) continue;
      seen.add(run.head_sha);
      const comparison = await github.rest.repos.compareCommitsWithBasehead({
        ...repository, basehead: `${context.sha}...${run.head_sha}`,
      });
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
