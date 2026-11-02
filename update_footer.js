const fs = require('fs');

const newFooter = `<footer class="site-footer" style="position: relative; overflow: hidden;">
        <!-- Background Pattern -->
        <div style="position: absolute; top: -50%; left: -10%; width: 500px; height: 500px; background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%); border-radius: 50%; pointer-events: none;"></div>
        <div style="position: absolute; bottom: -50%; right: -10%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(243, 156, 18, 0.05) 0%, transparent 70%); border-radius: 50%; pointer-events: none;"></div>
        
        <div class="container" style="position: relative; z-index: 1;">
            <div class="footer-grid">
                <div class="footer-col">
                    <h4 style="font-size: 1.4rem; letter-spacing: -0.5px; margin-bottom: 1.5rem;">Dr. Veerapandiyan Veerasamy</h4>
                    <p style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 1rem;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        Lecturer in Cybersecurity<br>Curtin University, Singapore
                    </p>
                    <p style="display: flex; align-items: flex-start; gap: 10px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        Veerapandiyan.Veerasamy@curtin.edu.sg
                    </p>
                </div>
                <div class="footer-col">
                    <h4 style="font-size: 1.2rem; margin-bottom: 1.5rem;">Explore</h4>
                    <ul class="footer-links">
                        <li><a href="index.html">Home</a></li>
                        <li><a href="research.html">Research</a></li>
                        <li><a href="publications.html">Publications</a></li>
                        <li><a href="supervision.html">Supervision</a></li>
                        <li><a href="teaching.html">Teaching</a></li>
                        <li><a href="join.html">Join Us</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4 style="font-size: 1.2rem; margin-bottom: 1.5rem;">Connect</h4>
                    <div class="footer-socials" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <a href="https://scholar.google.com/citations?hl=en&user=vzf72BMAAAAJ&view_op=list_works&sortby=pubdate" target="_blank" rel="noopener" style="display: flex; align-items: center; gap: 8px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg> Scholar
                        </a>
                        <a href="https://orcid.org" target="_blank" rel="noopener" style="display: flex; align-items: center; gap: 8px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> ORCID
                        </a>
                        <a href="https://www.linkedin.com/in/veerapandiyan-veerasamy-smieee-365a03117/" target="_blank" rel="noopener" style="display: flex; align-items: center; gap: 8px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg> LinkedIn
                        </a>
                        <a href="https://www.researchgate.net/profile/Veerapandiyan-Veerasamy?ev=hdr_xprf" target="_blank" rel="noopener" style="display: flex; align-items: center; gap: 8px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg> ResearchGate
                        </a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                &copy; 2026 Dr. Veerapandiyan Veerasamy. All Rights Reserved.
            </div>
        </div>
    </footer>`;

const files = ['index.html', 'research.html', 'publications.html', 'supervision.html', 'teaching.html', 'join.html'];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/<footer class="site-footer"[^>]*>[\s\S]*?<\/footer>/, newFooter);
    fs.writeFileSync(file, content);
    console.log(`Updated footer in ${file}`);
});
