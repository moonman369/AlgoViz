# AlgoViz — Codex Prompt
# Paste everything below this line into Codex (or ChatGPT o3/o4) as a single message.
---

You are an expert Next.js 14 developer. Scaffold a complete, production-ready web application called "AlgoViz" — a DSA Problem Visualizer that uses the Anthropic Claude API to generate interactive step-by-step algorithm visualizations on demand.

## Tech Stack
- Next.js 14 with App Router (TypeScript)
- Tailwind CSS for styling
- shadcn/ui for UI components (use: Button, Input, Select, Textarea, Badge, Card, Tabs, Tooltip)
- @anthropic-ai/sdk for the Claude API
- lucide-react for icons
- next-themes for dark/light mode

## Project Structure
Create this exact file structure:

algviz/
├── app/
│   ├── layout.tsx              # Root layout with ThemeProvider, Inter font
│   ├── page.tsx                # Home page — renders VisualizerForm + VisualizerOutput
│   ├── globals.css             # Tailwind base + custom scrollbar styles
│   └── api/
│       └── generate/
│           └── route.ts        # POST handler — calls Claude API, streams response
├── components/
│   ├── VisualizerForm.tsx      # Left panel: problem input form
│   ├── VisualizerOutput.tsx    # Right panel: iframe + loading + empty state
│   ├── HistoryPanel.tsx        # Slide-out drawer showing past generations
│   ├── ThemeToggle.tsx         # Dark/light mode toggle button
│   └── Navbar.tsx              # Top nav: logo + theme toggle + history button
├── lib/
│   ├── claude.ts               # Anthropic SDK setup and prompt builder
│   ├── storage.ts              # localStorage helpers for history (save/load/delete)
│   └── types.ts                # TypeScript interfaces
├── .env.local                  # ANTHROPIC_API_KEY=your_key_here
├── .env.example                # ANTHROPIC_API_KEY=
└── next.config.ts

---

## Detailed Component Specs

