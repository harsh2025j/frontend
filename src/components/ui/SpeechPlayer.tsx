"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Volume2, MoreVertical, RotateCcw, FastForward } from "lucide-react";
import { Article, TimelineUpdate } from "@/data/features/article/article.types";

interface SpeechPlayerProps {
    article: Article;
}

type VoiceGender = "male" | "female" | "auto";

export default function SpeechPlayer({ article }: SpeechPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [gender] = useState<VoiceGender>("female");
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [currentUtteranceIndex, setCurrentUtteranceIndex] = useState(0);

    const synth = useRef<SpeechSynthesis | null>(null);
    const textChunks = useRef<{ text: string; gender: "male" | "female" }[]>([]);
    const activeUtterance = useRef<SpeechSynthesisUtterance | null>(null);

    // 1. Clean and Prepare Text
    const prepareText = useCallback(() => {
        const chunks: { text: string; gender: "male" | "female" }[] = [];

        const clean = (html: string) => {
            // Strip HTML
            let text = html.replace(/<[^>]*>?/gm, " ");
            // Strip URLs
            text = text.replace(/https?:\/\/\S+/g, "");
            return text.trim();
        };

        // Add Title
        chunks.push({ text: `Article Title: ${article.title}`, gender: "female" });

        // Add Subheadline
        if (article.subHeadline) {
            chunks.push({ text: clean(article.subHeadline), gender: "female" });
        }
        if (article.content) {
            chunks.push({ text: clean(article.content), gender: "female" });
        }

        // Add Timeline
        if (article.updates && article.updates.length > 0) {
            article.updates.forEach((update: TimelineUpdate) => {
                const dateStr = new Date(update.updateDate).toLocaleDateString("en-US", {
                    month: "long", day: "numeric"
                });
                chunks.push({
                    text: `Update for ${dateStr}: ${update.title ? update.title + "." : ""} ${clean(update.content)}`,
                    gender: "female"
                });
            });
        }

        // Add Main Content (split by paragraphs)
        const paragraphs = article.content.split(/<\/p>|<br\s*\/?>/).map(p => clean(p)).filter(p => p.length > 10);
        paragraphs.forEach((p) => {
            chunks.push({
                text: p,
                gender: "female"
            });
        });

        textChunks.current = chunks;

        // Estimate duration (~150 words per minute)
        const totalWords = chunks.reduce((acc, c) => acc + c.text.split(/\s+/).length, 0);
        setDuration(Math.ceil((totalWords / 150) * 60));
    }, [article]);

    // 2. Load Voices with enhanced refresh for premium engines (Chrome/Edge)
    useEffect(() => {
        if (typeof window === "undefined") return;

        synth.current = window.speechSynthesis;

        const updateVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
            }
        };

        // Initial call
        updateVoices();

        // Browser event for dynamic loading
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = updateVoices;
        }

        // Polling fallback for browsers that don't fire voiceschanged reliably
        // or for Chrome where Google voices are loaded asynchronously
        const intervalId = setInterval(() => {
            const currentVoices = window.speechSynthesis.getVoices();
            const hasGoogleVoice = currentVoices.some(v => v.name.toLowerCase().includes("google"));

            if (currentVoices.length !== voices.length || hasGoogleVoice) {
                updateVoices();
                if (hasGoogleVoice) clearInterval(intervalId); // Stop once we have the good ones
            }
        }, 500);

        const timeoutId = setTimeout(() => clearInterval(intervalId), 5000); // Stop after 5s anyway

        prepareText();

        return () => {
            if (synth.current) synth.current.cancel();
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };
    }, [prepareText, voices.length]);

    const getVoice = (targetGender: "male" | "female", targetLang: string) => {
        // High-quality voice candidates
        const premiumKeywords = ["google", "natural", "neural", "online", "premium"];

        // Extended Gender-specific indicators
        const maleKeywords = ["male", "guy", "david", "mark", "james", "andrew", "alex", "daniel", "ravi", "rishi", "desktop", "heera", "madhur"];
        const femaleKeywords = ["female", "girl", "zira", "samantha", "victoria", "aria", "stefanie", "sangeeta", "veena", "hazel", "isha", "kalpana", "hi-in"];

        const genderKeywords = targetGender === "male" ? maleKeywords : femaleKeywords;
        const oppositeKeywords = targetGender === "male" ? femaleKeywords : maleKeywords;

        // Filter voices by target language (Hindi vs English)
        const isHindi = targetLang.toLowerCase().startsWith("hi");
        const langCode = isHindi ? "hi" : "en";

        const langVoices = voices.filter(v => v.lang.toLowerCase().startsWith(langCode));

        // Sub-filter for IN (India) locale if possible
        const localVoices = langVoices.filter(v => v.lang.toLowerCase().includes("in"));

        // Final search pool: Try Indian-Specific first, then all for that language
        const voicePools = [localVoices, langVoices];

        for (const pool of voicePools) {
            if (pool.length === 0) continue;

            // Tier 1: Pool + Premium + Gender
            let selection = pool.find(v =>
                premiumKeywords.some(pk => v.name.toLowerCase().includes(pk)) &&
                genderKeywords.some(gk => v.name.toLowerCase().includes(gk)) &&
                !oppositeKeywords.some(ok => v.name.toLowerCase().includes(ok))
            );

            // Tier 2: Pool + Premium
            if (!selection) {
                selection = pool.find(v =>
                    premiumKeywords.some(pk => v.name.toLowerCase().includes(pk))
                );
            }

            // Tier 3: Pool + Gender
            if (!selection) {
                selection = pool.find(v =>
                    genderKeywords.some(gk => v.name.toLowerCase().includes(gk))
                );
            }

            // Tier 4: Pool Fallback
            if (!selection && pool.length > 0) {
                selection = targetGender === "male" ? pool[0] : pool[pool.length - 1];
            }

            if (selection) return selection;
        }

        return null;
    };

    const speakChunk = (index: number) => {
        if (!synth.current || index >= textChunks.current.length) {
            setIsPlaying(false);
            setCurrentUtteranceIndex(0);
            setCurrentTime(0);
            return;
        }

        const chunk = textChunks.current[index];
        const utterance = new SpeechSynthesisUtterance(chunk.text);

        // Determine language
        const artLang = article.language || "en";
        utterance.lang = artLang.startsWith("hi") ? "hi-IN" : "en-IN";

        // Determine voice
        let targetVoiceGender: "male" | "female" = chunk.gender;
        if (gender === "male") targetVoiceGender = "male";
        if (gender === "female") targetVoiceGender = "female";

        utterance.voice = getVoice(targetVoiceGender, utterance.lang);
        utterance.rate = playbackSpeed;
        utterance.pitch = 1; // Natural anchor pitch

        console.log(`[SpeechPlayer] Speaking with: ${utterance.voice?.name || "System Default"} (${targetVoiceGender})`);

        utterance.onstart = () => {
            setIsPlaying(true);
        };

        utterance.onend = () => {
            if (index + 1 < textChunks.current.length) {
                setCurrentUtteranceIndex(index + 1);
                speakChunk(index + 1);
            } else {
                setIsPlaying(false);
                setCurrentUtteranceIndex(0);
                setCurrentTime(0);
            }
        };

        utterance.onerror = (err) => {
            console.error("[SpeechPlayer] Utterance error:", err);
            setIsPlaying(false);
        };

        activeUtterance.current = utterance;
        if (synth.current) {
            synth.current.cancel(); // Clear any existing queue
            synth.current.speak(utterance);
        }
    };

    // 3. Real-time Progress Timer
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isPlaying) {
            timer = setInterval(() => {
                setCurrentTime(prev => {
                    if (prev < duration) return prev + 1;
                    return prev;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isPlaying, duration]);

    const handlePlayPause = () => {
        if (!synth.current) return;

        if (isPlaying) {
            synth.current.pause();
            setIsPlaying(false);
        } else {
            if (synth.current.paused) {
                synth.current.resume();
            } else {
                speakChunk(currentUtteranceIndex);
            }
            setIsPlaying(true);
        }
    };

    const handleStop = () => {
        if (synth.current) {
            synth.current.cancel();
            setIsPlaying(false);
            setCurrentUtteranceIndex(0);
            setCurrentTime(0);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Calculate progress
    const progressPercent = (currentUtteranceIndex / (textChunks.current.length || 1)) * 100;

    return (
        <div className="my-8 w-full">
            <p className="text-sm font-semibold text-gray-500 mb-2 ml-1">Listen to this Article</p>

            <div className="flex items-center gap-4 bg-[#F2F4F7] p-4 rounded-full shadow-sm border border-gray-100">
                {/* Play/Pause Button */}
                <button
                    onClick={handlePlayPause}
                    className="w-10 h-10 flex items-center justify-center bg-transparent text-gray-800 hover:bg-gray-200 rounded-full transition-colors"
                >
                    {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                </button>

                {/* Time Display */}
                <div className="text-sm font-medium text-gray-600 min-w-[80px]">
                    {formatTime(currentTime)} / {formatTime(duration)}
                </div>

                {/* Seek Bar */}
                <div className="flex-1 h-1 bg-gray-300 rounded-full overflow-hidden relative group cursor-pointer">
                    <div
                        className="absolute h-full bg-gray-600 transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                {/* Volume Icon */}
                <div className="hidden sm:flex items-center text-gray-600">
                    <Volume2 size={20} />
                </div>

                {/* More Options / Speed / Voice */}
                <div className="flex items-center gap-3 pr-2">
                    <select
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                        className="bg-transparent text-xs font-bold text-gray-600 outline-none cursor-pointer hover:text-gray-900"
                    >
                        <option value="1">1x</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2x</option>
                    </select>

                    <button className="text-gray-500 hover:text-gray-900">
                        <MoreVertical size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
