# Dr. Veerapandiyan Veerasamy - Academic Profile Website

Personal academic profile and research portfolio of **Dr. Veerapandiyan Veerasamy**, Lecturer in Cybersecurity at Curtin University, Singapore, and recognized in the **Stanford / Elsevier World's Top 2% Scientists in Energy (2025–2026)**.

---

## 🔬 Google Scholar Publications & Iframe Integration

### The Problem Solved
Google Scholar sets the HTTP response header `X-Frame-Options: SAMEORIGIN`. Consequently, attempting to embed a raw Google Scholar URL (`https://scholar.google.com/citations?...`) directly in an HTML `<iframe>` causes modern browsers (Chrome, Safari, Firefox, Edge) to block the frame with a **"Refused to connect / Refused to display"** error.

### The Solution Architecture
This website implements a dedicated, resilient Google Scholar Publications & Iframe integration:

1. **Standalone Embed Widget (`scholar_embed.html`)**:
   - A dedicated, lightweight responsive page designed specifically to be embedded via `<iframe>` without any CORS or `X-Frame-Options` restrictions.
   - Built with instant search, multi-year filtering (2026, 2025, 2024...), topic tags (IEEE, Cyber-Physical, Smart Grids, AI), and sorting (Newest vs Most Cited).
   - Features one-click **"Copy BibTeX"** and **"Copy APA"** citation buttons with toast notifications.
   - Communicates dynamically with parent pages via `postMessage` to auto-adjust iframe height and eliminate awkward double scrollbars.

2. **Iframe Integration on the Research Page (`research.html`)**:
   - The "Recent Publications" section of `research.html` now houses the responsive iframe:
     ```html
     <iframe 
         src="scholar_embed.html" 
         id="scholar-research-frame" 
         class="scholar-frame" 
         title="Recent Publications of Dr. Veerapandiyan Veerasamy from Google Scholar" 
         loading="lazy">
     </iframe>
     ```
   - Features quick controls to refresh the feed, open the full publications portal, or launch the Google Scholar profile.

3. **Dedicated Publications Portal (`publications.html`)**:
   - Comprehensive research portal featuring Dr. Veera's citation metrics dashboard:
     - **2,936+ Total Citations** (2,838 since 2021)
     - **h-index: 30** (30 since 2021)
     - **i10-index: 55** (55 since 2021)
     - **Interactive Annual Citation Growth Chart** (2019–2026)
   - Dual view modes:
     - **Interactive Explorer**: Full-width searchable grid with quick chips and BibTeX export.
     - **Live Iframe Embed**: Visualizes the embedded iframe widget and provides an **"Embed Code Snippet"** generator for collaborators or university lab pages.

4. **Synchronous Data Delivery & Offline Reliability**:
   - Publications data is generated in both:
     - `data/publications.json` (for standard REST/fetch requests)
     - `js/scholar-data.js` (for synchronous global object loading, ensuring the site works with 0 latency, 0 CORS issues, and even when viewing directly via `file:///`).

---

## 🔄 Updating Google Scholar Data

To retrieve the latest publications, citation counts, and metrics from Dr. Veera's Google Scholar profile, run:

```bash
node update_scholar.js
```

This script:
- Fetches the latest works and citation metrics from Dr. Veera's Google Scholar profile (`user=vzf72BMAAAAJ`).
- Parses article titles, authors, venues, years, citations, scholar URLs, and citation links.
- Classifies papers by type (Journal, Conference, Book Chapter, Patent) and topic (IEEE, Smart Grids, Cyber-Physical, AI).
- Automatically formats clean BibTeX and APA citations for every paper.
- Updates `data/publications.json` and `js/scholar-data.js`.

---

## 💻 Local Testing & Development

To test the website locally:

```bash
node local_server.js
```
Then visit [http://localhost:8000/](http://localhost:8000/) in your browser.

- Home: `http://localhost:8000/index.html`
- Research: `http://localhost:8000/research.html`
- Publications: `http://localhost:8000/publications.html`
- Iframe Widget: `http://localhost:8000/scholar_embed.html`
- Supervision: `http://localhost:8000/supervision.html`
- Teaching: `http://localhost:8000/teaching.html`
- Join Us: `http://localhost:8000/join.html`

---

## 📋 Embed Snippet for External Sites

To embed Dr. Veera's Google Scholar feed on any external academic or departmental page:

```html
<iframe 
    src="https://veerapandiyan-veerasamy-web.vercel.app/scholar_embed.html" 
    width="100%" 
    height="850" 
    frameborder="0" 
    style="border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06);" 
    title="Dr. Veerapandiyan Veerasamy Publications on Google Scholar" 
    loading="lazy">
</iframe>
```

