const fs = require('fs');

async function fetchPage(url, name) {
    console.log(`Fetching ${name}...`);
    try {
        const res = await fetch(url);
        const html = await res.text();
        const text = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                         .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                         .replace(/<[^>]+>/g, '\n')
                         .replace(/\n\s*\n/g, '\n')
                         .trim();
        fs.writeFileSync(`${name}_content.txt`, text.substring(0, 10000));
        
        // Also extract images to find the profile picture
        const imgMatches = html.match(/<img[^>]+src="([^">]+)"/g);
        if(imgMatches) {
             fs.writeFileSync(`${name}_images.txt`, imgMatches.join('\n'));
        }
    } catch (err) {
        console.error(`Failed ${name}:`, err);
    }
}

async function main() {
    await fetchPage('https://sites.google.com/view/dr-veerapandiyan-veerasamy/home', 'home');
    await fetchPage('https://sites.google.com/view/dr-veerapandiyan-veerasamy/research-publications', 'research');
    await fetchPage('https://sites.google.com/view/dr-veerapandiyan-veerasamy/supervision', 'supervision');
    await fetchPage('https://sites.google.com/view/dr-veerapandiyan-veerasamy/teaching', 'teaching');
    await fetchPage('https://sites.google.com/view/dr-veerapandiyan-veerasamy/join-us', 'join');
}
main();
