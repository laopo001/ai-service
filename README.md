# AI Service (Cloudflare Worker)

A Cloudflare Worker that provides AI services using Workers AI.

## Features
- **Whisper**: Speech-to-text using `@cf/openai/whisper-large-v3-turbo`.

## Usage

### Development
```bash
npm run dev
```

### Deployment
```bash
npm run deploy
```

### API
- **Endpoint**: `GET /`
- **Query Parameters**:
  - `url`: (Optional) The URL of the MP3 file to transcribe. Defaults to a sample audio file.
  - `lang`: (Optional) ISO 639-1 language code (e.g., "en", "zh").
