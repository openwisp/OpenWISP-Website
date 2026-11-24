"""Check that CI installs dependencies without running site builds."""

import os
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


class CiInstallerTests(unittest.TestCase):
    def test_installs_python_and_yarn_dependencies(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory)
            log = path / "calls"
            for name in ("python", "yarn"):
                command = path / name
                command.write_text(
                    f'#!/bin/sh\nprintf "%s\\n" "{name} $*" >> "$CALLS"\n'
                )
                command.chmod(0o755)
            result = subprocess.run(
                [str(ROOT / "install-ci-deps.sh")],
                cwd=ROOT,
                env={
                    **os.environ,
                    "PATH": f"{path}:{os.environ['PATH']}",
                    "CALLS": str(log),
                },
                capture_output=True,
                text=True,
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(
                log.read_text().splitlines(),
                [
                    "yarn install",
                    "python -m pip install -U pip setuptools wheel",
                    "python -m pip install -r requirements.txt",
                ],
            )
