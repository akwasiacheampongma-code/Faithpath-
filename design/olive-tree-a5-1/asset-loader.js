/** One visible-stage variant, with cancellation and same-stage fallbacks.
 * Source art, comparisons and QA media are never requested by this module. */
import { LOAD_TIMEOUT_MS } from './config.js';
export function selectVariant(stage, cssWidth, dpr = 1.5) {
  const target = Math.max(1, cssWidth) * dpr * stage.art.scale;
  return stage.variants.find((v) => v.width >= target) || stage.variants.at(-1);
}
function abortError() {
  return new DOMException('Bildanforderung abgebrochen.', 'AbortError');
}
async function decode(variant, signal, timeoutMs) {
  if (signal?.aborted) throw abortError();
  const img = new Image();
  img.decoding = 'async';
  let timer,
    abort,
    loaded = false;
  try {
    const cancelled = new Promise((_, reject) => {
      abort = () => {
        img.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
        reject(abortError());
      };
      signal?.addEventListener('abort', abort, { once: true });
      timer = setTimeout(
        () => reject(Error('Zeitüberschreitung beim Baumbild.')),
        timeoutMs,
      );
    });
    img.src = new URL(variant.src, import.meta.url).href;
    await Promise.race([img.decode(), cancelled]);
    if (signal?.aborted) throw abortError();
    if (
      img.naturalWidth !== variant.width ||
      img.naturalHeight !== variant.width
    )
      throw Error('Unerwartete Bildgröße.');
    loaded = true;
    return img;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
    if (!loaded)
      img.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
  }
}
export async function loadStageAsset(
  stage,
  cssWidth,
  dpr,
  { signal, timeoutMs = LOAD_TIMEOUT_MS } = {},
) {
  const preferred = selectVariant(stage, cssWidth, dpr),
    alternatives = [
      preferred,
      ...stage.variants
        .filter((v) => v !== preferred)
        .sort(
          (a, b) =>
            Math.abs(a.width - preferred.width) -
            Math.abs(b.width - preferred.width),
        ),
    ];
  let error;
  for (const variant of alternatives) {
    try {
      return { image: await decode(variant, signal, timeoutMs), variant };
    } catch (e) {
      if (e.name === 'AbortError') throw e;
      error = e;
    }
  }
  throw error || Error('Baumbild nicht verfügbar.');
}
