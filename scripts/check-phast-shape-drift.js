// Guards against unnoticed drift between the module-owned PHAST shape
// (src/app/process-heating-assessment/models/phast.ts) and the legacy shared shape it was
// duplicated from (src/app/shared/models/phast/phast.ts). See
// .prompts/.process-heating-upgrade/refactor-plan/process-heating-type-structure-improvements.md
// section 3.6: the two files describe one on-disk/shared-container shape, and TypeScript's
// structural typing won't flag it if they diverge. This is a plain text/AST diff, not a runtime
// check: it compares interface member name/optionality/type-text, nothing more.
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const LOCAL_FILE = path.join(__dirname, '..', 'src/app/process-heating-assessment/models/phast.ts');
const SHARED_FILE = path.join(__dirname, '..', 'src/app/shared/models/phast/phast.ts');

// `Modification` is deliberately excluded: process-heating-assessment reshaped its local copy
// (dropped `phast`, replaced the 15 flat `exploreOppsShowX` fields with `exploreOpportunities`)
// while the shared/legacy copy keeps the original shape on purpose. See sections 3.2 and 3.3 of
// the document linked above.
const INTERFACES_TO_COMPARE = [
  'PHAST',
  'Losses',
  'Notes',
  'PhastResults',
  'PhastValid',
  'PhastCo2SavingsData',
  'PhastCo2EmissionsOutput',
  'EAFResults',
];

function extractInterfaceMembers(filePath) {
  const sourceText = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true);
  const membersByInterface = new Map();

  sourceFile.statements.forEach(statement => {
    if (!ts.isInterfaceDeclaration(statement) || !INTERFACES_TO_COMPARE.includes(statement.name.text)) {
      return;
    }
    const members = statement.members
      .filter(ts.isPropertySignature)
      .map(member => ({
        name: member.name.getText(sourceFile),
        optional: Boolean(member.questionToken),
        type: member.type.getText(sourceFile).replace(/\s+/g, ' ').trim(),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
    membersByInterface.set(statement.name.text, members);
  });

  return membersByInterface;
}

function describeMember(member) {
  return `${member.name}${member.optional ? '?' : ''}: ${member.type}`;
}

function diffInterface(interfaceName, localMembers, sharedMembers) {
  const differences = [];
  const localByName = new Map(localMembers.map(member => [member.name, member]));
  const sharedByName = new Map(sharedMembers.map(member => [member.name, member]));

  for (const [name, localMember] of localByName) {
    if (!sharedByName.has(name)) {
      differences.push(`  - only in local copy: ${describeMember(localMember)}`);
    }
  }
  for (const [name, sharedMember] of sharedByName) {
    if (!localByName.has(name)) {
      differences.push(`  - only in shared copy: ${describeMember(sharedMember)}`);
    }
  }
  for (const [name, localMember] of localByName) {
    const sharedMember = sharedByName.get(name);
    if (sharedMember && (sharedMember.optional !== localMember.optional || sharedMember.type !== localMember.type)) {
      differences.push(`  - field "${name}" differs: local is "${describeMember(localMember)}", shared is "${describeMember(sharedMember)}"`);
    }
  }

  return differences;
}

function main() {
  const localMembersByInterface = extractInterfaceMembers(LOCAL_FILE);
  const sharedMembersByInterface = extractInterfaceMembers(SHARED_FILE);
  const allDifferences = [];

  INTERFACES_TO_COMPARE.forEach(interfaceName => {
    const localMembers = localMembersByInterface.get(interfaceName);
    const sharedMembers = sharedMembersByInterface.get(interfaceName);

    if (!localMembers || !sharedMembers) {
      allDifferences.push(`${interfaceName}: missing from ${!localMembers ? 'local' : 'shared'} copy`);
      return;
    }

    const differences = diffInterface(interfaceName, localMembers, sharedMembers);
    if (differences.length > 0) {
      allDifferences.push(`${interfaceName}:\n${differences.join('\n')}`);
    }
  });

  if (allDifferences.length > 0) {
    console.error('PHAST shape drift detected between:');
    console.error(`  local:  ${path.relative(process.cwd(), LOCAL_FILE)}`);
    console.error(`  shared: ${path.relative(process.cwd(), SHARED_FILE)}\n`);
    console.error(allDifferences.join('\n\n'));
    console.error(
      '\nIf this divergence is intentional, update src/app/process-heating-assessment/models/phast.ts ' +
      'and src/app/shared/models/phast/phast.ts to agree, or (for a deliberate, permanent split like ' +
      '`Modification`) add the interface name to the exclusion list in scripts/check-phast-shape-drift.js ' +
      'with a comment explaining why.'
    );
    process.exitCode = 1;
    return;
  }

  console.log('PHAST shape drift check passed: local and shared interfaces agree.');
}

main();
