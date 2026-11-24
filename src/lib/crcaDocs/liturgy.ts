// Presentation pass for liturgical forms and worship readings.
//
// The source Markdown (synced from the crca-forms-and-documents repo) writes responsive
// readings as one paragraph per line, prefixed with a bare speaker letter:
//
//   M O give thanks to the LORD, call on His name,
//   make known among the nations what He has done.
//   C He remembers His covenant for ever,
//
// That reads poorly on screen. This pass (display only, the files are untouched):
//  - groups each speaker's lines together under a clear label (Minister / All)
//  - sets continuation lines close together, like verse
//  - styles rubrics ("A psalm or hymn of praise is sung.") as quiet italic directions
//  - turns a leading "— a baptismal service —" line into a subtitle instead of a bullet

const SPEAKERS: Record<string, { label: string; role: 'leader' | 'people' }> = {
  M: { label: 'Minister', role: 'leader' },
  Minister: { label: 'Minister', role: 'leader' },
  L: { label: 'Leader', role: 'leader' },
  Leader: { label: 'Leader', role: 'leader' },
  C: { label: 'All', role: 'people' },
  Congregation: { label: 'All', role: 'people' },
  All: { label: 'All', role: 'people' },
  People: { label: 'All', role: 'people' },
};

// The forms mark speakers with a bare letter (M / C / L). Whole words only count with a colon
// ("People:"), because forms also open lines with "People of God, dear friends",
// "Congregation of our Lord Jesus Christ", "All members of…", which are not speaker cues.
const SPEAKER_RE = /^\s*(?:(Minister|Congregation|Leader|People|All)(?=[\s ]*:)|(M|C|L)(?=[\s :]|$))/;

const RUBRIC_RE =
  /^(optional\b|if (desired|appropriate|there)|here (the|follows)|the (minister|congregation|parents|candidates?|elders?|deacons?|office ?bearers?|people|bride|groom|couple)\b[^.]{0,80}\b(stands?|rises?|kneels?|comes?|come|says?|respond|responds|answer|answers|sit|sits|faces?|sings?|is seated|are seated|remains?|remain|prays?|reads?)\b)|\b(is|are|may be) (sung|read|said|prayed|offered)\b/i;

function startsWithSpeaker(p: HTMLElement): { speaker: string } | null {
  // Footnote refs can sit straight after the letter ("M[^1] O give thanks"), so test the
  // leading text node only.
  const first = p.firstChild;
  if (!first || first.nodeType !== Node.TEXT_NODE) return null;
  const m = (first.textContent ?? '').match(SPEAKER_RE);
  if (!m) return null;
  // A one-letter prefix must be followed by real text, not be a word like "C." on its own.
  return { speaker: m[1] ?? m[2] };
}

function stripSpeaker(p: HTMLElement, speaker: string) {
  const first = p.firstChild!;
  first.textContent = (first.textContent ?? '').replace(new RegExp(`^\\s*${speaker}[\\s\\u00a0:]*`), '');
  // Footnote marker that was attached to the speaker letter ("M[^1] O give thanks…"):
  // move it to the end of that line so the line starts with the words.
  if ((first.textContent ?? '').trim() === '') {
    const marker = first.nextSibling;
    first.remove();
    if (marker && marker.nodeType === Node.ELEMENT_NODE) {
      const after = marker.nextSibling;
      if (after && after.nodeType === Node.TEXT_NODE) after.textContent = (after.textContent ?? '').replace(/^[s ]+/, '');
      // place it just before the first line break (end of the first line), or at the end
      const br = p.querySelector('br');
      if (br) p.insertBefore(marker, br);
      else p.appendChild(marker);
    }
  }
}

function isPlainParagraph(el: Element): el is HTMLParagraphElement {
  return el.tagName === 'P' && !el.classList.length;
}


// ---------- Text clean-up (display only) ----------

