// Darlkom v2.0 Controller
console.log("Darlkom v2.0 Workstation Initializing...");

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
    
    // Auto-select first item if available
    if (state.library.length > 0) {
        selectDNA(state.library[0].module_id);
    }
}

async function loadLibrary() {
    try {
        const res = await fetch('templates.json');
        const data = await res.json();
        // Support both v2 and legacy schemas if needed, but prefer v2
        state.library = data.styles_v2 || data.styles_001_100 || [];
        renderLibrary();
    } catch (e) {
        console.error("Failed to load library:", e);
        els.grid.innerHTML = `<div class="error">Failed to load DNA Module Database. Check console.</div>`;
    }
}

// --- Rendering ---
function renderLibrary() {
    els.grid.innerHTML = '';
    
    const term = els.search.value.toLowerCase();
    
    const filtered = state.library.filter(dna => {
        // Filter Logic
        if (state.filter !== 'all') {
            const role = (dna.role_bucket || '').toLowerCase();
            if (!role.includes(state.filter)) return false;
        }
        // Search Logic
        if (term) {
            const haystack = JSON.stringify(dna).toLowerCase();
            if (!haystack.includes(term)) return false;
        }
        return true;
    });

    filtered.forEach(dna => {
        const item = document.createElement('div');
        item.className = `dna-item ${state.selection === dna.module_id ? 'selected' : ''}`;
        item.onclick = () => selectDNA(dna.module_id);
        
        // Thumbnail Logic (p5 instance later?)
        // For now, simple ID-based placeholder or p5 rendering
        const thumbID = `thumb-${dna.module_id}`;
        
        item.innerHTML = `
            <div class="dna-thumb" id="${thumbID}"></div>
            <div class="dna-info">
                <div class="dna-title">${dna.style_name}</div>
                <div class="dna-role">${dna.role_bucket}</div>
            </div>
        `;
        
        els.grid.appendChild(item);

        // Async render thumbnail
        requestAnimationFrame(() => {
            if (window.RenderEngine) {
                window.RenderEngine.renderThumbnail(thumbID, dna);
            }
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

// Boot
document.addEventListener('DOMContentLoaded', init);
