#!/usr/bin/env bash
# Add one or more new PHAST fixtures: scaffold spec + placeholder, then capture snapshots.
#
# Usage:
#   bash src/app/phast/snapshot-tests/add-fixture.sh                   # auto-detect
#   bash src/app/phast/snapshot-tests/add-fixture.sh "07-1353.json"    # specific file(s)
#   npm run snapshot:add
#   npm run snapshot:add -- "07-1353.json" "TEST B1.json"
#
# After running: npm run test:phast-snapshot to verify, then commit all three files.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
GENERATE_PY="$SCRIPT_DIR/generate-snapshot.py"

# --- Step 1: scaffold specs and placeholder snapshots ----------------------
echo "=== Step 1: Scaffolding ==="
new_specs_str=$(python3 "$SCRIPT_DIR/scaffold-spec.py" "$@")

new_specs=()
while IFS= read -r line; do
  [[ -n "$line" ]] && new_specs+=("$line")
done <<< "$new_specs_str"

# Also pick up any already-scaffolded spec whose snapshot is still a placeholder {}.
# This handles the case where scaffold ran previously but capture failed or was skipped.
for spec_path in "$SCRIPT_DIR"/*.snapshot.spec.ts; do
  spec_base=$(basename "$spec_path" .snapshot.spec.ts)
  snap_name="${spec_base#phast-}"
  snap_file="$SCRIPT_DIR/snapshots/$snap_name.snap.json"
  # Already queued from scaffold step — skip
  [[ " ${new_specs[*]} " == *" $spec_base "* ]] && continue
  # Snapshot missing or still a bare placeholder
  if [[ ! -f "$snap_file" ]] || [[ "$(tr -d '[:space:]' < "$snap_file")" == "{}" ]]; then
    new_specs+=("$spec_base")
    echo "  queued (placeholder snapshot): $spec_base" >&2
  fi
done

if [ "${#new_specs[@]}" -eq 0 ]; then
  echo "Nothing to do."
  exit 0
fi

# --- Step 2: capture initial snapshots -------------------------------------
echo ""
echo "=== Step 2: Capturing ${#new_specs[@]} snapshot(s) ==="

cd "$REPO_ROOT"

# Always restore GENERATE=false on exit, even if interrupted.
cleanup() {
  for spec_base in "${new_specs[@]}"; do
    local spec="$SCRIPT_DIR/$spec_base.snapshot.spec.ts"
    [[ -f "$spec" ]] && sed -i 's/^const GENERATE = true;/const GENERATE = false;/' "$spec"
  done
}
trap cleanup EXIT

failures=()

for spec_base in "${new_specs[@]}"; do
  snap_name="${spec_base#phast-}"
  snap_file="$SCRIPT_DIR/snapshots/$snap_name.snap.json"
  spec="$SCRIPT_DIR/$spec_base.snapshot.spec.ts"

  echo ""
  echo "  ==> $spec_base → $snap_name.snap.json"

  sed -i 's/^const GENERATE = false;/const GENERATE = true;/' "$spec"

  ng_out=$(mktemp)
  ng test \
      --include="**/$spec_base.snapshot.spec.ts" \
      --watch=false \
      --browsers=ChromeHeadlessNoSandbox > "$ng_out" 2>&1 || true

  if python3 "$GENERATE_PY" < "$ng_out" > "$snap_file"; then
    echo "       written: $snap_name.snap.json"
  else
    echo "       FAILED:  $snap_name"
    echo "       Relevant ng test output:"
    grep -iE "SNAPSHOT|ERROR|WARN|console" "$ng_out" | head -30 \
      || echo "       (no relevant lines found)"
    failures+=("$snap_name")
    echo "{}" > "$snap_file"  # restore placeholder so spec compiles on next run
  fi

  rm -f "$ng_out"
  sed -i 's/^const GENERATE = true;/const GENERATE = false;/' "$spec"
done

echo ""
if [ "${#failures[@]}" -gt 0 ]; then
  echo "ERROR: Snapshot capture failed for: ${failures[*]}"
  echo "Fix the errors above, then re-run: npm run snapshot:add"
  exit 1
fi

echo "All snapshots captured."
echo "Run 'npm run test:phast-snapshot' to verify, then commit fixture + spec + snapshot."
