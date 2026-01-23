const RenderEngine = {
    /**
     * Initializes the rendering context for a canvas element.
     * @param {HTMLCanvasElement} canvas 
     * @returns {CanvasRenderingContext2D}
     */
    init(canvas) {
        if (!canvas) return null;
        // Handle High DPI displays
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        return ctx;
    },

    /**
     * Helper to parse color strings
     */
    parseColor(color) {
        // Basic hex/name pass-through, could be enhanced
        if (!color) return '#333';
        return color.split(' ')[0]; // Handle "Color (Name)" format
    },

    /**
     * Main render function
     * @param {HTMLCanvasElement} canvas - Target canvas
     * @param {Object} dna - DNA Data Object
     */
    renderCanvas(canvas, dna) {
        const ctx = this.init(canvas);
        if (!ctx) return;

        const { width, height } = canvas.getBoundingClientRect();
        const palette = dna.palette || {};
        const bg = this.parseColor(palette.background) || '#111';
        const accent = this.parseColor(palette.accents?.[0]) || '#0ff';
        const secondary = this.parseColor(palette.accents?.[1]) || '#ff0';
        const fullReport = dna.full_report || '';

        // Clear and Set Background
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, width, height);

        // Determine Style Mode
        if (fullReport.includes('Grid') || fullReport.includes('グリッド') || fullReport.includes('Blueprint')) {
            this.drawGrid(ctx, width, height, accent, 40);
        } else if (fullReport.includes('Neon') || fullReport.includes('ネオン')) {
            this.drawNeon(ctx, width, height, accent, secondary);
        } else if (fullReport.includes('Noise') || fullReport.includes('Grain') || fullReport.includes('Lofi')) {
            this.drawNoise(ctx, width, height, bg);
        } else if (fullReport.includes('Dot') || fullReport.includes('ドット')) {
            this.drawDots(ctx, width, height, accent, 20);
        } else if (fullReport.includes('Marble') || fullReport.includes('Ink')) {
            this.drawMarble(ctx, width, height, accent);
        } else {
             // Default / Abstract
            this.drawAbstract(ctx, width, height, accent, secondary);
        }
    },

    /**
     * Hybrid Render Function
     */
    renderHybridCanvas(canvas, dnaA, dnaB) {
        const ctx = this.init(canvas);
        if (!ctx) return;
        
        const { width, height } = canvas.getBoundingClientRect();

        // Mix Colors
        const bgA = this.parseColor(dnaA.palette?.background) || '#000';
        const accentB = this.parseColor(dnaB.palette?.accents?.[0]) || '#fff';

        // 1. Draw Base (A) Background
        ctx.fillStyle = bgA;
        ctx.fillRect(0, 0, width, height);

        // 2. Draw A's Structure (Low Opacity)
        ctx.globalAlpha = 0.3;
        this.renderPattern(ctx, dnaA, width, height);
        
        // 3. Draw B's Structure (High Opacity, Blend Mode)
        ctx.globalAlpha = 0.7;
        ctx.globalCompositeOperation = 'screen'; // Additive blending for neon/tech feel
        this.renderPattern(ctx, dnaB, width, height, accentB);
        
        // Reset
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
        
        // 4. Glitch/Overlay Effect
        this.drawScanlines(ctx, width, height);
    },
    
    // --- Specific Pattern Drawers ---
    
    renderPattern(ctx, dna, width, height, overrideColor = null) {
        const fullReport = dna.full_report || '';
        const palette = dna.palette || {};
        const accent = overrideColor || this.parseColor(palette.accents?.[0]) || '#0ff';
        
        if (fullReport.includes('Grid') || fullReport.includes('Blueprint')) {
            this.drawGrid(ctx, width, height, accent, 30);
        } else if (fullReport.includes('Neon')) {
             this.drawNeon(ctx, width, height, accent, accent);
        } else if (fullReport.includes('Dot')) {
            this.drawDots(ctx, width, height, accent, 15);
        } else {
            this.drawAbstract(ctx, width, height, accent, accent);
        }
    },

    drawGrid(ctx, w, h, color, step) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;
        // Vertical
        for (let x = 0; x <= w; x += step) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
        }
        // Horizontal
        for (let y = 0; y <= h; y += step) {
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
        }
        ctx.stroke();
    },

    drawDots(ctx, w, h, color, step) {
        ctx.fillStyle = color;
        for (let x = 0; x <= w; x += step) {
            for (let y = 0; y <= h; y += step) {
                ctx.beginPath();
                ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    },

    drawNeon(ctx, w, h, c1, c2) {
        // Random neon lines/shapes
        const count = 5;
        ctx.shadowBlur = 15;
        ctx.lineWidth = 2;
        
        for(let i=0; i<count; i++) {
            ctx.strokeStyle = i % 2 === 0 ? c1 : c2;
            ctx.shadowColor = ctx.strokeStyle;
            
            ctx.beginPath();
            ctx.moveTo(Math.random() * w, Math.random() * h);
            ctx.bezierCurveTo(
                Math.random() * w, Math.random() * h,
                Math.random() * w, Math.random() * h,
                Math.random() * w, Math.random() * h
            );
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
    },
    
    drawNoise(ctx, w, h, bg) {
        // Simple noise imitation
        const iData = ctx.getImageData(0, 0, w, h);
        const buffer = iData.data;
        for (let i = 0; i < buffer.length; i += 4) {
            const noise = (Math.random() - 0.5) * 30;
            buffer[i] = Math.min(255, Math.max(0, buffer[i] + noise));
            buffer[i+1] = Math.min(255, Math.max(0, buffer[i+1] + noise));
            buffer[i+2] = Math.min(255, Math.max(0, buffer[i+2] + noise));
        }
        ctx.putImageData(iData, 0, 0);
    },

    drawMarble(ctx, w, h, accent) {
        // Fluid lines
        ctx.lineWidth = 1;
        ctx.strokeStyle = accent;
        ctx.globalAlpha = 0.5;
        
        for(let i=0; i<8; i++) {
            ctx.beginPath();
            let y = Math.random() * h;
            ctx.moveTo(0, y);
            for(let x=0; x<=w; x+=20) {
                 ctx.lineTo(x, y + Math.sin(x * 0.01 + i) * 50);
            }
            ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
    },

    drawAbstract(ctx, w, h, c1, c2) {
        ctx.fillStyle = c1;
        ctx.globalAlpha = 0.1;
        ctx.beginPath();
        ctx.arc(w/2, h/2, w/3, 0, Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        
        ctx.strokeStyle = c2;
        ctx.lineWidth = 2;
        ctx.strokeRect(w*0.1, h*0.1, w*0.8, h*0.8);
    },
    
    drawScanlines(ctx, w, h) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        for(let y=0; y<h; y+=4) {
            ctx.fillRect(0, y, w, 1);
        }
    }
};
