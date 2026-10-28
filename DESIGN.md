# Design Direction: NgaRingApi

> **Reading this as:** Local-first API IDE & testing environment for developers, in a precision dark-technical aesthetic with cyber-cyan & obsidian palette, dial ENERGY 2 / RHYTHM 1 / MOTION 1.

---

## 1. Brand Identity & Character

- **Product Name:** NgaRingApi
- **Tagline:** Local-first, git-friendly API IDE and client for modern developers.
- **Personality:** Precision-engineered, swift, focused, distraction-free, privacy-first.
- **Core Visual Metaphor:** The "NgaRing" — a continuous orbital ring representing the API request-response loop, local packet velocity, and unbroken connection, centered around a sharp geometric monogram.

---

## 2. Iconography & Mascot System

- **App Icon & Logo:**
  - An interlocking orbital ring framing a stylized geometric "N" / "R" signal node.
  - Radiant electric cyan (`#00F0FF`) transitioning to deep sapphire (`#0284C7`), set on deep obsidian.
  - Crisp at all scale factors (16x16, 24x24, 32x32, 48x48, 64x64, 128x128, 256x256, 1024x1024).
- **In-App Icons:**
  - Modern 1.5px stroke precision vectors.
  - Clear functional relevance: arrows guide action, dots show status, badges define HTTP methods.
  - Zero generic decorative sparkles, orbs, or floating blobs.

---

## 3. Color Architecture & Tokens

- **Core Palette (Strict 3 Colors + 1 Accent - R-29):**
  - **Neutral Base:** Obsidian Slate (`#0D1117` dark, `#FFFFFF` light)
  - **Neutral Elevated:** Charcoal Surface (`#161B22` mantle, `#21262D` surface0)
  - **Border & Structure:** Subdued Slate (`#30363D` border, `#484F58` divider)
  - **Primary Brand Accent:** Electric Cyan (`#00F0FF` / `#06B6D4` / `#0284C7`)
- **HTTP Method Tokens:**
  - **GET:** Emerald Green (`#10B981` / `hsl(145, 65%, 45%)`)
  - **POST:** Electric Cyan (`#06B6D4` / `hsl(190, 85%, 48%)`)
  - **PUT:** Amber Sun (`#F59E0B` / `hsl(38, 92%, 50%)`)
  - **DELETE:** Rose Coral (`#F43F5E` / `hsl(350, 89%, 60%)`)
  - **PATCH:** Amethyst Violet (`#A855F7` / `hsl(270, 75%, 65%)`)
- **Accessibility Guarantee (R-25, R-34):**
  - All text meets WCAG AA 4.5:1 minimum contrast.
  - Light mode uses deep ocean-teal accents ensuring 5.2:1 contrast against pure white.

---

## 4. Typography & Spacing

- **Interface Sans:** Inter / System UI stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`).
- **Code & Request Mono:** JetBrains Mono / Fira Code / Monaco / monospace fallback.
- **Rhythm & Elevation:**
  - Sharp, compact borders (3px - 6px border radius, strictly avoiding generic pill-shapes for panels).
  - Subtle 1px borders for structure instead of heavy floating shadows.

---

## 5. Antislop Dials

| Dial | Level | Implementation Rationale |
|---|---|---|
| **ENERGY** | **2 (Balanced)** | Purposeful technical developer aesthetic; sharp high-contrast accents at interactive focal points; zero random gradients. |
| **RHYTHM** | **1 (Uniform)** | Predictable, ergonomic IDE panel structure (Sidebar -> Tabs -> Editor -> Response) optimized for developer speed. |
| **MOTION** | **1 (Calm)** | Snappy 120-150ms transitions on state toggles; instant typing response in CodeMirror; zero distracting floating/parallax. |
