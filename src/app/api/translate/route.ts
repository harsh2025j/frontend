import { NextRequest, NextResponse } from 'next/server';

const API_KEY = 'AIzaSyD_xyUrPxriF365f1KCMnpgpbfMtJmi1AI';

export async function POST(request: NextRequest) {
    try {
        const { text, targetLang } = await request.json();

        if (!text || !targetLang) {
            return NextResponse.json({ error: 'Missing text or targetLang' }, { status: 400 });
        }

        // Google Translate API expects 'q' to be an array for multiple strings or a single string
        // We will ensure we send it as is, but the response handling depends on it.

        const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                target: targetLang,
                format: 'html' // Use html to preserve formatting in content
            }),
        });

        const data = await response.json();

        if (data.error) {
            console.error('Google Translate API Error:', data.error);
            return NextResponse.json({ error: data.error.message }, { status: 400 });
        }

        const translations = data.data.translations.map((t: any) => t.translatedText);

        return NextResponse.json({ translatedText: translations });
    } catch (error) {
        console.error('Translation Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
