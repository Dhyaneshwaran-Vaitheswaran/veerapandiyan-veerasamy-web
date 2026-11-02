/**
 * Google Scholar Publications Interactive Portal & Embed Engine
 * Dr. Veerapandiyan Veerasamy Academic Website
 */

(function () {
    'use strict';

    // State management
    const state = {
        data: null,
        filteredList: [],
        currentSearch: '',
        currentYear: 'all',
        currentTopic: 'all',
        currentSort: 'newest',
        displayLimit: 25,
        isIframe: window.self !== window.top,
        mode: (typeof URLSearchParams !== 'undefined' && window.location && window.location.search) 
            ? (new URLSearchParams(window.location.search).get('mode') || 'full') 
            : 'full'
    };

    /**
     * Initialize the publications module
     */
    async function init() {
        try {
            await loadData();
            if (!state.data || !state.data.publications) {
                throw new Error("Unable to load publication data.");
            }

            renderMetricsPanel();
            renderToolbar();
            applyFilters();
            setupIframeResizer();
            setupModalAndToasts();
        } catch (err) {
            console.error("Initialization error:", err);
            const container = document.getElementById('publications-container') || document.getElementById('publications-list');
            if (container) {
                container.innerHTML = `
                    <div style="padding: 2rem; text-align: center; background: #fff3cd; border-radius: 8px; color: #856404;">
                        <h3>Could not load publications</h3>
                        <p>${err.message}</p>
                        <a href="https://scholar.google.com/citations?hl=en&user=vzf72BMAAAAJ&view_op=list_works&sortby=pubdate" target="_blank" rel="noopener" class="btn" style="display: inline-block; width: auto; margin-top: 1rem;">
                            View Profile on Google Scholar
                        </a>
                    </div>
                `;
            }
        }
    }

    /**
     * Load publication data (checks synchronous fallback first, then tries fetch)
     */
    async function loadData() {
        if (window.SCHOLAR_DATA && window.SCHOLAR_DATA.publications) {
            state.data = window.SCHOLAR_DATA;
            return;
        }

        try {
            const res = await fetch('data/publications.json');
            if (res.ok) {
                state.data = await res.json();
            }
        } catch (e) {
            console.warn("Fetch failed, checking window.SCHOLAR_DATA fallback...");
        }

        if (!state.data && window.SCHOLAR_DATA) {
            state.data = window.SCHOLAR_DATA;
        }
    }

    /**
     * Render Scholar Metrics & Citation Growth Chart
     */
    function renderMetricsPanel() {
        const metricsContainer = document.getElementById('scholar-metrics-container');
        if (!metricsContainer || !state.data) return;

        const stats = state.data.stats || {
            citations: { all: 2936, since2021: 2838 },
            hIndex: { all: 30, since2021: 30 },
            i10Index: { all: 55, since2021: 55 }
        };
        const author = state.data.author || {};
        const history = state.data.citationHistory || [];

        // Find max count for chart scaling
        const maxCitation = Math.max(...history.map(h => h.count), 1);

        const chartBarsHtml = history.map(item => {
            const heightPercent = Math.round((item.count / maxCitation) * 100);
            return `
                <div class="chart-bar-group" title="${item.year}: ${item.count} citations">
                    <span class="chart-bar-count">${item.count}</span>
                    <div class="chart-bar-fill" style="height: ${heightPercent}%;"></div>
                    <span class="chart-bar-year">${item.year}</span>
                </div>
            `;
        }).join('');

        metricsContainer.innerHTML = `
            <div class="scholar-metrics-panel">
                <div class="scholar-badge-banner">
                    <div class="scholar-profile-lead">
                        <div class="scholar-icon-bubble">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                            </svg>
                        </div>
                        <div class="scholar-lead-text">
                            <h3>
                                Google Scholar Research Profile
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#10b981" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" title="Verified Scholar">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            </h3>
                            <p>${author.affiliation || 'Lecturer, Curtin University, Singapore'}</p>
                        </div>
                    </div>
                    <div class="top-scientist-tag">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        Stanford Top 2% Scientist in Energy
                    </div>
                </div>

                <div class="metrics-stat-grid">
                    <div class="metric-stat-card">
                        <div class="stat-number">${stats.citations.all.toLocaleString()}+</div>
                        <div class="stat-label">Total Citations</div>
                        <div class="stat-sub">${stats.citations.since2021.toLocaleString()} since 2021</div>
                    </div>
                    <div class="metric-stat-card">
                        <div class="stat-number">${stats.hIndex.all}</div>
                        <div class="stat-label">h-index</div>
                        <div class="stat-sub">${stats.hIndex.since2021} since 2021</div>
                    </div>
                    <div class="metric-stat-card">
                        <div class="stat-number">${stats.i10Index.all}</div>
                        <div class="stat-label">i10-index</div>
                        <div class="stat-sub">${stats.i10Index.since2021} since 2021</div>
                    </div>
                    <div class="metric-stat-card">
                        <div class="stat-number">${state.data.publications.length}</div>
                        <div class="stat-label">Peer-Reviewed Papers</div>
                        <div class="stat-sub">Updated dynamically</div>
                    </div>
                </div>

                <div class="citation-chart-container">
                    <div class="chart-header">
                        <div class="chart-title">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="20" x2="18" y2="10"></line>
                                <line x1="12" y1="20" x2="12" y2="4"></line>
                                <line x1="6" y1="20" x2="6" y2="14"></line>
                            </svg>
                            Annual Citation Growth (Google Scholar Tracking)
                        </div>
                        <a href="https://scholar.google.com/citations?hl=en&user=vzf72BMAAAAJ&view_op=list_works&sortby=pubdate" target="_blank" rel="noopener" style="font-size: 0.82rem; font-weight: 500; color: var(--scholar-dark); display: inline-flex; align-items: center; gap: 4px;">
                            View Live on Google Scholar
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        </a>
                    </div>
                    <div class="chart-bars-wrap">
                        ${chartBarsHtml}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render the Toolbar with search, year chips, topic chips, and sort dropdown
     */
    function renderToolbar() {
        const toolbarContainer = document.getElementById('publications-toolbar-container');
        if (!toolbarContainer || !state.data) return;

        // Calculate counts by year
        const yearCounts = {};
        state.data.publications.forEach(p => {
            const yr = p.year ? p.year.toString() : 'other';
            yearCounts[yr] = (yearCounts[yr] || 0) + 1;
        });

        // Determine unique years descending
        const years = Object.keys(yearCounts)
            .filter(y => y !== 'other')
            .sort((a, b) => parseInt(b, 10) - parseInt(a, 10));

        toolbarContainer.innerHTML = `
            <div class="publications-toolbar">
                <div class="toolbar-search-row">
                    <div class="search-input-wrapper">
                        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input type="text" id="scholar-search-input" class="search-input" placeholder="Search by paper title, co-author, topic, or venue..." autocomplete="off">
                        <button type="button" id="scholar-search-clear" class="search-clear-btn" title="Clear search">&times;</button>
                    </div>

                    <div class="sort-select-wrapper">
                        <span class="sort-label">Sort By:</span>
                        <select id="scholar-sort-select" class="sort-select">
                            <option value="newest" ${state.currentSort === 'newest' ? 'selected' : ''}>Newest First (Pub Date)</option>
                            <option value="cited" ${state.currentSort === 'cited' ? 'selected' : ''}>Most Cited (Citations)</option>
                            <option value="title" ${state.currentSort === 'title' ? 'selected' : ''}>Title (A to Z)</option>
                        </select>
                    </div>
                </div>

                <div class="filter-chips-row" style="margin-bottom: 0.75rem;">
                    <span class="filter-chip-label">Year:</span>
                    <button type="button" class="filter-chip ${state.currentYear === 'all' ? 'active' : ''}" data-year="all">
                        All <span class="chip-count">(${state.data.publications.length})</span>
                    </button>
                    ${years.map(y => `
                        <button type="button" class="filter-chip ${state.currentYear === y ? 'active' : ''}" data-year="${y}">
                            ${y} <span class="chip-count">(${yearCounts[y]})</span>
                        </button>
                    `).join('')}
                </div>

                <div class="filter-chips-row">
                    <span class="filter-chip-label">Topic:</span>
                    <button type="button" class="filter-chip ${state.currentTopic === 'all' ? 'active' : ''}" data-topic="all">All Topics</button>
                    <button type="button" class="filter-chip ${state.currentTopic === 'IEEE' ? 'active' : ''}" data-topic="IEEE">IEEE</button>
                    <button type="button" class="filter-chip ${state.currentTopic === 'Smart Grids & Energy' ? 'active' : ''}" data-topic="Smart Grids & Energy">Smart Grids & Energy</button>
                    <button type="button" class="filter-chip ${state.currentTopic === 'Cyber-Physical & Security' ? 'active' : ''}" data-topic="Cyber-Physical & Security">Cyber-Physical & Security</button>
                    <button type="button" class="filter-chip ${state.currentTopic === 'AI & Deep Learning' ? 'active' : ''}" data-topic="AI & Deep Learning">AI & Deep Learning</button>
                    <button type="button" class="filter-chip ${state.currentTopic === 'Journal' ? 'active' : ''}" data-topic="Journal">Journals</button>
                    <button type="button" class="filter-chip ${state.currentTopic === 'Conference' ? 'active' : ''}" data-topic="Conference">Conferences</button>
                </div>
            </div>

            <div class="results-meta-banner">
                <div class="results-count">
                    Showing <strong id="results-count-num">0</strong> of ${state.data.publications.length} publications
                </div>
                <div id="results-active-filter-text" class="active-filter-desc"></div>
            </div>
        `;

        // Event Listeners
        const searchInput = document.getElementById('scholar-search-input');
        const clearBtn = document.getElementById('scholar-search-clear');
        const sortSelect = document.getElementById('scholar-sort-select');

        searchInput.addEventListener('input', (e) => {
            state.currentSearch = e.target.value.trim().toLowerCase();
            clearBtn.style.display = state.currentSearch ? 'block' : 'none';
            applyFilters();
        });

        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            state.currentSearch = '';
            clearBtn.style.display = 'none';
            searchInput.focus();
            applyFilters();
        });

        sortSelect.addEventListener('change', (e) => {
            state.currentSort = e.target.value;
            applyFilters();
        });

        // Year and Topic chip delegates
        toolbarContainer.querySelectorAll('button[data-year]').forEach(btn => {
            btn.addEventListener('click', () => {
                toolbarContainer.querySelectorAll('button[data-year]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.currentYear = btn.getAttribute('data-year');
                applyFilters();
            });
        });

        toolbarContainer.querySelectorAll('button[data-topic]').forEach(btn => {
            btn.addEventListener('click', () => {
                toolbarContainer.querySelectorAll('button[data-topic]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.currentTopic = btn.getAttribute('data-topic');
                applyFilters();
            });
        });
    }

    /**
     * Filter & Sort Publications
     */
    function applyFilters() {
        if (!state.data || !state.data.publications) return;

        let list = [...state.data.publications];

        // 1. Text Search Filter
        if (state.currentSearch) {
            const query = state.currentSearch;
            list = list.filter(item => {
                return (
                    (item.title && item.title.toLowerCase().includes(query)) ||
                    (item.authors && item.authors.toLowerCase().includes(query)) ||
                    (item.publication && item.publication.toLowerCase().includes(query)) ||
                    (item.year && item.year.toString().includes(query)) ||
                    (item.tags && item.tags.some(t => t.toLowerCase().includes(query)))
                );
            });
        }

        // 2. Year Filter
        if (state.currentYear !== 'all') {
            const yr = parseInt(state.currentYear, 10);
            list = list.filter(item => item.year === yr);
        }

        // 3. Topic / Category Filter
        if (state.currentTopic !== 'all') {
            const topic = state.currentTopic;
            list = list.filter(item => {
                if (item.tags && item.tags.includes(topic)) return true;
                if (topic === item.type) return true;
                return false;
            });
        }

        // 4. Sort
        if (state.currentSort === 'newest') {
            list.sort((a, b) => {
                const yA = a.year || 0;
                const yB = b.year || 0;
                if (yB !== yA) return yB - yA;
                return a.id - b.id;
            });
        } else if (state.currentSort === 'cited') {
            list.sort((a, b) => {
                const cA = a.citations || 0;
                const cB = b.citations || 0;
                if (cB !== cA) return cB - cA;
                return (b.year || 0) - (a.year || 0);
            });
        } else if (state.currentSort === 'title') {
            list.sort((a, b) => a.title.localeCompare(b.title));
        }

        state.filteredList = list;

        // Update counts
        const countNum = document.getElementById('results-count-num');
        if (countNum) countNum.textContent = list.length;

        const activeFilterDesc = document.getElementById('results-active-filter-text');
        if (activeFilterDesc) {
            const parts = [];
            if (state.currentYear !== 'all') parts.push(`Year: ${state.currentYear}`);
            if (state.currentTopic !== 'all') parts.push(`Topic: ${state.currentTopic}`);
            if (state.currentSearch) parts.push(`Query: "${state.currentSearch}"`);
            activeFilterDesc.textContent = parts.length ? `(${parts.join(' | ')})` : '';
        }

        renderPublicationsList();
    }

    /**
     * Highlight Author Name in authors list
     */
    function formatAuthors(authorsStr) {
        if (!authorsStr) return '';
        // Bold Dr. Veera
        return authorsStr.replace(/(V Veerasamy|Veerapandiyan Veerasamy|V\. Veerasamy)/gi, '<strong class="author-highlight">$1</strong>');
    }

    /**
     * Render Publication Cards
     */
    function renderPublicationsList() {
        const container = document.getElementById('publications-list');
        if (!container) return;

        if (state.filteredList.length === 0) {
            container.innerHTML = `
                <div style="background: var(--bg-alt); border: 1px dashed var(--border-color); border-radius: 12px; padding: 3rem 1.5rem; text-align: center;">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" style="margin-bottom: 1rem;">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">No publications found</h3>
                    <p style="color: var(--text-light); margin-bottom: 1rem;">Try clearing your search terms or picking another year/topic filter.</p>
                    <button type="button" class="btn" style="width: auto; padding: 8px 18px;" onclick="document.getElementById('scholar-search-clear').click()">
                        Reset Filters
                    </button>
                </div>
            `;
            notifyResize();
            return;
        }

        const itemsToShow = state.filteredList.slice(0, state.displayLimit);

        const cardsHtml = itemsToShow.map((item, index) => {
            const pubUrl = item.scholarUrl || `https://scholar.google.com/citations?hl=en&user=vzf72BMAAAAJ&view_op=list_works&sortby=pubdate`;
            const citeBadgeHtml = item.citations > 0 ? `
                <a href="${item.citationsUrl || pubUrl}" target="_blank" rel="noopener" class="pub-citations-badge" title="View ${item.citations} citing articles on Google Scholar">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    Cited by ${item.citations}
                </a>
            ` : '';

            const tagsHtml = (item.tags || []).slice(0, 3).map(t => `<span class="pub-tag-badge">${t}</span>`).join('');

            return `
                <article class="publication-card" data-pub-id="${item.id}">
                    <div class="pub-card-top">
                        <div class="pub-badges-wrap">
                            <span class="pub-year-badge">${item.year || 'Recent'}</span>
                            <span class="pub-type-badge">${item.type || 'Journal'}</span>
                            ${tagsHtml}
                        </div>
                        ${citeBadgeHtml}
                    </div>

                    <h3 class="pub-title">
                        <a href="${pubUrl}" target="_blank" rel="noopener">
                            ${item.title}
                        </a>
                    </h3>

                    <div class="pub-authors">
                        ${formatAuthors(item.authors)}
                    </div>

                    <div class="pub-venue">
                        ${item.publication || ''}
                    </div>

                    <div class="pub-actions">
                        <button type="button" class="pub-action-btn copy-bibtex-btn" data-id="${item.id}">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            Copy BibTeX
                        </button>
                        <button type="button" class="pub-action-btn copy-apa-btn" data-id="${item.id}">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            Copy APA
                        </button>
                        <a href="${pubUrl}" target="_blank" rel="noopener" class="pub-action-btn btn-scholar">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                            Google Scholar
                        </a>
                    </div>
                </article>
            `;
        }).join('');

        let loadMoreHtml = '';
        if (state.filteredList.length > state.displayLimit) {
            loadMoreHtml = `
                <div style="text-align: center; margin-top: 1.5rem;">
                    <button type="button" id="load-more-pubs-btn" class="btn" style="width: auto; padding: 12px 30px; font-size: 0.95rem;">
                        Load More Publications (${state.filteredList.length - state.displayLimit} remaining)
                    </button>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="publications-list">
                ${cardsHtml}
            </div>
            ${loadMoreHtml}
        `;

        // Load more event
        const loadMoreBtn = document.getElementById('load-more-pubs-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                state.displayLimit += 25;
                renderPublicationsList();
            });
        }

        // Attach action handlers
        container.querySelectorAll('.copy-bibtex-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const pubId = parseInt(btn.getAttribute('data-id'), 10);
                const pub = state.data.publications.find(p => p.id === pubId);
                if (pub && pub.bibtex) {
                    copyToClipboard(pub.bibtex, 'BibTeX citation copied to clipboard!');
                }
            });
        });

        container.querySelectorAll('.copy-apa-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const pubId = parseInt(btn.getAttribute('data-id'), 10);
                const pub = state.data.publications.find(p => p.id === pubId);
                if (pub && pub.apaCitation) {
                    copyToClipboard(pub.apaCitation, 'APA reference copied to clipboard!');
                }
            });
        });

        notifyResize();
    }

    /**
     * Copy to clipboard with toast notification
     */
    function copyToClipboard(text, message) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showToast(message);
            }).catch(() => fallbackCopy(text, message));
        } else {
            fallbackCopy(text, message);
        }
    }

    function fallbackCopy(text, message) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            showToast(message);
        } catch (e) {
            alert(text);
        }
        document.body.removeChild(ta);
    }

    /**
     * Show Toast Notification
     */
    function showToast(message) {
        let toast = document.getElementById('scholar-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'scholar-toast';
            toast.className = 'scholar-toast';
            document.body.appendChild(toast);
        }
        toast.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>${message}</span>
        `;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    /**
     * Iframe Auto-Resize support
     */
    function setupIframeResizer() {
        if (!state.isIframe) return;

        const resizeObserver = new ResizeObserver(() => {
            notifyResize();
        });
        resizeObserver.observe(document.body);
        window.addEventListener('resize', notifyResize);
    }

    function notifyResize() {
        if (!state.isIframe) return;
        const currentHeight = (document.documentElement && document.documentElement.scrollHeight) || 
                              (document.body && document.body.scrollHeight) || 
                              850;
        if (window.parent && window.parent.postMessage) {
            window.parent.postMessage({
                type: 'scholar-embed-resize',
                height: currentHeight
            }, '*');
        }
    }

    /**
     * Setup Modal & Snippet copy if needed
     */
    function setupModalAndToasts() {
        // Expose copyEmbedSnippet to global for embed snippet button
        window.copyEmbedSnippet = function () {
            const snippet = `<iframe src="${window.location.origin}/scholar_embed.html" width="100%" height="850" frameborder="0" style="border:1px solid #e2e8f0; border-radius:12px; box-shadow:0 4px 10px rgba(0,0,0,0.05);" title="Dr. Veerapandiyan Veerasamy Publications on Google Scholar"></iframe>`;
            copyToClipboard(snippet, 'Iframe embed snippet copied to clipboard!');
        };
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