const SENTENCE_END_RE = /[.?!…:]["'”’)\]]*$/;
const OPEN_END_RE = /[A-Za-z0-9]$/;
const FUNCTION_WORD_END_RE = /\b(of|the|a|an|to|in|and|or|your|his|her|their|our|my|with|for|by|at|on|as|that|this|these)$/i;
const DASH_ITEM_RE = /^[–—-]\s+/;
const LABEL_RE = /^(either|or|and|then|prayer|to (elders|deacons|ministers|the congregation[^:]*)|regarding (elders|deacons)|charge|charges)\s*:$/i;
const DIRECTION_END_RE = /\b(minister|congregation|elders?|deacons?|office ?bearers?|parents|candidates?|people|members|couple|bride|groom|reader|chairman)\b[^:]{0,80}\b(shall say|says|say|asks?|answers?|responds?|reads?|prays?|in unison)\b[^:]{0,40}:$|\b(individually|in unison|may be used)[^:]{0,40}:$/i;

/** Text of a paragraph without footnote markers. */
function lineText(p: Element): string {
  const c = p.cloneNode(true) as Element;
  c.querySelectorAll('sup, .fn-ref').forEach((s) => s.remove());
  return (c.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function firstText(p: Element): string {
  return (p.textContent ?? '').trimStart();
}

/** Tidy footnote markers: "catholic*[1]" -> "catholic[1]", "them,"[9]calling" -> "them,"[9] calling". */
function tidyFootnotes(root: Element) {
  root.querySelectorAll('sup, .fn-ref').forEach((sup) => {
    const node: Node = sup.parentElement?.tagName === 'A' && sup.parentElement.childNodes.length === 1 ? sup.parentElement : sup;
    const prev = node.previousSibling;
    if (prev && prev.nodeType === Node.TEXT_NODE && /\*$/.test(prev.textContent ?? '')) {
      prev.textContent = (prev.textContent ?? '').replace(/\*+$/, '');
    }
    const next = node.nextSibling;
    if (next && next.nodeType === Node.TEXT_NODE) {
      let t = next.textContent ?? '';
      t = t.replace(/^\d{1,2} (?=[a-z])/, ' '); // stray footnote digit left in the text ("[11]1 priests")
      if (/^[A-Za-z(]/.test(t) && !/^[A-Z]$/.test(prev?.textContent?.trim() ?? '')) t = ' ' + t;
      next.textContent = t;
    }
  });
}

/** Join a sentence that the source split over two paragraphs ("…mature in" / "the faith, whose…"). */
function joinBrokenLines(root: Element, doc: Document) {
  for (const a of Array.from(root.children)) {
    if (!isPlainParagraph(a) || !a.isConnected) continue;
    let b = a.nextElementSibling;
    while (b && isPlainParagraph(b)) {
      const at = lineText(a);
      const bt = lineText(b);
      if (!at || !bt || !OPEN_END_RE.test(at) || startsWithSpeaker(b as HTMLElement)) break;
      const lower = /^[a-z]/.test(bt);
      if (!((lower && bt.length > 110) || FUNCTION_WORD_END_RE.test(at))) break;
      a.append(doc.createTextNode(' '), ...Array.from(b.childNodes));
      const gone = b;
      b = b.nextElementSibling;
      gone.remove();
    }
  }
}

/** Paragraphs that start with an en dash become a list. */
function dashLists(root: Element, doc: Document) {
  let list: HTMLUListElement | null = null;
  for (const el of Array.from(root.children)) {
    const isItem = isPlainParagraph(el) && DASH_ITEM_RE.test(firstText(el));
    if (!isItem) {
      list = null;
      continue;
    }
    if (!list) {
      list = doc.createElement('ul');
      list.className = 'dash-list';
      el.before(list);
    }
    const first = el.firstChild;
    if (first && first.nodeType === Node.TEXT_NODE) first.textContent = (first.textContent ?? '').replace(/^\s*[–—-]\s+/, '');
    const li = doc.createElement('li');
    li.append(...Array.from(el.childNodes));
    list.appendChild(li);
    el.remove();
  }
  // a single dash line is just a sentence
  root.querySelectorAll(':scope > ul.dash-list').forEach((ul) => {
    if (ul.children.length > 1) return;
    const p = doc.createElement('p');
    p.append('– ', ...Array.from(ul.firstElementChild!.childNodes));
    ul.replaceWith(p);
  });
}

/** Short cue lines: "EITHER:", "Prayer:", "To Elders:" as labels; "…the minister shall say:" as directions. */
function labelsAndDirections(root: Element) {
  for (const el of Array.from(root.children)) {
    if (!isPlainParagraph(el) || startsWithSpeaker(el as HTMLElement)) continue;
    const t = lineText(el);
    if (t.length <= 40 && LABEL_RE.test(t)) {
      el.classList.add('form-label');
      el.textContent = t.replace(/:$/, '');
    } else if (t.length < 200 && DIRECTION_END_RE.test(t) && !ADDRESSED_RE.test(t)) {
      el.classList.add('rubric');
    }
  }
}

/**
 * Runs of short lines (psalms, creeds, Scripture set out as verse) are one paragraph per line in
 * the source, which spaces every line apart. Set them as verse: lines close together, a small gap
 * after each sentence, and lines that continue a sentence indented.
 */
function verseBlocks(root: Element, doc: Document) {
  const flush = (run: Element[]) => {
    if (run.length < 3) return;
    const texts = run.map(lineText);
    if (!texts.slice(0, -1).some((t) => !SENTENCE_END_RE.test(t))) return; // prose, not verse
    const wrap = doc.createElement('div');
    wrap.className = 'verse';
    run[0].before(wrap);
    run.forEach((p, i) => {
      if (i < run.length - 1 && SENTENCE_END_RE.test(texts[i])) p.classList.add('stanza-end');
      if (/^[a-z]/.test(texts[i])) p.classList.add('cont');
      wrap.appendChild(p);
    });
  };
  let run: Element[] = [];
  for (const el of Array.from(root.children)) {
    if (isPlainParagraph(el) && lineText(el).length <= 90 && !el.querySelector('br')) run.push(el);
    else {
      flush(run);
      run = [];
    }
  }
  flush(run);
}

/** Directions are written about people ("the minister says"), never to them. */
const ADDRESSED_RE = /\b(you|your|we|us|our)\b/i;

export function formatLiturgyHtml(html: string, opts: { readings?: boolean } = {}): string {
  if (typeof DOMParser === 'undefined' || !html) return html;
  const doc = new DOMParser().parseFromString(`<div id="root">${html}</div>`, 'text/html');
  const root = doc.getElementById('root');
  if (!root) return html;

  // Subtitle: a lone list item like "a baptismal service —" right at the top.
  const firstList = root.querySelector(':scope > ul');
  if (firstList && firstList.children.length === 1) {
    const text = firstList.textContent?.trim() ?? '';
    const before = firstList.previousElementSibling;
    if (/—\s*$/.test(text) && (!before || /^H[12]$/.test(before.tagName))) {
      const p = doc.createElement('p');
      p.className = 'form-subtitle';
      p.textContent = text.replace(/^[—–-]\s*|\s*[—–-]$/g, '');
      firstList.replaceWith(p);
    }
  }

  tidyFootnotes(root);
  dashLists(root, doc);
  joinBrokenLines(root, doc);
  if (!opts.readings) labelsAndDirections(root);

  const children = Array.from(root.children);
  let group: HTMLElement | null = null;
  let lines: HTMLElement | null = null;

  for (const el of children) {
    if (!isPlainParagraph(el)) {
      group = null;
      continue;
    }
    const text = el.textContent?.trim() ?? '';
    const sp = startsWithSpeaker(el);

    if (sp && text.length > sp.speaker.length + 1) {
      const meta = SPEAKERS[sp.speaker];
      stripSpeaker(el, sp.speaker);
      group = doc.createElement('div');
      group.className = `resp resp-${meta.role}`;
      const label = doc.createElement('span');
      label.className = 'resp-label';
      label.textContent = meta.label;
      lines = doc.createElement('div');
      lines.className = 'resp-lines';
      group.append(label, lines);
      el.replaceWith(group);
      lines.appendChild(el);
      continue;
    }

    if (!opts.readings && RUBRIC_RE.test(text) && text.length < 220 && !ADDRESSED_RE.test(text)) {
      el.classList.add('rubric');
      group = null;
      continue;
    }

    // Continuation line of the current speaker.
    if (group && lines) {
      if (/^[a-z]/.test(text) && text.length <= 90) el.classList.add('cont');
      lines.appendChild(el);
    }
  }

  verseBlocks(root, doc);

  return root.innerHTML;
}
