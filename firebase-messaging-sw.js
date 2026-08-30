importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDFZCPczQ_xceK-lJHx70BHAxlQFJpP4uY",
  authDomain: "colisscan.firebaseapp.com",
  databaseURL: "https://colisscan-default-rtdb.firebaseio.com",
  projectId: "colisscan",
  storageBucket: "colisscan.firebasestorage.app",
  messagingSenderId: "454108666785",
  appId: "1:454108666785:web:a1fe1ddf69f932386309e0"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title || "تحديث جديد في ColisScan";
  const notificationOptions = {
    body: payload.notification.body || "تمت إضافة شحنة أو تحديث البيانات",
    icon: './icon.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});