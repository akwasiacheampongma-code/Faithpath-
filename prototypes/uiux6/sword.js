// Presentation-only copy of the existing renderer; no reading authority or persistence.
(function () {
  // Presentation-only projections. Reading authority remains bible-journey.js.
  function swordReadingState(summary) {
    const total = summary.books.reduce((n, b) => n + b.chapters, 0);
    return {
      chapters: summary.chapters,
      total,
      completedBooks: summary.completedBooks,
      reveal: total
        ? Math.sqrt(Math.min(1, Math.max(0, summary.chapters / total)))
        : 0,
    };
  }
  const countLabel = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  function groupOriginPairs(pairs) {
    const groups = new Map();
    for (const pair of pairs) {
      const key = pair.before.route;
      if (!groups.has(key)) groups.set(key, { before: pair.before, pairs: [] });
      groups.get(key).pairs.push(pair);
    }
    return [...groups.values()];
  }
  function progressiveSword(summary, id = "journey-sword") {
    const x = swordReadingState(summary),
      height = 238 * x.reveal,
      y = 264 - height;
    const blade =
      "M114 83 L114 231 Q114 248 130 264 Q146 248 146 231 L146 83 Z";
    const hilt =
      "M125 45 L122 37 L130 27 L138 37 L135 45 L135 70 Q147 76 155 72 L158 82 Q145 88 135 83 L135 94 L125 94 L125 83 Q115 88 102 82 L105 72 Q113 76 125 70 Z";
    return `<svg class="journey-sword" viewBox="0 0 260 292" role="img" aria-label="Schwert als Symbol deiner Bibelreise: ${x.chapters} von ${x.total} Kapiteln erkundet"><defs><clipPath id="${id}-reveal"><rect x="90" y="${y}" width="80" height="${height}"/></clipPath><linearGradient id="${id}-metal" x1="0" x2="1"><stop stop-color="var(--sword-edge)"/><stop offset=".45" stop-color="var(--sword-metal)"/><stop offset=".55" stop-color="var(--sword-light)"/><stop offset="1" stop-color="var(--sword-edge)"/></linearGradient></defs><ellipse class="sword-halo" cx="130" cy="148" rx="89" ry="114"/><g class="sword-outline"><path d="${blade}"/><path d="${hilt}"/><path d="M130 94 V255"/></g><g clip-path="url(#${id}-reveal)"><path class="sword-blade" d="${blade}" fill="url(#${id}-metal)"/><path class="sword-hilt" d="${hilt}"/><path class="sword-grip" d="M125 48 H135 M125 54 H135 M125 60 H135"/><path class="sword-seam" d="M130 95 V251"/></g><g class="sword-olive ${x.completedBooks ? "sword-olive--complete" : ""}" fill="none"><path d="M111 257 Q83 238 83 202 M149 257 Q177 238 177 202"/><path d="M88 238 Q68 239 70 225 Q85 224 88 238 M84 223 Q68 216 75 205 Q88 212 84 223 M91 245 Q94 226 104 229 Q109 244 91 245 M172 238 Q192 239 190 225 Q175 224 172 238 M176 223 Q192 216 185 205 Q172 212 176 223 M169 245 Q166 226 156 229 Q151 244 169 245"/></g></svg>`;
  }

  globalThis.FaithPathSword = progressiveSword;
})();
