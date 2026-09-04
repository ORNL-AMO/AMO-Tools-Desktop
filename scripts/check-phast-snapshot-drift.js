// Guards against unnoticed drift between the legacy golden-master fixtures/snapshots
// (src/app/phast/snapshot-tests/) and the copies ported into process-heating-assessment
// (src/app/process-heating-assessment/snapshot-tests/). See
// .prompts/.process-heating-upgrade/refactor-plan/step-4-golden-master-test-infrastructure-plan.md:
// the new module's suite carries extra fixtures (Steam/EAF/Custom Electrotechnology) legacy doesn't
// have, so this only compares the filenames present on both sides — it is not a directory-listing
// equality check.
const fs = require('fs');
const path = require('path');
const isEqual = require('lodash/isEqual');

const LEGACY_ROOT = path.join(__dirname, '..', 'src/app/phast/snapshot-tests');
const NEW_ROOT = path.join(__dirname, '..', 'src/app/process-heating-assessment/snapshot-tests');
const SUBDIRS = ['fixtures', 'snapshots'];

function listJsonFiles(dir) {
  return fs.readdirSync(dir).filter(name => name.endsWith('.json'));
}

function main() {
  const allDifferences = [];

  SUBDIRS.forEach(subdir => {
    const legacyDir = path.join(LEGACY_ROOT, subdir);
    const newDir = path.join(NEW_ROOT, subdir);
    const legacyFiles = new Set(listJsonFiles(legacyDir));
    const newFiles = new Set(listJsonFiles(newDir));
    const sharedFiles = [...legacyFiles].filter(name => newFiles.has(name));

    sharedFiles.forEach(name => {
      const legacyContent = JSON.parse(fs.readFileSync(path.join(legacyDir, name), 'utf8'));
      const newContent = JSON.parse(fs.readFileSync(path.join(newDir, name), 'utf8'));
      if (!isEqual(legacyContent, newContent)) {
        allDifferences.push(
          `${subdir}/${name}:\n` +
          `  legacy: ${path.relative(process.cwd(), path.join(legacyDir, name))}\n` +
          `  new:    ${path.relative(process.cwd(), path.join(newDir, name))}`
        );
      }
    });
  });

  if (allDifferences.length > 0) {
    console.error('PHAST snapshot drift detected between:');
    console.error(`  legacy: ${path.relative(process.cwd(), LEGACY_ROOT)}`);
    console.error(`  new:    ${path.relative(process.cwd(), NEW_ROOT)}\n`);
    console.error(allDifferences.join('\n\n'));
    console.error(
      '\nIf legacy was intentionally regenerated (e.g. via GENERATE=true after a PhastResultsService ' +
      'change), mirror the same fixture/snapshot update into process-heating-assessment/snapshot-tests/, ' +
      'or vice versa if the new module was updated first.'
    );
    process.exitCode = 1;
    return;
  }

  console.log('PHAST snapshot drift check passed: shared legacy and new-module fixtures/snapshots agree.');
}

main();
