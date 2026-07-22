const BASE="/qingtian-mood/";
const CACHE="qingtian-local-v8";
const MOODS=["super-happy","small-happy","light","shy","calm","speechless","tired","anxious","sad","angry"];
const SHELL=[
  BASE,
  `${BASE}index.html`,
  `${BASE}manifest.webmanifest`,
  `${BASE}icon.svg`,
  `${BASE}icon-192.png`,
  `${BASE}icon-512.png`,
  ...MOODS.map(name=>`${BASE}moods/${name}.webp`)
];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

async function fetchAndCache(request){
  const response=await fetch(request);
  if(response.ok){
    const cache=await caches.open(CACHE);
    cache.put(request,response.clone());
  }
  return response;
}

async function cacheFirst(request){
  const cached=await caches.match(request);
  if(cached)return cached;
  return fetchAndCache(request);
}

async function instantPage(request,event){
  const cache=await caches.open(CACHE);
  const cached=await cache.match(request,{ignoreSearch:true})||await cache.match(BASE)||await cache.match(`${BASE}index.html`);
  const refresh=fetchAndCache(request).catch(()=>null);
  if(cached){event.waitUntil(refresh);return cached}
  return await refresh||new Response("暂时无法打开晴天，请检查网络后重试。",{status:503,headers:{"Content-Type":"text/plain;charset=utf-8"}});
}

self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET")return;
  const url=new URL(request.url);
  if(url.origin!==location.origin)return;
  if(request.mode==="navigate"){
    event.respondWith(instantPage(request,event));
    return;
  }
  const isReusableAsset=url.pathname.includes(`${BASE}moods/`)||url.pathname.includes(`${BASE}assets/`)||/\.(?:webp|png|svg|css|js|webmanifest)$/.test(url.pathname);
  if(isReusableAsset)event.respondWith(cacheFirst(request).catch(()=>caches.match(request)));
});
