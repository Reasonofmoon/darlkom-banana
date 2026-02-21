// Darlkom v2.0 Controller
console.log("Darlkom v2.0 Workstation Initializing...");

// ── Toast Notification ────────────────────────
function showToast(msg, icon = '✓') {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toast-msg');
    if (!toast || !msgEl) return;
    toast.querySelector('.toast-icon').textContent = icon;
    msgEl.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

// State
const state = {
    library: [],
    filter: 'all',
    view: 'grid',
    selection: null, // Currently selected DNA ID
    mixer: {
        A: null, // Structure
        B: null, // Palette/Vibe
        C: null  // Material
    }
};

// DOM Elements
const els = {
    grid: document.getElementById('dna-grid'),
    inspector: document.getElementById('inspector-content'),
    inspectorPanel: document.getElementById('inspector-panel'),
    slots: {
        A: document.querySelector('.slot[data-slot="A"]'),
        B: document.querySelector('.slot[data-slot="B"]'),
        C: document.querySelector('.slot[data-slot="C"]')
    },
    slotValues: {
        A: document.getElementById('slot-a-value'),
        B: document.getElementById('slot-b-value'),
        C: document.getElementById('slot-c-value')
    },
    mixBtn: document.getElementById('btn-mix'),
    exportBtn: document.getElementById('btn-export'),
    filters: document.querySelectorAll('.filter-item'),
    search: document.getElementById('global-search')
};


// --- Initialization ---
async function init() {
    await loadLibrary();
    setupEventListeners();
    setupNavItems();

    // Auto-select first item if available
    if (state.library.length > 0) {
        selectDNA(state.library[0].module_id);
    }
}

// ── View Switching ─────────────────────────────
function setupNavItems() {
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.nav-item[data-view]').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const view = item.dataset.view;
            const dnaView = document.getElementById('dna-view');
            const annoView = document.getElementById('annotation-view');
            if (view === 'annotations') {
                dnaView.style.display = 'none';
                annoView.style.display = 'block';
                renderAnnotationView();
            } else {
                dnaView.style.display = 'block';
                annoView.style.display = 'none';
            }
        });
    });
}

async function loadLibrary() {
    try {
        const res = await fetch('templates.json');
        const data = await res.json();
        const serverLibrary = data.styles_v2 || data.styles_001_100 || [];

        // Load User Designs from LocalStorage
        const userLibrary = JSON.parse(localStorage.getItem('darlkom_user_designs') || '[]');

        state.library = [...userLibrary, ...serverLibrary];
        renderLibrary();
        updateSidebarStats();
    } catch (e) {
        console.error("Failed to load library:", e);
        els.grid.innerHTML = `<div class="error">Failed to load DNA Module Database. Check console.</div>`;
    }
}

function updateSidebarStats() {
    const total = state.library.length;
    const userCount = state.library.filter(d => d.module_id.startsWith('USER_')).length;
    const el = (id, v) => { const e = document.getElementById(id); if(e) e.textContent = v; };
    el('stat-total', total);
    el('stat-shown', total);
    el('stat-user', userCount);
}

// --- Rendering ---
function renderLibrary() {
    els.grid.innerHTML = '';

    const term = els.search.value.toLowerCase();

    const filtered = state.library.filter(dna => {
        if (state.filter !== 'all') {
            const role = (dna.role_bucket || '').toLowerCase();
            if (state.filter === 'user' && !dna.module_id.startsWith('USER_')) return false;
            if (state.filter !== 'user' && !role.includes(state.filter)) return false;
        }
        if (term) {
            const haystack = JSON.stringify(dna).toLowerCase();
            if (!haystack.includes(term)) return false;
        }
        return true;
    });

    // Update shown stat
    const shownEl = document.getElementById('stat-shown');
    if (shownEl) shownEl.textContent = filtered.length;

    filtered.forEach(dna => {
        const isUserFor = dna.module_id.startsWith('USER_');
        const item = document.createElement('div');
        item.className = `dna-item ${state.selection === dna.module_id ? 'selected' : ''} ${isUserFor ? 'user-dna' : ''}`;
        item.onclick = () => selectDNA(dna.module_id);

        const thumbID = `thumb-${dna.module_id}`;
        item.innerHTML = `
            <div class="dna-thumb" id="${thumbID}"></div>
            <div class="dna-info">
                <div class="dna-title">${dna.style_name}</div>
                <div class="dna-role">${isUserFor ? 'USER DESIGN' : dna.role_bucket}</div>
            </div>
        `;

        els.grid.appendChild(item);
        requestAnimationFrame(() => {
            if (window.RenderEngine) window.RenderEngine.renderThumbnail(thumbID, dna);
        });
    });
}

