# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Precedence

When sources conflict, apply this order (highest to lowest):

1. Direct instructions from the user in the current conversation
2. Claude's own persisted memory for this project (prior feedback and corrections)
3. The coding style guide imported below
4. `AGENTS.md` (imported below)

`AGENTS.md` covers repo orientation, architecture, and workflow (what to do, where things live, how to verify changes). The style guide covers how to write the code. If the two disagree on style or pattern, the style guide wins.

## Commenting

Default to no comment. Only add one when the *why* is non-obvious: a hidden constraint, a subtle
invariant, a workaround for a specific bug, or behavior that would surprise a reader. Never comment
*what* the code does — descriptive naming should already make that clear; if removing the comment
wouldn't confuse a future reader, don't write it. Don't reference the current task, fix, ticket, or
caller (e.g. "added for the X flow", "fix for #123") — that belongs in the commit message or PR
description and rots as the codebase evolves.

## Coding Style

@CODING_STYLE_GUIDE.MD

## Repo Orientation

@AGENTS.md

## Commands

Both this repo and `process-flow-diagram-component/` need dependencies installed for a working build: `npm run install-packages` (or `npm install` in each directory).

### Development

- `npm run start`: serve the web build with live reload. Preferred over Electron for most feature work (faster reloads).
- `npm run build-watch` plus `npm run electron`: build for Electron with hot-reload, then launch the desktop shell.

### Production builds

- `npm run build-prod-desktop` then `npm run dist`: desktop installer, output lands in `output/`.
- `npm run build-prod-web`: web distribution build.

### Tests

See `AGENTS.md` → Verification for test and typecheck commands.

- `npm test`: Angular/Karma suite (ChromeHeadless).
- Single spec: `ng test --include='**/path/to/file.spec.ts'`
- Process-flow package (from `process-flow-diagram-component/`): `npm run test` (Vitest), `npm run test:typecheck`.

## Pull Requests

- Title: `Issue <number> - <description mimicking the issue title>`, e.g. `Issue 8645 - Populate Total Outflow field under specific conditions`.
- Body: the repo's PR template (`.github/pull_request_template.md`) verbatim, followed by the issue reference on its own line at the end, e.g. `#8645` (no quotes).
