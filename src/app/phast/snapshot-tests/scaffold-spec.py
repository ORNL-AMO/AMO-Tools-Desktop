#!/usr/bin/env python3
"""
Scaffolds PHAST snapshot spec files and placeholder .snap.json files for new fixtures.

Usage:
  python3 scaffold-spec.py FIXTURE.json [FIXTURE2.json ...]
  python3 scaffold-spec.py   # auto-detect all fixtures without specs

Prints the base name of each newly-created spec file to stdout (one per line).
Progress messages go to stderr so the caller can capture stdout cleanly.
"""
import json, os, re, sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
FIXTURES_DIR = os.path.join(SCRIPT_DIR, "fixtures")
SNAPSHOTS_DIR = os.path.join(SCRIPT_DIR, "snapshots")

# Placeholders use ALL_CAPS names that never appear in raw TypeScript, so simple
# str.replace() is safe without risking collisions with template content.
SPEC_TEMPLATE = """\
/**
 * Snapshot test: __SPEC_LABEL__
 *
 * __DESCRIPTION__.
 *
 * To regenerate snapshots:
 *   1. Set GENERATE = true
 *   2. Run: ng test --include="**\\/__SPEC_FILENAME__" --watch=false --browsers=ChromeHeadless
 *   3. Pipe output through generate-snapshot.py into snapshots/__SNAP_NAME__.snap.json
 *   4. Set GENERATE = false and re-run to confirm green
 */

import { PHAST } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { PhastResultsService } from '../phast-results.service';
import { buildPhastServices } from './snapshot.helper';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fixture = require('./fixtures/__FIXTURE_FILENAME__');

const GENERATE = false;

const MODIFICATION_COUNT = __MOD_COUNT__;

function extractAssessment(): { phast: PHAST; settings: Settings } {
  const raw = fixture.assessments[0];
  return { phast: raw.assessment.phast, settings: raw.settings };
}

describe('Snapshot Test: __SPEC_LABEL__', () => {
  let phastResultsService: PhastResultsService;

  beforeAll(async () => {
    const services = await buildPhastServices();
    phastResultsService = services.phastResultsService;
  });

  it('GENERATE flag must be false before committing', () => {
    expect(GENERATE).toBe(false);
  });

  it('fixture has expected modification count', () => {
    expect(extractAssessment().phast.modifications.length).toBe(MODIFICATION_COUNT);
  });

  if (GENERATE) {

    it('generates baseline snapshot', () => {
      const { phast, settings } = extractAssessment();
      const result = phastResultsService.getResults(phast, settings);
      console.log('SNAPSHOT:baseline:' + JSON.stringify(result));
      expect(true).toBe(true);
    });

    for (let i = 0; i < MODIFICATION_COUNT; i++) {
      it(`generates modification[${i}] snapshot`, () => {
        const { phast, settings } = extractAssessment();
        const modPhast: PHAST = phast.modifications[i].phast;
        const result = phastResultsService.getResults(modPhast, settings);
        console.log(`SNAPSHOT:modification_${i}:` + JSON.stringify(result));
        expect(true).toBe(true);
      });
    }

  } else {

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const snapshots = require('./snapshots/__SNAP_NAME__.snap.json');

    it('baseline results match snapshot', () => {
      const { phast, settings } = extractAssessment();
      const result = JSON.parse(JSON.stringify(phastResultsService.getResults(phast, settings)));
      expect(result).toEqual(snapshots.baseline);
    });

    for (let i = 0; i < MODIFICATION_COUNT; i++) {
      it(`modification[${i}] results match snapshot`, () => {
        const { phast, settings } = extractAssessment();
        const modPhast: PHAST = phast.modifications[i].phast;
        const result = JSON.parse(JSON.stringify(phastResultsService.getResults(modPhast, settings)));
        expect(result).toEqual(snapshots[`modification_${i}`]);
      });
    }

  }
});
"""


def fixture_to_snap_name(fixture_filename):
    """'TEST B1.json' → 'test-b1',  '07-1353.json' → '07-1353'"""
    base = os.path.splitext(fixture_filename)[0]
    return re.sub(r'\s+', '-', base).lower()


