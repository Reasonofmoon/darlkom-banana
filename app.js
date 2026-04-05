// Darlkom v2.0 Controller — UX Enhanced
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

// ── Modal System ──────────────────────────────
function showModal(title, bodyHtml, actions) {
    const overlay = document.getElementById('modal-overlay');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');
    const actionsEl = document.getElementById('modal-actions');
    if (!overlay) return;

    titleEl.textContent = title;
    bodyEl.innerHTML = bodyHtml;
    actionsEl.innerHTML = '';

    actions.forEach(a => {
        const btn = document.createElement('button');
        btn.className = a.primary ? 'btn-primary' : 'btn-secondary';
        btn.textContent = a.label;
        btn.onclick = () => { closeModal(); if (a.onClick) a.onClick(); };
        actionsEl.appendChild(btn);
    });

    overlay.classList.add('active');
    const input = bodyEl.querySelector('input');
    if (input) setTimeout(() => input.focus(), 100);
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.remove('active');
}

function showPromptModal(title, defaultValue, onConfirm) {
    const inputId = 'modal-prompt-input';
    showModal(title, `<input type="text" class="modal-input" id="${inputId}" value="${defaultValue}">`, [
        { label: '취소', primary: false },
        { label: '확인', primary: true, onClick: () => {
            const val = document.getElementById(inputId)?.value?.trim();
            if (val) onConfirm(val);
        }}
    ]);
    setTimeout(() => {
        const input = document.getElementById(inputId);
        if (input) { input.focus(); input.select(); }
    }, 150);
}

// ── Welcome Banner ────────────────────────────
window.dismissWelcome = function() {
    localStorage.setItem('darlkom_welcomed', '1');
    const banner = document.getElementById('welcome-banner');
    if (banner) banner.style.display = 'none';
};

function initWelcomeBanner() {
    if (window.__showWelcome) {
        const banner = document.getElementById('welcome-banner');
        if (banner) banner.style.display = 'block';
    }
}

// State
const state = {
    library: [],
    filter: 'all',
    view: 'grid',
    selection: null,
    mixer: {
        A: null,
        B: null,
        C: null
    },
    deck: []
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
    setupDragAndDrop();
    initWelcomeBanner();

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
            switchView(view);
        });
    });
}

function switchView(view) {
    const dnaView = document.getElementById('dna-view');
    const annoView = document.getElementById('annotation-view');
    const promptsView = document.getElementById('prompts-view');

    dnaView.style.display = 'none';
    annoView.style.display = 'none';
    if (promptsView) promptsView.style.display = 'none';

    if (view === 'annotations') {
        annoView.style.display = 'block';
        renderAnnotationView();
    } else if (view === 'prompts') {
        if (promptsView) promptsView.style.display = 'block';
        renderPromptsView();
    } else {
        dnaView.style.display = 'block';
    }
}

window.backToDnaView = function() {
    switchView('grid');
    document.querySelectorAll('.nav-item[data-view]').forEach(i => {
        i.classList.toggle('active', i.dataset.view === 'grid');
    });
};

