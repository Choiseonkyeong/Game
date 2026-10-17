import importlib.util
import subprocess
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('preflight', Path(__file__).with_name('preflight.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def run(*args):
    return subprocess.run(args, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)


class GuardTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.bare = self.root / 'remote.git'
        self.writer = self.root / 'writer'
        self.worker = self.root / 'worker'
        run('git', 'init', '--bare', str(self.bare))
        run('git', 'init', '-b', 'master', str(self.writer))
        self.config(self.writer)
        (self.writer / 'dist').mkdir()
        (self.writer / 'dist/index.html').write_text('reviewed game')
        self.commit(self.writer, 'baseline')
        run('git', '-C', str(self.writer), 'remote', 'add', 'origin', str(self.bare))
        run('git', '-C', str(self.writer), 'push', 'origin', 'master')
        run('git', 'clone', '-b', 'master', str(self.bare), str(self.worker))
        self.config(self.worker)
        run('git', '-C', str(self.worker), 'remote', 'set-url', 'origin', 'https://github.com/Choiseonkyeong/Game.git')
        run('git', '-C', str(self.worker), 'config', 'url.' + str(self.bare) + '.insteadOf', 'https://github.com/Choiseonkyeong/Game.git')

    def tearDown(self):
        self.tmp.cleanup()

    def config(self, repo):
        run('git', '-C', str(repo), 'config', 'user.name', 'Local Guard Test')
        run('git', '-C', str(repo), 'config', 'user.email', 'guard-test@example.invalid')

    def commit(self, repo, message):
        run('git', '-C', str(repo), 'add', '.')
        run('git', '-C', str(repo), 'commit', '-m', message)

    def test_current_checkout_is_ready(self):
        self.assertEqual(module.check(self.worker)['status'], 'ready')

    def test_new_remote_commit_blocks_stale_worker_and_preserves_files(self):
        (self.writer / 'dist/index.html').write_text('other worker improvement')
        self.commit(self.writer, 'another worker')
        run('git', '-C', str(self.writer), 'push', 'origin', 'master')
        before = (self.worker / 'dist/index.html').read_bytes()
        result = module.check(self.worker)
        self.assertEqual(result['reason'], 'stale_or_diverged_branch')
        self.assertEqual((self.worker / 'dist/index.html').read_bytes(), before)

    def test_existing_local_work_is_not_reset(self):
        (self.worker / 'dist/index.html').write_text('unsaved intentional work')
        self.assertEqual(module.check(self.worker)['reason'], 'existing_local_work')
        self.assertEqual((self.worker / 'dist/index.html').read_text(), 'unsaved intentional work')
        self.assertEqual(module.check(self.worker, 'finish')['status'], 'ready')

    def test_wrong_repository_is_blocked(self):
        run('git', '-C', str(self.worker), 'remote', 'set-url', 'origin', 'https://github.com/another/repository.git')
        self.assertEqual(module.check(self.worker)['reason'], 'wrong_repository_or_sites_checkout')

    def test_old_task_branch_can_continue_after_latest_master_is_integrated(self):
        run('git', '-C', str(self.worker), 'switch', '-c', 'claude/task')
        (self.writer / 'dist/index.html').write_text('latest game')
        self.commit(self.writer, 'update game')
        run('git', '-C', str(self.writer), 'push', 'origin', 'master')
        self.assertEqual(module.check(self.worker)['reason'], 'stale_or_diverged_branch')
        run('git', '-C', str(self.worker), 'merge', '--ff-only', 'origin/master')
        self.assertEqual(module.check(self.worker)['status'], 'ready')


if __name__ == '__main__':
    unittest.main()