def describe_fixture(phast, settings):
    losses = phast.get("losses", {})

    if losses.get("energyInputEAF"):
        fuel_type = "Electrotechnology / EAF"
    elif losses.get("flueGasLosses"):
        fuel_type = "Fuel-fired"
    else:
        fuel_type = "Electrotechnology"

    units = settings.get("unitsOfMeasure", "Imperial")

    def plural(n, singular, plural_form):
        return f"{n} {singular if n == 1 else plural_form}"

    parts = [fuel_type, units]
    charge = len(losses.get("chargeMaterials", []))
    wall = len(losses.get("wallLosses", []))
    cooling = len(losses.get("coolingLosses", []))
    if charge:
        parts.append(plural(charge, "charge material", "charge materials"))
    if wall:
        parts.append(plural(wall, "wall loss", "wall losses"))
    if cooling:
        parts.append(plural(cooling, "cooling loss", "cooling losses"))
    mods = len(phast.get("modifications", []))
    parts.append(plural(mods, "modification", "modifications"))

    return ", ".join(parts)


def scaffold_fixture(fixture_filename):
    fixture_path = os.path.join(FIXTURES_DIR, fixture_filename)
    if not os.path.exists(fixture_path):
        print(f"ERROR: fixture not found: {fixture_path}", file=sys.stderr)
        sys.exit(1)

    snap_name = fixture_to_snap_name(fixture_filename)
    spec_base = f"phast-{snap_name}"
    spec_filename = f"{spec_base}.snapshot.spec.ts"
    spec_path = os.path.join(SCRIPT_DIR, spec_filename)
    snap_path = os.path.join(SNAPSHOTS_DIR, f"{snap_name}.snap.json")

    if os.path.exists(spec_path):
        print(f"  skip (spec already exists): {spec_filename}", file=sys.stderr)
        return None

    with open(fixture_path, encoding="utf-8") as f:
        data = json.load(f)

    raw = data["assessments"][0]
    phast = raw["assessment"]["phast"]
    settings = raw["settings"]
    spec_label = raw["assessment"].get("name", snap_name)
    mod_count = len(phast.get("modifications", []))
    description = describe_fixture(phast, settings)

    spec_content = (
        SPEC_TEMPLATE
        .replace("__SPEC_LABEL__", spec_label)
        .replace("__DESCRIPTION__", description)
        .replace("__SPEC_FILENAME__", spec_filename)
        .replace("__SNAP_NAME__", snap_name)
        .replace("__FIXTURE_FILENAME__", fixture_filename)
        .replace("__MOD_COUNT__", str(mod_count))
    )

    with open(spec_path, "w", encoding="utf-8") as f:
        f.write(spec_content)
    print(f"  created spec:        {spec_filename}", file=sys.stderr)

    if not os.path.exists(snap_path):
        with open(snap_path, "w", encoding="utf-8") as f:
            f.write("{}\n")
        print(f"  created placeholder: {snap_name}.snap.json", file=sys.stderr)

    return spec_base


def auto_detect():
    """Return fixture filenames not referenced by any existing spec's require() call."""
    # Read every spec to find which fixture files are already covered.
    require_re = re.compile(r"require\('./fixtures/(.+?)'\)")
    referenced = set()
    for fname in os.listdir(SCRIPT_DIR):
        if fname.endswith(".snapshot.spec.ts"):
            with open(os.path.join(SCRIPT_DIR, fname), encoding="utf-8") as f:
                for m in require_re.finditer(f.read()):
                    referenced.add(m.group(1))

    all_fixtures = sorted(f for f in os.listdir(FIXTURES_DIR) if f.endswith(".json"))
    return [f for f in all_fixtures if f not in referenced]


def main():
    fixture_filenames = sys.argv[1:] or auto_detect()

    if not fixture_filenames:
        print("No new fixtures found — all have spec files.", file=sys.stderr)
        sys.exit(0)

    if not sys.argv[1:]:
        print(f"Auto-detected {len(fixture_filenames)} new fixture(s):", file=sys.stderr)
        for f in fixture_filenames:
            print(f"  {f}", file=sys.stderr)

    created = []
    for fixture_filename in fixture_filenames:
        print(f"\nScaffolding: {fixture_filename}", file=sys.stderr)
        spec_base = scaffold_fixture(fixture_filename)
        if spec_base:
            created.append(spec_base)

    if not created:
        print("\nNothing new to scaffold.", file=sys.stderr)
        sys.exit(0)

    for spec_base in created:
        print(spec_base)


if __name__ == "__main__":
    main()
