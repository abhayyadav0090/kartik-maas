/* Standalone service worker for the Kartik PWA. */
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

function pickIcon(data) { return '/kartik-icon-192.png'; }

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) {}
  const title = typeof data.title === 'string' ? data.title : 'Damodar Vows';
  const body = typeof data.body === 'string' ? data.body : 'You have vows to complete today.';
  const target = typeof data.url === 'string' && data.url.startsWith('/') ? data.url : '/';
  event.waitUntil(self.registration.showNotification(title, {
    body,
    icon: pickIcon(data),
    badge: '/kartik-icon-192.png',
    tag: typeof data.tag === 'string' ? data.tag : 'kartik-notification',
    data: { url: target, taskId: data.taskId || null },
    renotify: false,
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const relativeUrl = event.notification.data && event.notification.data.url;
  const target = new URL(typeof relativeUrl === 'string' && relativeUrl.startsWith('/') ? relativeUrl : '/', self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      if (new URL(client.url).origin === self.location.origin && 'focus' in client) {
        if ('navigate' in client && client.url !== target) await client.navigate(target);
        await client.focus();
        return;
      }
    }
    if (self.clients.openWindow) await self.clients.openWindow(target);
  })());
});
