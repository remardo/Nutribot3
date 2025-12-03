<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Q1fkyhhqBdoyPQElqSKzc9I85LFrJi8S

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:  
   `npm install`
2. Создайте `.env.local` и задайте переменные:
   ```
   VITE_CONVEX_URL=<ваш_convex_deployment_url>
   OPENAI_API_KEY=<ключ_OpenAI_для_анализа_блюд>
   OPENAI_MODEL=gpt-4.1   # опционально, можно оставить по умолчанию
   VITE_GEMINI_API_KEY=<ключ_Gemini_для_фолбэка> # опционально
   ```
3. Run dev:  
   `npm run dev`

## Deploy на Vercel

1. В Vercel → Project Settings → Environment Variables добавьте:
   - `VITE_CONVEX_URL` — URL деплоймента Convex (из `npx convex dashboard` → Deploy).
   - `OPENAI_API_KEY` — ключ OpenAI.
   - `OPENAI_MODEL` — (опционально) нужная модель, например `gpt-4.1`.
   - `VITE_GEMINI_API_KEY` - (опционально) если хотите фолбэк на Gemini.
2. Build & Output:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   (зафиксировано в `vercel.json`)
3. Deploy (Push в репозиторий или Vercel CLI). 
