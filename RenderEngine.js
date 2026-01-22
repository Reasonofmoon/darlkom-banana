const RenderEngine = {
    /**
     * Translates DNA data into CSS styles for real-time rendering.
     * @param {Object} dna - The DNA template object.
     * @returns {Object} cssObject - Containing background, filter, and other styles.
     */
    generateStyles(dna) {
        const palette = dna.palette || {};
        const bg = palette.background || '#0a0a0a';
        const accent = (palette.accents && palette.accents.length > 0) ? palette.accents[0].split(' ')[0] : '#00ffff';
        const fullReport = dna.full_report || '';

        let backgroundStyle = bg;
        let overlayFilter = 'none';
        let patternType = 'none';

        // Detect Pattern Type from full_report
        if (fullReport.includes('グリッド') || fullReport.includes('Grid')) {
            patternType = 'grid';
            backgroundStyle = `
                linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px),
                ${bg}
            `;
        } else if (fullReport.includes('ノイズ') || fullReport.includes('Grain')) {
            patternType = 'grain';
            overlayFilter = 'contrast(150%) brightness(100%)';
        } else if (fullReport.includes('ネオン') || fullReport.includes('Neon')) {
            patternType = 'neon';
            backgroundStyle = `radial-gradient(circle at 50% 50%, ${accent}33 0%, ${bg} 100%)`;
        } else if (fullReport.includes('ドット') || fullReport.includes('Dots')) {
            patternType = 'dots';
            backgroundStyle = `
                radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                ${bg}
            `;
        }

        return {
            background: backgroundStyle,
            filter: overlayFilter,
            pattern: patternType,
            backgroundSize: patternType === 'grid' ? '40px 40px' : (patternType === 'dots' ? '20px 20px' : 'auto'),
            accentColor: accent
        };
    },

    /**
     * Applies the generated styles to a target element.
     * @param {HTMLElement} element - The target element to render onto.
     * @param {Object} dna - The DNA template object.
     */
    render(element, dna) {
        if (!element || !dna) return;
        const styles = this.generateStyles(dna);
        
        element.style.backgroundColor = ''; // Clear default
        element.style.backgroundImage = styles.background;
        element.style.backgroundSize = styles.backgroundSize;
        element.style.filter = styles.filter;
        element.dataset.pattern = styles.pattern;
        
        // Add additional effects based on pattern
        if (styles.pattern === 'neon') {
            element.style.boxShadow = `inset 0 0 50px ${styles.accentColor}33`;
        } else {
            element.style.boxShadow = 'none';
        }
    },

    /**
     * Mixes two sets of DNA for a hybrid render.
     */
    renderHybrid(element, dnaA, dnaB) {
        if (!element || !dnaA || !dnaB) return;
        const stylesA = this.generateStyles(dnaA);
        const stylesB = this.generateStyles(dnaB);

        // Blinking Hybrid Logic: Blend background of A with accent/pattern of B
        const hybridBackground = `
            linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),
            ${stylesA.background}
        `;
        
        element.style.backgroundImage = hybridBackground;
        element.style.borderColor = stylesB.accentColor;
        element.style.boxShadow = `0 0 30px ${stylesB.accentColor}44`;
        
        // Add a "glitch" overlay if B is tech/neon
        if (stylesB.pattern === 'neon' || stylesB.pattern === 'grid') {
            element.classList.add('hybrid-glitch');
        } else {
            element.classList.remove('hybrid-glitch');
        }
    }
};
