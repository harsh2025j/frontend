interface UseGoogleTranslateResult {
    translatedText: string | string[] | null;
    loading: boolean;
    error: any;
}

export function useGoogleTranslate(text: string | string[] | null): UseGoogleTranslateResult {
    // Return original text immediately. No API call. No Loading state.
    return { 
        translatedText: text, 
        loading: false, 
        error: null 
    };
}