async function loadLibrary() {
    try {
        const res = await fetch('templates.json');
        const data = await res.json();
        const serverLibrary = data.styles_v2 || data.styles_001_100 || [];
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
let _searchDebounce = null;
function debouncedRenderLibrary() {
    clearTimeout(_searchDebounce);
    _searchDebounce = setTimeout(renderLibrary, 150);
}

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

    const shownEl = document.getElementById('stat-shown');
    if (shownEl) shownEl.textContent = filtered.length;

    filtered.forEach(dna => {
        const isUser = dna.module_id.startsWith('USER_');
        const item = document.createElement('div');
        item.className = `dna-item ${state.selection === dna.module_id ? 'selected' : ''} ${isUser ? 'user-dna' : ''}`;
        item.onclick = () => selectDNA(dna.module_id);

        // Drag-and-drop support
        item.draggable = true;
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', dna.module_id);
            e.dataTransfer.effectAllowed = 'copy';
            item.style.opacity = '0.5';
        });
        item.addEventListener('dragend', () => { item.style.opacity = ''; });

        const thumbID = `thumb-${dna.module_id}`;
        item.innerHTML = `
            <div class="dna-thumb" id="${thumbID}"></div>
            <div class="dna-info">
                <div class="dna-title">${dna.style_name}</div>
                <div class="dna-role">${isUser ? 'USER DESIGN' : dna.role_bucket}</div>
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
    document.querySelectorAll('.dna-item').forEach(el => el.classList.remove('selected'));
    renderLibrary();
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
            <div class="prop-header">슬롯 배정</div>
            <button class="btn-secondary" onclick="assignSlot('A', '${dna.module_id}')" style="width:100%; margin-bottom:0.5rem">
                <i data-lucide="layout-template"></i> Structure (A)에 배정
            </button>
            <button class="btn-secondary" onclick="assignSlot('B', '${dna.module_id}')" style="width:100%; margin-bottom:0.5rem">
                <i data-lucide="palette"></i> Palette (B)에 배정
            </button>
            <button class="btn-secondary" onclick="assignSlot('C', '${dna.module_id}')" style="width:100%">
                <i data-lucide="component"></i> Material (C)에 배정
            </button>
        </div>

        <div class="prop-group">
             <div class="prop-header">내보내기</div>
             <button class="btn-primary" style="width:100%; margin-bottom:0.5rem" onclick="copyPrompt('${dna.module_id}')">
                <i data-lucide="copy"></i> 이미지 프롬프트 복사
             </button>
             <button class="btn-secondary" style="width:100%" onclick="copyJSON('${dna.module_id}')">
                <i data-lucide="code"></i> DNA JSON 복사
             </button>
        </div>
    `;

    els.inspector.innerHTML = html;
    if (window.lucide) lucide.createIcons();
}

// ── Drag & Drop for Mixer Slots ───────────────
function setupDragAndDrop() {
    ['A', 'B', 'C'].forEach(slot => {
        const slotEl = els.slots[slot];
        if (!slotEl) return;

        slotEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            slotEl.classList.add('drag-over');
        });

        slotEl.addEventListener('dragleave', () => {
            slotEl.classList.remove('drag-over');
        });

        slotEl.addEventListener('drop', (e) => {
            e.preventDefault();
            slotEl.classList.remove('drag-over');
            const moduleId = e.dataTransfer.getData('text/plain');
            if (moduleId) assignSlot(slot, moduleId);
        });
    });

    // Timeline drop zone
    const timeline = document.getElementById('deck-timeline');
    if (timeline) {
        timeline.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            timeline.style.borderColor = 'var(--accent)';
        });
        timeline.addEventListener('dragleave', () => {
            timeline.style.borderColor = '';
        });
        timeline.addEventListener('drop', (e) => {
            e.preventDefault();
            timeline.style.borderColor = '';
            const moduleId = e.dataTransfer.getData('text/plain');
            if (moduleId) addToDeck(moduleId);
        });
    }
}

// --- Mixer Logic ---
window.assignSlot = function(slot, id) {
    const dna = state.library.find(d => d.module_id === id);
    if (!dna) return;

    state.mixer[slot] = dna;
    els.slotValues[slot].innerText = dna.style_name;
    els.slots[slot].classList.add('filled');

    els.slots[slot].style.borderColor = 'var(--accent)';
    setTimeout(() => els.slots[slot].style.borderColor = '', 600);

    showToast(`${dna.style_name} → Slot ${slot}`, '✓');
};

