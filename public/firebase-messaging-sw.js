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
    const notificationOptions = {
        body: payload?.notification?.body || payload?.data?.body || 'You have a new update.',
        icon: '/logo-gold.png',
        badge: '/logo-gold.png',
        data: payload?.data || {}
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = event.notification.data?.url || '/dashboard';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes('/dashboard') && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
