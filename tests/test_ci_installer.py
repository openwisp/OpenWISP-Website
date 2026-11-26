"""Check that CI installs dependencies without running site builds."""

import os
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


class CiInstallerTests(unittest.TestCase):
    def run_installer(self, fail_match=""):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory)
            log = path / "calls"
            for name in ("python", "yarn"):
                command = path / name
                command.write_text(
                    f'#!/bin/sh\nprintf "%s\\n" "{name} $*" >> "$CALLS"\n'
                    f'[ "${{FAIL_MATCH:-}}" != "{name} $*" ] || exit 17\n'
                )
                command.chmod(0o755)
            result = subprocess.run(
                [str(ROOT / "install-ci-deps.sh")],
                cwd=ROOT,
                env={
                    **os.environ,
                    "PATH": f"{path}:{os.environ['PATH']}",
                    "CALLS": str(log),
                    "FAIL_MATCH": fail_match,
                },
                capture_output=True,
                text=True,
            )
            return result, log.read_text().splitlines()

    def test_installs_python_and_yarn_dependencies(self):
        result, calls = self.run_installer()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(
            calls,
            [
                "yarn install",
                "python -m pip install -U pip setuptools wheel",
                "python -m pip install -r requirements.txt",
            ],
        )

    def test_failures_stop_later_commands(self):
        for command in (
            "yarn install",
            "python -m pip install -U pip setuptools wheel",
            "python -m pip install -r requirements.txt",
        ):
            with self.subTest(command=command):
                result, calls = self.run_installer(fail_match=command)
                self.assertEqual(result.returncode, 17)
                self.assertEqual(calls[-1], command)
