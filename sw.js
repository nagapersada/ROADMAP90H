// VERSI: KILL-SWITCH-FINAL
// Tujuannya: Menghapus cache, mencopot service worker, dan memaksa mode online.

const CACHE_NAME = 'kill-switch-v1';

self.addEventListener('install', (e) => {
  // 1. Paksa script ini segera aktif
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      // 2. HAPUS SEMUA CACHE (Lagu, HTML, Logo yang tersimpan di HP)
      return Promise.all(keyList.map((key) => {
        console.log('Menghapus cache:', key);
        return caches.delete(key);
      }));
    }).then(() => {
      // 3. MATIKAN SERVICE WORKER (Unregister)
      // Agar HP tidak lagi mencoba menyimpan aplikasi ini secara offline
      return self.registration.unregister();
    }).then(() => {
      // 4. Ambil alih kontrol halaman segera
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (e) => {
  // 5. NETWORK ONLY (Wajib Internet)
  // Jangan pernah ambil dari memori HP. Selalu minta ke GitHub.
  e.respondWith(
    fetch(e.request, {
      cache: 'no-store' 
    }).catch(() => {
      // Jika internet mati atau file di GitHub dihapus, tampilkan pesan error
      return new Response("Aplikasi Tidak Tersedia Offline. Koneksi Internet Diperlukan.", {
        status: 503,
        statusText: "Service Unavailable",
        headers: new Headers({ "Content-Type": "text/plain" })
      });
    })
  );
});
