"""
run_all.py  —  Entry-point wrapper.

Launches the full synthetic-data pipeline located in data/synthetic/run_all.py.
Run from the project root:

    python run_all.py
"""

import subprocess
import sys
import os

if __name__ == "__main__":
    root   = os.path.dirname(os.path.abspath(__file__))
    script = os.path.join(root, "data", "synthetic", "run_all.py")
    sys.exit(subprocess.call([sys.executable, script]))