function selectDNA(id) {
    state.selection = id;
    
    // Update Grid Selection UI
    document.querySelectorAll('.dna-item').forEach(el => el.classList.remove('selected'));
    // Re-render whole grid is inefficient, just update class finding by title/id logic?
    // For prototype, simple re-render is fine or query selector
    renderLibrary(); // Re-render to update selection class (naive)

    // Update Inspector
    const dna = state.library.find(d => d.module_id === id);
    renderInspector(dna);
}


function renderInspector(dna) {
    if (!dna) return;
    
    const d = dna.design_dna;
    
    let colorHtml = '';
    if (d.color_palette) {
        const { primary, secondary, accent } = d.color_palette;
        colorHtml = `
            <div class="color-swatch-row">
                <div class="swatch" style="background:${primary}" title="Primary: ${primary}"></div>
                <div class="swatch" style="background:${secondary}" title="Secondary: ${secondary}"></div>
                <div class="swatch" style="background:${accent}" title="Accent: ${accent}"></div>
            </div>
        `;
    }

    const html = `
        <div class="prop-group">
            <div class="prop-header"><i data-lucide="info"></i> Meta Info</div>
            <div class="prop-row"><span class="prop-key">ID</span> <span class="prop-val">${dna.module_id}</span></div>
            <div class="prop-row"><span class="prop-key">Name</span> <span class="prop-val">${dna.style_name}</span></div>
            <div class="prop-row"><span class="prop-key">Role</span> <span class="prop-val">${dna.role_bucket}</span></div>
        </div>

        <div class="prop-group">
            <div class="prop-header"><i data-lucide="palette"></i> Palette</div>
            ${colorHtml}
        </div>

        <div class="prop-group">
            <div class="prop-header"><i data-lucide="layout-template"></i> Form DNA</div>
            <div class="prop-row"><span class="prop-key">Composition</span> <span class="prop-val">${d.layout_rules?.composition || '-'}</span></div>
            <div class="prop-row"><span class="prop-key">Whitespace</span> <span class="prop-val">${(d.layout_rules?.whitespace_ratio * 100) || 0}%</span></div>
            <div class="prop-row"><span class="prop-key">Flow</span> <span class="prop-val">${d.layout_rules?.reading_flow || '-'}</span></div>
        </div>

        <div class="prop-group">
            <div class="prop-header"><i data-lucide="component"></i> Material</div>
            <div class="prop-row"><span class="prop-key">Base</span> <span class="prop-val">${d.materiality?.base || '-'}</span></div>
            <div class="prop-row"><span class="prop-key">Texture</span> <span class="prop-val">${(d.materiality?.texture || []).join(', ')}</span></div>
        </div>

        <div class="prop-group">
            <div class="prop-header"><i data-lucide="type"></i> Typography</div>
            <div class="prop-row"><span class="prop-key">Headline</span> <span class="prop-val">${d.typography?.headline || '-'}</span></div>
            <div class="prop-row"><span class="prop-key">Body</span> <span class="prop-val">${d.typography?.body || '-'}</span></div>
        </div>
        
        <div class="prop-group">
            <div class="prop-header"><i data-lucide="heart-pulse"></i> Emotion</div>
            <div class="prop-row"><span class="prop-key">Mood</span> <span class="prop-val">${(d.emotional_profile?.mood || []).join(', ')}</span></div>
        </div>
        
        <div class="prop-group">
            <div class="prop-header">ACTIONS</div>
            <button class="btn-secondary" onclick="assignSlot('A', '${dna.module_id}')" style="width:100%; margin-bottom:0.5rem">Set as Structure (A)</button>
            <button class="btn-secondary" onclick="assignSlot('B', '${dna.module_id}')" style="width:100%; margin-bottom:0.5rem">Set as Palette (B)</button>
            <button class="btn-secondary" onclick="assignSlot('C', '${dna.module_id}')" style="width:100%">Set as Material (C)</button>
        </div>
        
        <div class="prop-group">
             <div class="prop-header">EXPORT / COPY</div>
             <button class="btn-primary" style="width:100%; margin-bottom:0.5rem" onclick="copyPrompt('${dna.module_id}')">
                <i data-lucide="copy"></i> COPY IMAGE PROMPT
             </button>
             <button class="btn-secondary" style="width:100%" onclick="copyJSON('${dna.module_id}')">
                <i data-lucide="code"></i> COPY DNA JSON
             </button>
        </div>
    `;
    
    els.inspector.innerHTML = html;
    if (window.lucide) lucide.createIcons();
}

// --- Mixer Logic ---
window.assignSlot = function(slot, id) {
    const dna = state.library.find(d => d.module_id === id);
    if (!dna) return;
    
    state.mixer[slot] = dna;
    els.slotValues[slot].innerText = dna.style_name;
    
    // Highlight slot
    els.slots[slot].style.borderColor = 'var(--accent)';
    setTimeout(() => els.slots[slot].style.borderColor = '', 300);
}

