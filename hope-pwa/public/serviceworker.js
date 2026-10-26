// Nama Cache untuk PWA
const CACHE_NAME = 'hope-pwa-v2'

// Event Install Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Menginstal...')
  self.skipWaiting()
})

// Event Activate
self.addEventListener('activate', (event) => {
  console.log('Service Worker: diaktifkan')
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  )
  return self.clients.claim()
})

// Event Fetch: utamakan internet, simpan salinan, pakai cache kalau offline
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const salinan = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, salinan))
        return response
      })
      .catch(() =>
        caches.match(event.request).then((hasil) => hasil || caches.match('/'))
      )
  )
})