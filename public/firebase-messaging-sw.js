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
    // console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo-gold.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