function handleMix() {
    const { A, B, C } = state.mixer;
    if (!A && !B && !C) {
        showModal('슬롯이 비어 있습니다', '<p>최소 하나의 DNA를 슬롯에 배정한 후 합성하세요.</p><p style="margin-top:0.5rem;font-size:0.78rem;color:var(--text-muted);">라이브러리에서 DNA 카드를 클릭한 후 Inspector의 배정 버튼을 사용하거나, 카드를 슬롯으로 드래그하세요.</p>', [
            { label: '확인', primary: true }
        ]);
        return;
    }

    // Button feedback
    const btn = els.mixBtn;
    const originalHtml = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> 합성 중...';
    btn.disabled = true;
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
        try {
            if (window.RenderEngine) {
                window.RenderEngine.renderHybrid('p5-canvas-container', A, B, C);
            }
            showToast('디자인이 합성되었습니다!', '✨');
            const canvas = document.getElementById('p5-canvas-container');
            if (canvas) canvas.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (e) {
            console.error('Synthesis failed:', e);
            showToast('합성에 실패했습니다', '✗');
        } finally {
            btn.innerHTML = originalHtml;
            btn.disabled = false;
            if (window.lucide) lucide.createIcons();
        }
    }, 300);
}

// --- Save & Copy ---
window.saveHybrid = function() {
    const { A, B, C } = state.mixer;

    if (!A && !B && !C) {
        showModal('먼저 디자인을 구성하세요', '<p>슬롯에 DNA를 배정한 후 저장할 수 있습니다.</p>', [
            { label: '확인', primary: true }
        ]);
        return;
    }

    const base = A || B || C;
    const paletteSrc = B || A || C;
    const matSrc = C || A || B;

    showPromptModal('하이브리드 디자인 이름 입력', `Hybrid ${base.style_name.split(' ')[0]}`, (newName) => {
        const newDNA = {
            module_id: `USER_${Date.now()}`,
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

        const userDesigns = JSON.parse(localStorage.getItem('darlkom_user_designs') || '[]');
        userDesigns.unshift(newDNA);
        localStorage.setItem('darlkom_user_designs', JSON.stringify(userDesigns));

        loadLibrary();
        selectDNA(newDNA.module_id);
        showToast(`"${newName}" 저장 완료!`, '💾');
    });
};

window.copyPrompt = function(id) {
    const dna = state.library.find(d => d.module_id === id);
    if (!dna) return;

    let text = dna.image_prompt_one_line;
    if (!text || text.length < 10) {
        text = generatePromptFromDNA(dna);
    }
    secureCopy(text, "이미지 프롬프트");
};

window.copyJSON = function(id) {
    const dna = state.library.find(d => d.module_id === id);
    if (!dna) return;
    secureCopy(JSON.stringify(dna, null, 2), "DNA JSON");
};

function generatePromptFromDNA(dna) {
    const d = dna.design_dna || {};
    const colors = d.color_palette || {};
    const mood = (d.emotional_profile?.mood || []).join(', ');
    const tones = (d.tone_keywords || []).join(', ');
    const mat = d.materiality?.base || 'digital';
    const colorStr = `${colors.primary || ''} ${colors.secondary || ''} ${colors.accent || ''}`.trim();
    return `${dna.style_name} style, ${tones}, ${mood}, Colors: ${colorStr}, Material: ${mat}, high quality structured design, 8k resolution, architectural composition`;
}

function secureCopy(text, label) {
    const doFallback = () => {
        const ta = document.createElement('textarea');
        ta.value = text;
        Object.assign(ta.style, { top:0, left:0, position:'fixed', opacity:0 });
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        try {
            document.execCommand('copy');
            showToast(`${label} 복사됨!`, '📋');
        } catch { showToast('복사 실패. 수동으로 복사해주세요.', '✗'); }
        document.body.removeChild(ta);
    };
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
            .then(() => showToast(`${label} 복사됨!`, '📋'))
            .catch(doFallback);
    } else { doFallback(); }
}

// ── Timeline / Deck ───────────────────────────
function addToDeck(moduleId) {
    const dna = state.library.find(d => d.module_id === moduleId);
    if (!dna) return;
    state.deck.push({ id: moduleId, name: dna.style_name });
    renderDeck();
    showToast(`${dna.style_name} → Deck`, '🎬');
}

function removeFromDeck(index) {
    state.deck.splice(index, 1);
    renderDeck();
}

