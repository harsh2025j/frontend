import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";

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
    return gender === "male" ? "hi-IN-MadhurNeural" : "hi-IN-SwaraNeural";
}

function getRateString(speed: string): string {
    const spd = parseFloat(speed);
    if (isNaN(spd) || spd === 1) return "+0%";
    const percent = Math.round((spd - 1) * 100);
    return percent >= 0 ? `+${percent}%` : `${percent}%`;
}

function synthesizeWithEdgeTts(voice: string, rate: string, text: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const candidatePaths = [
            "/home/keshav-pathak/Projects/LegalTech/frontend/.venv-tts/bin/edge-tts",
            path.join(process.cwd(), ".venv-tts", "bin", "edge-tts"),
            path.join(process.cwd(), "frontend", ".venv-tts", "bin", "edge-tts"),
            "/tmp/tts_venv/bin/edge-tts",
        ];
        const binaryPath = candidatePaths.find((p) => fs.existsSync(p));

        if (!binaryPath) {
            return reject(new Error(`edge-tts binary not found in candidates: ${candidatePaths.join(", ")}`));
        }

        const tempFile = path.join("/tmp", `edge_tts_${crypto.randomUUID()}.mp3`);

        execFile(
            binaryPath,
            ["--voice", voice, "--rate", rate, "--text", text, "--write-media", tempFile],
            { timeout: 12000 },
            (err, stdout, stderr) => {
                if (err) {
                    console.error("[TTS API] execFile error:", err, "stderr:", stderr);
                    if (fs.existsSync(tempFile)) {
                        try { fs.unlinkSync(tempFile); } catch {}
                    }
                    return reject(err);
                }
                try {
                    const buf = fs.readFileSync(tempFile);
                    try { fs.unlinkSync(tempFile); } catch {}
                    resolve(buf);
                } catch (readErr) {
                    reject(readErr);
                }
            }
        );
    });
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get("text");
    const lang = searchParams.get("lang") || "en";
    const gender = searchParams.get("gender") || "female";
    const speed = searchParams.get("speed") || "1";

    if (!text || !text.trim()) {
        return new NextResponse("Text parameter is required", { status: 400 });
    }

    const trimmedText = text.trim().slice(0, 500);
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
        console.warn("[TTS API] Edge-TTS error, falling back:", edgeError);

        // Fallback to Google Translate TTS
        try {
            const encodedText = encodeURIComponent(trimmedText);
            const targetLang = lang.toLowerCase().startsWith("hi") ? "hi-IN" : "en-IN";
            const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${targetLang}&client=tw-ob&ttsspeed=${speed}`;

            const response = await fetch(fallbackUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                    "Referer": "https://translate.google.com/",
                },
            });

            if (!response.ok) {
                return new NextResponse("TTS generation failed", { status: 500 });
            }

            const arrayBuf = await response.arrayBuffer();
            const nodeBuf = Buffer.from(arrayBuf);
            audioCache.set(cacheKey, { buffer: nodeBuf, timestamp: Date.now() });

            return new NextResponse(new Uint8Array(nodeBuf), {
                status: 200,
                headers: {
                    "Content-Type": "audio/mpeg",
                    "Cache-Control": "public, max-age=86400, s-maxage=86400",
                    "X-TTS-Engine": "Google-Fallback",
                    "X-Cache": "MISS",
                },
            });
        } catch (fallbackError) {
            console.error("[TTS API] All TTS engines failed:", fallbackError);
            return new NextResponse("Failed to generate speech", { status: 500 });
        }
    }
}
