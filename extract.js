const fs = require('fs');

const extractData = (filename) => {
    const content = fs.readFileSync(filename, 'utf-8');
    
    // Extract text
    const text = content
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, '\n')
        .replace(/\n\s*\n/g, '\n')
        .trim();
        
    // Extract images
    const images = [];
    const imgRegex = /<img[^>]+src="([^">]+)"[^>]*>/g;
    let match;
    while ((match = imgRegex.exec(content)) !== null) {
        if (match[1].startsWith('http')) {
            images.push(match[1]);
        }
    }
    
    return { text, images };
};

const pages = ['home', 'research', 'supervision', 'teaching', 'join'];
let allData = '';

pages.forEach(page => {
    const data = extractData(`extracted_assets/${page}.html`);
    allData += `\n\n=== PAGE: ${page.toUpperCase()} ===\n\n`;
    allData += `--- TEXT ---\n${data.text}\n\n`;
    allData += `--- IMAGES ---\n${Array.from(new Set(data.images)).join('\n')}\n`; // deduplicate images
});

fs.writeFileSync('extracted_assets/all_content.txt', allData);
console.log('Extraction complete.');