function renderDeck() {
    const timeline = document.getElementById('deck-timeline');
    if (!timeline) return;

    if (state.deck.length === 0) {
        timeline.innerHTML = '<div class="timeline-placeholder">DNA 카드를 여기에 드래그하여 슬라이드 덱 순서를 구성하세요</div>';
        return;
    }

    timeline.innerHTML = state.deck.map((d, i) => `
        <div class="timeline-chip">
            <span>${i + 1}. ${d.name}</span>
            <button class="remove-chip" onclick="removeFromDeck(${i})">×</button>
        </div>
    `).join('') + `<button class="btn-secondary" style="font-size:0.7rem;padding:4px 10px;margin-left:8px;" onclick="copyDeckSequence()">📋 시퀀스 복사</button>`;
}
window.removeFromDeck = removeFromDeck;

window.copyDeckSequence = function() {
    const text = state.deck.map((d, i) => `${i + 1}. ${d.name}`).join('\n');
    secureCopy(text, '덱 시퀀스');
};


// --- Event Listeners ---
function setupEventListeners() {
    // Search with debounce
    els.search.addEventListener('input', debouncedRenderLibrary);

    // Ctrl+K / Cmd+K shortcut
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            els.search.focus();
            els.search.select();
        }
        // Esc to close modal
        if (e.key === 'Escape') closeModal();
    });

    // Click outside modal to close
    document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
        if (e.target.id === 'modal-overlay') closeModal();
    });

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

    const existingBackBtn = container.querySelector('.anno-back-btn');
    const backBtnHtml = existingBackBtn ? '' : '';

    container.insertAdjacentHTML('beforeend', `
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
    `);

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

// ── Concept Prompts Integration ───────────────
const CONCEPT_DATA = {
    "A: Brand Film": { color: "#ff6b35", tag: "BRAND FILM" },
    "B: Documentary": { color: "#00c9ff", tag: "DOCUMENTARY" },
    "C: RPG Quest": { color: "#7cff6b", tag: "RPG QUEST" },
    "D: Magazine": { color: "#ff6bce", tag: "MAGAZINE" },
    "E: Classified": { color: "#ffd700", tag: "CLASSIFIED" }
};

let _conceptPrompts = null;

async function loadConceptPrompts() {
    if (_conceptPrompts) return _conceptPrompts;
    try {
        const res = await fetch('notebooklm_concept_prompts_v2.html');
        const html = await res.text();
        const match = html.match(/const CONCEPTS = (\{[\s\S]*?\n\});/);
        if (match) {
            _conceptPrompts = eval('(' + match[1] + ')');
            return _conceptPrompts;
        }
    } catch(e) { console.error('Failed to load concept prompts:', e); }
    return null;
}

let _promptsState = { tab: null, search: '' };

