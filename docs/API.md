# AffiliateOps API

Base URL: `http://localhost:5000/api/v1`

Responses used by the frontend are returned directly as typed JSON objects or arrays.

## Health

`GET /health`

Returns service status.

## Products

`GET /products`

Returns all products sorted newest first.

`POST /products`

Body:

```json
{
  "name": "Wireless Earbuds",
  "description": "ANC earbuds",
  "price": 2499,
  "currency": "INR",
  "features": ["ANC", "Long battery"],
  "affiliateUrl": "https://affiliate.example.com/earbuds",
  "imageUrl": "https://example.com/image.jpg"
}
```

`GET /products/:id`, `PATCH /products/:id`, `DELETE /products/:id`

Standard product CRUD. Invalid payloads return `400`; missing products return `404`.

`POST /products/import`

Accepts `{ "products": [...] }` and returns `{ "importedCount": 1, "errors": [] }`.

## Videos

`GET /videos`

Returns all video jobs.

`POST /videos` and `POST /videos/generate`

Starts the existing Gemini -> Sarvam -> Remotion -> FFmpeg pipeline asynchronously.

`GET /videos/:id` and `GET /videos/:id/status`

Returns current status, stage, progress, and `videoUrl` when rendering completes.

`POST /videos/:id/cancel`

Marks a job cancelled for the UI. The local prototype worker cannot interrupt a render already running in-process.

`POST /videos/:id/retry`

Starts a new generation using the same visible video fields and returns the new video job.

## Workflows

`GET /workflows`

Returns workflow runs with stage logs.

`GET /workflows/:id`

Accepts a workflow ID or video ID.

## Analytics

`GET /analytics/overview`

Returns aggregate counts derived from current in-memory products, videos, and workflows. No fabricated revenue or conversion metrics are returned.
