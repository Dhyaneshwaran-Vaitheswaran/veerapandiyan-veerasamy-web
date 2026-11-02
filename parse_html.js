const fs = require('fs');
const html = fs.readFileSync('/Users/dhyaneshwaranvaitheswaran/.gemini/antigravity-ide/brain/b5a9e8b1-c09f-4de9-aff3-fd93418cb4ba/.system_generated/steps/6/content.md', 'utf8');
const text = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                 .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                 .replace(/<[^>]+>/g, ' ')
                 .replace(/\s+/g, ' ')
                 .trim();
console.log(text.substring(0, 4000));