### app/api/generate/route.ts
- Accept POST with JSON body: { problemName, difficulty, approach, timeComplexity, spaceComplexity, topics: string[], sampleInput, extraNotes }
- Use @anthropic-ai/sdk, model: "claude-sonnet-4-20250514", max_tokens: 8000
- Stream the response back using Next.js ReadableStream + TextEncoder
- Set header: Content-Type: text/plain
- The Claude prompt must instruct the model to return ONLY a complete self-contained HTML document (no markdown fences, no explanation) that:
  - Has a step-by-step interactive visualizer with Prev/Next/Play/Pause controls
  - Shows the data structure (tree, stack, array, graph) as an SVG at each step
  - Shows a step description box explaining what's happening
  - Shows auxiliary state (stack contents, current element, etc.)
  - Has a custom input field + Reset button
  - Works in a dark background (background: #0f0f0f, text: #e5e5e5)
  - Uses only vanilla HTML/CSS/JS — no external libraries
  - Includes a color legend
  - Is educational and clearly illustrates the algorithm mechanics

### components/VisualizerForm.tsx
Form fields (all controlled state with useState):
1. problemName: text input — "Problem name or LeetCode URL"
2. difficulty: Select — Easy / Medium / Hard (colored badges: green/amber/red)
3. approach: text input — "Algorithm / Approach (e.g. Monotonic Stack)"
4. timeComplexity: text input — "Time complexity (e.g. O(n log n))"
5. spaceComplexity: text input — "Space complexity (e.g. O(n))"
6. topics: tag input system — type + press Enter or click Add to add tags, click × to remove. Show tags as removable pill badges.
7. sampleInput: text input — "Sample input (e.g. nums = [3,2,1,6,0,5])"
8. extraNotes: Textarea — "Extra instructions for the visualizer"

Submit button: "Generate Visualizer" with a Play icon. Full width. Disabled while loading. Shows spinner when loading.

On submit: POST to /api/generate with form data, read the streamed response, collect full HTML string, then call onGenerated(html, formData) prop.

### components/VisualizerOutput.tsx
Props: { html: string | null, isLoading: boolean }
States:
- Empty (html is null, not loading): centered empty state with binary tree icon and text "Your interactive visualizer will appear here"
- Loading: centered animated skeleton with pulsing dots and text "Generating your visualizer…"
- Generated: render an <iframe> with srcdoc={html} sandbox="allow-scripts" — no allow-same-origin. Auto-resize iframe height using postMessage or a ResizeObserver on load. Show a toolbar above the iframe with: problem name badge, difficulty badge, "Download HTML" button (triggers blob download), "Copy HTML" button.

### components/HistoryPanel.tsx
- Slide-out drawer from the right (use Sheet from shadcn/ui)
- Load history from localStorage on mount (key: "algviz_history")
- Each history item shows: problem name, difficulty badge, approach, timestamp (relative: "2 hours ago")
- Click item → calls onRestore(item) prop which repopulates the form and output
- Delete button (trash icon) per item
- "Clear all" button at the bottom
- Empty state: "No visualizations yet"

### lib/storage.ts
Interface HistoryItem {
  id: string (nanoid)
  problemName: string
  difficulty: string
  approach: string
  timeComplexity: string
  spaceComplexity: string
  topics: string[]
  sampleInput: string
  html: string
  createdAt: number (Date.now())
}
Functions: saveToHistory(item), loadHistory(): HistoryItem[], deleteFromHistory(id), clearHistory()
Keep max 20 items (drop oldest when exceeding limit).

### app/page.tsx
- Two-column layout on desktop (form left 380px fixed, output fills remaining width)
- Single column stacked on mobile
- State: formData, generatedHtml, isLoading, historyOpen
- Pass setHistoryOpen to Navbar
- On generation complete: auto-save to localStorage history

### Navbar.tsx
- Left: logo "AlgoViz" with a small binary-tree icon (lucide: Network or GitBranch)
- Right: History button (Clock icon + "History") + ThemeToggle
- Sticky top, backdrop blur, border bottom

---

## Styling Notes
- Use Tailwind dark: variants throughout — the app must look great in both modes
- Difficulty colors: Easy = green-500, Medium = amber-500, Hard = red-500
- Primary accent: blue-600
- Monospace font for complexity values (font-mono)
- The iframe output area should have a dark background even in light mode (bg-zinc-950) since the generated HTML is always dark-themed
- Smooth transitions on all interactive elements (transition-all duration-150)

---

## .env.local
ANTHROPIC_API_KEY=your_anthropic_api_key_here

---

## package.json dependencies to install
{
  "dependencies": {
    "next": "14.2.x",
    "react": "^18",
    "react-dom": "^18",
    "typescript": "^5",
    "@anthropic-ai/sdk": "^0.39.0",
    "tailwindcss": "^3.4",
    "next-themes": "^0.3.0",
    "lucide-react": "^0.400.0",
    "nanoid": "^5.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@radix-ui/react-tabs": "^1.0.4"
  }
}

---

## shadcn/ui Setup
After scaffolding, run: npx shadcn-ui@latest init
Then add components: npx shadcn-ui@latest add button input select textarea badge card tabs sheet tooltip

---

## Error Handling
- API route: wrap in try/catch, return 500 with { error: message }
- Client: show a dismissible error toast (use shadcn/ui Toast or a simple div) if generation fails
- Empty / invalid API key: show a friendly message "Check your ANTHROPIC_API_KEY in .env.local"
- If the generated HTML string doesn't start with "<!DOCTYPE" or "<html", show error: "Generation failed — model returned unexpected output. Try again."

---

## Deployment (Vercel)
Add this comment block at the bottom of the README.md you generate:

### Deploy to Vercel
1. Push repo to GitHub
2. Go to vercel.com → New Project → Import your repo
3. Add environment variable: ANTHROPIC_API_KEY = your key
4. Click Deploy — done. Live in ~60 seconds.

---

## What to generate
Generate ALL files completely — do not truncate or use placeholder comments like "// add implementation here". Every file must be fully implemented and runnable. Start with package.json, then next.config.ts, then tailwind.config.ts, then app/globals.css, then layout.tsx, then each component in order, then the API route, then lib files, then README.md.
