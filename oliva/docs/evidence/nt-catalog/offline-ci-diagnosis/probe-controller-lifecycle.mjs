import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

const output = new URL('./', import.meta.url);
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const events = [];
await page.exposeBinding('observeOfflineNative', (_source, event) => events.push(event));
await page.addInitScript(() => {
  const log = (type, extra = {}) => void window.observeOfflineNative({ type, at: performance.now(), epoch: Date.now(), url: location.href, visible: document.visibilityState, focused: document.hasFocus(), controller: navigator.serviceWorker.controller?.state ?? null, ...extra });
  log('document-start');
  navigator.serviceWorker.addEventListener('controllerchange', () => log('controllerchange'));
  document.addEventListener('visibilitychange', () => log('visibilitychange'));
  const register = navigator.serviceWorker.register.bind(navigator.serviceWorker);
  navigator.serviceWorker.register = (...args) => {
    log('register-start');
    const native = register(...args);
    void native.then(registration => log('register-native-resolved', { active: registration.active?.state, waiting: registration.waiting?.state, installing: registration.installing?.state }), error => log('register-native-rejected', { error: String(error) }));
    if (sessionStorage.getItem('diagnostic-hold-register') !== 'yes') return native;
    const gate = new Promise(resolve => { window.releaseDiagnosticRegistration = resolve; });
    return Promise.all([native, gate]).then(([registration]) => { log('register-return-released'); return registration; });
  };
  const post = ServiceWorker.prototype.postMessage;
  ServiceWorker.prototype.postMessage = function (...args) {
    if (args[0]?.type === 'OLIVA_BUILD') log('product-worker-query', { target: this.state });
    return Reflect.apply(post, this, args);
  };
});
async function snapshot(label) {
  const data = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    const query = worker => !worker ? Promise.resolve(null) : new Promise(resolve => {
      const channel = new MessageChannel();
      const finish = value => { clearTimeout(timer); channel.port1.close(); channel.port2.close(); resolve(value); };
      const timer = setTimeout(() => finish({ timeout: true }), 1500);
      channel.port1.onmessage = event => finish(event.data);
      worker.postMessage({ type: 'OLIVA_BUILD' }, [channel.port2]);
    });
    const cacheCounts = {};
    for (const key of await caches.keys()) cacheCounts[key] = (await (await caches.open(key)).keys()).length;
    return { url: location.href, visibility: document.visibilityState, focused: document.hasFocus(), expected: document.querySelector('meta[name="oliva-build"]')?.content,
      controller: navigator.serviceWorker.controller ? { state: navigator.serviceWorker.controller.state, reply: await query(navigator.serviceWorker.controller) } : null,
      registration: registration ? { active: registration.active?.state, reply: await query(registration.active) } : null,
      footer: document.body.innerText.split('\n').filter(line => /Offline-Paket|Offline-Neustart|Aktualisierung verfügbar/.test(line)), cacheCounts };
  });
  console.log(JSON.stringify({ label, ...data }));
  return { label, ...data };
}
const snapshots = [];
try {
  await page.goto('http://localhost:4186/einstellungen');
  await expect(page.getByText('Für den Offline-Neustart bereit.', { exact: true })).toBeVisible({ timeout: 30000 });
  snapshots.push(await snapshot('seed-native-ready'));
  await page.evaluate(() => sessionStorage.setItem('diagnostic-hold-register', 'yes'));
  const cdp = await context.newCDPSession(page);
  await cdp.send('Page.enable');
  await cdp.send('Page.reload', { ignoreCache: true });
  await expect(page.getByRole('textbox', { name: 'Dein Vorname (freiwillig)' })).toBeVisible();
  snapshots.push(await snapshot('forced-reload-native-document'));
  await expect(page.getByText('Offline-Paket noch nicht vollständig. Mit Verbindung erneut öffnen.', { exact: true })).toBeVisible({ timeout: 15000 }).catch(error => snapshots.push({ label: 'unavailable-not-observed', message: error.message }));
  snapshots.push(await snapshot('after-finite-retries'));
  await page.screenshot({ path: new URL('controller-lifecycle-after-retries.png', output).pathname });
  await page.evaluate(() => window.releaseDiagnosticRegistration?.());
  await expect(page.getByText('Für den Offline-Neustart bereit.', { exact: true })).toBeVisible({ timeout: 15000 });
  snapshots.push(await snapshot('after-native-registration-release'));
} finally {
  await writeFile(new URL('controller-lifecycle.json', output), JSON.stringify({ scope: 'Frozen 0.11 dist, localhost:4186, actual Chromium force reload and real native registration; only returned registration promise held.', events, snapshots }, null, 2) + '\n');
  await browser.close();
}
