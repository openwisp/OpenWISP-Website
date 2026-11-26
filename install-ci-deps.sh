#!/bin/bash
# Install Python and Node.js dependencies used by CI and review.
set -e
yarn install
python -m pip install -U pip setuptools wheel
python -m pip install -r requirements.txt
