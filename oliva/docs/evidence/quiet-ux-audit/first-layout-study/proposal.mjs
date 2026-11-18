/** Review-only DOM layout studies over the unchanged, qualified 0.18 app.
 * Not imported by app/src, not a delivered implementation or acceptance result.
 * Keeps all application handlers and every existing destination in the document.
 */
export function applyProposal({ area, variant }) {
  const main = document.querySelector('[role="main"]');
  if (!main) throw new Error('No application main landmark');
  const headings = [...main.querySelectorAll('h1,[role="heading"]')];
  const heading = headings[0];
  const text = (value) => [...main.querySelectorAll('div,p,span,h1')].find(e => e.textContent === value && ![...e.children].some(c => c.textContent === value));
  const button = (value) => [...main.querySelectorAll('[role="button"],button')].find(e => e.getAttribute('aria-label') === value || e.textContent.trim() === value);
  const style = (node, values) => { if (node) Object.assign(node.style, values); };
  const content = [...main.querySelectorAll('div')].find(e => e.style.maxWidth === '1200px' || e.style.maxWidth === '1040px');
  const dark = getComputedStyle(main).color === 'rgb(243, 240, 228)' || [...document.querySelectorAll('div')].some(e => e.style.backgroundColor === 'rgb(25, 37, 31)');
  const line = dark ? '#455044' : '#dedfd4';
  const css = document.createElement('style');
  css.dataset.olivaReviewOnly = variant;
  css.textContent = `[data-quiet-row] {border-radius:0!important;border-width:0 0 1px!important;border-color:${line}!important;background:transparent!important;}
    [data-quiet-segments] {display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px!important;}
    [data-quiet-segments]>[role=button] {border-radius:12px!important;min-width:0!important;padding:12px 8px!important;min-height:48px!important;justify-content:center!important;align-items:center!important;}
    [data-quiet-segments]>[role=button]>div {white-space:normal!important;text-align:center!important;}
    @media(min-width:600px){[data-quiet-segments]{grid-template-columns:repeat(4,minmax(0,1fr));}}
    [data-quiet-study] h1 {overflow-wrap:anywhere;}
    [data-quiet-study] [role=button]:focus-visible {outline:3px solid #a47c32;outline-offset:3px;}`;
  document.head.append(css);
  content?.setAttribute('data-quiet-study', variant);
  style(heading, { fontSize: '34px', lineHeight: '40px', marginTop: '4px', marginBottom: '10px' });
  if (area === 'heute') {
    const header = heading?.parentElement?.parentElement;
    const columns = content?.children[1];
    const primary = columns?.children[0], secondary = columns?.children[1];
    const heroHeading = headings[1], hero = heroHeading?.parentElement?.parentElement;
    const heroBody = heroHeading?.parentElement;
    style(header, { marginBottom: '18px' });
    style(hero, { height: 'auto', minHeight: variant === 'A' ? '246px' : '220px' });
    style(heroBody, { padding: '22px', gap: '12px' });
    style(heroHeading, { fontSize: '34px', lineHeight: '37px' });
    if (variant === 'B' && heading) heading.textContent = 'Schön, dass du da bist.';
    style(primary, { gap: '20px' });
    if (secondary && primary && variant === 'B') {
      // Same existing garden card, every control retained; place it after reading/verse/path.
      const garden = secondary.children[0];
      if (garden) { primary.append(garden); style(garden, { padding: '18px', alignItems: 'stretch' }); }
    }
  } else if (area === 'bibel') {
    const list = main.querySelector('[data-testid="bible-book-list"]');
    const word = main.querySelector('[data-testid="spiritual-word-card"]');
    const resumeLabel = text('HIER KANNST DU WEITERLESEN');
    style(resumeLabel?.parentElement, { padding: '16px', marginBottom: '16px', gap: '8px' });
    const resumeFoot = [...(resumeLabel?.parentElement?.children ?? [])].at(-1);
    style(resumeFoot, { lineHeight: '17px' });
    const context = text('Die Bibel ist eine Sammlung verschiedener Bücher – von Erzählungen bis zu Briefen.');
    style(context, { marginBottom: '14px' });
    if (list && word && innerWidth < 960) {
      // The exact card remains reachable in the same hub; follows the books in A.
      const host = word.parentElement;
      if (variant === 'A') list.parentElement.append(host);
      else {
        // B: one compact two-column reading reminder before the list, no text removed.
        style(word, { padding: '14px', gap: '8px' });
        style(word.querySelector('[data-testid="spiritual-sword-artwork"]'), { width: '64px', height: '96px' });
        for (const image of word.querySelectorAll('img')) style(image, { width: '64px', height: '96px', objectFit: 'contain' });
      }
    }
    for (const card of list?.children ?? []) {
      card.setAttribute('data-quiet-row', '');
      const row = card.children[0]; style(row, { padding: '12px 2px', minHeight: '64px', gap: '12px' });
      style(row?.children[0], { width: '28px', height: '32px', backgroundColor: 'transparent' });
      const name = row?.children[1]?.children[0]; style(name, { fontSize: '23px', lineHeight: '27px' });
    }
    style(list, { gap: '0px' });
  } else if (area === 'wege') {
    if (heading) heading.textContent = 'Deine Wege.';
    const intro = text('Ein Weg ist eine kleine, geführte Reise durch ein Thema der Bibel. Du liest kurze Abschnitte, bekommst verständliche Erklärungen und kannst über das Gelernte nachdenken.');
    if (intro) { intro.textContent = 'Kurze Bibelabschnitte, verständliche Erklärungen und freiwillige Gedanken. Ohne Vorwissen.'; style(intro, { marginBottom: '16px' }); }
    const flow = text('Lesen → Verstehen → Nachdenken')?.parentElement;
    style(flow, { padding: '14px', marginBottom: '16px' });
    const filters = button('Alle Wege')?.parentElement;
    style(filters, { gap: '6px', marginBottom: '16px' });
    if (variant === 'B' && filters) {
      // Real existing category controls, no new category, no horizontal scrolling.
      style(filters, { display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))' });
      for (const f of filters.children) style(f, { borderRadius: '12px', padding: '12px', minHeight: '48px' });
    }
    const intentions = text('Ein Gedanke darf Alltag werden.')?.parentElement;
    if (intentions && content) content.append(intentions);
    const cards = [...main.querySelectorAll('[role="button"]')].filter(e => /Minuten.*Schritten$/.test(e.getAttribute('aria-label') ?? ''));
    for (const [i, card] of cards.entries()) {
      const picture = card.children[0];
      if (variant === 'A' || i === 0) style(picture, { height: '104px' });
      else { style(picture, { height: '78px', width: '92px', alignSelf: 'flex-start' }); style(card, { borderRadius: '14px' }); }
      style(card.children[1], { padding: '16px', gap: '7px' });
    }
  } else if (area === 'sammlung') {
    const segments = button('Gedanken')?.parentElement;
    segments?.setAttribute('data-quiet-segments', '');
    style(segments, { marginBottom: '18px' });
    // Both avoid clipped labels: A wraps into a deliberate 2x2 segment; B uses a real native select.
    if (variant === 'B' && segments) {
      const options = [...segments.children];
      const select = document.createElement('select'); select.setAttribute('aria-label', 'Bereich deiner Sammlung');
      style(select, { font: 'inherit', fontSize: '16px', minHeight: '48px', width: '100%', padding: '10px', border: `1px solid ${line}`, borderRadius: '12px', background: 'transparent', color: 'inherit', marginBottom: '16px' });
      options.forEach((o, i) => { const option = document.createElement('option'); option.value = String(i); option.textContent = o.textContent; option.selected = o.getAttribute('aria-pressed') === 'true'; select.append(option); });
      select.onchange = () => options[Number(select.value)].click();
      segments.before(select);
      // Original controls remain visible as a secondary segment during review; production decision pending.
      style(segments, { opacity: '0.85' });
    }
  } else if (area === 'garten') {
    if (heading) heading.textContent = 'Dein Garten.';
    const intro = [...(content?.children ?? [])].find(e => e.textContent.startsWith('Dein Olivenbaum erinnert'));
    style(intro, { marginBottom: '18px' });
    const layout = [...(content?.children ?? [])].find(e => e.style.alignItems === 'stretch');
    const card = layout?.children[0]; style(card, { padding: '20px', gap: '10px' });
    const meanings = text('Was die Bilder bedeuten')?.parentElement;
    const love = text('Du musst nichts verdienen.')?.parentElement;
    if (variant === 'B' && layout?.children[1] && content) content.append(layout.children[1]);
    style(meanings, { padding: '18px' }); style(love, { padding: '18px' });
  }
  return { variant, area, label: 'Nicht ausgelieferte Gestaltungsvorschau über unverändertem 0.18-Build', removedDestinations: 0 };
}
