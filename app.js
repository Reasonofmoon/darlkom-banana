let dnaData = [];
let filteredData = [];

// Initialize Lucide icons
lucide.createIcons();

// Elements
const grid = document.getElementById('dna-grid');
const searchInput = document.getElementById('dna-search');
const templateCount = document.getElementById('template-count');
const filterChips = document.querySelectorAll('.chip');
const modal = document.getElementById('dna-modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.querySelector('.close-modal');

// Load Data
async function loadData() {
    try {
        const response = await fetch('templates.json');
        dnaData = await response.json();
        
        // Remove duplicates and normalize
        // (The extraction script might have picked up some overlaps)
        dnaData = Array.from(new Set(dnaData.map(d => d.title)))
            .map(title => dnaData.find(d => d.title === title));
            
        filteredData = [...dnaData];
        templateCount.innerText = dnaData.length;
        renderGrid(filteredData);
        populateMixerOptions();
    } catch (error) {
        console.error("Error loading DNA templates:", error);
        grid.innerHTML = `<div class="error">Failed to load DNA repository. Please run the extraction script.</div>`;
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
            <div class="tag">#${dna.id.toString().padStart(2, '0')} DNA</div>
            <h3>${dna.title}</h3>
            <p class="tone">${dna.tone ? dna.tone : 'Premium design aesthetic'}</p>
            <div class="palette-preview">
                <div class="color-dot" style="background: ${bg}" title="Background: ${bg}"></div>
                <div class="color-dot" style="background: ${text}" title="Text: ${text}"></div>
                ${accents.map(c => `<div class="color-dot" style="background: ${c}" title="Accent: ${c}"></div>`).join('')}
            </div>
            <div class="actions">
                <button class="btn btn-secondary view-btn" onclick="openDnaPortal(${dna.id})">ANALYZE</button>
                <button class="btn btn-primary" onclick="copyPrompt('${dna.prompt.replace(/'/g, "\\'")}')">COPY PROMPT</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Global Filter Logic
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    filteredData = dnaData.filter(dna => 
        dna.title.toLowerCase().includes(term) || 
        dna.tone.toLowerCase().includes(term) ||
        dna.prompt.toLowerCase().includes(term)
    );
    renderGrid(filteredData);
});

filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const filter = chip.dataset.filter;
        
        if (filter === 'all') {
            filteredData = [...dnaData];
        } else {
            // Simple mapping for tags - enhanced for the 101+ templates
            filteredData = dnaData.filter(dna => {
                const title = dna.title.toLowerCase();
                if (filter === 'tech') return title.includes('tech') || title.includes('cyber') || title.includes('web3') || title.includes('minimal');
                if (filter === 'art') return title.includes('art') || title.includes('museum') || title.includes('ukiyo') || title.includes('bauhaus');
                if (filter === 'nature') return title.includes('aurora') || title.includes('storm') || title.includes('ice') || title.includes('flower');
                if (filter === 'brand') return title.includes('apple') || title.includes('tesla') || title.includes('hermes') || title.includes('lego');
                return true;
            });
        }
        renderGrid(filteredData);
    });
});

