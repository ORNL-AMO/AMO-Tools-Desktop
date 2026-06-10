#!/usr/bin/env bash
# Regenerates all PHAST snapshot files in one pass.
#
# For each *.snapshot.spec.ts:
#   1. Flips GENERATE=false → true
#   2. Runs the spec via ng test (headless)
#   3. Pipes output through generate-snapshot.py → writes the .snap.json
#   4. Restores GENERATE=false
#
# Usage:
#   bash src/app/phast/snapshot-tests/regenerate-all.sh
#   npm run snapshot:regenerate
#
# Abort on any unexpected error; clean up spec files on exit.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
GENERATE_PY="$SCRIPT_DIR/generate-snapshot.py"

# Always restore GENERATE=false in all specs on exit, even if interrupted.
cleanup() {
  for spec in "$SCRIPT_DIR"/*.snapshot.spec.ts; do
    sed -i 's/^const GENERATE = true;/const GENERATE = false;/' "$spec"
  done
}
trap cleanup EXIT

cd "$REPO_ROOT"

failures=()

for spec in "$SCRIPT_DIR"/*.snapshot.spec.ts; do
  # Derive snapshot path from spec filename.
  # phast-foo-bar.snapshot.spec.ts → snapshots/foo-bar.snap.json
  spec_base=$(basename "$spec" .snapshot.spec.ts)
  snap_name="${spec_base#phast-}"
  snap_file="$SCRIPT_DIR/snapshots/$snap_name.snap.json"

  echo "==> $spec_base → $snap_name.snap.json"

  sed -i 's/^const GENERATE = false;/const GENERATE = true;/' "$spec"

  # Capture ng test output to a temp file so we can inspect it on failure
  # and avoid PIPESTATUS complexity entirely.
  ng_out=$(mktemp)
  ng test \
      --include="**/$spec_base.snapshot.spec.ts" \
      --watch=false \
      --browsers=ChromeHeadlessNoSandbox > "$ng_out" 2>&1 || true

  python3 "$GENERATE_PY" < "$ng_out" > "$snap_file"
  py_exit=$?

  if [ "${py_exit}" -eq 0 ]; then
    echo "    written: $snap_file"
  else
    echo "    FAILED: $snap_name"
    echo "    Relevant ng test output:"
    grep -iE "snapshot|LOG:|WARN:|console|ERROR" "$ng_out" | head -20 \
      || echo "    (no relevant lines found; check $ng_out for full output)"
    failures+=("$snap_name")
    # Remove any partial output so a corrupt file isn't committed.
    rm -f "$snap_file"
  fi

  rm -f "$ng_out"

  sed -i 's/^const GENERATE = true;/const GENERATE = false;/' "$spec"
done

echo ""
if [ ${#failures[@]} -gt 0 ]; then
  echo "ERROR: The following snapshots failed to regenerate:"
  for f in "${failures[@]}"; do echo "  - $f"; done
  exit 1
fi

echo "All snapshots regenerated."
echo "Run 'npm run test:phast-snapshot' to verify all tests pass against the new snapshots."
