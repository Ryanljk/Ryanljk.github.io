# CLAUDE.md — Portfolio Project

## Project Overview
A personal portfolio website built as a single-page application (SPA).

**Tech Stack:**
- React 18+
- Tailwind CSS
- Vite (bundler)

## Getting Started
```bash
npm install
npm run dev       # Start dev server
npm run build     # Production build
npm run preview   # Preview production build
```

## Project Structure
```
portfolio/
├── public/              # Static assets (images, favicon)
├── src/
│   ├── components/      # Reusable UI components
│   ├── sections/        # Page sections (Hero, About, Projects, Contact)
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Helper functions
│   ├── assets/          # Images, fonts, SVGs
│   ├── App.jsx          # Root component
│   └── main.jsx         # Entry point
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

## Design System
<!-- Fill in your design tokens here -->
- **Colors:** <!-- primary, secondary, accent, background, text -->
- **Typography:** <!-- font families, sizes, weights -->
- **Spacing:** <!-- base unit, scale -->
- **Breakpoints:** <!-- sm, md, lg, xl, 2xl values -->

---

## 🎨 Artistic Vision

<!-- ================================================================== -->
<!-- WRITE YOUR CREATIVE DIRECTION BELOW                                -->
<!-- This section guides all visual and interaction decisions.           -->
<!-- The more detail you provide, the closer the result to your vision. -->
<!-- ================================================================== -->

### Mood & Aesthetic
<!-- What feeling should visitors get? Example: "calm and minimal", "bold and energetic", "dark and moody" -->
1. Midnight sky with pixelated stars twinkling
2. Calm and Minimal vibe
3. Midnight sky should have a gentle gradient
4. Waves flowing that cover the bottom third of the page. The waves should undulate gently, like how waves act in real life

### Color Direction
<!-- Any specific colors, palettes, or color moods you want? References welcome. -->
1. Dark Blue (sky)
2. White (stars)
3. Light Blue (waves)

### Typography Feel
<!-- Example: "clean sans-serif", "editorial serif", "monospace hacker vibe" -->
1. Pixelated fonts

### Layout & Composition
<!-- Do you prefer lots of whitespace? Dense layouts? Full-bleed sections? Grid-based? -->
1. For all assets, ensure they can scale appropriately with screen size to be readable

### Animation & Interaction
<!-- Subtle fades? Bold transitions? Scroll-triggered effects? None? -->
1. Subtle, but fast

### References & Inspiration
<!-- Links to sites, designs, or visuals that capture what you want. URLs, screenshots, or descriptions all work. -->

### What to Avoid
<!-- Things you definitely do NOT want. Example: "no carousels", "no stock photos", "no gradients" -->
1. Transitions that last too long

### Anything Else
<!-- Any other creative instructions, vibes, or constraints. -->

---

## Components
<!-- Add component conventions as you build -->
- Prefer functional components with hooks
- Keep components in `src/components/`
- Use Tailwind utility classes; avoid custom CSS unless necessary
- Name files in PascalCase: `ProjectCard.jsx`
- Flow is as follows: Hero -> Gallery -> AboutMe/MyProjects
- Page transitions are standardised: `300ms ease-in-out` on transform + opacity.
  - Forward (in arrow direction): current page slides out left (`translate-x-[-50vw]`), next page enters from right (`+50vw` -> 0).
  - Back (`< back`): current page slides out right (`+50vw`), previous page enters from left (`-50vw` -> 0).
  - Implement with `entered`/`leaving` state: mount at the off-screen position, flip to `entered` via `requestAnimationFrame`, animate out before calling `onBack`/`onNavigate` after ~300ms.

## Deployment
<!-- Update once deployment is configured -->
- Build output: `dist/`
- Target: <!-- Vercel / Netlify / GitHub Pages / custom -->
