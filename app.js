let dnaData = [];
let filteredData = [];

// Image Mapping
const sampleImages = {
    16: 'art_deco_gold_dna_sample_1769039206808.png',
    17: 'art_deco_neon_dna_sample_1769039711703.png',
    26: 'neon_noir_dna_sample_1769039191428.png',
    15: 'ukiyo_e_modern_dna_sample_1769039223658.png',
    19: 'ukiyo_e_tattoo_dna_sample_1769039695373.png',
    8: 'minimal_white_dna_sample_1769039665828.png',
    30: 'bauhaus_geometric_dna_sample_1769039679414.png'
};

// Elements (Declared globally but initialized in DOMContentLoaded)
let grid, searchInput, templateCount, filterChips, modal, modalBody, closeModal;

function init() {
    grid = document.getElementById('dna-grid');
    searchInput = document.getElementById('dna-search');
    templateCount = document.getElementById('template-count');
    filterChips = document.querySelectorAll('.chip');
    modal = document.getElementById('dna-modal');
    modalBody = document.getElementById('modal-body');
    closeModal = document.querySelector('.close-modal');

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Attach Search listener
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            filteredData = dnaData.filter(dna => 
                dna.title.toLowerCase().includes(term) || 
                (dna.ko_title && dna.ko_title.toLowerCase().includes(term)) ||
                dna.tone.toLowerCase().includes(term)
            );
            renderGrid(filteredData);
        });
    }

    // Attach Filter listener
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const filter = chip.dataset.filter;
            
            if (filter === 'all') {
                filteredData = [...dnaData];
            } else {
                filteredData = dnaData.filter(dna => {
                    const text = (dna.title + dna.tone).toLowerCase();
                    if (filter === 'tech') return text.includes('future') || text.includes('neon') || text.includes('cyber');
                    if (filter === 'art') return text.includes('art') || text.includes('ukiyo') || text.includes('bauhaus');
                    if (filter === 'nature') return text.includes('nature') || text.includes('marble') || text.includes('watercolor');
                    if (filter === 'brand') return text.includes('brand') || text.includes('ethos') || text.includes('design');
                    return true;
                });
            }
            renderGrid(filteredData);
        });
    });

    // Modal close shortcuts
    if (closeModal) closeModal.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

    loadData();
}

document.addEventListener('DOMContentLoaded', init);

// Load Data
async function loadData() {
    try {
        const response = await fetch('templates.json');
        dnaData = await response.json();
        
        // Remove duplicates and normalize
        dnaData = Array.from(new Set(dnaData.map(d => d.title)))
            .map(title => dnaData.find(d => d.title === title));
            
        filteredData = [...dnaData];
        if (templateCount) templateCount.innerText = dnaData.length;
        renderGrid(filteredData);
        populateMixerOptions();
    } catch (error) {
        console.error("Error loading DNA templates:", error);
        if (grid) grid.innerHTML = `<div class="error">DNA 저장소를 불러올 수 없습니다.</div>`;
    }
}

// Render Cards
function renderGrid(data) {
    grid.innerHTML = '';
    data.forEach(dna => {
        const card = document.createElement('div');
        card.className = 'dna-card';
        card.dataset.id = dna.id;
        
        const palette = dna.palette || {};
        const bg = palette.background || '#1a1a1a';
        const text = palette.text || '#ffffff';
        const accents = palette.accents || [];
        
        card.innerHTML = `
            <div class="render-overlay" id="render-${dna.id}"></div>
            <div class="tag">#${dna.id.toString().padStart(3, '0')} DNA</div>
            <h3>${dna.ko_title || dna.title}</h3>
            <p class="tone">${dna.tone ? dna.tone : 'Premium design aesthetic'}</p>
            <div class="palette-preview">
                <div class="color-dot" style="background: ${bg}" title="Background"></div>
                ${accents.map(c => `<div class="color-dot" style="background: ${c}" title="Accent"></div>`).join('')}
            </div>
            <div class="actions">
                <button class="btn btn-secondary" onclick="openDnaPortal(${dna.id})">분석하기</button>
            </div>
        `;
        grid.appendChild(card);
        
        // Apply Real-time Rendering to Overlay
        const overlay = document.getElementById(`render-${dna.id}`);
        RenderEngine.render(overlay, dna);
    });
}

