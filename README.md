# Darlkom v2.0 - Design DNA Workstation

**Darlkom** (formerly Slide DNA Architect) is a professional-grade **Design DNA Workstation** for extracting, analyzing, and synthesizing presentation aesthetics.

> **v2.0 Major Upgrade**: Moved from a "Gallery" interface to a "Pro Dashboard" with deep generative capabilities.

![System Badge](https://img.shields.io/badge/System-Darlkom%20v2.0-blue)
![Engine](https://img.shields.io/badge/Engine-p5.js%20Generative-pink)
![UI](https://img.shields.io/badge/UI-Professional%20Workstation-zinc)

## ⚡ What's New in v2.0
1.  **Pro Workstation UI**: A layout inspired by IDEs and Video Editors (Sidebar / Canvas / Inspector).
2.  **3-Way DNA Hybridizer**: Synthesize unique designs by combining **Structure (A) + Palette (B) + Material (C)**.
3.  **Deep DNA Schema**: Granular control over 6 genes: `Form`, `Color`, `Material`, `Line`, `Typography`, `Emotion`.
4.  **Generative Art Engine**: Powered by **p5.js Instance Mode** for high-fidelity noise, grain, and geometric masking.

## 🛠 Usage
### 1. Installation
This is a client-side web application. No build step required (Vanilla JS + CDN).
```bash
# Recommended: Run with a local server for JSON fetching
npx serve .
# OR
python -m http.server
```

### 2. The Workflow
1.  **Browse**: Explore the **DNA Library** in the center panel. Use filters or search.
2.  **Inspect**: Click any DNA to see its deep genetic code in the **Right Inspector**.
3.  **Mix**: Drag and drop DNA into the **Hybridizer Slots (A, B, C)**.
    *   **Slot A (Structure)**: Defines layout grids and shapes.
    *   **Slot B (Palette)**: Defines color harmony and mood.
    *   **Slot C (Material)**: Defines texture, grain, and line feel.
4.  **Export**: Click `Synthesize` to generate a 4K p5.js render, then `Export PNG`.

## 🧬 The Deep DNA Schema
Darlkom v2.0 uses a MECE (Mutually Exclusive, Collectively Exhaustive) schema:
*   **Form**: Composition ratio, whitespace, reading flow.
*   **Color**: Primary, Secondary, Accent, specific usage rules.
*   **Material**: Base material (paper, glass), texture overlay (grain, glitch).
*   **Line**: Stroke weight, geometric vs organic.
*   **Typography**: Serif vs Sans, mood, weight.
*   **Emotion**: Keywords for the generative seed.

## 📂 Project Structure
*   `index.html`: The Workbench UI.
*   `app.js`: The central controller (State Management, Mixer Logic).
*   `RenderEngine.js`: The p5.js Generative Art Module.
*   `style.css`: The "Zinc/Slate" Dark Mode Design System.
*   `templates.json`: The Deep DNA Database.

## 📜 Credits
*   **Developer**: Reasonofmoon (Moon)
*   **Architecture**: Antigravity Agent
*   **Engine**: p5.js
*   **Icons**: Lucide
