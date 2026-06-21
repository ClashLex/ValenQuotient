# ValenQuotient — Optimization Action Plan

> PromptWars Virtual 2026 | Evaluation Parameters: Code Quality · Security · Efficiency · Testing · Accessibility

---

## 1. CODE QUALITY

### High Priority

- [ ] Rename `NFTModal.tsx` → `AdvisoryModal.tsx` and update all imports — the current name is a dead giveaway of template origin
- [ ] Add `eslint` + `prettier` config if not already present (`eslint-plugin-react`, `eslint-plugin-react-hooks`, `@typescript-eslint/eslint-plugin`)
- [ ] Enforce strict TypeScript — set `"strict": true` in `tsconfig.json`, eliminate all `any` types
- [ ] Break down large components — if `App.tsx` is handling routing + state + layout, extract them into separate concerns
- [ ] Use consistent naming conventions — all components PascalCase, all hooks `useXxx`, all utils camelCase
- [ ] Add JSDoc comments to calculator logic functions (footprint computation, emission coefficients)

### Medium Priority

- [ ] Move hardcoded emission constants (IPCC values) into a dedicated `src/constants/emissions.ts` file
- [ ] Use `React.memo` on static UI components (cards, nav items) to avoid unnecessary re-renders
- [ ] Replace any magic numbers in calculator logic with named constants

---

## 2. SECURITY

### High Priority

- [ ] Audit `.env.example` — ensure no real API keys were committed to the repo at any point (check git history with `git log -p`)
- [ ] Add a `Content-Security-Policy` header in Cloudflare Pages settings (Dashboard → Pages → Custom Headers)
- [ ] Sanitize any user inputs in the calculator sliders and pledge form — even client-side, never trust raw input
- [ ] Ensure no `dangerouslySetInnerHTML` usage anywhere in components

### Medium Priority

- [ ] Add `X-Frame-Options: DENY` and `X-Content-Type-Options: nosniff` headers via `public/_headers` file in Cloudflare Pages
- [ ] Review all external CDN/font dependencies (Google Fonts, etc.) for subresource integrity (SRI) hashes

### `public/_headers` example to add:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## 3. EFFICIENCY

### High Priority

- [ ] Run `npm run build` and check bundle size — target under 500KB gzipped
- [ ] Enable code splitting via React lazy loading for each view section:
  ```tsx
  const GapMatrix = React.lazy(() => import('./components/AboutSection'));
  ```
- [ ] Wrap lazy-loaded routes in `<Suspense fallback={<LoadingSpinner />}>`
- [ ] Optimize images in `public/images/` — convert `commute.png`, `diet.png`, `energy.png` to `.webp` format (use Squoosh or `sharp`)
- [ ] Add `loading="lazy"` to all `<img>` tags

### Medium Priority

- [ ] Memoize expensive calculator computations with `useMemo`
- [ ] Debounce slider `onChange` handlers to avoid firing on every pixel move
- [ ] Check if grain-noise canvas overlay is re-rendering on every frame — move to a one-time draw or CSS approach if possible
- [ ] Add `vite-plugin-compression` to generate `.gz` / `.br` files for Cloudflare to serve

---

## 4. TESTING

### High Priority

- [ ] Install Vitest + React Testing Library:
  ```bash
  npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
  ```
- [ ] Write unit tests for carbon calculation logic — this is the core of the app and easiest to test:
  ```
  src/__tests__/emissions.test.ts
  ```
  Test cases: transport kg/CO₂ per km, dietary emission scores, energy consumption coefficients
- [ ] Add at least one component render test for `HeroSection` and `CollectionSection`
- [ ] Add `"test": "vitest"` script to `package.json`

### Medium Priority

- [ ] Write a smoke test that verifies the app renders without crashing
- [ ] Test edge cases in calculator — zero values, max slider values, switching between categories
- [ ] Add `vitest.config.ts` with coverage reporting enabled

### Example test structure:

```
src/
└── __tests__/
    ├── emissions.test.ts       # Pure logic unit tests
    ├── HeroSection.test.tsx    # Component render test
    └── Calculator.test.tsx     # Slider + output integration test
```

---

## 5. ACCESSIBILITY

### High Priority

- [ ] Add `alt` text to all images — `commute.png`, `diet.png`, `energy.png` and any icons used as images
- [ ] Ensure all interactive elements (sliders, buttons, nav tabs) are keyboard-navigable (Tab + Enter/Space)
- [ ] Add `aria-label` to icon-only buttons and nav items
- [ ] Check color contrast ratios — neon-on-dark themes often fail WCAG AA (4.5:1 minimum). Use [https://webaim.org/resources/contrastchecker/](https://webaim.org/resources/contrastchecker/)
- [ ] Add `<html lang="en">` to `index.html` if not already present
- [ ] Ensure slider inputs have associated `<label>` elements with `htmlFor`

### Medium Priority

- [ ] Add `role="main"` to the primary content wrapper
- [ ] Add `aria-live="polite"` to the AI Footprint Diagnostic result area so screen readers announce updates
- [ ] Add `prefers-reduced-motion` CSS media query to disable grain-noise animation and heavy transitions for users who need it:
  ```css
  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
  ```
- [ ] Run Lighthouse Accessibility audit in Chrome DevTools — target score 90+

---

## QUICK WINS (Do These First)

| Action                              | Time   | Impact        |
| ----------------------------------- | ------ | ------------- |
| Rename `NFTModal.tsx`               | 2 min  | Code Quality  |
| Add `public/_headers` security file | 5 min  | Security      |
| Convert images to `.webp`           | 10 min | Efficiency    |
| Add `lang="en"` to index.html       | 1 min  | Accessibility |
| Add `alt` text to all images        | 10 min | Accessibility |
| Install Vitest + write 1 calc test  | 20 min | Testing       |
| Add `prefers-reduced-motion` CSS    | 5 min  | Accessibility |

---

## TOOLS TO USE

- **Lighthouse** (Chrome DevTools) — audit all 5 parameters at once
- **Squoosh** (squoosh.app) — convert images to webp
- **WebAIM Contrast Checker** — check neon color ratios
- **Bundlephobia** (bundlephobia.com) — check dependency sizes before adding
- **Vitest UI** (`npx vitest --ui`) — visual test runner

---

_Last updated: PromptWars Virtual 2026 — Main Challenge 3_
