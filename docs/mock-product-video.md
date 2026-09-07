# Mock Product Video Test

This prototype accepts a generic product object. A future Meesho scraper can populate the same object without changing the Gemini, Sarvam, or Remotion services.

## Start the server

```powershell
npm run dev
```

The server validates `GEMINI_API_KEY` and `SARVAM_API_KEY` from `.env` at startup.

## Start generation

`POST http://localhost:5000/api/video/test-generate`

```json
{
  "product": {
    "id": "mock-meesho-product-001",
    "title": "Portable Mini Mixer Grinder",
    "description": "A compact rechargeable mixer for smoothies, juices, and everyday kitchen prep. It is lightweight, easy to carry, and simple to clean.",
    "price": 899,
    "currency": "INR",
    "benefits": [
      "Rechargeable and cordless",
      "Compact for home or travel",
      "Easy to clean",
      "Useful for smoothies and juices"
    ],
    "metadata": {
      "category": "kitchen",
      "source": "manual-mock"
    }
  }
}
```

The endpoint returns `202 Accepted` immediately:

```json
{
  "success": true,
  "data": {
    "jobId": "<uuid>",
    "status": "pending",
    "stage": "queued",
    "assets": [],
    "createdAt": "<iso timestamp>"
  }
}
```

## Read status

`GET http://localhost:5000/api/video/test-generate/<jobId>`

A completed response has `status: "completed"` and asset entries like:

```json
{
  "kind": "voice",
  "path": ".../storage/output/audio/<scene>-<uuid>.wav",
  "mimeType": "audio/wav",
  "size": 123456
}
```

```json
{
  "kind": "render",
  "path": ".../storage/output/videos/gemini-sarvam-<jobId>.mp4",
  "mimeType": "video/mp4",
  "size": 456789
}
```

Failures return `status: "failed"` and an `error` field. The Postman collection is available at `docs/postman/ai-video-prototype.postman_collection.json`.

The same workflow can be run without HTTP using:

```powershell
npm run test:e2e
```
