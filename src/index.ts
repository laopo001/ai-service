import { Buffer } from 'node:buffer';

export interface Env {
  AI: Ai;
}

const DEFAULT_URL = "https://pub-dbcf9f0bd3af47ca9d40971179ee62de.r2.dev/02f6edc0-1f7b-4272-bd17-f05335104725/audio.mp3";

async function handleWhisper(request: Request, env: Env): Promise<Response> {
  let audioUrl = "";
  let language = "en";

  // Support both GET query params and POST JSON body
  if (request.method === "POST") {
    try {
      const body: any = await request.json();
      audioUrl = body.url || DEFAULT_URL;
      language = body.lang || "en";
    } catch (e) {
      // Fallback or error if body is empty/invalid but method is POST
      const { searchParams } = new URL(request.url);
      audioUrl = searchParams.get("url") || DEFAULT_URL;
      language = searchParams.get("lang") || "en";
    }
  } else {
    const { searchParams } = new URL(request.url);
    audioUrl = searchParams.get("url") || DEFAULT_URL;
    language = searchParams.get("lang") || "en";
  }

  try {
    const response = await fetch(audioUrl);
    if (!response.ok) {
      return Response.json({ error: `Failed to fetch audio: ${response.status}` }, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");

    const result = await env.AI.run("@cf/openai/whisper-large-v3-turbo", {
      audio: base64Audio,
      language: language,
    });

    return Response.json({
      success: true,
      source: audioUrl,
      language,
      result
    });
  } catch (e: any) {
    console.error(e);
    return Response.json({ 
      error: "An unexpected error occurred during AI processing",
      details: e.message 
    }, { status: 500 });
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    // Route distribution
    if (pathname === "/whisper") {
      return handleWhisper(request, env);
    }

    // Default route info
    return Response.json({
      service: "AI Service",
      endpoints: {
        whisper: {
          path: "/whisper",
          methods: ["GET", "POST"],
          params: {
            url: "Audio file URL (optional, defaults to sample)",
            lang: "ISO 639-1 code (optional, defaults to 'en')"
          }
        }
      }
    });
  },
} satisfies ExportedHandler<Env>;
