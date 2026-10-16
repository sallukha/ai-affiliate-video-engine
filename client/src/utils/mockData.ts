import { VideoItem, ProductItem, WorkflowRun, AnalyticsOverview } from '../types';

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-001',
    name: 'AeroGlide Ultra Ergonomic Wireless Mouse',
    description: 'High-precision wireless mouse with 57-degree natural handshake angle, quiet clicks, and 70-day rechargeable battery life.',
    price: 2499,
    currency: 'INR',
    features: ['57° Ergo angle', 'USB-C fast charging', 'Dual Bluetooth + 2.4G', 'Customizable thumb wheel', 'Silent switches'],
    affiliateUrl: 'https://affiliate.example.com/item/aeroglide-ultra?ref=affiliateops_01',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80',
    videoCount: 4,
    createdAt: '2026-03-28T10:30:00Z',
    updatedAt: '2026-04-02T14:15:00Z'
  },
  {
    id: 'prod-002',
    name: 'Veloce Titan Smart Fitness Ring Gen 3',
    description: 'Aircraft-grade titanium biometric ring tracking continuous HRV, sleep architecture, recovery index, and skin temperature.',
    price: 11999,
    currency: 'INR',
    features: ['Aerospace Titanium', 'HRV & Sleep Staging', '7-day battery', '50m water resistant', 'No subscription required'],
    affiliateUrl: 'https://affiliate.example.com/item/veloce-titan-ring?ref=affiliateops_02',
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80',
    videoCount: 7,
    createdAt: '2026-03-15T08:00:00Z',
    updatedAt: '2026-04-05T11:20:00Z'
  },
  {
    id: 'prod-003',
    name: 'SonicShield ANC Studio Headphones',
    description: 'Hybrid 42dB active noise cancellation with 40mm beryllium drivers, spatial audio tracking, and 50hr playtime.',
    price: 4999,
    currency: 'INR',
    features: ['42dB Hybrid ANC', '40mm Beryllium Drivers', '50hr playtime', 'Multipoint connection', 'Memory foam ear cushions'],
    affiliateUrl: 'https://affiliate.example.com/item/sonicshield-anc?ref=affiliateops_03',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    videoCount: 5,
    createdAt: '2026-03-01T14:45:00Z',
    updatedAt: '2026-03-29T16:00:00Z'
  },
  {
    id: 'prod-004',
    name: 'NutriBlend Pro 1200W Portable Smoothie Maker',
    description: 'Compact high-torque blender with magnetic safety interlock, Tritan BPA-free to-go bottles, and ice crushing blades.',
    price: 1899,
    currency: 'INR',
    features: ['1200W Pure Copper Motor', 'Tritan BPA-free bottles', 'One-touch pulse operation', 'Crushes ice in 8 seconds'],
    affiliateUrl: 'https://affiliate.example.com/item/nutriblend-pro?ref=affiliateops_04',
    imageUrl: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&auto=format&fit=crop&q=80',
    videoCount: 2,
    createdAt: '2026-04-01T09:10:00Z',
    updatedAt: '2026-04-01T09:10:00Z'
  },
  {
    id: 'prod-005',
    name: 'LuminaBeam 4K Portable Laser Projector',
    description: 'Ultra-bright 800 ANSI lumens smart projector with auto-keystone correction, Android TV 12, and Dolby Audio.',
    price: 28999,
    currency: 'INR',
    features: ['800 ANSI Lumens', 'Auto-focus & Auto-keystone', 'Built-in 15000mAh Battery', 'Dolby Digital Speaker', 'HDR10+'],
    affiliateUrl: 'https://affiliate.example.com/item/luminabeam-4k?ref=affiliateops_05',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
    videoCount: 3,
    createdAt: '2026-03-10T12:00:00Z',
    updatedAt: '2026-04-08T18:40:00Z'
  }
];