function renderPromptsView() {
    const container = document.getElementById('prompts-view');
    if (!container) return;
    if (container.dataset.rendered) return;
    container.dataset.rendered = '1';

    container.insertAdjacentHTML('beforeend', `
        <div class="concept-hero">
            <h1>Concept Infographic Prompts</h1>
            <p>슬라이드를 위한 5가지 크리에이티브 톤 — 각 100개 프롬프트, 클릭하면 복사됩니다</p>
        </div>

        <div class="concept-guide">
            <div class="concept-guide-title">어떤 톤의 슬라이드를 만들고 싶으세요? 카테고리를 클릭하거나 아래에서 검색하세요</div>
            <div class="concept-guide-grid" id="concept-guide-grid"></div>
        </div>

        <div class="concept-search">
            <span class="search-icon">🔍</span>
            <input type="text" id="concept-search" placeholder="예: Bauhaus, 흑백, 퀘스트, 타임라인, 네온, Rothko, 데이터...">
        </div>
        <div class="concept-popular-tags" id="concept-popular-tags"></div>
        <div class="concept-tabs" id="concept-tabs"></div>
        <div class="concept-toolbar">
            <div class="concept-count" id="concept-count"></div>
            <button class="btn-secondary" style="font-size:0.72rem;padding:6px 14px;" onclick="copyAllConceptPrompts()">📋 현재 탭 전체 복사</button>
        </div>
        <div class="concept-grid" id="concept-grid"></div>
    `);

    loadConceptPrompts().then(data => {
        if (!data) {
            container.querySelector('.concept-grid').innerHTML = '<p style="color:var(--text-muted);padding:2rem;">프롬프트 데이터를 불러올 수 없습니다.</p>';
            return;
        }

        const categories = Object.keys(data);

        // Build guide cards with descriptions
        const GUIDE_INFO = {
            "A": { icon: "🎬", title: "Brand Film", desc: "건축·디자인 거장의 미학으로 브랜드 스토리를 시각화", mood: "영감, 열망, 감동", example: "Bauhaus, Dieter Rams, 골드, 미니멀" },
            "B": { icon: "🎥", title: "Documentary", desc: "다큐멘터리 사진 감성으로 데이터와 팩트를 극적으로 전달", mood: "충격, 긴장, 진실", example: "흑백, 증언, 데이터, Salgado" },
            "C": { icon: "🎮", title: "RPG Quest", desc: "게임 UI/퀘스트 시스템으로 비즈니스 전략을 모험으로 표현", mood: "몰입, 성취, 도전", example: "HP바, 스킬트리, 보스, 레벨업" },
            "D": { icon: "📰", title: "Magazine", desc: "패션·라이프스타일 매거진 에디토리얼 감성의 세련된 레이아웃", mood: "욕망, 트렌드, 세련", example: "Vogue, 에디토리얼, 럭셔리, 트렌드" },
            "E": { icon: "🔒", title: "Classified", desc: "기밀 문서·암호화 미학으로 호기심과 긴박감 연출", mood: "호기심, 긴박, 미스터리", example: "REDACTED, 기밀, 암호, 코드명" }
        };

        const guideGrid = document.getElementById('concept-guide-grid');
        guideGrid.innerHTML = categories.map(cat => {
            const letter = cat.split(':')[0].trim();
            const info = GUIDE_INFO[letter] || {};
            const color = data[cat].color;
            return `<div class="concept-guide-card" style="border-color:${color}30" data-guide-cat="${cat}">
                <div class="concept-guide-icon" style="color:${color}">${info.icon} ${info.title}</div>
                <div class="concept-guide-desc">${info.desc}</div>
                <div class="concept-guide-mood"><span style="color:${color}">분위기:</span> ${info.mood}</div>
                <div class="concept-guide-example">검색 예시: ${info.example}</div>
            </div>`;
        }).join('');

        // Guide card click -> filter by that category
        guideGrid.querySelectorAll('.concept-guide-card').forEach(card => {
            card.addEventListener('click', () => {
                const cat = card.dataset.guideCat;
                _promptsState.tab = cat;
                _promptsState.search = '';
                const searchInput = document.getElementById('concept-search');
                if (searchInput) searchInput.value = '';
                // Update tab active state
                const tabsEl = document.getElementById('concept-tabs');
                tabsEl.querySelectorAll('.concept-tab').forEach(b => { b.classList.remove('active'); b.style.borderColor = 'transparent'; });
                const targetTab = tabsEl.querySelector(`[data-ct="${cat}"]`);
                if (targetTab) {
                    targetTab.classList.add('active');
                    targetTab.style.borderColor = data[cat]?.color || 'var(--accent)';
                }
                renderConceptCards(data);
                document.getElementById('concept-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });

        // Build popular search tags from actual prompt content
        const POPULAR_TAGS = ['Bauhaus', '흑백', '미니멀', '데이터', 'Rothko', '퀘스트', 'Salgado', '네온', '타임라인', '럭셔리', '기밀', 'Kandinsky', '인포그래픽'];
        const tagsEl = document.getElementById('concept-popular-tags');
        tagsEl.innerHTML = '<span class="popular-tags-label">자주 찾는 키워드:</span>' +
            POPULAR_TAGS.map(tag => `<button class="popular-tag" data-ptag="${tag}">${tag}</button>`).join('');
        tagsEl.querySelectorAll('.popular-tag').forEach(btn => {
            btn.addEventListener('click', () => {
                const searchInput = document.getElementById('concept-search');
                if (searchInput) { searchInput.value = btn.dataset.ptag; searchInput.dispatchEvent(new Event('input')); }
            });
        });

        // Build tabs
        const tabsEl = document.getElementById('concept-tabs');
        tabsEl.innerHTML = `<button class="concept-tab active" data-ct="all">전체 (${categories.reduce((s, c) => s + data[c].data.length, 0)})</button>` +
            categories.map(cat => `<button class="concept-tab" data-ct="${cat}" style="border-color:transparent">${cat.split(':')[0].trim()} (${data[cat].data.length})</button>`).join('');

        tabsEl.querySelectorAll('.concept-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                tabsEl.querySelectorAll('.concept-tab').forEach(b => { b.classList.remove('active'); b.style.borderColor = 'transparent'; });
                btn.classList.add('active');
                _promptsState.tab = btn.dataset.ct === 'all' ? null : btn.dataset.ct;
                if (_promptsState.tab) {
                    btn.style.borderColor = data[_promptsState.tab]?.color || 'var(--accent)';
                } else {
                    btn.style.borderColor = 'var(--accent)';
                }
                renderConceptCards(data);
            });
        });

        // Search
        document.getElementById('concept-search')?.addEventListener('input', (e) => {
            _promptsState.search = e.target.value.toLowerCase();
            renderConceptCards(data);
        });

        renderConceptCards(data);
    });
}

function renderConceptCards(data) {
    const grid = document.getElementById('concept-grid');
    const countEl = document.getElementById('concept-count');
    if (!grid) return;

    const categories = Object.keys(data);
    const activeCats = _promptsState.tab ? [_promptsState.tab] : categories;
    const search = _promptsState.search;
    let items = [];

    activeCats.forEach(cat => {
        const catData = data[cat];
        if (!catData) return;
        catData.data.forEach((text, i) => {
            if (search && !text.toLowerCase().includes(search)) return;
            items.push({ cat, text, index: i, color: catData.color, tag: catData.tag });
        });
    });

    if (countEl) countEl.innerHTML = `<b>${items.length}</b> prompts`;

    if (items.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:3rem;">검색 결과가 없습니다</div>';
        return;
    }

    grid.innerHTML = items.map(item => {
        const safeText = item.text.replace(/"/g, '&quot;').replace(/`/g, "'");
        return `
        <div class="concept-card" onclick="secureCopy(\`${item.text.replace(/`/g, "'")}\`, 'Prompt')">
            <div class="concept-accent" style="background:${item.color}"></div>
            <div class="concept-num">${String(item.index + 1).padStart(2, '0')}</div>
            <div style="flex:1">
                <div class="concept-tag" style="background:${item.color}22;color:${item.color}">${item.tag}</div>
                <div class="concept-text">${item.text}</div>
            </div>
        </div>`;
    }).join('');
}

window.copyAllConceptPrompts = function() {
    if (!_conceptPrompts) return;
    const categories = Object.keys(_conceptPrompts);
    const activeCats = _promptsState.tab ? [_promptsState.tab] : categories;
    const lines = [];
    activeCats.forEach(cat => {
        _conceptPrompts[cat]?.data.forEach((text, i) => {
            if (_promptsState.search && !text.toLowerCase().includes(_promptsState.search)) return;
            lines.push(`[${cat.split(':')[0].trim()}-${i + 1}] ${text}`);
        });
    });
    secureCopy(lines.join('\n\n'), `${lines.length}개 프롬프트`);
};

// ── Prompt-Mixer Bridge ───────────────────────
window.copyPromptWithMix = function(promptText) {
    const { A, B, C } = state.mixer;
    let mixDesc = '';
    if (A || B || C) {
        const parts = [];
        if (A) parts.push(`Structure: ${A.style_name}`);
        if (B) parts.push(`Palette: ${B.style_name}`);
        if (C) parts.push(`Material: ${C.style_name}`);
        mixDesc = `\n\n[Design DNA Mix: ${parts.join(' + ')}]`;
    }
    secureCopy(promptText + mixDesc, '프롬프트+DNA');
};

// Boot
document.addEventListener('DOMContentLoaded', init);
