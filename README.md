AI Affiliate Video Engine
Overview

AI Affiliate Video Engine is a modular backend system designed to automate the creation of short-form affiliate marketing videos.

The system receives product information from manual input or supported product sources and converts that information into a structured AI-powered video generation pipeline.

The target output includes:

Product marketing script
Structured storyboard
AI-generated voiceover
Timed captions
Processed media assets
Rendered short-form video
Final MP4 output

The architecture is designed so that each stage of the generation process can evolve independently without tightly coupling the entire application.

Core Generation Pipeline
Product URL / Product Data
          │
          ▼
   Product Import Layer
          │
          ▼
 Product Normalization
          │
          ▼
   Content Generation
          │
          ▼
      AI Script
          │
          ▼
     Storyboard
          │
     ┌────┴────┐
     ▼         ▼
   Voice    Captions
     │         │
     └────┬────┘
          ▼
     Media Pipeline
          │
          ▼
     Video Rendering
          │
     ┌────┴────┐
     ▼         ▼
  Remotion   FFmpeg
     │         │
     └────┬────┘
          ▼
      Final MP4
Architecture Principles

This project follows a modular, feature-oriented architecture.

The major design principles are:

Each feature owns its own business logic.
External AI providers are isolated from business modules.
The generation pipeline acts as an orchestrator.
Video rendering is separated from content generation.
Temporary media files are separated from final output.
Provider implementations can be replaced without changing the entire application.
Every important generation stage can be tested independently.
New AI providers and product sources can be added in the future.
Project Structure
ai-affiliate-video-engine/
│
├── src/
│   ├── config/
│   │
│   ├── modules/
│   │   ├── health/
│   │   ├── product/
│   │   ├── product-import/
│   │   │   └── providers/
│   │   ├── script/
│   │   │   └── prompts/
│   │   ├── storyboard/
│   │   │   └── prompts/
│   │   ├── voice/
│   │   │   └── providers/
│   │   ├── captions/
│   │   ├── media/
│   │   │   ├── image/
│   │   │   └── audio/
│   │   ├── video/
│   │   │   ├── remotion/
│   │   │   └── ffmpeg/
│   │   └── generation/
│   │
│   ├── providers/
│   │   ├── llm/
│   │   ├── tts/
│   │   └── storage/
│   │
│   └── shared/
│       ├── errors/
│       ├── middleware/
│       ├── utils/
│       └── types/
│
├── remotion/
│   └── src/
│       ├── compositions/
│       ├── scenes/
│       ├── components/
│       └── types/
│
├── storage/
│   ├── input/
│   │   ├── images/
│   │   └── audio/
│   ├── temp/
│   │   ├── renders/
│   │   └── processing/
│   └── output/
│       └── videos/
│
├── tests/
│   ├── product/
│   ├── product-import/
│   ├── script/
│   ├── storyboard/
│   ├── voice/
│   ├── video/
│   └── generation/
│
├── docs/
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
Module Architecture
Product Module

Location:

src/modules/product/

The Product module is responsible for creating a consistent internal product format for the rest of the AI pipeline.

Product data may arrive from different sources with different structures. The Product module converts that data into a normalized format.

Responsibilities:

Validate required product information
Normalize product fields
Prepare AI-ready product context
Maintain a consistent internal product structure

Example normalized data:

{
  "name": "Wireless Earbuds",
  "price": 999,
  "description": "Wireless Bluetooth earbuds",
  "features": [
    "Long battery life",
    "Fast charging"
  ],
  "images": []
}

The rest of the system should consume normalized product data rather than depending directly on a specific product source.

Product Import Module

Location:

src/modules/product-import/

This module is responsible for receiving product information from external sources.

The architecture separates product importing from product processing.

External Product Source
          │
          ▼
 Product Import Provider
          │
          ▼
    Raw Product Data
          │
          ▼
   Product Module
          │
          ▼
 Normalized Product Data

The provider-based design allows support for multiple sources in the future.

product-import/
└── providers/

Potential source support can include approved APIs, affiliate feeds, permitted integrations, or other supported product data sources.

Script Generation Module

Location:

src/modules/script/

The Script module transforms normalized product information into marketing content suitable for short-form video.

The generated result should be structured instead of being treated only as plain text.

Example conceptual output:

Hook
   ↓
Product Problem
   ↓
Product Introduction
   ↓
Features
   ↓
Benefits
   ↓
Call To Action

