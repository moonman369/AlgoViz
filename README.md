# AlgoViz

AlgoViz is a Next.js application that uses OpenRouter or Anthropic to generate self-contained, interactive DSA problem visualizations.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure an AI provider in `.env.local`. OpenRouter's free model router is the default:
   ```env
   AI_PROVIDER=openrouter
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   OPENROUTER_MODEL=openrouter/free
   ```
   To switch back to Anthropic, set `AI_PROVIDER=anthropic` and add `ANTHROPIC_API_KEY`.
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000`.

Generated visualizers are streamed from the configured provider, rendered in a sandboxed iframe, and saved locally in the browser. History keeps the latest 20 generations.

### Deploy to Vercel
1. Push repo to GitHub
2. Go to vercel.com → New Project → Import your repo
3. Add `AI_PROVIDER` and the selected provider's API key and model environment variables
4. Click Deploy — done. Live in ~60 seconds.