// Modal Logic
function openDnaPortal(id) {
    const dna = dnaData.find(d => d.id === id);
    if (!dna) return;
    
    modalBody.innerHTML = `
        <div class="modal-header">
            <span class="dna-id">GFIMS DNA v3.5-0${dna.id}</span>
            <h2>${dna.title}</h2>
        </div>
        <div class="dna-detail-grid">
            <div class="dna-section">
                <h4>Vibe & Tone</h4>
                <p>${dna.tone}</p>
            </div>
            <div class="dna-section">
                <h4>Color Palette Configuration</h4>
                <div class="palette-list">
                    <div class="palette-item"><span class="color-swatch" style="background:${dna.palette.background}"></span> Background: ${dna.palette.background}</div>
                    <div class="palette-item"><span class="color-swatch" style="background:${dna.palette.text}"></span> Main Text: ${dna.palette.text}</div>
                    ${dna.palette.accents.map(c => `<div class="palette-item"><span class="color-swatch" style="background:${c}"></span> Accent: ${c}</div>`).join('')}
                </div>
            </div>
            <div class="dna-section full-width">
                <h4>Optimized Agentic Prompt</h4>
                <div class="prompt-box">
                    <code>${dna.prompt}</code>
                    <button class="copy-btn-inner" onclick="copyPrompt('${dna.prompt.replace(/'/g, "\\'")}')">COPY</button>
                </div>
            </div>
            <div class="dna-section full-width">
                <h4>Structural Analysis (MD)</h4>
                <pre class="md-preview">${dna.full_report}</pre>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

closeModal.onclick = () => modal.style.display = 'none';
window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

// Copy to Clipboard
function copyPrompt(text) {
    if (!text) return alert("No prompt available for this DNA.");
    navigator.clipboard.writeText(text).then(() => {
        const btn = event.target;
        const originalText = btn.innerText;
        btn.innerText = 'COPIED!';
        btn.style.background = '#00ff00';
        btn.style.color = '#000';
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = '';
            btn.style.color = '';
        }, 2000);
    });
}

// DNA Mixer / Hybridizer
function populateMixerOptions() {
    const selectA = document.getElementById('select-a');
    const selectB = document.getElementById('select-b');
    
    const optionsHtml = dnaData.slice(0, 50).map(dna => `<div class="option" data-id="${dna.id}">${dna.title}</div>`).join('');
    
    selectA.onclick = () => toggleDropdown('select-a');
    selectB.onclick = () => toggleDropdown('select-b');
}

let activeSlot = null;
function toggleDropdown(slotId) {
    const slot = document.getElementById(slotId);
    if (activeSlot === slotId) {
        // Close
        const existingList = slot.querySelector('.options-list');
        if (existingList) existingList.remove();
        activeSlot = null;
    } else {
        // Open
        const list = document.createElement('div');
        list.className = 'options-list';
        list.innerHTML = dnaData.map(dna => `<div class="option" onclick="selectOption('${slotId}', ${dna.id})">${dna.title}</div>`).join('');
        slot.appendChild(list);
        activeSlot = slotId;
    }
}

let selectedA = null;
let selectedB = null;

window.selectOption = (slotId, id) => {
    const dna = dnaData.find(d => d.id === id);
    const slot = document.getElementById(slotId);
    slot.innerText = dna.title;
    if (slotId === 'select-a') selectedA = dna;
    else selectedB = dna;
    
    // Close list
    const list = slot.querySelector('.options-list');
    if (list) list.remove();
    activeSlot = null;
};

document.getElementById('mix-dna-btn').onclick = () => {
    if (!selectedA || !selectedB) return alert("Please select two DNA styles to mix.");
    
    const output = document.getElementById('hybrid-output');
    output.classList.add('visible');
    
    // Combinational Logic:
    // Core structure from A + Vibe/Colors from B
    const hybridTitle = `${selectedA.title} × ${selectedB.title} Hybrid`;
    const hybridTone = `${selectedA.tone}, infused with ${selectedB.tone}`;
    const hybridBg = selectedA.palette.background;
    const hybridAccents = [...new Set([...selectedA.palette.accents, ...selectedB.palette.accents])].slice(0, 3);
    
    const hybridPrompt = `A stunning hybrid visualization combining the structure of ${selectedA.title} with the atmosphere and color palette of ${selectedB.title}. Features: ${selectedA.tone}, ${selectedB.tone}. Background: ${hybridBg}. Accents: ${hybridAccents.join(', ')}. High fidelity, cinematic lighting, 8k.`;

    output.innerHTML = `
        <div class="hybrid-card">
            <div class="hybrid-badge">NEW DNA SYNTHESIZED</div>
            <h3>${hybridTitle}</h3>
            <div class="hybrid-details">
                <div class="hybrid-tones">${hybridTone}</div>
                <div class="hybrid-palette">
                    ${[hybridBg, ...hybridAccents].map(c => `<div class="color-dot" style="background:${c}"></div>`).join('')}
                </div>
                <div class="hybrid-prompt-box">
                    <code>${hybridPrompt}</code>
                    <button onclick="copyPrompt('${hybridPrompt.replace(/'/g, "\\'")}')">COPY HYBRID PROMPT</button>
                </div>
            </div>
        </div>
    `;
    output.scrollIntoView({ behavior: 'smooth' });
};

loadData();