export const INITIAL_VIDEOS: VideoItem[] = [
  {
    id: 'vid-8821',
    title: 'Stop wrist strain today with AeroGlide Mouse',
    productName: 'AeroGlide Ultra Ergonomic Wireless Mouse',
    productId: 'prod-001',
    price: 2499,
    currency: 'INR',
    affiliateUrl: 'https://affiliate.example.com/item/aeroglide-ultra?ref=affiliateops_01',
    thumbnailUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80',
    duration: 30,
    aspectRatio: '9:16',
    language: 'Hinglish',
    tone: 'Energetic',
    status: 'completed',
    currentStage: 'saving',
    progress: 100,
    createdAt: '2026-04-12T14:32:00Z',
    completedAt: '2026-04-12T14:33:45Z',
    workflowId: 'wf-8821',
    fileSizeMb: 14.8,
    renderEngine: 'Remotion 4.0 + FFmpeg libx264',
    script: {
      hook: 'Kya aapke haath me desk work ke baad dard hota hai? Listen to this!',
      problem: 'Normal mouse aapki wrist ko twist karke carpal tunnel syndrome ka risk badha deta hai.',
      solution: 'AeroGlide Ultra ergonomic mouse ka 57-degree vertical handshake angle pressure ko instant release karta hai!',
      callToAction: 'Check the special link in bio for 30% discount right now. Tap link below!',
      fullScript: 'Kya aapke haath me desk work ke baad dard hota hai? Normal mouse aapki wrist ko unnatural angle me rakhta hai. Lekin AeroGlide Ultra ka natural 57-degree design wrist tension ko zero kar deta hai! Silent clicks, 70 din ki battery. Link in bio par click karein aur pain-free work experience karein!'
    }
  },
  {
    id: 'vid-8822',
    title: 'Track your recovery without bulky smartwatches: Titan Ring',
    productName: 'Veloce Titan Smart Fitness Ring Gen 3',
    productId: 'prod-002',
    price: 11999,
    currency: 'INR',
    affiliateUrl: 'https://affiliate.example.com/item/veloce-titan-ring?ref=affiliateops_02',
    thumbnailUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80',
    duration: 30,
    aspectRatio: '9:16',
    language: 'English',
    tone: 'Informative',
    status: 'completed',
    currentStage: 'saving',
    progress: 100,
    createdAt: '2026-04-11T18:12:00Z',
    completedAt: '2026-04-11T18:14:10Z',
    workflowId: 'wf-8822',
    fileSizeMb: 12.4,
    renderEngine: 'Remotion 4.0 + FFmpeg libx264',
    script: {
      hook: 'Tired of sleeping with a bulky screen on your wrist?',
      problem: 'Smartwatches are heavy, light up at night, and need charging every 24 hours.',
      solution: 'Meet Veloce Titan Ring Gen 3: medical-grade HRV, sleep staging, and a 7-day battery in pure titanium.',
      callToAction: 'Claim your sizing kit and exclusive affiliate discount using the link below.',
      fullScript: 'Tired of sleeping with a bulky smartwatch? Meet the Veloce Titan Ring Gen 3. It tracks continuous HRV, deep sleep cycles, and daily recovery with zero subscription fees. Ultra-light titanium with 7-day battery life. Tap the link below to get yours today!'
    }
  },
  {
    id: 'vid-8823',
    title: '42dB Hybrid Noise Cancelling on a Budget: SonicShield',
    productName: 'SonicShield ANC Studio Headphones',
    productId: 'prod-003',
    price: 4999,
    currency: 'INR',
    affiliateUrl: 'https://affiliate.example.com/item/sonicshield-anc?ref=affiliateops_03',
    thumbnailUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    duration: 15,
    aspectRatio: '9:16',
    language: 'Hindi',
    tone: 'Promotional',
    status: 'completed',
    currentStage: 'saving',
    progress: 100,
    createdAt: '2026-04-10T09:20:00Z',
    completedAt: '2026-04-10T09:21:20Z',
    workflowId: 'wf-8823',
    fileSizeMb: 8.9,
    renderEngine: 'Remotion 4.0 + FFmpeg libx264',
    script: {
      hook: 'Traffic aur shor se pareshan? Yeh headphone aapki duniya badal dega!',
      problem: 'Mahange headphones 25 hazar ke aate hain par background noise phir bhi aati hai.',
      solution: 'SonicShield ANC me hai 42dB Hybrid noise cancellation aur 50 ghante ka battery backup!',
      callToAction: 'Abhi order karein aur 50% discount ka fayda uthayein. Link niche hai!',
      fullScript: 'Traffic aur shor se pareshan? SonicShield ANC headphone deta hai studio quality 42dB noise cancellation sirf under ₹5000 me! 50 ghante ka non-stop backup. Limited period deal link par click karein!'
    }
  },
  {
    id: 'vid-8824',
    title: 'Transform your bedroom into a 150-inch Cinema',
    productName: 'LuminaBeam 4K Portable Laser Projector',
    productId: 'prod-005',
    price: 28999,
    currency: 'INR',
    affiliateUrl: 'https://affiliate.example.com/item/luminabeam-4k?ref=affiliateops_05',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
    duration: 60,
    aspectRatio: '16:9',
    language: 'English',
    tone: 'Professional',
    status: 'processing',
    currentStage: 'rendering',
    progress: 72,
    createdAt: '2026-04-13T10:15:00Z',
    workflowId: 'wf-8824',
    renderEngine: 'Remotion 4.0 + FFmpeg libx264',
    script: {
      hook: 'Why spend $2,000 on a heavy TV when you can carry a 150-inch theater?',
      problem: 'Traditional projectors are dim, blurry, and require complicated manual alignment.',
      solution: 'LuminaBeam features 800 ANSI lumens laser brightness and instant autofocus.',
      callToAction: 'Order through our link for free carrying case and tripod.',
      fullScript: 'Why spend thousands on a heavy TV? The LuminaBeam 4K Laser Projector gives you true cinematic 150-inch projection with 800 ANSI lumens brightness, instant auto-keystone, and Dolby audio. Watch Netflix anywhere with the built-in battery.'
    }
  },
  {
    id: 'vid-8825',
    title: 'Smoothie in 8 seconds with NutriBlend Pro',
    productName: 'NutriBlend Pro 1200W Portable Smoothie Maker',
    productId: 'prod-004',
    price: 1899,
    currency: 'INR',
    affiliateUrl: 'https://affiliate.example.com/item/nutriblend-pro?ref=affiliateops_04',
    thumbnailUrl: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&auto=format&fit=crop&q=80',
    duration: 15,
    aspectRatio: '9:16',
    language: 'Hinglish',
    tone: 'Energetic',
    status: 'failed',
    currentStage: 'voiceover',
    progress: 45,
    createdAt: '2026-04-09T16:40:00Z',
    errorMessage: 'Voiceover synthesis timeout: TTS provider rate limit exceeded on audio chunk 3. Pipeline aborted.',
    workflowId: 'wf-8825',
    renderEngine: 'Remotion 4.0 + FFmpeg libx264'
  }
];

