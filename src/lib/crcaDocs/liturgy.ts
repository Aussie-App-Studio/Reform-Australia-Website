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
  /^(optional\b|if (desired|appropriate|there)|here (the|follows)|the (minister|congregation|parents|candidates?|elders?|people|bride|groom|couple)\b[^.]{0,80}\b(stands?|rises?|kneels?|comes?|come|says?|respond|responds|answer|answers|sit|sits|faces?)\b)|\b(is|are|may be) (sung|read|said|prayed|offered)\b/i;

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

export function formatLiturgyHtml(html: string): string {
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

  const children = Array.from(root.children);
  let group: HTMLElement | null = null;
  let lines: HTMLElement | null = null;
  let groups = 0;

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
      groups++;
      continue;
    }

    if (RUBRIC_RE.test(text) && text.length < 220) {
      el.classList.add('rubric');
      group = null;
      continue;
    }

    // Continuation line of the current speaker.
    if (group && lines) {
      lines.appendChild(el);
    }
  }

  // Only keep the changes if the document really is a responsive liturgy.
  return groups >= 2 || root.querySelector('.form-subtitle, .rubric') ? root.innerHTML : html;
}
