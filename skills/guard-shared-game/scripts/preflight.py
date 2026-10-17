#!/usr/bin/env python3
"""Read-only shared-repo preflight; fetch refs but never modify the worktree."""
import argparse
import json
import re
import subprocess
from pathlib import Path
from urllib.parse import urlparse


def git(repo, *args):
    return subprocess.run(['git', '-C', str(repo), *args], text=True,
                          stdout=subprocess.PIPE, stderr=subprocess.PIPE)


def repository_name(url):
    if url.startswith('git@github.com:'):
        return url.split(':', 1)[1].removesuffix('.git').strip('/').lower()
    value = urlparse(url)
    if value.hostname == 'github.com':
        return value.path.removesuffix('.git').strip('/').lower()
    return None


def check(repo, phase='start'):
    root = git(repo, 'rev-parse', '--show-toplevel')
    if root.returncode:
        return {'status': 'blocked', 'reason': 'not_a_git_checkout'}
    repo = Path(root.stdout.strip())
    origin = git(repo, 'config', '--get', 'remote.origin.url')
    if repository_name(origin.stdout.strip()) != 'choiseonkyeong/game':
        return {'status': 'blocked', 'reason': 'wrong_repository_or_sites_checkout'}
    fetched = git(repo, 'fetch', 'origin', '+refs/heads/master:refs/remotes/origin/master')
    if fetched.returncode:
        return {'status': 'blocked', 'reason': 'cannot_verify_latest_remote_master'}
    branch = git(repo, 'symbolic-ref', '--short', '-q', 'HEAD').stdout.strip()
    local = git(repo, 'rev-parse', 'HEAD').stdout.strip()
    remote = git(repo, 'rev-parse', 'refs/remotes/origin/master').stdout.strip()
    report = {'status': 'ready', 'phase': phase, 'branch': branch,
              'local_head': local, 'remote_master': remote}
    if not branch:
        return {**report, 'status': 'blocked', 'reason': 'detached_head'}
    if git(repo, 'merge-base', '--is-ancestor', remote, local).returncode:
        return {**report, 'status': 'blocked', 'reason': 'stale_or_diverged_branch',
                'next': 'Preserve local work; integrate latest master or use a fresh worktree.'}
    dirty = git(repo, 'status', '--porcelain').stdout.splitlines()
    report['worktree_change_count'] = len(dirty)
    if phase == 'start' and dirty:
        return {**report, 'status': 'blocked', 'reason': 'existing_local_work',
                'next': 'Preserve it; inspect and isolate before starting a new task.'}
    entry = repo / 'dist/index.html'
    if not entry.is_file():
        return {**report, 'status': 'blocked', 'reason': 'missing_game_entrypoint'}
    report['committed_game_tree'] = git(repo, 'rev-parse', 'HEAD:dist').stdout.strip()
    report['entry_scripts'] = re.findall(r'<script[^>]+src=[\"\']([^\"\']+)', entry.read_text(encoding='utf-8'))
    report['note'] = 'Recheck remote HEAD at write/push; this check is not a deployment or access proof.'
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=Path, default=Path.cwd())
    parser.add_argument('--phase', choices=['start', 'finish'], default='start')
    args = parser.parse_args()
    result = check(args.repo, args.phase)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result['status'] == 'ready' else 2


if __name__ == '__main__':
    raise SystemExit(main())