export const INITIAL_WORKFLOWS: WorkflowRun[] = [
  {
    id: 'wf-8821',
    videoId: 'vid-8821',
    productName: 'AeroGlide Ultra Ergonomic Wireless Mouse',
    status: 'completed',
    currentStage: 'saving',
    startedAt: '2026-04-12T14:32:00Z',
    completedAt: '2026-04-12T14:33:45Z',
    durationSeconds: 105,
    stages: [
      {
        id: 'validating',
        name: 'Validating product information',
        description: 'Verify product parameters, image asset availability, and affiliate link format',
        status: 'completed',
        startedAt: '2026-04-12T14:32:00Z',
        completedAt: '2026-04-12T14:32:04Z',
        durationSeconds: 4,
        logs: [
          '[14:32:00] Payload received: AeroGlide Ultra Ergonomic Wireless Mouse',
          '[14:32:01] Validated affiliate link format: https://affiliate.example.com/...',
          '[14:32:02] Image asset cached (1.2 MB, 1200x1200px, RGB format)',
          '[14:32:04] Product verification passed with zero warnings.'
        ]
      },
      {
        id: 'scripting',
        name: 'Generating AI script',
        description: 'Generating Hook, Problem, Solution, and CTA optimized for 30s Hinglish affiliate reel',
        status: 'completed',
        startedAt: '2026-04-12T14:32:04Z',
        completedAt: '2026-04-12T14:32:15Z',
        durationSeconds: 11,
        logs: [
          '[14:32:04] Initializing Gemini prompt context with tone: Energetic',
          '[14:32:07] Gemini returned script payload with 4 distinct segment tokens',
          '[14:32:10] Calculated word count: 68 words (targeting ~2.3 words/sec)',
          '[14:32:15] Structured script validated and timestamp markers inserted.'
        ]
      },
      {
        id: 'voiceover',
        name: 'Generating voiceover',
        description: 'Synthesizing neural speech audio with Hinglish pronunciation and natural pauses',
        status: 'completed',
        startedAt: '2026-04-12T14:32:15Z',
        completedAt: '2026-04-12T14:32:32Z',
        durationSeconds: 17,
        logs: [
          '[14:32:15] Connecting to high-fidelity TTS voice: hi-IN-Wavenet-B',
          '[14:32:20] Generated raw audio PCM stream (28.4s duration)',
          '[14:32:26] Applied dynamic compression and normalized to -14 LUFS',
          '[14:32:32] Voiceover track saved to /tmp/audio_vid8821.wav'
        ]
      },
      {
        id: 'rendering',
        name: 'Rendering video',
        description: 'Executing Remotion composition with animated typography, zoom transitions, and price tags',
        status: 'completed',
        startedAt: '2026-04-12T14:32:32Z',
        completedAt: '2026-04-12T14:33:35Z',
        durationSeconds: 63,
        logs: [
          '[14:32:32] Initializing Remotion 4.0 bundle with composition "AffiliateProductReel9x16"',
          '[14:32:45] Rendered frames 0-300 (10.0s) @ 30fps',
          '[14:33:05] Rendered frames 300-600 (20.0s) @ 30fps with kinetic typography',
          '[14:33:28] Rendered frames 600-900 (30.0s) @ 30fps with CTA banner',
          '[14:33:35] Video frame rendering completed in 63 seconds.'
        ]
      },
      {
        id: 'saving',
        name: 'Saving final output',
        description: 'FFmpeg audio multiplexing, H.264 optimization, faststart MOOV atom placement, and CDN upload',
        status: 'completed',
        startedAt: '2026-04-12T14:33:35Z',
        completedAt: '2026-04-12T14:33:45Z',
        durationSeconds: 10,
        logs: [
          '[14:33:35] FFmpeg command: ffmpeg -i frames.mp4 -i audio.wav -c:v libx264 -crf 20 -movflags +faststart output.mp4',
          '[14:33:40] Muxing complete. Final file size: 14.8 MB',
          '[14:33:43] Uploaded to CDN: /videos/vid-8821.mp4',
          '[14:33:45] Video published and marked ready for download.'
        ]
      }
    ]
  },
  {
    id: 'wf-8824',
    videoId: 'vid-8824',
    productName: 'LuminaBeam 4K Portable Laser Projector',
    status: 'processing',
    currentStage: 'rendering',
    startedAt: '2026-04-13T10:15:00Z',
    stages: [
      {
        id: 'validating',
        name: 'Validating product information',
        description: 'Verify product parameters, image asset availability, and affiliate link format',
        status: 'completed',
        startedAt: '2026-04-13T10:15:00Z',
        completedAt: '2026-04-13T10:15:03Z',
        durationSeconds: 3,
        logs: ['[10:15:00] Product validation started', '[10:15:03] Validation successful']
      },
      {
        id: 'scripting',
        name: 'Generating AI script',
        description: 'Generating Hook, Problem, Solution, and CTA optimized for 60s English landscape video',
        status: 'completed',
        startedAt: '2026-04-13T10:15:03Z',
        completedAt: '2026-04-13T10:15:18Z',
        durationSeconds: 15,
        logs: ['[10:15:03] Gemini script generation triggered', '[10:15:18] Script synthesized (135 words)']
      },
      {
        id: 'voiceover',
        name: 'Generating voiceover',
        description: 'Synthesizing neural speech audio with natural pauses',
        status: 'completed',
        startedAt: '2026-04-13T10:15:18Z',
        completedAt: '2026-04-13T10:15:42Z',
        durationSeconds: 24,
        logs: ['[10:15:18] Generating voiceover audio', '[10:15:42] Master audio normalized']
      },
      {
        id: 'rendering',
        name: 'Rendering video',
        description: 'Executing Remotion composition with animated typography and 4K preview slides',
        status: 'processing',
        startedAt: '2026-04-13T10:15:42Z',
        logs: [
          '[10:15:42] Remotion render started for 1800 frames (60s @ 30fps)',
          '[10:16:15] Rendered frames 0-700 (38%)',
          '[10:17:00] Rendered frames 700-1300 (72%)',
          '[10:17:15] Rendering remaining frames...'
        ]
      },
      {
        id: 'saving',
        name: 'Saving final output',
        description: 'FFmpeg multiplexing and final video artifact persistence',
        status: 'pending',
        logs: ['Pending completion of video rendering stage']
      }
    ]
  },
  {
    id: 'wf-8825',
    videoId: 'vid-8825',
    productName: 'NutriBlend Pro 1200W Portable Smoothie Maker',
    status: 'failed',
    currentStage: 'voiceover',
    startedAt: '2026-04-09T16:40:00Z',
    completedAt: '2026-04-09T16:41:12Z',
    durationSeconds: 72,
    errorMessage: 'Voiceover synthesis timeout: TTS provider rate limit exceeded on audio chunk 3. Pipeline aborted.',
    stages: [
      {
        id: 'validating',
        name: 'Validating product information',
        description: 'Verify product parameters, image asset availability, and affiliate link format',
        status: 'completed',
        startedAt: '2026-04-09T16:40:00Z',
        completedAt: '2026-04-09T16:40:02Z',
        durationSeconds: 2,
        logs: ['[16:40:00] Product verified']
      },
      {
        id: 'scripting',
        name: 'Generating AI script',
        description: 'Generating Hook, Problem, Solution, and CTA',
        status: 'completed',
        startedAt: '2026-04-09T16:40:02Z',
        completedAt: '2026-04-09T16:40:14Z',
        durationSeconds: 12,
        logs: ['[16:40:02] Script generation started', '[16:40:14] Script successfully produced']
      },
      {
        id: 'voiceover',
        name: 'Generating voiceover',
        description: 'Synthesizing neural speech audio',
        status: 'failed',
        startedAt: '2026-04-09T16:40:14Z',
        completedAt: '2026-04-09T16:41:12Z',
        durationSeconds: 58,
        errorMessage: 'Voiceover synthesis timeout: TTS provider rate limit exceeded on audio chunk 3. Pipeline aborted.',
        logs: [
          '[16:40:14] TTS synthesis initiated for chunk 1/3',
          '[16:40:25] Chunk 1 synthesized',
          '[16:40:40] TTS synthesis initiated for chunk 2/3',
          '[16:40:55] Chunk 2 synthesized',
          '[16:41:00] TTS synthesis initiated for chunk 3/3',
          '[16:41:12] ERROR 429: Rate limit quota exceeded. Operation timed out after 58s.'
        ]
      },
      {
        id: 'rendering',
        name: 'Rendering video',
        description: 'Executing Remotion composition',
        status: 'pending',
        logs: ['Skipped due to upstream voiceover failure']
      },
      {
        id: 'saving',
        name: 'Saving final output',
        description: 'FFmpeg multiplexing and storage',
        status: 'pending',
        logs: ['Skipped due to upstream failure']
      }
    ]
  }
];

