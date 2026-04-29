// public/notification-handler.js

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'HostelHub Update', body: 'You have a new notification' };

  const options = {
    body: data.body,
    icon: '/icon-192x192.png', // Ensure you have this in /public
    badge: '/badge-72x72.png',
    data: { url: data.url || '/dashboard' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});