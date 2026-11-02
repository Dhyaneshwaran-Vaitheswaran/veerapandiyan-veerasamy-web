/**
 * Google Scholar Data Fetcher & Parser
 * Profile: Dr. Veerapandiyan Veerasamy (user: vzf72BMAAAAJ)
 *
 * This script retrieves Dr. Veera's latest publications, citation metrics,
 * and yearly citation history from Google Scholar, and saves them to:
 *  - data/publications.json (structured JSON API)
 *  - js/scholar-data.js (synchronous global fallback for file:// and offline preview)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const USER_ID = 'vzf72BMAAAAJ';
const SCHOLAR_URL = `https://scholar.google.com/citations?hl=en&user=${USER_ID}&view_op=list_works&sortby=pubdate&cstart=0&pagesize=100`;

function fetchHtml(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return fetchHtml(res.headers.location).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`HTTP ${res.statusCode}: Failed to fetch Google Scholar`));
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        });
        req.on('error', reject);
        req.setTimeout(15000, () => {
            req.destroy();
            reject(new Error('Request timed out'));
        });
    });
}

function parseScholarHtml(html) {
    // 1. Author Metadata
    const nameMatch = html.match(/<div id="gsc_prf_in">([^<]+)<\/div>/);
    const authorName = nameMatch ? nameMatch[1].trim() : "Dr. Veerapandiyan Veerasamy";

    const affMatch = html.match(/<div class="gsc_prf_il">([^<]+)<\/div>/);
    const affiliation = affMatch ? affMatch[1].trim() : "Lecturer, Curtin University, Singapore (Top 2% Scientist in Energy 2025-2026)";

    // 2. Citation Indices (Citations, h-index, i10-index)
    const statsMatches = [...html.matchAll(/<td class="gsc_rsb_std">([^<]+)<\/td>/g)].map(m => m[1].trim());
    const stats = {
        citations: {
            all: parseInt(statsMatches[0] || "2936", 10),
            since2021: parseInt(statsMatches[1] || "2838", 10)
        },
        hIndex: {
            all: parseInt(statsMatches[2] || "30", 10),
            since2021: parseInt(statsMatches[3] || "30", 10)
        },
        i10Index: {
            all: parseInt(statsMatches[4] || "55", 10),
            since2021: parseInt(statsMatches[5] || "55", 10)
        }
    };

    // 3. Yearly Citation History
    const histYears = [...html.matchAll(/<span class="gsc_g_t"[^>]*>(\d+)<\/span>/g)].map(m => m[1]);
    const histCounts = [...html.matchAll(/<span class="gsc_g_al">(\d+)<\/span>/g)].map(m => parseInt(m[1], 10));
    const citationHistory = histYears.map((yr, idx) => ({
        year: parseInt(yr, 10),
        count: histCounts[idx] || 0
    }));

    // 4. Articles extraction
    const articleRegex = /<tr class="gsc_a_tr">([\s\S]*?)<\/tr>/g;
    let match;
    const articles = [];
    let id = 1;

    while ((match = articleRegex.exec(html)) !== null) {
        const row = match[1];

        // Title and Google Scholar Article Link
        const aMatch = row.match(/<a[^>]+class="[^"]*gsc_a_at[^"]*"[^>]*>([\s\S]*?)<\/a>/);
        const title = aMatch ? aMatch[1].replace(/<[^>]+>/g, "").trim() : "";
        let scholarUrl = "";
        if (aMatch) {
            const hrefMatch = aMatch[0].match(/href="([^"]+)"/);
            if (hrefMatch) {
                scholarUrl = hrefMatch[1].startsWith('http') 
                    ? hrefMatch[1].replace(/&amp;/g, '&')
                    : 'https://scholar.google.com' + hrefMatch[1].replace(/&amp;/g, '&');
            }
        }

        // Authors & Publication Venue
        const grayDivs = [...row.matchAll(/<div class="gs_gray">([\s\S]*?)<\/div>/g)].map(m => m[1].replace(/<[^>]+>/g, "").trim());
        const authors = grayDivs[0] || "";
        const publication = grayDivs[1] || "";

        // Citations
        const citeMatch = row.match(/<a[^>]+class="[^"]*gsc_a_ac[^"]*"[^>]*>(\d+)<\/a>/);
        const citations = citeMatch ? parseInt(citeMatch[1], 10) : 0;
        let citationsUrl = "";
        if (citeMatch) {
            const citeHrefMatch = row.match(/<a[^>]+href="([^"]+)"[^>]+class="[^"]*gsc_a_ac/);
            if (citeHrefMatch && citeHrefMatch[1]) {
                citationsUrl = citeHrefMatch[1].replace(/&amp;/g, '&');
            }
        }

        // Year
        const yearMatch = row.match(/<span class="gsc_a_h gsc_a_hc gs_ibl">(\d{4})<\/span>/);
        const year = yearMatch ? parseInt(yearMatch[1], 10) : null;

        // Categorize publication type
        let type = "Journal";
        const pubLower = publication.toLowerCase();
        const titleLower = title.toLowerCase();

        if (pubLower.includes("conference") || pubLower.includes("symposium") || 
            pubLower.includes("proceedings") || pubLower.includes("workshop") || 
            pubLower.includes("icpea") || pubLower.includes("icsefe")) {
            type = "Conference";
        } else if (pubLower.includes("patent")) {
            type = "Patent";
        } else if (pubLower.includes("book") || pubLower.includes("chapter")) {
            type = "Book Chapter";
        }

        // Topic / Publisher Tags
        const tags = [];
        tags.push(type);
        if (pubLower.includes("ieee")) tags.push("IEEE");
        if (pubLower.includes("springer") || pubLower.includes("nature") || pubLower.includes("discover")) tags.push("Springer / Nature");
        if (pubLower.includes("elsevier")) tags.push("Elsevier");
        if (pubLower.includes("mdpi") || pubLower.includes("energies") || pubLower.includes("sensors")) tags.push("MDPI");

        if (titleLower.includes("microgrid") || titleLower.includes("power") || titleLower.includes("grid") || titleLower.includes("energy") || titleLower.includes("bess") || titleLower.includes("pv")) {
            tags.push("Smart Grids & Energy");
        }
        if (titleLower.includes("cyber") || titleLower.includes("attack") || titleLower.includes("security") || titleLower.includes("fault") || titleLower.includes("resilient") || titleLower.includes("defense")) {
            tags.push("Cyber-Physical & Security");
        }
        if (titleLower.includes("neural") || titleLower.includes("learning") || titleLower.includes("fuzzy") || titleLower.includes("ai") || titleLower.includes("intelligence") || titleLower.includes("lstm") || titleLower.includes("optimization")) {
            tags.push("AI & Deep Learning");
        }

        // BibTeX key and citation entry
        const firstAuthorSurname = (authors.split(',')[0] || "Veerasamy").trim().split(' ').pop().toLowerCase().replace(/[^a-z]/g, '');
        const titleSlug = title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 12);
        const bibKey = `${firstAuthorSurname}${year || 'recent'}_${titleSlug}`;

        const bibtex = `@article{${bibKey},
  title = {${title.replace(/[{}]/g, '')}},
  author = {${authors}},
  journal = {${publication}},
  year = {${year || ''}},
  url = {${scholarUrl}}
}`;

        // APA formatted citation
        const apaCitation = `${authors} (${year || 'n.d.'}). ${title}. ${publication}.`;

        articles.push({
            id: id++,
            title,
            authors,
            publication,
            year,
            citations,
            scholarUrl,
            citationsUrl,
            type,
            tags,
            bibtex,
            apaCitation
        });
    }

    return {
        author: {
            name: authorName,
            affiliation: affiliation,
            scholarId: USER_ID,
            profileUrl: `https://scholar.google.com/citations?hl=en&user=${USER_ID}&view_op=list_works&sortby=pubdate`,
            honors: "Stanford / Elsevier Top 2% Scientist in Energy (2025-2026)"
        },
        stats,
        citationHistory,
        lastUpdated: new Date().toISOString(),
        totalPublications: articles.length,
        publications: articles
    };
}

async function main() {
    console.log("Fetching Google Scholar data for Dr. Veerapandiyan Veerasamy...");
    let html = "";
    try {
        html = await fetchHtml(SCHOLAR_URL);
        console.log(`Successfully fetched live Scholar HTML (${html.length} bytes).`);
        fs.writeFileSync(path.join(__dirname, '../scholar_raw.html'), html);
    } catch (err) {
        console.warn(`Online fetch warning: ${err.message}. Checking local cached raw HTML...`);
        const rawPath = path.join(__dirname, '../scholar_raw.html');
        if (fs.existsSync(rawPath)) {
            html = fs.readFileSync(rawPath, 'utf8');
            console.log(`Loaded cached raw HTML (${html.length} bytes).`);
        } else {
            console.error("No local HTML available and online fetch failed.");
            process.exit(1);
        }
    }

    const data = parseScholarHtml(html);
    console.log(`Parsed ${data.publications.length} publications.`);
    console.log(`Total Citations: ${data.stats.citations.all}, h-index: ${data.stats.hIndex.all}, i10-index: ${data.stats.i10Index.all}`);

    // Ensure directories exist
    const dataDir = path.join(__dirname, '../data');
    const jsDir = path.join(__dirname, '../js');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(jsDir)) fs.mkdirSync(jsDir, { recursive: true });

    // 1. Save data/publications.json
    const jsonPath = path.join(dataDir, 'publications.json');
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Wrote JSON data to ${jsonPath}`);

    // 2. Save js/scholar-data.js (for direct script tag inclusion without CORS restrictions)
    const jsPath = path.join(jsDir, 'scholar-data.js');
    const jsContent = `/**
 * Dr. Veerapandiyan Veerasamy - Google Scholar Data
 * Auto-generated on: ${new Date().toISOString()}
 * Publications count: ${data.publications.length}
 */
window.SCHOLAR_DATA = ${JSON.stringify(data, null, 2)};
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.SCHOLAR_DATA;
}
`;
    fs.writeFileSync(jsPath, jsContent, 'utf8');
    console.log(`Wrote synchronous JS data to ${jsPath}`);

    console.log("Scholar data generation completed successfully!");
}

main().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
});