function handleMix() {
    // 3-Way Mix Logic
    const { A, B, C } = state.mixer;
    if (!A && !B && !C) {
        alert("Please load at least one DNA into the slots.");
        return;
    }
    
    // Pass to RenderEngine
    if (window.RenderEngine) {
        window.RenderEngine.renderHybrid('p5-canvas-container', A, B, C);
    }
}

// --- New Features: Save & Copy ---

window.saveHybrid = function() {
    const { A, B, C } = state.mixer;
    
    if (!A && !B && !C) {
        alert("Compose a hybrid design first!");
        return;
    }
    
    // Merge Logic (Preference: A=Start, B=Colors, C=Material)
    // Fallback logic if a slot is empty
    const base = A || B || C;
    const paletteSrc = B || A || C;
    const matSrc = C || A || B;
    
    const newName = prompt("Name your new Hybrid Design:", `Hybrid ${base.style_name.split(' ')[0]}`);
    if (!newName) return;
    
    const newDNA = {
        module_id: `USER_${Date.now()}`, // Unique ID
        style_name: newName,
        role_bucket: "Hybrid User Design",
        design_dna: {
            tone_keywords: [...(base.design_dna?.tone_keywords || []), 'hybrid'],
            color_palette: paletteSrc.design_dna?.color_palette,
            layout_rules: base.design_dna?.layout_rules,
            materiality: matSrc.design_dna?.materiality,
            line_shape: base.design_dna?.line_shape,
            typography: base.design_dna?.typography,
            emotional_profile: paletteSrc.design_dna?.emotional_profile
        },
        slide_usage: base.slide_usage,
        image_prompt_one_line: `Hybrid design combining structure of ${base.style_name}, colors of ${paletteSrc.style_name}, and material of ${matSrc.style_name}. ${paletteSrc.image_prompt_one_line || ''}`
    };
    
    // Save to LocalStorage
    const userDesigns = JSON.parse(localStorage.getItem('darlkom_user_designs') || '[]');
    userDesigns.unshift(newDNA);
    localStorage.setItem('darlkom_user_designs', JSON.stringify(userDesigns));
    
    // Reload
    loadLibrary();
    selectDNA(newDNA.module_id);
    alert("Design Saved locally!");
}

window.copyPrompt = function(id) {
    const dna = state.library.find(d => d.module_id === id);
    if (!dna) return;
    
    let text = dna.image_prompt_one_line;
    
    // Auto-generate if missing or empty
    if (!text || text.length < 10) {
        console.log("Prompt missing, generating dynamically...");
        text = generatePromptFromDNA(dna);
    }
    
    secureCopy(text, "Image Prompt");
}

window.copyJSON = function(id) {
    const dna = state.library.find(d => d.module_id === id);
    if (!dna) return;
    
    const text = JSON.stringify(dna, null, 2);
    secureCopy(text, "DNA JSON");
}

// Client-side Prompt Generator
function generatePromptFromDNA(dna) {
    const d = dna.design_dna || {};
    const colors = d.color_palette || {};
    const mood = (d.emotional_profile?.mood || []).join(', ');
    const tones = (d.tone_keywords || []).join(', ');
    const mat = d.materiality?.base || 'digital';
    
    const colorStr = `${colors.primary || ''} ${colors.secondary || ''} ${colors.accent || ''}`.trim();
    
    // Construct robust prompt
    return `${dna.style_name} style, ${tones}, ${mood}, Colors: ${colorStr}, Material: ${mat}, high quality structured design, 8k resolution, architectural composition`;
}

// Robust Copy Helper (toast-based)
function secureCopy(text, label) {
    const doFallback = () => {
        const ta = document.createElement('textarea');
        ta.value = text;
        Object.assign(ta.style, { top:0, left:0, position:'fixed', opacity:0 });
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        try {
            document.execCommand('copy');
            showToast(`${label} copied!`, '📋');
        } catch { showToast(`Copy failed. Please copy manually.`, '✗'); }
        document.body.removeChild(ta);
    };
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
            .then(() => showToast(`${label} copied!`, '📋'))
            .catch(doFallback);
    } else { doFallback(); }
}


// --- Event Listeners ---
function setupEventListeners() {
    // Search
    els.search.addEventListener('input', () => renderLibrary());
    
    // Filter Chips
    els.filters.forEach(btn => {
        btn.addEventListener('click', () => {
            els.filters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.filter = btn.dataset.filter;
            renderLibrary();
        });
    });
    
    // Mix Button
    els.mixBtn.addEventListener('click', handleMix);
    
    // Export Button
    els.exportBtn.addEventListener('click', () => {
        if (window.RenderEngine) window.RenderEngine.download();
    });
}

