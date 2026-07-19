# Signal — Stock Trend Predictor Frontend

React + TypeScript + Tailwind + Framer Motion + Recharts. Bloomberg-terminal-inspired,
glassmorphism surfaces over a dark canvas, animated ticker tape, scroll-triggered reveals.

## Run it

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Currently runs on **mock data** — search any ticker
(e.g. TCS, AAPL, RELIANCE) and it'll generate a plausible synthetic history + prediction.

## Wire up your FastAPI backend

Everything routes through one file: `src/services/api.ts`.

1. Set `USE_MOCK = false`
2. Set `API_BASE_URL` to your backend's URL
3. Make sure your FastAPI endpoint `GET /api/predict/{ticker}` returns JSON matching
   the `PredictionResult` shape in `src/types.ts` — field names must match exactly:

```ts
{
  ticker, companyName, currentPrice, predictedPrice, changePct,
  trend: "up" | "down" | "flat",
  confidence,        // 0-100
  history: [{ date, actual, predicted, ma100, ma200 }],
  signals: [{ label, weight, direction }],  // weight is 0-1
  stats: { marketCap, peRatio, weekHigh52, weekLow52, avgVolume },
  lastUpdated
}
```

If your backend's field names differ, either rename them server-side, or map them in
`fetchPrediction()` right after the `fetch()` call — no component needs to change.

You'll also need to enable CORS on the FastAPI side for your frontend's origin:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://your-vercel-domain.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Deploy

- **Frontend → Vercel**: push this folder to GitHub, import into Vercel, no config
  needed (Vite is auto-detected). Free.
- **Backend → Render / Hugging Face Spaces**: deploy FastAPI there, then point
  `API_BASE_URL` at that deployed URL and redeploy the frontend.

## Structure

```
src/
  components/     UI pieces (chart, gauge, ticker tape, prediction card, etc.)
  services/api.ts  <- backend integration point, swap mock for real fetch here
  types.ts         <- shared contract between frontend and backend
  App.tsx          <- page layout + state
```
