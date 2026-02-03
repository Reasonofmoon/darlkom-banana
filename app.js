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
        const serverLibrary = data.styles_v2 || data.styles_001_100 || [];

        // Load User Designs from LocalStorage
        const userLibrary = JSON.parse(localStorage.getItem('darlkom_user_designs') || '[]');

        state.library = [...userLibrary, ...serverLibrary];
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
            // Special filter for user designs
            if (state.filter === 'user' && !dna.module_id.startsWith('USER_')) return false;
            // Normal filter
            if (state.filter !== 'user' && !role.includes(state.filter)) return false;
        }
        // Search Logic
        if (term) {
            const haystack = JSON.stringify(dna).toLowerCase();
            if (!haystack.includes(term)) return false;
        }
        return true;
    });

    filtered.forEach(dna => {
        const isUserFor = dna.module_id.startsWith('USER_');
        const item = document.createElement('div');
        item.className = `dna-item ${state.selection === dna.module_id ? 'selected' : ''} ${isUserFor ? 'user-dna' : ''}`;
        item.onclick = () => selectDNA(dna.module_id);
        
        // Thumbnail Logic (p5 instance later?)
        // For now, simple ID-based placeholder or p5 rendering
        const thumbID = `thumb-${dna.module_id}`;
        
        item.innerHTML = `
            <div class="dna-thumb" id="${thumbID}"></div>
            <div class="dna-info">
                <div class="dna-title">${dna.style_name}</div>
                <div class="dna-role">${isUserFor ? 'USER DESIGN' : dna.role_bucket}</div>
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

// Robust Copy Helper
function secureCopy(text, label) {
    // 1. Try Modern API
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            alert(`${label} copied to clipboard!`);
        }).catch(err => {
            console.warn("Clipboard API failed, trying fallback...", err);
            fallbackCopy(text, label);
        });
    } else {
        // 2. Direct Fallback
        fallbackCopy(text, label);
    }
}

function fallbackCopy(text, label) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    
    // Avoid scrolling to bottom
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.position = "fixed";
    
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            alert(`${label} copied! (Fallback)`);
        } else {
            alert(`Failed to copy ${label}. Manual copy required.`);
        }
    } catch (err) {
        console.error('Fallback copy failed', err);
        alert("Copy failed entirely. Check console.");
    }
    
    document.body.removeChild(textarea);
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
