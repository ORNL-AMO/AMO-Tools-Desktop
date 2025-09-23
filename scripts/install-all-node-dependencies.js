
// * Must install node dependencies for process-flow-diagram-component first, then the main ng project
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function getMeasurToolsSuiteVersion(pkgPath) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  return (pkg.dependencies && pkg.dependencies['measur-tools-suite']) || null;
}

function installDependencies(dir) {
  console.log(`Installing dependencies in ${dir}...`);
  execSync('npm install', { stdio: 'inherit', cwd: dir });
}

const diagramDir = path.join(__dirname, '../process-flow-diagram-component');
const rootDir = path.join(__dirname, '..');

const diagramPkgPath = path.join(diagramDir, 'package.json');
const rootPkgPath = path.join(rootDir, 'package.json');

const diagramVersion = getMeasurToolsSuiteVersion(diagramPkgPath);
const rootVersion = getMeasurToolsSuiteVersion(rootPkgPath);

// todo check against all of package shared packages
if (diagramVersion !== rootVersion) {
  throw new Error(`measur-tools-suite version mismatch: process-flow-diagram-component (${diagramVersion}) vs. MEASUR root (${rootVersion})`);
}

installDependencies(diagramDir);
installDependencies(rootDir);

console.log('All dependencies installed.');
