const CACHE = 'marethur-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/src/logo.png',
  '/src/frota.jpeg',
  '/src/hotel.jpeg',
  '/src/onibus.jpeg',
  '/src/favicon.ico'
];

// Instalar: cache dos assets principais
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); })
  );
  self.skipWaiting();
});

// Ativar: limpar caches antigos
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch: cache-first para assets, network-first para HTML
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  // Sempre busca HTML da rede
  if(url.pathname.endsWith('.html') || url.pathname === '/'){
    e.respondWith(
      fetch(e.request)
        .then(function(r){
          var clone = r.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
          return r;
        })
        .catch(function(){ return caches.match(e.request); })
    );
    return;
  }
  // Cache-first para imagens e outros assets
  e.respondWith(
    caches.match(e.request).then(function(cached){
      return cached || fetch(e.request).then(function(r){
        var clone = r.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        return r;
      });
    })
  );
});
