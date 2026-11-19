<!-- Title: "Issue <number>: <short description>", e.g. "Issue 8645: Populate Total Outflow field" ("Issue 8645 - ..." is also accepted).
No linked issue: title it "No issue: <short description>".
Fill in each section below. Comments like this one are hidden when the PR is viewed, so you can leave them.
AI agents: follow the "Pull Requests" rules in AGENTS.md. -->

## Summary
<!-- What changes for users, and why we're making the change.
Write it for someone who hasn't seen the issue or the code. Plain language, under 100 words. Keep it simple and concise. -->

## Changes
<!-- A bulleted list or concise write-up of what behaves differently. Not exhaustive, and not a list of files.
Need the full breakdown? Add an optional "## Details" section after this one. -->

## Checklist
<!-- Tick each box. If an item doesn't apply, tick it and add "(N/A)". Leave a box unticked only if it isn't done, and say why in Changes. -->
- [ ] Changes are limited to the linked issue; unrelated problems and out-of-scope concerns are noted, not fixed, and an issue is submitted if applicable
- [ ] I reviewed the full diff myself, including any AI-generated code, as if another developer wrote it
- [ ] Tests were added or updated for changed behavior, or Changes explains why not
- [ ] Calculations still go through `src/app/tools-suite-api/` (no new direct Suite calls in components or services)
- [ ] Units, percentage conventions, and saved assessment data are unchanged, or the change is explained in Summary
- [ ] Visible UI changes were checked in the web app (and Electron if desktop code changed)
- [ ] No console logs, commented-out code, test values, customer data, or sensitive assessment inputs are included
- [ ] The first or last line is the bare issue number, e.g. `#8645`, or `No issue: <reason>` when there is no issue

<!-- First or last line: the issue number on its own line, e.g. #8645. Use the bare number, not "Closes #8645", so the issue stays open for QA.
No linked issue: replace the "#" line with "No issue: <one-line reason>", e.g. "No issue: Suite RC dependency update". -->
#
