// firebase-messaging-sw.js

// Importez les scripts Firebase nécessaires pour FCM dans le service worker
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// Initialisez Firebase dans le Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyAmVSJwvMama0h79rPHiUvPKRgZnfjymXA",
  authDomain: "agenda-bed4f.firebaseapp.com",
  projectId: "agenda-bed4f",
  storageBucket: "agenda-bed4f.firebasestorage.app",
  messagingSenderId: "993980335293",
  appId: "1:993980335293:web:90aa697c134c89e8b5e3d4"
});

// Récupérez une instance de Firebase Messaging pour gérer les notifications en arrière-plan
const messaging = firebase.messaging();

// Optionnel : Gérez les notifications reçues en arrière-plan
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Personnalisez l'affichage de la notification ici
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png' // Changez l'icône si nécessaire
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});