# Standard Operating Procedure: Presentation Slide DNA Fine-Tuning

## 1. Philosophy: The "Neo-Retro" Loop
To achieve professional-grade "Slide Deck DNA", we move beyond simple prompt engineering to a rigorous **"Generation → Discrimination → Correction"** loop.
We evaluate every slide DNA on two critical axes:
- **Style Fidelity**: Does it look like the intended artistic style?
- **Role Fitness**: Does it function as a presentation slide (Opening, Context, Structure)?

## 2. Evaluation Criteria (Score 0-10)

### Axis A: Style Fidelity (0-5)
- **Essential Elements (0-2)**: Are the core visual markers present?
- **No Forbidden Elements (0-2)**: Are glitches/artifacts/wrong styles absent?
- **Texture/Lighting (0-1)**: Is the "grain" or "material" correct?

### Axis B: Role Fitness (0-5)
- **Info Density (0-2)**: Is there appropriate negative space? (e.g., Thesis = 70% void).
- **Flow (0-2)**: Is the focal point clear and immediate?
- **Deck Consistency (0-1)**: Does it feel part of the globally defined deck universe?

**Scoring Actions:**
- **9-10**: Lock as "Master Preset".
- **7-8**: Fine-tune specific keywords (2-3 words).
- **0-6**: Structural Rewrite (Revisit Camera, Lighting, Layout rules).

## 3. Tuning Levers (The "4 Levers")
Only adjust these four variables to correct course:
1.  **Lock Level**: Strengthen `Must` / `Do Not` constraints.
2.  **Composition**: Define Camera angles, Layouts, and Focal points.
3.  **Material/Light**: Define the "Single Light Source" logic or specific Texture.
4.  **Deck DNA**: Re-inject Anchor Motifs or Palette Rules.

## 4. Operational Workflow (Batch Processing)
1.  **Generate v1**: Produce 1 sample image per DNA (e.g., Batch 001-010).
2.  **Judge**: Apply the 10-point checklist. Record score + 1-line failure reason.
    - *Example*: "001: Too clean, lacks personal notebook feel."
3.  **Diagnose**: Match failure to valid failure types (S1-S6):
    - S1: Too Clean (Needs imperfection)
    - S2: Too Complex (Needs negative space)
    - S3: Too Decorative (Needs constraint)
    - S4: Color Mismatch (Needs palette enforcement)
    - S5: Bad Layout (Needs slide composition rules)
    - S6: Broken Consistency (Needs anchor reinforcement)
4.  **Refine (v2/v3)**: Adjust purely based on diagnosis.
5.  **Finalize**: Save the "Locked Prompt" and "Negative Prompt".

## 5. Slide-Specific Prompt Engineering Tips
Include these phrases to ensure "Slide-Friendliness":
- `presentation slide background`
- `readable composition`, `ample whitespace for text`
- `clear focal area`, `no clutter`
- `leave 30-40% empty space on the right`

## 6. App Integration
The system expects:
- **Positive Prompt**: `image_prompt_one_line`
- **Negative Prompt**: `negative_prompt` (Optional, ensures purity)
- **Tuning Score**: `fidelity_score` (Optional metadata)
