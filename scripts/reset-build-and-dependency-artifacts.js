// Cleans node_modules, dist, and package-lock.json in both root and process-flow-diagram-component
const fs = require('fs');
const path = require('path');


function safeDelete(targetPath, label) {
  if (fs.existsSync(targetPath)) {
    const stat = fs.statSync(targetPath);
    if (stat.isDirectory()) {
      console.log(`Removing directory: ${label} (${targetPath})`);
      fs.rmSync(targetPath, { recursive: true, force: true });
      console.log(`Deleted directory: ${targetPath}`);
    } else {
      console.log(`Removing file: ${label} (${targetPath})`);
      fs.unlinkSync(targetPath);
      console.log(`Deleted file: ${targetPath}`);
    }
  } else {
    console.log(`Not found: ${label} (${targetPath})`);
  }
}

function cleanDir(baseDir, dirLabel) {
  safeDelete(path.join(baseDir, 'node_modules'), `${dirLabel}/node_modules`);
  safeDelete(path.join(baseDir, 'dist'), `${dirLabel}/dist`);
  safeDelete(path.join(baseDir, 'package-lock.json'), `${dirLabel}/package-lock.json`);
}

const rootDir = path.join(__dirname, '..');
const diagramDir = path.join(__dirname, '../process-flow-diagram-component');

console.log('--- Cleaning root directory ---');
cleanDir(rootDir, 'root');

console.log('--- Cleaning process-flow-diagram-component directory ---');
cleanDir(diagramDir, 'process-flow-diagram-component');

console.log('=== Reset build and dependency artifacts complete.');
