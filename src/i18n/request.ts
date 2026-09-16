import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;
    if (!locale || !routing.locales.includes(locale as any)) {
        locale = routing.defaultLocale;
    }

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default,
        onError(error) {
            // Prevent SSR crash on missing translations
            if (process.env.NODE_ENV === 'development') {
                console.error(error);
            }
        },
        getMessageFallback({ key, namespace }) {
            return namespace ? `${namespace}.${key}` : key;
        }
    };
});
