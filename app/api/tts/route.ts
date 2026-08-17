import { NextRequest, NextResponse } from "next/server";

// Same-origin TTS proxy. Streams Japanese audio from Google Translate / Youdao
// through the app server so playback isn't broken by browser-side referer
// checks, extensions, or cross-origin media blocking. Falls through to the
// client's next fallback tier on any upstream failure (502).

const MAX_QUERY_LENGTH = 300;

function buildUpstreamUrl(provider: "google" | "youdao", text: string): string {
  const encoded = encodeURIComponent(text);
  if (provider === "youdao") {
    return `https://dict.youdao.com/dictvoice?audio=${encoded}&le=jap`;
  }
  return `https://translate.google.com/translate_tts?ie=UTF-8&tl=ja&client=tw-ob&q=${encoded}`;
}

export async function GET(request: NextRequest) {
  const text = (request.nextUrl.searchParams.get("q") || "").trim();
  const provider = request.nextUrl.searchParams.get("p") === "youdao" ? "youdao" : "google";

  if (!text) {
    return NextResponse.json({ error: "Missing q parameter" }, { status: 400 });
  }

  try {
    const upstream = await fetch(buildUpstreamUrl(provider, text.slice(0, MAX_QUERY_LENGTH)), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
        Referer: "https://translate.google.com/",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    const contentType = upstream.headers.get("content-type") || "";
    if (!upstream.ok || !contentType.includes("audio")) {
      return NextResponse.json({ error: `Upstream ${provider} failed` }, { status: 502 });
    }

    const audioBuffer = await upstream.arrayBuffer();
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(audioBuffer.byteLength),
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "TTS fetch failed" }, { status: 502 });
  }
}
