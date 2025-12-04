import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';

interface UseGoogleTranslateResult {
    translatedText: string | string[] | null;
    loading: boolean;
    error: any;
}

export function useGoogleTranslate(text: string | string[] | null): UseGoogleTranslateResult {
    const [translatedText, setTranslatedText] = useState<string | string[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const locale = useLocale();

    useEffect(() => {
        if (!text || locale === 'en') {
            setTranslatedText(text);
            return;
        }

        // If text is an empty array, do nothing
        if (Array.isArray(text) && text.length === 0) {
            setTranslatedText([]);
            return;
        }

        const translate = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/translate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text,
                        targetLang: locale,
                    }),
                });

                const data = await response.json();

                if (data.error) {
                    throw new Error(data.error);
                }

                setTranslatedText(data.translatedText);
            } catch (err) {
                console.error('Translation failed:', err);
                setError(err);
                // Fallback to original text on error
                setTranslatedText(text);
            } finally {
                setLoading(false);
            }
        };

        translate();
    }, [text, locale]);

    return { translatedText, loading, error };
}