The script generation output will later be consumed by:

Storyboard generation
Voice generation
Caption generation
Video rendering

The module should therefore produce predictable structured output.

Prompt Architecture

Location:

src/modules/script/prompts/
src/modules/storyboard/prompts/

Prompt templates are kept separate from service logic.

This allows prompt instructions to be improved independently without mixing them with application flow.

Prompt responsibilities may include:

Defining AI role
Defining output format
Restricting unsupported claims
Defining content tone
Controlling video duration
Defining call-to-action requirements
Requesting structured JSON output

Prompt versioning can also be introduced later to compare different content generation strategies.

Storyboard Module

Location:

src/modules/storyboard/

The Storyboard module converts AI-generated content into a structured video plan.

The storyboard acts as the connection between AI-generated content and the video engine.

Example:

Scene 1
Duration: 0–3 seconds
Purpose: Hook

Scene 2
Duration: 3–7 seconds
Purpose: Product Introduction

Scene 3
Duration: 7–14 seconds
Purpose: Product Features

Scene 4
Duration: 14–20 seconds
Purpose: Call To Action

Each scene can contain information such as:

Scene ID
Start time
Duration
Script text
Caption text
Required image
Animation type
Visual instructions

This structured output can later be passed directly to the video rendering system.

Voice Module

Location:

src/modules/voice/

The Voice module converts generated script content into audio.

The module is designed to support multiple Text-to-Speech providers through a provider abstraction.

Structured Script
       │
       ▼
   Voice Module
       │
       ▼
 TTS Provider Layer
       │
       ▼
 Generated Audio

The generated audio result should provide metadata required by the rest of the system.

Possible metadata:

Audio file location
Duration
Format
Voice identifier
Generation status

The audio duration is especially important because the storyboard and captions may need to synchronize with the generated voice.

Caption Module

Location:

src/modules/captions/

The Caption module prepares text for visual display inside the generated video.

Captions are not only plain subtitles. They must eventually be associated with video timing.

Conceptual structure:

Start Time
End Time
Caption Text

Example:

0.0s → 2.5s
"LOOKING FOR BETTER WIRELESS EARBUDS?"

2.5s → 5.0s
"THIS PRODUCT OFFERS LONG BATTERY LIFE"

The Caption module must produce output that can be consumed by Remotion.

Media Module

Location:

src/modules/media/

The Media module manages media preparation before video rendering.

media/
├── image/
└── audio/
Image Processing

The image layer can handle:

Validation
Format checking
Resizing
Optimization
Aspect ratio preparation
Media metadata
Audio Processing

The audio layer can handle:

Duration detection
Format validation
Conversion
Temporary processing
Metadata extraction

This separation prevents media processing logic from being mixed directly with AI or video logic.

Video Module

Location:

src/modules/video/

The Video module is responsible for transforming structured generation data into a rendered video.

The video layer receives structured information from the upstream modules.

Storyboard
    +
Voice
    +
Captions
    +
Images
    │
    ▼
Video Module
    │
    ▼
Final Render

The implementation is separated into two major responsibilities:

video/
├── remotion/
└── ffmpeg/
Remotion Integration

Location:

src/modules/video/remotion/
remotion/

Remotion is responsible for timeline-based video composition.

The dedicated Remotion project contains:

remotion/
└── src/
    ├── compositions/
    ├── scenes/
    ├── components/
    └── types/
Compositions

A composition represents a complete video template.

Examples:

ProductReel
AffiliateProductVideo
FeatureShowcase
Scenes

Scenes represent sections of the complete video.

Hook Scene
Product Scene
Feature Scene
Benefit Scene
CTA Scene
Components

Reusable visual components.

Examples:

AnimatedText
ProductImage
Subtitle
ProgressIndicator
PriceTag
CallToAction

The video engine should consume dynamic data rather than relying on hardcoded product information.

FFmpeg Integration

Location:

src/modules/video/ffmpeg/

FFmpeg handles lower-level media operations.

Possible responsibilities:

Audio conversion
Video conversion
File compression
Format normalization
Media merging
Post-processing
Final optimization

The architecture keeps FFmpeg operations separate from scene and composition logic.

Generation Module

Location:

src/modules/generation/

The Generation module is the orchestration layer for the complete AI pipeline.

It coordinates the execution order of other modules.

Product
   │
   ▼
Script
   │
   ▼
Storyboard
   │
   ├──────────┐
   ▼          ▼