// ── Annotation Guide Renderer ──────────────────
const ANNO_TAGS = ['layout','typo','color','spatial','motion','data','korean','english','academic','minimal'];

function renderAnnotationView() {
    const container = document.getElementById('annotation-view');
    if (!container || container.dataset.rendered) return;
    container.dataset.rendered = '1';

    // Hero
    container.innerHTML = `
        <div class="anno-hero">
            <div class="anno-hero-inner">
                <div class="anno-badge">✦ Spatial Design Guidelines v2.0</div>
                <h1>고급 주석 인포그래픽 <em>50가지 디자인 지침</em></h1>
                <p class="anno-hero-sub">원문의 가독성을 해치지 않으면서도 분석적 주석이 고급스럽게 배치된 인포그래픽을 생성하기 위한 공간 설계(Spatial Design) 관점의 프롬프트 전략 50종</p>
                <div class="anno-stats">
                    <div><div class="anno-stat-num">50</div><div class="anno-stat-label">Versions</div></div>
                    <div><div class="anno-stat-num">10</div><div class="anno-stat-label">Categories</div></div>
                    <div><div class="anno-stat-num">∞</div><div class="anno-stat-label">Contexts</div></div>
                </div>
            </div>
        </div>
        <div class="anno-filter-bar">
            <span class="anno-filter-label">Filter</span>
            <button class="anno-filter-btn active" data-af="all">전체 All</button>
            ${ANNO_TAGS.map(t => `<button class="anno-filter-btn" data-af="${t}">${t}</button>`).join('')}
        </div>
        <div id="anno-content"></div>
    `;

    // Filter listeners
    container.querySelectorAll('.anno-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.anno-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderAnnoCards(btn.dataset.af);
        });
    });

    renderAnnoCards('all');
}

function renderAnnoCards(filterTag) {
    const contentEl = document.getElementById('anno-content');
    if (!contentEl) return;
    contentEl.innerHTML = '';

    // Build categories from raw script in the annotation HTML file
    // We load the guidelines array from the embedded script tag
    const guideStore = window.__annoGuidelines;
    if (!guideStore || !guideStore.length) {
        contentEl.innerHTML = '<p style="color:var(--text-muted);padding:2rem;">가이드라인 데이터를 불러오는 중...</p>';
        loadAnnoGuidelines().then(() => renderAnnoCards(filterTag));
        return;
    }

    const cats = {};
    const order = [];
    guideStore.forEach(g => {
        if (!cats[g.cat]) { cats[g.cat] = { items:[], catEn: g.catEn||'', catNum: g.catNum }; order.push(g.cat); }
        const match = filterTag === 'all' || g.tags.includes(filterTag);
        if (match) cats[g.cat].items.push(g);
    });

    order.forEach(catName => {
        const cat = cats[catName];
        if (!cat.items.length) return;
        const sec = document.createElement('div');
        sec.className = 'anno-category';
        sec.innerHTML = `
            <div class="anno-cat-header">
                <div class="anno-cat-num">${cat.catNum}</div>
                <div>
                    <div class="anno-cat-title">${catName}</div>
                    <div style="font-size:0.7rem;color:var(--text-muted);margin-top:1px;">${cat.catEn}</div>
                </div>
                <div class="anno-cat-count">${cat.items.length} guides</div>
            </div>
            <div class="anno-grid">
                ${cat.items.map(g => `
                    <div class="anno-card">
                        <button class="anno-copy-btn" onclick="secureCopy(\`${g.prompt.replace(/`/g,"'")}\`, '${g.id} Prompt')">COPY</button>
                        <div class="anno-card-top">
                            <div class="anno-card-id">${g.id}</div>
                            <div class="anno-card-tags">${g.tags.map(t => `<span class="tag tag-${t}">${t}</span>`).join('')}</div>
                        </div>
                        <div class="anno-card-title">${g.title}<span class="anno-card-title-en">${g.titleEn}</span></div>
                        <div class="anno-card-desc">${g.desc}</div>
                        <div class="anno-card-prompt">${g.prompt.replace(/\n/g,'<br>')}</div>
                        <div class="anno-card-specs">
                            ${g.specs.map(s => `<div class="anno-card-spec"><div class="spec-dot" style="background:${s.color}"></div><span>${s.label}</span></div>`).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        contentEl.appendChild(sec);
    });
}

async function loadAnnoGuidelines() {
    try {
        const res = await fetch('annotation-design-guidelines-50.html');
        const html = await res.text();
        const match = html.match(/const guidelines = (\[.*?\]);\s*\/\/ Group/s);
        if (match) window.__annoGuidelines = eval(match[1]);
    } catch(e) { console.error('Failed to load annotation guidelines:', e); }
}

// Boot
document.addEventListener('DOMContentLoaded', init);