// Modal Implementation (Split View)
function openDnaPortal(id) {
    const dna = dnaData.find(d => d.id === id);
    if (!dna) return;
    
    const imgUrl = sampleImages[dna.id] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    const totalScore = Object.values(dna.metrics).reduce((a, b) => a + b, 0);
    
    modalBody.innerHTML = `
        <div class="modal-left">
            <div class="visual-preview" id="modal-render-area" style="background-image: url('${imgUrl}')">
                <div class="render-overlay" id="modal-pattern-overlay"></div>
                <div class="visual-overlay">
                    <h2>${dna.ko_title || dna.title}</h2>
                    <p>${dna.tone}</p>
                </div>
            </div>
            <div class="dna-map-container">
                <svg class="dna-helix-svg" viewBox="0 0 800 300">
                    <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style="stop-color:#00ffff;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#6c5ce7;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <!-- Visual DNA Helix Path -->
                    <path class="helix-strand" d="M0,150 Q200,50 400,150 T800,150" fill="none" stroke="url(#grad1)" stroke-width="4" opacity="0.3">
                        <animate attributeName="d" dur="5s" repeatCount="indefinite" values="M0,150 Q200,50 400,150 T800,150;M0,150 Q200,250 400,150 T800,150;M0,150 Q200,50 400,150 T800,150" />
                    </path>
                    <path class="helix-strand" d="M0,150 Q200,250 400,150 T800,150" fill="none" stroke="#fff" stroke-width="2" opacity="0.2">
                        <animate attributeName="d" dur="5s" repeatCount="indefinite" values="M0,150 Q200,250 400,150 T800,150;M0,150 Q200,50 400,150 T800,150;M0,150 Q200,250 400,150 T800,150" />
                    </path>
                    <!-- Gene Nodes -->
                    ${Object.entries(dna.metrics).map(([key, val], i) => `
                        <circle cx="${150 + i * 120}" cy="${150 + Math.sin(i) * 50}" r="8" fill="#00ffff" opacity="${val / 10}">
                            <animate attributeName="r" values="6;10;6" dur="3s" repeatCount="indefinite" begin="${i * 0.5}s" />
                        </circle>
                        <text x="${150 + i * 120}" y="${180 + Math.sin(i) * 50}" text-anchor="middle" fill="#aaa" font-size="10" font-weight="bold">${key.toUpperCase()}: ${val}</text>
                    `).join('')}
                </svg>
            </div>
        </div>
        <div class="modal-right">
            <div class="total-score-box">
                <div class="total-score-value">${totalScore}<span>/50</span></div>
                <div class="stat-label">TOTAL DESIGN SYNERGY</div>
            </div>

            <div class="analysis-grid">
                ${renderMetric('가독성 / 가시성', dna.metrics.readability)}
                ${renderMetric('계층 구조', dna.metrics.hierarchy)}
                ${renderMetric('일관성', dna.metrics.consistency)}
                ${renderMetric('분위기 표현력', dna.metrics.atmosphere)}
                ${renderMetric('테마 적합성', dna.metrics.suitability)}
            </div>

            <div class="prompt-header">
                <h4>ELABORATED DNA PROMPT</h4>
                <button class="btn btn-primary" onclick="copyPrompt('${dna.prompt.replace(/'/g, "\\'")}')">COPY DNA</button>
            </div>
            <div class="prompt-box-elaborate">
                <code>${dna.prompt || 'No elaborate prompt available for this legacy DNA.'}</code>
            </div>

            <div class="dna-section" style="margin-top: 3rem;">
                <h4>STRUCTURAL DNA DATA</h4>
                <pre class="md-preview">${dna.full_report}</pre>
            </div>
        </div>
    `;
    modal.style.display = 'flex';

    // Apply Real-time Rendering to Modal
    const modalOverlay = document.getElementById('modal-pattern-overlay');
    RenderEngine.render(modalOverlay, dna);
    modalOverlay.style.opacity = "0.4"; // Blend with sample image
}

function renderMetric(label, score) {
    return `
        <div class="analysis-card">
            <div class="analysis-header">
                <span class="analysis-label">${label}</span>
                <span class="analysis-score">${score}/10</span>
            </div>
            <div class="score-bar-bg">
                <div class="score-bar-fill" style="width: ${score * 10}%"></div>
            </div>
        </div>
    `;
}

// Mixer Implementation
let selectA, selectB, mixBtn, hybridOutput;

function populateMixerOptions() {
    selectA = document.getElementById('select-a');
    selectB = document.getElementById('select-b');
    mixBtn = document.getElementById('mix-dna-btn');
    hybridOutput = document.getElementById('hybrid-output');

    if (!selectA || !selectB) return;

    [selectA, selectB].forEach(select => {
        select.innerHTML = '<option value="">Select DNA</option>'; // Reset
        dnaData.forEach(dna => {
            const opt = document.createElement('option');
            opt.value = dna.id;
            opt.innerText = dna.ko_title || dna.title;
            select.appendChild(opt);
        });
    });

    if (mixBtn && !mixBtn.dataset.listener) {
        mixBtn.addEventListener('click', handleMix);
        mixBtn.dataset.listener = 'true';
    }
}

function handleMix() {
    const idA = selectA.value;
    const idB = selectB.value;
    
    if (!idA || !idB) return alert("두 가지 DNA를 선택해주세요.");
    
    const dnaA = dnaData.find(d => d.id == idA);
    const dnaB = dnaData.find(d => d.id == idB);
    
    hybridOutput.innerHTML = `
        <div class="hybrid-card" id="hybrid-render-target">
            <div class="hybrid-badge">NEW HYBRID DNA SYNTHESIZED</div>
            <h2>${dnaA.title.split('/')[0]} x ${dnaB.title.split('/')[0]}</h2>
            <div class="analysis-grid" style="margin: 2rem 0;">
                <p>Base DNA: ${dnaA.ko_title || dnaA.title}</p>
                <p>Modifier DNA: ${dnaB.ko_title || dnaB.title}</p>
            </div>
            <div class="prompt-box-elaborate">
                <code>${dnaA.prompt} ${dnaB.prompt}</code>
            </div>
            <button class="btn btn-primary" style="margin-top: 2rem;" onclick="copyPrompt('${dnaA.prompt} ${dnaB.prompt}')">COPY HYBRID PROMPT</button>
        </div>
    `;
    hybridOutput.style.display = 'block';
    
    const target = document.getElementById('hybrid-render-target');
    if (typeof RenderEngine !== 'undefined') {
        RenderEngine.renderHybrid(target, dnaA, dnaB);
    }
    
    hybridOutput.scrollIntoView({ behavior: 'smooth' });
}

// Modal close shortcuts handled in init()

// Exposure for global calls
window.openDnaPortal = openDnaPortal;
window.copyPrompt = copyPrompt;

function copyPrompt(text) {
    if (!text) return alert("프롬프트가 없습니다.");
    navigator.clipboard.writeText(text).then(() => {
        alert("DNA 프롬프트가 복사되었습니다.");
    });
}

loadData();
