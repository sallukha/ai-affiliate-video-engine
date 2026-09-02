 # AI Affiliate Video Engine

AI Affiliate Video Engine is a Node.js and TypeScript project that will help generate affiliate marketing videos using AI.

The main purpose of this project is to take product information and convert it into a short marketing video.

## How It Works

The basic project flow will be:

Product Information
↓
AI generates a marketing script
↓
AI generates voice from the script
↓
Product images and media are added
↓
Captions are generated
↓
Video is created
↓
Final MP4 is generated

## Main Features

The project will include:

- Product information input
- Product URL import support in the future
- AI marketing script generation
- AI voice generation
- Storyboard generation
- Caption generation
- Image and media processing
- Video generation
- Final MP4 output

## Project Structure

```text
src/
├── config/          # Application configuration
├── modules/         # Main project features
├── providers/       # AI and external service integrations
└── shared/          # Common reusable code

remotion/            # Video templates and animations

storage/             # Images, audio, temporary files, and output videos

tests/               # Project testing

docs/                # Project documentation