Voice      Captions
   │          │
   └────┬─────┘
        ▼
      Video
        │
        ▼
   Final Output

The Generation module should not contain the internal implementation of every feature.

Its responsibility is orchestration:

Start generation
Track generation state
Call modules in sequence
Pass outputs between modules
Handle failures
Return final generation results
Provider Architecture

Location:

src/providers/

External services are isolated through provider layers.

providers/
├── llm/
├── tts/
└── storage/

This architecture prevents business logic from depending directly on one AI company or service.

Conceptually:

Application
     │
     ▼
Provider Interface
     │
     ▼
External Service

This makes future provider replacement easier.

For example:

LLM Provider A
      ↓
can be replaced with
      ↓
LLM Provider B

without rewriting the complete Script module.

Storage Architecture

Location:

storage/

The local storage structure separates three different types of files.

storage/
├── input/
├── temp/
└── output/
Input

Original media entering the generation pipeline.

Examples:

Product images
Uploaded media
Input audio
Temporary Storage

Intermediate processing files.

Examples:

Render artifacts
Converted media
Temporary audio
Processing results

Temporary files should be cleaned after successful processing where appropriate.

Output

Completed generation results.

Examples:

final-video.mp4
generation-result.json
thumbnail.jpg

For production environments, this storage layer can later be replaced by cloud storage.

Shared Application Layer

Location:

src/shared/

Shared code contains functionality used by multiple modules.

shared/
├── errors/
├── middleware/
├── utils/
└── types/

The shared layer should not contain feature-specific business logic.

Feature-specific logic belongs inside its respective module.

Testing Architecture

Location:

tests/

Tests are organized according to application modules.

tests/
├── product/
├── product-import/
├── script/
├── storyboard/
├── voice/
├── video/
└── generation/

The purpose is to verify each stage independently before relying on the complete pipeline.

Product Tests

Verify:

Required fields
Normalization
Invalid input handling
Product Import Tests

Verify:

Source data handling
Invalid URL handling
Provider failures
Normalized output
Script Tests

Verify:

Valid structured output
Required sections
Output validation
Failure handling
Storyboard Tests

Verify:

Scene structure
Timing consistency
Required scene data
Voice Tests

Verify:

Audio generation result
Audio metadata
Provider error handling
Video Tests

Verify:

Render input
Composition validation
Generated output
Failure handling
Generation Tests

Verify the complete pipeline.

Product
   ↓
Script
   ↓
Storyboard
   ↓
Voice
   ↓
Captions
   ↓
Video

Generation tests are important because individual modules can work correctly while their integration may still fail.

Failure Handling Strategy

AI and media generation workflows can fail at different stages.

Examples:

LLM generation failed
TTS generation failed
Image processing failed
Video rendering failed
Storage upload failed

The system should identify:

Which generation stage failed?
What was the error?
Can the operation be retried?
Should temporary files be cleaned?

Future versions can introduce generation states such as:

PENDING
PROCESSING
SCRIPT_GENERATED
VOICE_GENERATED
RENDERING
COMPLETED
FAILED
Future Scalability

The architecture is designed to support future features without rebuilding the entire project.

Potential future extensions include:

Multiple AI providers
Multiple TTS providers
Multiple product data sources
Multiple video templates
Multiple aspect ratios
Different social media formats
Cloud storage
Background job processing
Queue systems
Generation retry systems
Generation history
Template selection
Brand-specific content generation
Analytics integration
Development Order

The project should be developed in dependency order.

Phase 1
Project foundation
    ↓
Health endpoint
Phase 2
Product input
    ↓
Product validation
    ↓
Product normalization
Phase 3
LLM integration
    ↓
AI script generation
Phase 4
Storyboard generation
Phase 5
Text-to-Speech integration
    ↓
Audio generation
Phase 6
Caption timing
Phase 7
Remotion composition
    ↓
Video rendering
Phase 8
FFmpeg processing
    ↓
Final MP4
Phase 9
Complete generation orchestration
Current Target

The first working version should achieve one complete result:

Normalized Product Data
        ↓
AI Marketing Script
        ↓
Storyboard
        ↓
AI Voiceover
        ↓
Captions
        ↓
Product Media
        ↓
Video Rendering
        ↓
Final MP4

The goal is to first build a reliable end-to-end generation pipeline. After that, advanced features such as multiple providers, background workers, cloud storage, additional templates, and automation can be added.
