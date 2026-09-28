const fs = require('fs');
const glob = require('glob');

const files = glob.sync('frontend/src/routes/**/*.tsx');

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // Replace /app/billing with /app/settings to fix routing errors
  content = content.replace(/\/app\/billing/g, '/app/settings');

  // Remove `billing,` or `billing` from useApp()
  content = content.replace(/billing\s*,\s*/g, '');
  content = content.replace(/,\s*billing/g, '');
  content = content.replace(/\{\s*billing\s*\}/g, '{}');
  
  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
  }
});

console.log("Fixed tsx references.");
