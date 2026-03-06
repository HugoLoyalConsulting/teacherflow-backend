#!/usr/bin/env python3
import os
import subprocess
import sys
from pathlib import Path


def run(cmd: list[str]) -> str:
    return subprocess.check_output(cmd, text=True).strip()


def get_changed_files(base: str, head: str) -> list[str]:
    output = run(["git", "diff", "--name-only", base, head])
    return [line.strip() for line in output.splitlines() if line.strip()]


def main() -> int:
    base = os.environ.get("BASE_SHA")
    head = os.environ.get("HEAD_SHA")

    if not base or not head:
        print("Missing BASE_SHA or HEAD_SHA env vars.")
        return 1

    # First push to a branch can provide an all-zero base SHA.
    if set(base) == {"0"}:
        print("Initial push detected (zero base SHA). Skipping README sync check.")
        return 0

    changed = get_changed_files(base, head)
    if not changed:
        print("No changed files.")
        return 0

    changed_set = set(changed)

    # Domain -> acceptable README/index files proving docs were updated.
    required = {
        "backend/": {"backend/README.md"},
        "frontend/": {"frontend/README.md"},
        "scripts/": {"scripts/README.md"},
        "docs/": {
            "docs/README.md",
            "docs/overview/README.md",
            "docs/DOCUMENTATION_INDEX.md",
        },
    }

    violations: list[str] = []

    for prefix, accepted_docs in required.items():
        domain_files = [p for p in changed if p.startswith(prefix)]
        if not domain_files:
            continue

        # Ignore changes that are only within accepted docs files.
        non_doc_changes = [p for p in domain_files if p not in accepted_docs]
        if not non_doc_changes:
            continue

        if changed_set.isdisjoint(accepted_docs):
            violations.append(
                f"{prefix}: changed {len(non_doc_changes)} file(s) but none of {sorted(accepted_docs)} was updated"
            )

    if violations:
        print("README sync check failed:")
        for v in violations:
            print(f"- {v}")
        return 1

    print("README sync check passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
