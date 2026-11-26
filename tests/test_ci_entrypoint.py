"""Check restricted CI test execution without building the website."""

import os
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


class CiEntrypointTests(unittest.TestCase):
    def run_script(self, *arguments, status=0, root=ROOT):
        with tempfile.TemporaryDirectory() as directory:
            fake = Path(directory) / "python"
            fake.write_text('#!/bin/sh\nprintf "%s\\n" "$@"\nexit "$STATUS"\n')
            fake.chmod(0o755)
            return subprocess.run(
                [str(root / "runtests"), *arguments],
                cwd=root,
                env={
                    **os.environ,
                    "PATH": f"{directory}:{os.environ['PATH']}",
                    "STATUS": str(status),
                },
                capture_output=True,
                text=True,
            )

    def test_default_discovery(self):
        result = self.run_script()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(
            result.stdout.splitlines(), ["-m", "unittest", "discover", "-s", "tests"]
        )

    def test_rejects_unsupported_arguments(self):
        for argument in ("--locals", "../test.py", "tests/test_x.py;id", "--"):
            with self.subTest(argument=argument):
                result = self.run_script(argument)
                self.assertEqual(result.returncode, 2)
                self.assertIn("unsupported", result.stderr.lower())
                self.assertEqual(result.stdout, "")

    def test_selected_test_file(self):
        result = self.run_script("-q", "tests/test_ci_installer.py")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(
            result.stdout.splitlines(),
            [
                "-m",
                "unittest",
                "discover",
                "-s",
                "tests",
                "-p",
                "test_ci_installer.py",
                "-q",
            ],
        )

    def test_returns_runner_status(self):
        self.assertEqual(self.run_script("-v", status=17).returncode, 17)

    def test_rejects_missing_duplicate_and_symlinked_files(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            shutil.copy2(ROOT / "runtests", root / "runtests")
            tests = root / "tests"
            tests.mkdir()
            (tests / "test_real.py").touch()
            (root / "other.py").touch()
            (tests / "test_link.py").symlink_to(root / "other.py")
            for arguments in (
                ("tests/test_missing.py",),
                ("tests/test_real.py", "tests/test_real.py"),
                ("tests/test_link.py",),
            ):
                with self.subTest(arguments=arguments):
                    result = self.run_script(*arguments, root=root)
                    self.assertEqual(result.returncode, 2)
                    self.assertEqual(result.stdout, "")
