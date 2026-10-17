---
name: guard-shared-game
description: Protect the shared Choiseonkyeong/Game project during Codex and Claude collaboration. Use before editing, restoring, merging, publishing, reporting a URL/version, or continuing game work from another worker or branch. Verify current remote source and deployment provenance, reject stale branch baselines, preserve other workers' changes, and hand off exact commits and verified access status.
---

# Shared Game work guard

## Establish the current facts before editing

1. Read repository `AGENTS.md` or `CLAUDE.md`, `COLLABORATION.md`, and `.collaboration/release-state.json`. Treat the release file as a dated record, not proof of today's live state.
2. Use `Choiseonkyeong/Game` **remote `master`** as the authoritative source. Re-read its HEAD and tree at task start and before writing or merging. Do not use a remembered SHA, old local folder, or another tool's personal branch as the current source.
3. Record remote HEAD, current working branch/HEAD, working-tree changes, and the files needed for this task. Follow `dist/index.html` imports to identify active files. The reviewed v0.6.3 entry is `play.js`; legacy `app.js`, `art.js`, `engine.js`, and `story.js` may exist but are not automatically the active game. Re-check this rather than freezing the layout forever.
4. In a GitHub clone, run this skill's `scripts/preflight.py --repo <checkout> --phase start`. It fetches `origin/master`, verifies repository identity, rejects stale history and dirty starts, and never resets, checks out, stashes, commits, or pushes. Preserve an existing dirty worktree; use an isolated fresh worktree or integrate its intentional work. Never delete it to pass the check.
5. With GitHub connector tools, perform the same checks using branch/commit/tree and compare reads. A Sites checkout is a **different Git repository**, not an automatically synchronized GitHub checkout. Import the current GitHub game source before editing it, preserving Site identity/configuration. Do not run the GitHub-origin checker against a Sites checkout and mistake its rejection for a game error.

## Preserve concurrent work

- Create task branches from current `master`. Before reusing a branch, fetch and verify it contains current master; merge or rebase relevant changes without losing local work. For a substantially stale branch, use a fresh branch/worktree and carry over the small intended patch, not its whole historical source tree.
- Read the current target file before editing it. Apply the smallest task-specific patch. Do not overwrite files with an older full snapshot, even if using a new commit parent.
- For GitHub tree API writes, derive `base_tree_sha` from the freshly read master/target tree; re-read changed files on collisions. Update refs with `expected_sha` and `force:false`; update files with their current blob SHA. Re-read and integrate after a rejected lease. Never retry using force.
- Before merging or pushing, re-run preflight with `--phase finish` or connector comparisons. Re-fetch remote master and inspect the final diff. Stop a broad unexplained game replacement; recover the intended small patch instead.
- Use the existing authorization to complete normal fixes and publication. Ask only for truly missing decisions, conflicting edits whose intended behavior cannot be determined, or a destructive operation not already authorized.
- When asked to restore game source but preserve URLs, compare the named/reference game version first. Restore only the requested source paths; retain deployment, access, URLs and unrelated work. Use an additive revert/restore commit with an expected-HEAD check; preserve both histories. If files are already identical, say so instead of inventing a rollback.

## Keep source, deployment, and access separate

1. Re-read the current hosting configuration and its actual publication status. Retain the agreed URL unless the user requests a change. Never declare a new or merely planned URL live.
2. Distinguish `code_saved`, `checks_passed`, `deployment_succeeded`, `external_access_verified`, and `visual_or_mobile_verified`. Report only observed states. A source push is not a deployment; a public access flag or one successful HTTP request does not prove another person's account/network/AI URL-fetch tool can access it.
3. Compare deployed provenance with the intended **game content**. Different commit SHAs can hold identical game files after documentation-only commits or synchronization between GitHub and Sites. Compare `dist` trees/file hashes when IDs differ; do not roll back just to make commit IDs equal.
4. For GitHub Pages, use the repository workflow and verify its run/deployment, then `build-info.json` when available. For Sites, use the Sites skill and exact existing project/audience; retain its source commit and saved-version ID. Do not mix a GitHub SHA with a Sites source SHA.
5. Without the provider capability required for an outstanding setting, finish and commit the reviewable configuration, state the exact remaining setting, and do not report the URL fixed. Do not collect or persist personal tokens.
6. Run meaningful checks for the changed behavior. Keep automated tests, static rendering, actual browser behavior, and phone touch verification distinct. An automated pass alone cannot prove visual consistency or touch quality.
7. After a successful deployment, update `.collaboration/release-state.json` with actual source provenance, URL and verification evidence. After failure, preserve the last successful release and record the failed/pending attempt separately. Do not replace a confirmed release with a mere proposed commit.

## Hand off concrete evidence

Record in the repository or PR: task branch, exact source commit, short change summary, relevant check results, actual deployed version/commit and URL, verification limits, and any remaining action. Use this compact form:

- Source: `<branch>@<SHA>`; synchronized master: `<SHA>`
- Changes/checks: `<behavior; observed results>`
- Deployment: `<provider/version/source SHA; succeeded | pending | not deployed>`
- URL/access: `<URL; checked method; other collaborator confirmed or not>`
- Remaining: `<specific unresolved item or none>`

Keep the shared Game repository as the handoff medium. Do not assume another worker read this chat, automatically refreshed their local files, or received a message. Never send them external messages without the user's instruction.
