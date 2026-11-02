const fs = require('fs');

function extractText(filePath, label) {
    console.log(`\n--- ${label} ---`);
    if (!fs.existsSync(filePath)) {
        console.log('File not found:', filePath);
        return;
    }
    const html = fs.readFileSync(filePath, 'utf8');
    
    // Extract Image URL if Home
    if (label === 'Home') {
        const imgMatches = html.match(/<img[^>]+src="([^">]+)"[^>]*>/g);
        if (imgMatches) {
            console.log("Images found:", imgMatches.slice(0, 5));
        }
    }

    const text = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                     .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                     .replace(/<[^>]+>/g, '\n')
                     .replace(/\n\s*\n/g, '\n')
                     .trim();
    console.log(text.substring(0, 1500));
}

const baseDir = '/Users/dhyaneshwaranvaitheswaran/.gemini/antigravity-ide/brain/b5a9e8b1-c09f-4de9-aff3-fd93418cb4ba/.system_generated/steps';

extractText(`${baseDir}/6/content.md`, 'Home');
extractText(`${baseDir}/115/content.md`, 'Research & Publications');
extractText(`${baseDir}/116/content.md`, 'Supervision');
extractText(`${baseDir}/117/content.md`, 'Teaching');
extractText(`${baseDir}/118/content.md`, 'Join Us');
