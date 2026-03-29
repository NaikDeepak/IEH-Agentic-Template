
const fs = require('fs');
const coverage = JSON.parse(fs.readFileSync('coverage/coverage-final.json', 'utf8'));
const zeroCoverageFiles = [];

for (const file in coverage) {
  const data = coverage[file];
  const totalStatements = Object.keys(data.s).length;
  const coveredStatements = Object.values(data.s).filter(count => count > 0).length;
  const percentage = totalStatements === 0 ? 100 : (coveredStatements / totalStatements) * 100;
  
  if (percentage === 0) {
    zeroCoverageFiles.push(file);
  }
}

console.log(zeroCoverageFiles.join('\n'));
