// Darlkom v2.0 Render Engine (Hybrid: Canvas 2D + p5.js)

const RenderEngine = {
    // Current p5 instance
    currentP5: null,

    /**
     * Renders a lightweight thumbnail using native Canvas 2D (Performance optimized)
     */
    renderThumbnail: (containerId, dna) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Remove existing canvas
        container.innerHTML = '';
        
        const canvas = document.createElement('canvas');
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        const ctx = canvas.getContext('2d');
        container.appendChild(canvas);
        
        const d = dna.design_dna;
        const w = canvas.width;
        const h = canvas.height;
        
        // --- 1. Background (Palette) ---
        const bg = d.color_palette?.primary || '#111';
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);
        
        // --- 2. Form (Structure) ---
        const layout = d.layout_rules?.composition || 'grid';
        const accent = d.color_palette?.accent || '#f00';
        const secondary = d.color_palette?.secondary || '#fff';
        
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1;
        
        if (layout.includes('grid')) {
            // Grid Lines
            ctx.beginPath();
            for(let i=0; i<w; i+=20) { ctx.moveTo(i,0); ctx.lineTo(i,h); }
            for(let i=0; i<h; i+=20) { ctx.moveTo(0,i); ctx.lineTo(w,i); }
            ctx.globalAlpha = 0.2;
            ctx.stroke();
        } else if (layout.includes('central')) {
            // Circle
            ctx.beginPath();
            ctx.arc(w/2, h/2, w/4, 0, Math.PI*2);
            ctx.fillStyle = secondary;
            ctx.globalAlpha = 0.1;
            ctx.fill();
            ctx.globalAlpha = 1.0;
            ctx.stroke();
        } else {
            // Freeform / Organic
            ctx.beginPath();
            ctx.moveTo(0, h);
            ctx.bezierCurveTo(w/3, h/2, w*2/3, h, w, 0);
            ctx.stroke();
        }
        
        // --- 3. Text Placeholder ---
        ctx.font = '10px sans-serif';
        ctx.fillStyle = secondary;
        ctx.globalAlpha = 0.8;
        ctx.fillText(dna.style_name.substring(0, 10), 10, h-10);
    },

    /**
     * Renders the High-Fidelity Hybrid using p5.js in 4K resolution
     */
    renderHybrid: (containerId, dnaA, dnaB, dnaC) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Cleanup old p5 instance
        if (RenderEngine.currentP5) {
            RenderEngine.currentP5.remove();
        }

        const sketch = (p) => {
            // --- DNA Extraction ---
            // A: Structure (Layout, Shapes)
            // B: Palette (Colors)
            // C: Material (Texture, Grain, Line Feel)
            
            // Fallbacks
            const struct = dnaA?.design_dna?.layout_rules || { composition: 'central' };
            const shape = dnaA?.design_dna?.line_shape || { line_style: 'geometric' };
            
            const palette = dnaB?.design_dna?.color_palette || { primary:'#111', secondary:'#fff', accent:'#f00' };
            
            const material = dnaC?.design_dna?.materiality || { texture: [] };
            const emotion = dnaC?.design_dna?.emotional_profile || {};

            p.setup = () => {
                // Responsive Size
                const w = container.clientWidth;
                const h = container.clientHeight; // Aspect ratio check?
                p.createCanvas(w, h);
                p.pixelDensity(2); // High res
                p.noLoop();
                
                // Defaults
                p.background(palette.primary);
            };

            p.draw = () => {
                const w = p.width;
                const h = p.height;
                
                // Color Setup
                const cPrim = p.color(palette.primary);
                const cSec = p.color(palette.secondary);
                const cAcc = p.color(palette.accent);
                
                // --- LAYER 1: FORM (From A) ---
                p.strokeWeight(1);
                
                // Stroke Style (From C - Material influence on Line)
                if (shape.line_style === 'hand-drawn' || emotion.mood?.includes('personal')) {
                     // Hand drawn feel simulation could go here
                }

                if (struct.composition.includes('grid')) {
                    drawBauhausGrid(p, w, h, cSec, cAcc);
                } else if (struct.composition.includes('flow') || struct.composition.includes('organic')) {
                    drawOrganicFlow(p, w, h, cSec, cAcc);
                } else if (struct.composition.includes('central')) {
                     drawCentralGlow(p, w, h, cSec, cAcc);
                } else {
                    // Default fallback
                     drawAbstractShapes(p, w, h, cSec, cAcc);
                }
                
                // --- LAYER 2: TEXTURE (From C) ---
                if (material.texture.some(t => t.includes('grain') || t.includes('paper'))) {
                    applyGrain(p, 0.15);
                }
                if (material.texture.some(t => t.includes('glitch') || t.includes('digital'))) {
                    applyScanlines(p);
                }
            };
            
            // --- Helper Functions (Generative Patterns) ---
            
            function drawBauhausGrid(p, w, h, cSec, cAcc) {
                const cols = 12;
                const rows = 8;
                const cellW = w / cols;
                const cellH = h / rows;
                
                p.stroke(cSec);
                p.noFill();
                
                for(let x=0; x<cols; x++) {
                    for(let y=0; y<rows; y++) {
                        // Random Bauhaus Shapes
                        const r = p.random();
                        p.push();
                        p.translate(x*cellW, y*cellH);
                        if (r > 0.8) {
                             p.fill(cAcc);
                             p.rect(0,0, cellW, cellH);
                        } else if (r > 0.6) {
                             p.line(0,0, cellW, cellH);
                        } else if (r > 0.5) {
                             p.ellipse(cellW/2, cellH/2, cellW * 0.8);
                        }
                        p.pop();
                    }
                }
            }
            
            function drawOrganicFlow(p, w, h, cSec, cAcc) {
                p.noFill();
                p.stroke(cSec);
                p.strokeWeight(2);
                
                for(let i=0; i<5; i++) {
                    p.beginShape();
                    for(let x=0; x<=w; x+=20) {
                        const n = p.noise(x * 0.005, i * 0.1);
                        const y = p.map(n, 0, 1, h*0.2, h*0.8);
                        p.vertex(x, y);
                    }
                    p.endShape();
                }
                
                // Accent blobs
                p.noStroke();
                p.fill(cAcc);
                p.globalAlpha = 0.2;
                p.ellipse(w*0.8, h*0.2, 200);
                p.globalAlpha = 1.0;
            }
            
            function drawCentralGlow(p, w, h, cSec, cAcc) {
                 // Cyberpunk/Central style
                 p.stroke(cAcc);
                 p.noFill();
                 p.translate(w/2, h/2);
                 for(let i=0; i<10; i++) {
                     p.rotate(p.PI / 5);
                     p.rectMode(p.CENTER);
                     p.rect(0, 0, w*0.4, h*0.4);
                 }
            }
            
            function drawAbstractShapes(p, w, h, cSec, cAcc) {
                p.background(cSec); // Invert?
            }

            function applyGrain(p, opacity) {
                p.loadPixels();
                const d = p.pixelDensity();
                const total = 4 * (p.width * d) * (p.height * d);
                for (let i = 0; i < total; i += 4) {
                    const grain = p.random(-20, 20);
                    p.pixels[i] = p.pixels[i] + grain;
                    p.pixels[i+1] = p.pixels[i+1] + grain;
                    p.pixels[i+2] = p.pixels[i+2] + grain;
                }
                p.updatePixels();
            }
            
            function applyScanlines(p) {
                p.fill(0, 50);
                p.noStroke();
                for(let y=0; y<p.height; y+=4) {
                    p.rect(0, y, p.width, 1);
                }
            }
        };

        RenderEngine.currentP5 = new p5(sketch, containerId);
    },
    
    download: () => {
         if (RenderEngine.currentP5) {
             RenderEngine.currentP5.save('darlkom_v2_design.png');
         } else {
             alert("No design generated yet.");
         }
    }
};

window.RenderEngine = RenderEngine;