export const INITIAL_ANALYTICS: AnalyticsOverview = {
  totalVideos: 48,
  completedVideos: 43,
  processingVideos: 2,
  failedJobs: 3,
  successRate: 89.6,
  averageProcessingTimeSec: 84,
  activityTimeline: [
    { date: 'Apr 07', completed: 4, failed: 0 },
    { date: 'Apr 08', completed: 6, failed: 1 },
    { date: 'Apr 09', completed: 7, failed: 1 },
    { date: 'Apr 10', completed: 9, failed: 0 },
    { date: 'Apr 11', completed: 8, failed: 1 },
    { date: 'Apr 12', completed: 5, failed: 0 },
    { date: 'Apr 13', completed: 4, failed: 0 }
  ],
  stageDurations: [
    { stage: 'Validation', avgSeconds: 3 },
    { stage: 'AI Scripting', avgSeconds: 12 },
    { stage: 'Voiceover TTS', avgSeconds: 18 },
    { stage: 'Remotion Render', avgSeconds: 42 },
    { stage: 'FFmpeg & Save', avgSeconds: 9 }
  ],
  topProducts: [
    { name: 'Veloce Titan Smart Ring Gen 3', videoCount: 14 },
    { name: 'AeroGlide Ergonomic Mouse', videoCount: 12 },
    { name: 'SonicShield ANC Headphones', videoCount: 9 },
    { name: 'LuminaBeam 4K Laser Projector', videoCount: 7 },
    { name: 'NutriBlend Pro 1200W Blender', videoCount: 6 }
  ],
  languageDistribution: [
    { name: 'Hinglish', count: 24 },
    { name: 'English', count: 16 },
    { name: 'Hindi', count: 8 }
  ],
  ratioDistribution: [
    { name: '9:16 (Shorts/Reels)', count: 39 },
    { name: '16:9 (Landscape)', count: 9 }
  ]
};
