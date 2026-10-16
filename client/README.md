# AffiliateOps AI Studio — Frontend Documentation & Integration Guide

Professional AI Video Automation Dashboard for affiliate marketing videos with automated Gemini script generation, neural voiceovers, Remotion 4.0 rendering, and FFmpeg multiplexing.

---

## 1. Quick Start

### Prerequisites
- Node.js >= 18
- npm or bun

### Installation & Run
```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Start development server (Port 3000)
npm run dev

# 4. Build for production
npm run build
```

---

## 2. Connecting to Your Existing Backend

By default, the centralized Axios API client connects to:
```env
VITE_API_BASE_URL="http://localhost:5000/api/v1"
```

You can change this anytime:
1. In `.env`: set `VITE_API_BASE_URL="http://your-backend-host:port/api/v1"`
2. Directly inside the UI: Open **Settings** &rarr; **Backend API Connection**, enter your URL, and click **Save & Connect**. The frontend will immediately probe the server and report latency.

### Live API vs. Demo Sandbox Mode
The dashboard features an instant mode switch in the top header:
- **Live API**: Sends all requests directly to `VITE_API_BASE_URL`. If the backend is running, live progress polling and actual video download URLs are used.
- **Demo Sandbox**: Operates without external server dependencies so you can test all UI workflows, forms, video players, and analytics charts.

---

## 3. Backend Endpoints Contract

The frontend maps to the following REST endpoints:

### Endpoints Used

| Method | Endpoint | Description | Status |
|---|---|---|---|
| `POST` | `/videos` | Starts video pipeline with product specs and video config. | **Required** |
| `GET` | `/videos` | Returns array of all video generation jobs. | **Required** |
| `GET` | `/videos/:id` | Returns single video status, current stage, and progress %. | **Required (Polled)** |
| `POST` | `/videos/:id/retry` | Restarts a failed pipeline from the last failed stage. | **Optional** |
| `POST` | `/videos/:id/cancel` | Terminates an active render. | **Optional** |
| `GET` | `/products` | Retrieves catalogue of saved products. | **Required** |
| `POST` | `/products` | Creates a new manual product in the catalogue. | **Required** |
| `DELETE` | `/products/:id` | Deletes a product from the catalogue. | **Optional** |
| `POST` | `/products/import` | Multipart CSV file upload for batch product import. | **Optional** |
| `GET` | `/workflows` | Returns array of pipeline runs with stage logs. | **Optional** |
| `GET` | `/workflows/:id` | Returns single workflow with console logs per stage. | **Optional** |
| `GET` | `/analytics/overview`| Returns aggregated metrics, latency benchmarks, and charts. | **Optional** |
| `GET` | `/health` | Connectivity and latency probe. | **Optional** |

---

## 4. API Request & Response Formats

### `POST /videos`
**Request Body:**
```json
{
  "inputMethod": "manual",
  "productDetails": {
    "name": "AeroGlide Ultra Ergonomic Wireless Mouse",
    "description": "57-degree vertical handshake angle with 70-day battery life",
    "price": 2499,
    "currency": "INR",
    "features": ["57° Ergo angle", "USB-C fast charging", "Dual Bluetooth"],
    "affiliateUrl": "https://affiliate.example.com/item/aeroglide-ultra?ref=aff_01",
    "imageUrl": "https://images.unsplash.com/..."
  },
  "videoConfig": {
    "language": "Hinglish",
    "tone": "Energetic",
    "duration": 30,
    "aspectRatio": "9:16",
    "customInstructions": "Emphasize carpal tunnel prevention"
  }
}
```

**Response (200 / 201):**
```json
{
  "video": {
    "id": "vid-8821",
    "title": "Stop wrist strain today with AeroGlide Mouse",
    "productName": "AeroGlide Ultra Ergonomic Wireless Mouse",
    "status": "processing",
    "currentStage": "validating",
    "progress": 10,
    "duration": 30,
    "aspectRatio": "9:16",
    "language": "Hinglish",
    "tone": "Energetic",
    "createdAt": "2026-04-13T10:15:00Z"
  },
  "workflowId": "wf-8821"
}
```

### `GET /videos/:id` (Polled every 3 seconds)
**Response:**
```json
{
  "id": "vid-8821",
  "status": "completed",
  "currentStage": "saving",
  "progress": 100,
  "videoUrl": "https://your-bucket.com/videos/vid-8821.mp4",
  "thumbnailUrl": "https://your-bucket.com/thumbs/vid-8821.jpg",
  "script": {
    "hook": "Kya aapke haath me desk work ke baad dard hota hai? Listen to this!",
    "problem": "Normal mouse aapki wrist ko unnatural angle me rakhta hai.",
    "solution": "AeroGlide Ultra vertical mouse wrist pressure ko instant release karta hai!",
    "callToAction": "Check the special link in bio for 30% discount right now. Tap link below!",
    "fullScript": "Kya aapke haath me desk work ke baad dard hota hai?..."
  },
  "completedAt": "2026-04-13T10:16:30Z"
}
```

---

## 5. Security & Architecture Principles
- **No Client-Side Gemini Keys**: All Gemini API prompts, TTS generation, and Remotion rendering occur strictly on the backend.
- **No Meesho Scraping**: Respects anti-scraping policies by prioritizing manual product input specs and image uploads.
- **Duplicate-Submit Protection**: Submit buttons are disabled with loading spinners during pipeline dispatch.
- **Zero Fake Success**: Progress and completion are bound strictly to backend status checks.

---

## 6. Verification Checklist
- [x] Application compiles cleanly with zero TypeScript errors.
- [x] Sidebar navigation works across Overview, Create Video, Video Library, Products, Workflow History, Analytics, and Settings.
- [x] URL vs Manual Product details input tabs with Zod schema validation.
- [x] Product image upload with preview and replacement.
- [x] Dedicated 5-stage progress tracking page with live polling.
- [x] Video library with search, status filters, aspect ratio filters, and modal player with script inspection.
- [x] Products catalogue with table/grid toggle, add product modal, and CSV import.
- [x] Recharts analytics visualizations for throughput and latency.
- [x] Settings page with live backend connectivity probe.
