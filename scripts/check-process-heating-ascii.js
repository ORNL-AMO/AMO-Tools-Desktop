// Keeps special characters out of the process-heating-assessment source. Templates use HTML
// entities (&#8457;, &mdash;), plain-text display strings come from constants/display-text.ts, and
// comments and specs stay ASCII (specs use \u escapes for test data). Raw symbols pasted into other
// files tend to reach the PDF report, whose built-in font can't draw many of them.
const fs = require('fs');
const path = require('path');

const MODULE_ROOT = path.join(__dirname, '..', 'src/app/process-heating-assessment');
const ALLOWED_FILE = path.join(MODULE_ROOT, 'constants', 'display-text.ts');
const CHECKED_EXTENSIONS = new Set(['.ts', '.html', '.css']);
const NON_ASCII = /[^\x00-\x7F]/;

function listCheckedFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listCheckedFiles(fullPath);
    return CHECKED_EXTENSIONS.has(path.extname(entry.name)) ? [fullPath] : [];
  });
}

function main() {
  const violations = [];
  listCheckedFiles(MODULE_ROOT)
    .filter(file => file !== ALLOWED_FILE)
    .forEach(file => {
      fs.readFileSync(file, 'utf8').split('\n').forEach((line, index) => {
        if (NON_ASCII.test(line)) {
          violations.push(`${path.relative(process.cwd(), file)}:${index + 1}: ${line.trim()}`);
        }
      });
    });

  if (violations.length > 0) {
    console.error('Non-ASCII characters found in process-heating-assessment:\n');
    console.error(violations.join('\n'));
    console.error(
      '\nUse an HTML entity in templates (&#8457;, &#8451;, &sup2;, &mdash;), a constant from ' +
      'constants/display-text.ts in TypeScript, plain ASCII in comments, or a \\u escape for spec test data.'
    );
    process.exitCode = 1;
    return;
  }

  console.log('Process heating ASCII check passed.');
}

main();
