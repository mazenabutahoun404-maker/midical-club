/** Run after `vite build`: node src/integration/offline-build.mjs dist */
import { readdir,stat,writeFile,readFile } from 'node:fs/promises';
import { resolve,join,relative } from 'node:path';
import { createHash } from 'node:crypto';
const root=resolve(process.argv[2]||'dist');
const assets=[];
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())await walk(path);else if((await stat(path)).size<20*1024*1024)assets.push('/'+relative(root,path).replaceAll('\\','/'));}}
await walk(join(root,'assets'));
const html=await readFile(join(root,'index.html'),'utf8');
const version=createHash('sha256').update(html+assets.sort().join('\n')).digest('hex').slice(0,16);
// Cache only this build's static assets. Never intercept API responses or private PDF URLs.
const worker=`const CACHE='medclub-shell-${version}';const ASSETS=${JSON.stringify(['/',...assets])};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('medclub-shell-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(url.origin!==self.location.origin||event.request.method!=='GET')return;if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(()=>caches.open(CACHE).then(cache=>cache.match('/'))));return;}if(!ASSETS.includes(url.pathname))return;event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(event.request))||fetch(event.request)));});`;
await writeFile(join(root,'medclub-sw.js'),worker);
console.log('Offline worker generated:',version,assets.length,'static assets. Serve medclub-sw.js at the origin root as application/javascript.');
