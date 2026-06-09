# ValenQuotient Eco Hub

ValenQuotient is an ultra-premium, interactive climate awareness and carbon footprint analysis application designed specifically for mobile and responsive web devices. It utilizes high-contrast dark space aesthetics, futuristic "liquid glass" visual cards, and high-fidelity simulated real-time calculator telemetry.

With ValenQuotient, users can model, understand, and visualize the impact of their daily commutes, dietary profiles, and residential power grids guided by the Intergovernmental Panel on Climate Change (IPCC-2026-GS-VERRA) standards.

---

## 🚀 Core Features

1. **Integrated Multi-View Architecture**
   - **🏡 Dashboard (01 // HOME)**: Overview index presenting the baseline systemic change indicators, an educational "What is a Carbon Footprint?" breakdown, and rapid-action shortcuts.
   - **📊 Gap Matrix (02 // EMISSIONS GAP)**: Deep analytical problem statements showcasing the contrast between unsustainable real-world defaults and ecological goals.
   - **⚡ CO₂ Trackers (03 // CHAT PROTOCOLS)**: A multi-pane interface styled like messaging apps (e.g., WhatsApp/Telegram) with instant bot interactions, sliders for live carbon calculation, and community pledge streams.
   - **🌿 Eco Directives (04 // ADVISORY)**: High-fidelity expert advisory content and localized climate action directives.

2. **Liquid Glass & Cosmic Aesthetics**
   - Immersive custom-made grain-noise overlay generated on dynamic HTML5 canvases.
   - Elegant responsive navigation nodes optimized with sidebar-dock rails for desktop and sticky tactile bottom tabs for mobile screens.
   - Glowing neon accents coupled with premium font selections ("Anton" displays, "JetBrains Mono" telemetry, and "Condiment" cursive typography).

3. **Interconnected Telemetry Calculator**
   - **Transportation tracking** modeled after vehicle-class exhaust metrics.
   - **Dietary nutrition analysis** classifying food footprints from high-methane meat groups to low-scoring vegans.
   - **Residential grid monitoring** measuring standby power leaks and electric demand coefficients.
   - **AI Footprint Diagnostic**: Automatic calculation system providing instant, personalized carbon-reduction tips with a smooth loading scan.

---

## 🛠️ Tech Stack & Directory Structure

- **Framework**: React 18+ powered by Vite (TypeScript)
- **Styling**: Tailwind CSS with custom theme properties
- **Icons**: Lucide React
- **Static Assets**: Stored locally in Vite's public folder for absolute reliability

```
├── public/                   # Static public assets directory (root path `/`)
│   ├── favicon.png           # Website Favicon
│   ├── icon.png              # Apple Touch Icon / Brand Logo
│   ├── _redirects            # Cloudflare Pages SPA redirection rules
│   └── images/               # Category-specific local images
│       ├── commute.png       # Commute tracker card & modal image
│       ├── diet.png          # Diet tracker card & modal image
│       └── energy.png        # Energy tracker card & modal image
├── index.html                # Main entry index
├── elements.md               # Asset registry documenting fonts, icons, and colors
├── image.md                  # Asset guide detailing how to replace/add local images
├── .node-version             # Locks Cloudflare Pages Node build environment
├── package.json              # Direct and indirect dependencies metadata
├── tsconfig.json             # TypeScript options
├── vite.config.ts            # Vite client config
├── src/
│   ├── main.tsx              # Virtual DOM mount point
│   ├── App.tsx               # Main application container & responsive tab router
│   ├── types.ts              # Data models and structures
│   ├── index.css             # Tailwinds setup & custom responsive themes
│   └── components/
│       ├── HeroSection.tsx   # Dashboard banner with footprint education
│       ├── AboutSection.tsx  # Dynamic Gap Matrix tabs
│       ├── CollectionSection.tsx # Two-pane messaging UI and sliders
│       ├── CTASection.tsx    # Climate action consensus and pledges form
│       └── NFTModal.tsx      # High-fidelity advisory details popup
```

---

## 💻 Local Development

### 1. Install Project Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
The application will boot and bind to [http://localhost:3000](http://localhost:3000) (or ports 3001/3002 if 3000 is occupied).

### 3. Build for Production
To bundle a production-ready, highly compressed static build:
```bash
npm run build
```
This outputs static assets into the `/dist` directory.
