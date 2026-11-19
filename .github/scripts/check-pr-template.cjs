const fs = require('node:fs');

const CHECKLIST_ITEMS = 8;
const MAX_SUMMARY_WORDS = 99;

/**
 * Splits a PR body into its `## ` sections, after removing HTML comments.
 * @param {string} body
 * @returns {{ sections: Record<string, string>, text: string }}
 */
function parseBody(body) {
  const text = (body || '').replace(/<!--[\s\S]*?-->/g, '');
  const sections = {};
  let current = null;
  for (const line of text.split(/\r?\n/)) {
    const heading = /^##\s+(.+?)\s*$/.exec(line);
    if (heading) {
      current = heading[1];
      sections[current] = '';
    } else if (current !== null) {
      sections[current] += `${line}\n`;
    }
  }
  return { sections, text };
}

/**
 * Checks a PR title and body against the PR template rules.
 * @param {{ title?: string, body?: string, draft?: boolean, base?: string }} pr
 * @returns {string[]} one message per failed rule; empty when skipped or clean
 */
function checkPullRequest({ title, body, draft, base }) {
  if (draft || base === 'master') {
    return [];
  }
  const warnings = [];
  const { sections, text } = parseBody(body);

  if (!/^(?:Issue \d+(?::| -)|No issue:) \S/.test(title || '')) {
    warnings.push('T1 Title: must look like "Issue <number>: <short description>" (or "No issue: <short description>").');
  }

  const missing = ['Summary', 'Changes', 'Checklist'].filter(name => !(name in sections));
  for (const name of missing) {
    warnings.push(`H1 Headings: the "## ${name}" section is missing.`);
  }

  if ('Summary' in sections) {
    const summary = sections.Summary.trim();
    if (!summary) {
      warnings.push('S1 Summary: is empty.');
    } else if (summary.split(/\s+/).length > MAX_SUMMARY_WORDS) {
      warnings.push(`S2 Summary: must be under 100 words (found ${summary.split(/\s+/).length}).`);
    }
  }

  if ('Changes' in sections && !sections.Changes.trim()) {
    warnings.push('S3 Changes: is empty.');
  }

  if ('Checklist' in sections) {
    const boxes = (sections.Checklist.match(/^\s*- \[[ xX]\]/gm) || []).length;
    if (boxes < CHECKLIST_ITEMS) {
      warnings.push(`C1 Checklist: expected ${CHECKLIST_ITEMS} checkbox items, found ${boxes}. Do not delete items; tick and mark "(N/A)" instead.`);
    }
  }

  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const isIssueReference = line => /^(?:#\d+|No issue: \S.*)$/.test(line || '');
  if (!isIssueReference(lines[0]) && !isIssueReference(lines[lines.length - 1])) {
    warnings.push('I1 Issue reference: the first or last line must be the bare issue number, e.g. "#8645", or "No issue: <reason>".');
  }

  return warnings;
}

function main() {
  const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  const pr = event.pull_request || {};
  const warnings = checkPullRequest({
    title: pr.title,
    body: pr.body,
    draft: pr.draft,
    base: pr.base && pr.base.ref,
  });
  for (const warning of warnings) {
    console.log(`::warning title=PR template::${warning}`);
  }
  if (!warnings.length) {
    console.log('PR template check passed (or skipped for draft / master PRs).');
  }
}

if (require.main === module) {
  main();
}

module.exports = { CHECKLIST_ITEMS, checkPullRequest, parseBody };
