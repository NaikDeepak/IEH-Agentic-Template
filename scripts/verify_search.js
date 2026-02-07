
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const functionsPath = path.join(__dirname, '../functions/index.js');

try {
  const content = fs.readFileSync(functionsPath, 'utf8');

  const checks = [
    { pattern: /export const searchCandidatesHandler/, name: 'searchCandidatesHandler exported' },
    { pattern: /const runVectorSearch/, name: 'runVectorSearch defined' },
    { pattern: /app\.post\("\/candidates\/search", searchCandidatesHandler\)/, name: 'Route /candidates/search registered' },
    { pattern: /createFilter\("status", "active"\)/, name: 'Active status filter used' }, // This might be too generic, but good enough for static check
  ];

  let allPassed = true;
  console.log('Verifying functions/index.js...');

  checks.forEach(check => {
    if (check.pattern.test(content)) {
      console.log(`✅ ${check.name}`);
    } else {
      console.error(`❌ ${check.name}`);
      allPassed = false;
    }
  });

  if (allPassed) {
    console.log('All checks passed!');
    process.exit(0);
  } else {
    console.error('Some checks failed.');
    process.exit(1);
  }

} catch (err) {
  console.error('Error reading file:', err);
  process.exit(1);
}
