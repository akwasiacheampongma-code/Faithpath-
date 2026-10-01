"""Critical drawer acceptance against the built app; supports local or live URL.
Run with Python Playwright installed: python tests/menu-qa.py [URL] [OUTPUT].
"""
import json,sys,time,os
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=(sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:4174').rstrip('/')
OUT=Path(sys.argv[2] if len(sys.argv)>2 else 'qa-output/menu');OUT.mkdir(parents=True,exist_ok=True)
checks={};errors=[];console=[];details={}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('FAITHPATH_CHROMIUM','/usr/bin/chromium'),args=['--no-sandbox'])
 c=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,device_scale_factor=3,service_workers='allow')
 c.add_init_script("window.__rejections=[];window.__touches=0;document.addEventListener('touchstart',()=>window.__touches++,true);window.addEventListener('unhandledrejection',e=>window.__rejections.push(String(e.reason)));")
 page=c.new_page();page.set_default_timeout(10000)
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('console',lambda m:console.append(m.text) if m.type=='error' else None)
 page.goto(BASE,wait_until='networkidle')
 if page.locator('dialog[open]').count():page.get_by_role('dialog').get_by_role('button',name='Direkt zur Bibel',exact=True).tap()
 page.goto(BASE+'/#today',wait_until='networkidle')
 button=page.locator('#menu-toggle');panel=page.locator('#main-menu')
 def opened():
  assert panel.is_visible();assert button.get_attribute('aria-expanded')=='true'
  assert page.evaluate('document.querySelector(".page").inert')
  assert page.evaluate('getComputedStyle(document.body).overflow')=='hidden'
  assert page.evaluate('document.querySelector("#main-menu").contains(document.activeElement)')
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 def closed(focus=True):
  assert not panel.is_visible();assert button.get_attribute('aria-expanded')=='false'
  assert not page.locator('#menu-overlay').is_visible()
  assert not page.evaluate('document.querySelector(".page").inert')
  assert page.evaluate('getComputedStyle(document.body).overflow')!='hidden'
  if focus:assert page.evaluate('document.activeElement.id')=='menu-toggle'
 def test(name,fn):
  try:fn();checks[name]='PASS';print('PASS',name,flush=True)
  except Exception as e:
   checks[name]='FAIL';details[name]=str(e);print('FAIL',name,str(e),flush=True)
   page.screenshot(path=str(OUT/(name+'-failed.png')))
   if panel.is_visible():page.keyboard.press('Escape')
 def opening():button.tap();opened();page.screenshot(path=str(OUT/'drawer-mobile.png'));button.tap();closed()
 test('menu_open',opening);checks['aria_expanded']=checks['menu_open']
 def closing():
  button.tap();opened();button.tap();closed()
  button.tap();opened();panel.get_by_role('button',name='Menü schließen').tap();closed()
 test('menu_close',closing)
 def escape():button.tap();page.keyboard.press('Escape');closed()
 test('menu_escape',escape)
 def overlay():button.tap();page.locator('#menu-overlay').tap(position={'x':5,'y':80});closed()
 test('menu_overlay_close',overlay)
 def repeat():
  for _ in range(10):button.tap();opened();button.tap();closed()
 test('menu_repeat_10',repeat)
 def reload():page.goto(BASE+'/#today');page.reload(wait_until='networkidle');button.tap();opened();button.tap();closed()
 test('menu_after_reload',reload)
 def targets():
  global quiz_href,story_href
  button.tap();links=panel.get_by_role('link');items=[(links.nth(i).inner_text(),links.nth(i).get_attribute('href')) for i in range(links.count())];button.tap()
  details['menu_items']=[]
  for label,href in items:
   button.tap();panel.get_by_role('link',name=label,exact=True).tap();page.wait_for_url('**/'+href);closed(False)
   assert page.locator('main h1').is_visible();assert 'Hier ist gerade nichts.' not in page.locator('main').inner_text()
   details['menu_items'].append({'label':label,'href':href,'heading':page.locator('main h1').inner_text()})
  page.goto(BASE+'/#quizzes');quiz_href=page.locator('main a[href^="#quiz/"]').first.get_attribute('href')
  page.goto(BASE+'/#discover');story_href=page.locator('main a[href^="#story/"]').first.get_attribute('href')
 test('all_available_menu_items',targets)
 def deeplink():
  for route in ['#read/JHN/1/otb',story_href,quiz_href]:
   page.goto(BASE+'/'+route,wait_until='networkidle')
   if route.startswith('#read'):page.locator('.verse').first.wait_for()
   assert page.locator('main h1').is_visible();button.tap();opened();button.tap();closed()
 test('menu_after_deeplink',deeplink)
 def back():
  page.goto(BASE+'/#today');button.tap();panel.get_by_role('link',name='Journal',exact=True).tap();page.go_back(wait_until='networkidle');button.tap();opened();button.tap();closed()
 test('menu_after_browser_back',back)
 def touch():assert page.evaluate('window.__touches')>0;button.tap();opened();button.tap();closed()
 test('menu_mobile_touch',touch)
 def keyboard():
  button.tap();panel.get_by_role('link').last.focus();page.keyboard.press('Tab');assert page.evaluate('document.activeElement.id')=='menu-toggle'
  page.keyboard.press('Shift+Tab');assert panel.get_by_role('link').last.evaluate('(e)=>e===document.activeElement')
  page.keyboard.press('Escape');closed()
 test('menu_keyboard_focus',keyboard)
 def sw():
  page.evaluate('async()=>{await navigator.serviceWorker.ready}')
  for _ in range(100):
   if page.evaluate('!!navigator.serviceWorker.controller'):break
   page.wait_for_timeout(100)
  assert page.evaluate('!!navigator.serviceWorker.controller')
  c.set_offline(True);page.reload(wait_until='networkidle');button.tap();opened();button.tap();closed();c.set_offline(False)
 test('menu_with_active_service_worker_offline',sw)
 details['technical']=page.evaluate('''()=>({pointer_events:getComputedStyle(document.querySelector('#menu-toggle')).pointerEvents,z_index:getComputedStyle(document.querySelector('#menu-toggle')).zIndex,aria_controls:document.querySelector('#menu-toggle').getAttribute('aria-controls'),expanded:document.querySelector('#menu-toggle').getAttribute('aria-expanded'),overlay_hidden:document.querySelector('#menu-overlay').hidden,drawer_hidden:document.querySelector('#main-menu').hidden,scroll_lock:document.body.classList.contains('menu-open'),service_worker:navigator.serviceWorker.controller?.scriptURL,rejections:window.__rejections})''')
 result={'checks':checks,'details':details,'console_errors':console,'page_errors':errors,'engine':'Chromium','viewport':'390x844','touch':True,'url':BASE}
 (OUT/'results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');b.close()
if 'FAIL' in checks.values() or errors or console or details['technical']['rejections']:sys.exit(1)
