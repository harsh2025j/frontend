import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

// In-memory cache for audio chunks
const audioCache = new Map<string, { buffer: Buffer; timestamp: number }>();
const MAX_CACHE_ENTRIES = 500;

function cleanCache() {
    if (audioCache.size > MAX_CACHE_ENTRIES) {
        const oldestKeys = Array.from(audioCache.entries())
            .sort((a, b) => a[1].timestamp - b[1].timestamp)
            .slice(0, 150)
            .map(([k]) => k);
        for (const k of oldestKeys) {
            audioCache.delete(k);
        }
    }
}

function getVoiceName(lang: string, gender: string): string {
    const isMale = (gender || "male").toLowerCase() === "male";
    // Microsoft Edge Neural bilingual models for Indian languages:
    // hi-IN-MadhurNeural (Male) and hi-IN-SwaraNeural (Female) natively speak
    // both Hindi and English with natural pronunciation and legal terminology.
    return isMale ? "hi-IN-MadhurNeural" : "hi-IN-SwaraNeural";
}

function getRateString(speed: string): string {
    const spd = parseFloat(speed);
    if (isNaN(spd) || spd === 1) return "+0%";
    const percent = Math.round((spd - 1) * 100);
    return percent >= 0 ? `+${percent}%` : `${percent}%`;
}

/**
 * Pure Node.js Microsoft Edge Neural Speech Synthesizer.
 * Runs natively in Node.js on local dev & Vercel serverless functions without Python.
 */
function synthesizeWithEdgeTts(voice: string, rate: string, text: string): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
        try {
            const tts = new MsEdgeTTS();
            await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
            const { audioStream } = tts.toStream(text, { rate });
            const chunks: Buffer[] = [];

            const timer = setTimeout(() => {
                audioStream.destroy(new Error("MsEdgeTTS stream timeout"));
            }, 12000);

            audioStream.on("data", (chunk: Buffer) => chunks.push(chunk));
            audioStream.on("end", () => {
                clearTimeout(timer);
                const buf = Buffer.concat(chunks);
                if (buf.length > 0) {
                    resolve(buf);
                } else {
                    reject(new Error("Empty audio buffer received from MsEdgeTTS"));
                }
            });
            audioStream.on("error", (err: unknown) => {
                clearTimeout(timer);
                reject(err instanceof Error ? err : new Error(String(err)));
            });
        } catch (err) {
            reject(err instanceof Error ? err : new Error(String(err)));
        }
    });
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get("text");
    const lang = searchParams.get("lang") || "en";
    const gender = searchParams.get("gender") || "male";
    const speed = searchParams.get("speed") || "1";

    if (!text || !text.trim()) {
        return new NextResponse("Text parameter is required", { status: 400 });
    }

    const trimmedText = text.trim().slice(0, 3000);
    const voiceName = getVoiceName(lang, gender);
    const rateStr = getRateString(speed);
    const cacheKey = `${voiceName}_${rateStr}_${trimmedText}`;

    // 1. Check in-memory cache
    const cached = audioCache.get(cacheKey);
    if (cached) {
        return new NextResponse(new Uint8Array(cached.buffer), {
            status: 200,
            headers: {
                "Content-Type": "audio/mpeg",
                "Cache-Control": "public, max-age=86400, s-maxage=86400",
                "X-TTS-Engine": "Edge-Neural",
                "X-TTS-Voice": voiceName,
                "X-Cache": "HIT",
            },
        });
    }

    // 2. Synthesize with Microsoft Edge Neural Voice
    try {
        const buffer = await synthesizeWithEdgeTts(voiceName, rateStr, trimmedText);
        cleanCache();
        audioCache.set(cacheKey, { buffer, timestamp: Date.now() });

        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                "Content-Type": "audio/mpeg",
                "Cache-Control": "public, max-age=86400, s-maxage=86400",
                "X-TTS-Engine": "Edge-Neural",
                "X-TTS-Voice": voiceName,
                "X-Cache": "MISS",
            },
        });
    } catch (edgeError) {
        console.warn("[TTS API] Edge-TTS error, signaling client for Web Speech fallback:", edgeError);
        return new NextResponse(
            JSON.stringify({
                error: "Edge-TTS synthesis unavailable",
                fallback: "client-webspeech",
                details: edgeError instanceof Error ? edgeError.message : String(edgeError),
            }),
            {
                status: 503,
                headers: {
                    "Content-Type": "application/json",
                    "X-TTS-Fallback": "client-webspeech",
                },
            }
        );
    }
}
