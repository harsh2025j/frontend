importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

firebase.initializeApp({
    apiKey: "AIzaSyBKkIgYyPqGNirX_K4DFklYh-I_HvHKCFg",
    authDomain: "legaltechsolution-3f4e5.firebaseapp.com",
    projectId: "legaltechsolution-3f4e5",
    storageBucket: "legaltechsolution-3f4e5.firebasestorage.app",
    messagingSenderId: "287309577955",
    appId: "1:287309577955:web:d024203b05be9b01580fd6",
    measurementId: "G-88RRSP2L7E"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload?.notification?.title || payload?.data?.title || 'Sajjad Husain Legal Academy';
    const tag = payload?.data?.articleId
        ? `article-${payload.data.articleId}`
        : (payload?.data?.tag || payload?.data?.id || notificationTitle);

    const notificationOptions = {
        body: payload?.notification?.body || payload?.data?.body || 'You have a new update.',
        icon: '/logo-gold.png',
        badge: '/logo-gold.png',
        tag: tag,
        renotify: false,
        data: payload?.data || {}
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Force immediate activation of updated service worker
self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

function getAcademyHost(host) {
    if (host.startsWith('academy.')) return host;
    const cleanHost = host.replace(/^www\./, '');
    if (cleanHost.startsWith('127.0.0.1')) {
        return cleanHost.replace('127.0.0.1', 'academy.localhost');
    }
    return 'academy.' + cleanHost;
}

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const rawData = event.notification.data || {};
    // Firebase Web SDK can store payload in FCM_MSG.data when auto-displayed,
    // or directly in event.notification.data when displayed via onBackgroundMessage.
    const data = rawData.FCM_MSG?.data || rawData.data || rawData;
    const rawUrl = data.url;

    // Check if notification belongs to Academy (by portal tag, type, or path)
    const isAcademy = data.portal === 'academy' ||
        (data.type && String(data.type).toLowerCase().startsWith('academy')) ||
        (rawUrl && (rawUrl.startsWith('/dashboard') || rawUrl.startsWith('/academy')));

    let targetUrl;

    if (rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))) {
        targetUrl = rawUrl;
    } else if (isAcademy) {
        // Academy URLs must always point to the academy subdomain
        let cleanPath = rawUrl || '/dashboard';
        cleanPath = cleanPath.replace(/^\/academy/, '');
        if (!cleanPath.startsWith('/')) {
            cleanPath = '/' + cleanPath;
        }

        const proto = self.location.protocol;
        const academyHost = getAcademyHost(self.location.host);
        targetUrl = `${proto}//${academyHost}${cleanPath}`;
    } else {
        // Main site fallback: default to '/' rather than a non-existent /dashboard
        targetUrl = rawUrl || '/';
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
