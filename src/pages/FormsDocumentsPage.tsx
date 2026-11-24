import {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  FileDown,
  FileText,
  FolderOpen,
  History,
  List,
  Menu,
  Printer,
  Search,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { FootnotePopover } from '../components/crcaDocs/FootnotePopover';
import { ServicePrepPanel } from '../components/crcaDocs/ServicePrepPanel';
import {
  DOC_IDS,
  EXTENSION_URLS,
  encodeDocUrl,
  fetchDocsIndex,
  fetchDocMarkdown,
  fetchSearchIndex,
  fetchSyncMeta,
  flattenDocs,
  searchDocuments,
} from '../lib/crcaDocs/client';
import {
  BIBLE_VERSIONS,
  analyzeFormSchema,
  applyFormPersonalization,
  buildWordDocumentHtml,
  formatForSlides,
  linkifyChurchOrderRefsHtml,
  linkifyDocRefsHtml,
  linkifyScriptureHtml,
} from '../lib/crcaDocs/features';
import { getDocumentRelatedLinks } from '../lib/crcaDocs/harmony';
import { formatLiturgyHtml } from '../lib/crcaDocs/liturgy';
import {
  extractQaMarkdown,
  extractSectionMarkdown,
  extractWcfSectionMarkdown,
  getCleanHtml,
  getCleanText,
  parseMarkdown,
  slugify,
} from '../lib/crcaDocs/markdown';
import type {
  DocsIndex,
  FlattenedDocItem,
  ParsedFootnote,
  SearchIndex,
  SyncMeta,
  TableChoices,
} from '../lib/crcaDocs/types';
import { formatAuDate } from '../utils/formatDate';

const PREFS_STORAGE_KEY = 'crcaDocsPrefs_v1';

interface ReaderPrefs {
  fontSize: number;
  showFootnotes: boolean;
  bibleVersion: string;
  bookmarks: string[];
  recentDocs: string[];
}

const DEFAULT_PREFS: ReaderPrefs = {
  fontSize: 16,
  showFootnotes: true,
  bibleVersion: 'NIV',
  bookmarks: [],
  recentDocs: [],
};

const QUICK_JUMP_CHIPS = [
  { label: 'LD 1', hint: "Heidelberg Lord's Day 1" },
  { label: 'Q 1', hint: 'Heidelberg Q&A 1' },
  { label: 'BC 29', hint: 'Belgic Confession Art. 29' },
  { label: 'CD 1:7', hint: 'Canons of Dort 1:7' },
  { label: 'WCF 1:6', hint: 'Westminster 1:6' },
  { label: 'CO 52', hint: 'Church Order Art. 52' },
];

function loadPrefs(): ReaderPrefs {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<ReaderPrefs>;
    return {
      fontSize:
        typeof parsed.fontSize === 'number'
          ? Math.min(22, Math.max(14, parsed.fontSize))
          : DEFAULT_PREFS.fontSize,
      showFootnotes:
        typeof parsed.showFootnotes === 'boolean'
          ? parsed.showFootnotes
          : DEFAULT_PREFS.showFootnotes,
      bibleVersion:
        typeof parsed.bibleVersion === 'string' &&
        BIBLE_VERSIONS.includes(parsed.bibleVersion)
          ? parsed.bibleVersion
          : DEFAULT_PREFS.bibleVersion,
      bookmarks: Array.isArray(parsed.bookmarks)
        ? parsed.bookmarks.filter((x): x is string => typeof x === 'string')
        : [],
      recentDocs: Array.isArray(parsed.recentDocs)
        ? parsed.recentDocs.filter((x): x is string => typeof x === 'string')
        : [],
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeDecodeHash(hash: string): string {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function FormsDocumentsPage() {
  const { docId } = useParams<{ docId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [docsIndex, setDocsIndex] = useState<DocsIndex | null>(null);
  const [searchIndex, setSearchIndex] = useState<SearchIndex | null>(null);
  const [syncMeta, setSyncMeta] = useState<SyncMeta | null>(null);
  const [indexError, setIndexError] = useState<string | null>(null);

  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const [activeCategory, setActiveCategory] = useState(
    () => searchParams.get('category') ?? 'all'
  );
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(() =>
    Boolean(!docId && (searchParams.get('q') || searchParams.get('category')))
  );

  const [rawMd, setRawMd] = useState('');
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);

  const [prefs, setPrefs] = useState<ReaderPrefs>(() => loadPrefs());
  const [prepOpen, setPrepOpen] = useState(false);
  const [prepValues, setPrepValues] = useState<Record<string, string>>({});
  const [tableChoices, setTableChoices] = useState<TableChoices>({});
  const [copyMenuOpen, setCopyMenuOpen] = useState(false);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [activeFootnote, setActiveFootnote] = useState<ParsedFootnote | null>(null);
  const [highlightedFnId, setHighlightedFnId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const copyMenuRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<number | null>(null);
  const lastScrolledKeyRef = useRef<string>('');
  const lastFootnoteTriggerRef = useRef<HTMLElement | null>(null);
  const prevUrlCategoryRef = useRef<string | null>(searchParams.get('category'));

  const closeFootnote = useCallback(() => {
    setActiveFootnote(null);
    const trigger = lastFootnoteTriggerRef.current;
    lastFootnoteTriggerRef.current = null;
    if (trigger && trigger.isConnected) {
      window.requestAnimationFrame(() => trigger.focus());
    }
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMsg(null);
    }, 2400);
  }, []);

  // Persist user preferences
  useEffect(() => {
    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Ignore storage quota errors
    }
  }, [prefs]);

  // Load library index & sync metadata on mount
  useEffect(() => {
    let cancelled = false;
    fetchDocsIndex()
      .then((idx) => {
        if (!cancelled) setDocsIndex(idx);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setIndexError(
            err instanceof Error ? err.message : 'Unable to load CRCA document library.'
          );
        }
      });

    fetchSyncMeta().then((meta) => {
      if (!cancelled) setSyncMeta(meta);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Sync URL search params (category & query) when navigated from external links
  useEffect(() => {
    const nextQ = searchParams.get('q') ?? '';
    const urlCat = searchParams.get('category');
    setQuery((prev) => (prev.trim() === nextQ.trim() ? prev : nextQ));
    if (urlCat !== null) {
      setActiveCategory(urlCat);
    } else if (!docId && prevUrlCategoryRef.current !== null) {
      setActiveCategory('all');
    }
    prevUrlCategoryRef.current = urlCat;
    if (!docId && (nextQ.trim() || (urlCat ?? 'all') !== 'all')) {
      setMobileDrawerOpen(true);
    }
  }, [searchParams, docId]);

  // Lazy-load search index when user searches
  const ensureSearchIndex = useCallback(() => {
    if (searchIndex) return;
    fetchSearchIndex()
      .then((si) => setSearchIndex(si))
      .catch(() => {
        // Metadata search still works without search-index.json
      });
  }, [searchIndex]);

  useEffect(() => {
    if (query.trim().length > 0) {
      ensureSearchIndex();
    }
  }, [query, ensureSearchIndex]);

  const allDocs = useMemo(() => {
    return docsIndex ? flattenDocs(docsIndex) : [];
  }, [docsIndex]);

  const docsById = useMemo(() => {
    const map = new Map<string, FlattenedDocItem>();
    for (const d of allDocs) {
      map.set(d.id, d);
    }
    return map;
  }, [allDocs]);

  const currentDoc = useMemo(() => {
    if (!docId) return null;
    return docsById.get(docId) ?? null;
  }, [docId, docsById]);

  // Load markdown whenever currentDoc changes
  useEffect(() => {
    setActiveFootnote(null);
    setCopyMenuOpen(false);
    setOutlineOpen(false);
    setPrepValues({});
    setTableChoices({});
    setPrepOpen(false);
    setHighlightedFnId(null);

    if (!currentDoc) {
      setRawMd('');
      setDocError(null);
      return;
    }

    let cancelled = false;
    setLoadingDoc(true);
    setDocError(null);

    fetchDocMarkdown(currentDoc.path)
      .then((md) => {
        if (!cancelled) {
          setRawMd(md);
          setLoadingDoc(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setDocError(err instanceof Error ? err.message : 'Unable to load document text.');
          setLoadingDoc(false);
        }
      });

    setPrefs((prev) => {
      const nextRecent = [
        currentDoc.id,
        ...prev.recentDocs.filter((id) => id !== currentDoc.id),
      ].slice(0, 6);
      return { ...prev, recentDocs: nextRecent };
    });

    return () => {
      cancelled = true;
    };
  }, [currentDoc]);

  // Close menus on outside click & bind "/" and "Escape" shortcuts
  useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      if (copyMenuRef.current && !copyMenuRef.current.contains(e.target as Node)) {
        setCopyMenuOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      const inInput =
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        (document.activeElement as HTMLElement | null)?.isContentEditable;

      if (e.key === '/' && !inInput) {
        e.preventDefault();
        searchInputRef.current?.focus();
        ensureSearchIndex();
      } else if (e.key === 'Escape') {
        if (activeFootnote) {
          closeFootnote();
        } else if (copyMenuOpen) {
          setCopyMenuOpen(false);
        } else if (outlineOpen) {
          setOutlineOpen(false);
        } else if (mobileDrawerOpen) {
          setMobileDrawerOpen(false);
        } else if (query) {
          setQuery('');
          setSearchParams(
            (prev) => {
              const next = new URLSearchParams(prev);
              next.delete('q');
              return next;
            },
            { replace: true }
          );
        }
      }
    }

    document.addEventListener('mousedown', handleDocClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleDocClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    activeFootnote,
    closeFootnote,
    copyMenuOpen,
    outlineOpen,
    mobileDrawerOpen,
    query,
    ensureSearchIndex,
    setSearchParams,
  ]);

  const formSchema = useMemo(() => {
    if (!currentDoc || !rawMd) return null;
    return analyzeFormSchema(rawMd, currentDoc);
  }, [currentDoc, rawMd]);

  const filledFieldCount = useMemo(() => {
    if (!formSchema) return 0;
    return formSchema.fields.reduce((count, field) => {
      const v = (prepValues[field.key] || '').trim();
      if (!v) return count;
      if (field.type === 'pronoun' && v === 'original') return count;
      return count + 1;
    }, 0);
  }, [formSchema, prepValues]);

  const isLiturgicalForm = currentDoc?.categoryId === 'liturgical-forms';
  const isReadingsDoc = currentDoc?.categoryId === 'other-resources';
  const isWestminster = currentDoc?.id === DOC_IDS.westminsterConfession;

  const renderedDocument = useMemo(() => {
    if (!currentDoc || !rawMd) {
      return {
        html: '',
        footnotes: [] as ParsedFootnote[],
        headings: [] as { level: number; text: string; slug: string }[],
        unmarkedMd: '',
      };
    }

    const marked = formSchema
      ? applyFormPersonalization(rawMd, currentDoc, prepValues, { markTokens: true })
      : { text: rawMd, prepTokens: [] };

    const unmarked = formSchema
      ? applyFormPersonalization(rawMd, currentDoc, prepValues, { markTokens: false }).text
      : rawMd;

    const parsed = parseMarkdown(marked.text, {
      prepTokens: marked.prepTokens,
      tableChoices,
      isLiturgicalForm,
      isReadingsDoc,
      isWestminster,
    });

    const withScripture = linkifyScriptureHtml(parsed.html, prefs.bibleVersion);
    const withXrefs = linkifyDocRefsHtml(withScripture, allDocs, currentDoc.id);
    const coDoc = docsById.get(DOC_IDS.churchOrder2022);
    const shouldLinkCo =
      currentDoc.id === DOC_IDS.churchOrder2022 ||
      currentDoc.id === DOC_IDS.rulesFinalExamination2024 ||
      currentDoc.id === DOC_IDS.actsOfSynod2024;
    const linkedHtml = shouldLinkCo
      ? linkifyChurchOrderRefsHtml(withXrefs, coDoc)
      : withXrefs;
    // Liturgies and worship readings: speaker labels, verse-like lines, styled rubrics.
    const finalHtml = isLiturgicalForm || isReadingsDoc ? formatLiturgyHtml(linkedHtml) : linkedHtml;

    return {
      html: finalHtml,
      footnotes: parsed.footnotes,
      headings: parsed.headings,
      unmarkedMd: unmarked,
    };
  }, [
    currentDoc,
    rawMd,
    formSchema,
    prepValues,
    tableChoices,
    isLiturgicalForm,
    isReadingsDoc,
    isWestminster,
    prefs.bibleVersion,
    allDocs,
    docsById,
  ]);

  const linkifiedFootnotes = useMemo(() => {
    return renderedDocument.footnotes.map((fn) => ({
      ...fn,
      html: linkifyScriptureHtml(escapeHtml(fn.text), prefs.bibleVersion),
    }));
  }, [renderedDocument.footnotes, prefs.bibleVersion]);

  // Scroll smoothly to hash anchor after document HTML has rendered
  useEffect(() => {
    if (!currentDoc || loadingDoc || !renderedDocument.html) return;
    if (!location.hash) {
      lastScrolledKeyRef.current = `${currentDoc.id}::`;
      return;
    }

    const targetKey = `${currentDoc.id}::${location.hash}`;
    if (lastScrolledKeyRef.current === targetKey) return;

    const targetId = safeDecodeHash(location.hash);
    const el = document.getElementById(targetId);
    if (el) {
      lastScrolledKeyRef.current = targetKey;
      el.scrollIntoView({ behavior: 'auto', block: 'start' });
      el.classList.remove('reader-jump-highlight');
      void el.offsetWidth;
      el.classList.add('reader-jump-highlight');
    }
  }, [currentDoc, loadingDoc, renderedDocument.html, location.hash]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    return searchDocuments(query, allDocs, searchIndex);
  }, [query, allDocs, searchIndex]);

  function updateQuery(next: string) {
    setQuery(next);
    ensureSearchIndex();
    setSearchParams(
      (prev) => {
        const updated = new URLSearchParams(prev);
        if (next.trim()) {
          updated.set('q', next.trim());
        } else {
          updated.delete('q');
        }
        return updated;
      },
      { replace: true }
    );
  }

  function handleSelectCategory(catId: string) {
    setActiveCategory(catId);
    const isTransientFilter = catId === 'all' || catId === 'saved' || catId === 'recent';
    prevUrlCategoryRef.current = isTransientFilter ? null : catId;
    setSearchParams(
      (prev) => {
        const updated = new URLSearchParams(prev);
        if (isTransientFilter) {
          updated.delete('category');
        } else {
          updated.set('category', catId);
        }
        return updated;
      },
      { replace: true }
    );
  }

  function openDoc(
    targetDocId: string,
    anchorSlug?: string | null
  ) {
    setMobileDrawerOpen(false);
    const hash = anchorSlug ? `#${anchorSlug}` : '';
    navigate(`/for-churches/forms-and-documents/${targetDocId}${hash}`);
  }

  function toggleBookmark(id: string) {
    setPrefs((prev) => {
      const exists = prev.bookmarks.includes(id);
      const nextBookmarks = exists
        ? prev.bookmarks.filter((b) => b !== id)
        : [id, ...prev.bookmarks];
      return { ...prev, bookmarks: nextBookmarks };
    });
  }

  async function copyToClipboard(text: string, message: string) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(message);
    } catch {
      showToast('Clipboard access was blocked by the browser.');
    }
  }

  async function copyRichText(plain: string, html: string, message: string) {
    try {
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([plain], { type: 'text/plain' }),
          }),
        ]);
        showToast(message);
        return;
      }
      await navigator.clipboard.writeText(plain);
      showToast(message);
    } catch {
      try {
        await navigator.clipboard.writeText(plain);
        showToast(message);
      } catch {
        showToast('Clipboard access was blocked by the browser.');
      }
    }
  }

  async function handleCopyDoc(mode: 'rich' | 'clean' | 'footnotes' | 'slides' | 'raw') {
    setCopyMenuOpen(false);
    if (!rawMd) return;
    const sourceMd = renderedDocument.unmarkedMd || rawMd;

    if (mode === 'raw') {
      await copyToClipboard(sourceMd, 'Copied raw Markdown.');
      return;
    }

    if (mode === 'rich') {
      const cleanHtml = getCleanHtml(sourceMd, {
        includeFootnotes: false,
        tableChoices,
        isLiturgicalForm,
        isReadingsDoc,
      });
      const plain = getCleanText(sourceMd, {
        includeFootnotes: false,
        tableChoices,
      });
      await copyRichText(plain, cleanHtml, 'Copied rich text for Word / Google Docs.');
      return;
    }

    if (mode === 'footnotes') {
      const text = getCleanText(sourceMd, {
        includeFootnotes: true,
        tableChoices,
      });
      await copyToClipboard(text, 'Copied text with footnotes.');
      return;
    }

    const clean = getCleanText(sourceMd, {
      includeFootnotes: false,
      tableChoices,
    });
    if (mode === 'slides') {
      await copyToClipboard(formatForSlides(clean), 'Copied formatted text for slides.');
      return;
    }

    await copyToClipboard(clean, 'Copied clean text to clipboard.');
  }

  function handleDownloadWord() {
    setCopyMenuOpen(false);
    if (!currentDoc || !rawMd) return;
    const sourceMd = renderedDocument.unmarkedMd || rawMd;
    const cleanHtml = getCleanHtml(sourceMd, {
      includeFootnotes: prefs.showFootnotes,
      tableChoices,
      isLiturgicalForm,
      isReadingsDoc,
    });
    const wordHtml = buildWordDocumentHtml(currentDoc.title, cleanHtml);
    const blob = new Blob([wordHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slugify(currentDoc.title)}.doc`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Downloaded Word document (.doc).');
  }

  function focusPrepField(fieldKey: string) {
    setPrepOpen(true);
    window.requestAnimationFrame(() => {
      const input = fieldKey ? document.getElementById(`prep-${fieldKey}`) : null;
      const target = input || document.getElementById('service-prep-panel');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (input instanceof HTMLInputElement) {
          input.focus();
          input.select();
        }
      }
    });
  }

  function handleArticleClick(e: ReactMouseEvent<HTMLElement>) {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // 1. Footnote reference popover
    const fnBtn = target.closest<HTMLElement>('.fn-ref');
    if (fnBtn) {
      e.preventDefault();
      const fnId = fnBtn.dataset.fnId;
      const found = renderedDocument.footnotes.find((f) => f.id === fnId);
      if (found) {
        lastFootnoteTriggerRef.current = fnBtn;
        setActiveFootnote(found);
      }
      return;
    }

    // 2. EITHER / OR table choice selection
    const choiceBtn = target.closest<HTMLElement>('.choice-col-btn');
    if (choiceBtn) {
      e.preventDefault();
      const tIdx = Number(choiceBtn.dataset.choiceTable);
      const colIdx = Number(choiceBtn.dataset.choiceCol);
      if (!Number.isNaN(tIdx) && (colIdx === 0 || colIdx === 1)) {
        setTableChoices((prev) => {
          const next = { ...prev };
          if (next[tIdx] === colIdx) {
            delete next[tIdx];
          } else {
            next[tIdx] = colIdx;
          }
          return next;
        });
      }
      return;
    }

    // 3. Inline section, Q&A, or WCF mini copy buttons
    const miniCopyBtn = target.closest<HTMLElement>('.mini-copy-btn');
    if (miniCopyBtn) {
      e.preventDefault();
      const sourceMd = renderedDocument.unmarkedMd || rawMd;
      const format = miniCopyBtn.dataset.copyFormat || 'clean';
      const sectionSlug = miniCopyBtn.dataset.copySection;
      const qaNum = miniCopyBtn.dataset.copyQa;
      const wcfKey = miniCopyBtn.dataset.copyWcf;

      let clean = '';
      if (sectionSlug) {
        const extracted = extractSectionMarkdown(sourceMd, sectionSlug, {
          isLiturgicalForm,
          isReadingsDoc,
        });
        if (!extracted.markdown) return;
        clean = getCleanText(extracted.markdown, {
          includeFootnotes: false,
          tableChoices,
          tableIndexOffset: extracted.tableIndexOffset,
        });
      } else if (qaNum) {
        const qaMd = extractQaMarkdown(sourceMd, qaNum);
        if (!qaMd) return;
        clean = getCleanText(qaMd, { includeFootnotes: false });
      } else if (wcfKey) {
        const [ch, sec] = wcfKey.split('-');
        const wcfMd = extractWcfSectionMarkdown(sourceMd, ch, sec);
        if (!wcfMd) return;
        clean = getCleanText(wcfMd, { includeFootnotes: false });
      }

      if (!clean) return;
      if (format === 'slides') {
        void copyToClipboard(formatForSlides(clean), 'Copied section for slides.');
      } else {
        void copyToClipboard(clean, 'Copied section text.');
      }
      return;
    }

    // 4. Internal Church Order Article references
    const coBtn = target.closest<HTMLElement>('.co-art-ref');
    if (coBtn) {
      e.preventDefault();
      const slug = coBtn.dataset.coSlug;
      if (!slug) return;
      if (currentDoc?.id === DOC_IDS.churchOrder2022) {
        jumpToHeading(slug);
      } else {
        openDoc(DOC_IDS.churchOrder2022, slug);
      }
      return;
    }

    // 5. Cross-document references
    const xrefBtn = target.closest<HTMLElement>('.doc-xref-link');
    if (xrefBtn) {
      e.preventDefault();
      const targetDocId = xrefBtn.dataset.docId;
      const targetSlug = xrefBtn.dataset.docSlug || null;
      if (targetDocId) {
        openDoc(targetDocId, targetSlug);
      }
      return;
    }

    // 6. Service Prep form blanks / personalised tokens
    const blankEl = target.closest<HTMLElement>('.form-blank, .form-filled');
    if (blankEl) {
      e.preventDefault();
      focusPrepField(blankEl.dataset.field || '');
    }
  }

  function handleArticleKeyDown(e: ReactKeyboardEvent<HTMLElement>) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const blankEl = target.closest<HTMLElement>('.form-blank, .form-filled');
    if (blankEl) {
      e.preventDefault();
      focusPrepField(blankEl.dataset.field || '');
    }
  }

  function handleJumpToFootnote(footnoteId: string) {
    lastFootnoteTriggerRef.current = null;
    setActiveFootnote(null);
    setPrefs((prev) => (prev.showFootnotes ? prev : { ...prev, showFootnotes: true }));
    setHighlightedFnId(footnoteId);
    window.setTimeout(() => {
      const li = document.getElementById(`fn-${footnoteId}`);
      if (li) {
        li.scrollIntoView({ behavior: 'smooth', block: 'center' });
        li.focus({ preventScroll: true });
      }
    }, 60);
  }

  function jumpToHeading(slug: string) {
    if (!slug) return;
    const target = document.getElementById(slug);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.classList.remove('reader-jump-highlight');
      void target.offsetWidth;
      target.classList.add('reader-jump-highlight');
    }
    if (currentDoc) {
      lastScrolledKeyRef.current = `${currentDoc.id}::#${slug}`;
      navigate(`/for-churches/forms-and-documents/${currentDoc.id}#${slug}`, {
        replace: true,
      });
    }
  }

  const visibleCategories = useMemo(() => {
    if (!docsIndex) return [];
    if (activeCategory === 'all') return docsIndex.categories;
    if (activeCategory === 'saved') {
      const savedSet = new Set(prefs.bookmarks);
      return docsIndex.categories
        .map((cat) => ({
          ...cat,
          groups: cat.groups
            .map((grp) => ({
              ...grp,
              items: grp.items.filter((item) => savedSet.has(item.id)),
            }))
            .filter((grp) => grp.items.length > 0),
        }))
        .filter((cat) => cat.groups.length > 0);
    }
    return docsIndex.categories.filter((cat) => cat.id === activeCategory);
  }, [docsIndex, activeCategory, prefs.bookmarks]);

  const docCount = docsIndex?.documentCount ?? (allDocs.length || 43);

  const relatedLinks = useMemo(
    () => getDocumentRelatedLinks(currentDoc, allDocs),
    [currentDoc, allDocs]
  );

  const isBookmarked = currentDoc ? prefs.bookmarks.includes(currentDoc.id) : false;

  const recentDocItems = useMemo(
    () =>
      prefs.recentDocs
        .map((id) => docsById.get(id))
        .filter((d): d is FlattenedDocItem => Boolean(d)),
    [prefs.recentDocs, docsById]
  );

  const bookmarkedDocItems = useMemo(
    () =>
      prefs.bookmarks
        .map((id) => docsById.get(id))
        .filter((d): d is FlattenedDocItem => Boolean(d)),
    [prefs.bookmarks, docsById]
  );

  const isPublicConfession = Boolean(
    currentDoc &&
      currentDoc.categoryId === 'creeds-and-confessions' &&
      currentDoc.id !== DOC_IDS.formOfSubscription
  );

  const sidebarContent = (
    <div className="flex flex-col rounded-lg border border-stone-200 bg-white overflow-hidden">
      {/* Search Box */}
      <div className="border-b border-stone-200 bg-stone-50/70 p-4">
        <label htmlFor="crca-library-search" className="sr-only">
          Search CRCA forms, creeds, confessions, and Church Order
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-600" />
          <input
            ref={searchInputRef}
            id="crca-library-search"
            type="search"
            value={query}
            onFocus={ensureSearchIndex}
            onChange={(e) => updateQuery(e.target.value)}
            placeholder="Search or jump (LD 1, BC 29, CO 52)..."
            className="w-full rounded-md border border-stone-300 bg-white py-2.5 pl-9 pr-9 text-sm text-navy-900 placeholder:text-stone-600/80 focus:border-teal-500 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => updateQuery('')}
              aria-label="Clear library search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-stone-600 hover:bg-stone-100 hover:text-navy-900"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="mt-1.5 text-[11px] text-stone-600">
          Press <kbd className="rounded border border-stone-300 bg-white px-1 font-mono text-[10px]">/</kbd> to
          search across all {docCount} documents.
        </p>
      </div>

      {query.trim() ? (
        /* Search Results View */
        <div className="max-h-[65vh] overflow-y-auto p-3 space-y-2">
          <div role="status" aria-live="polite" className="px-1 text-[11px] font-bold uppercase tracking-wider text-stone-600">
            {searchResults.length} {searchResults.length === 1 ? 'match' : 'matches'} for “{query}”
          </div>

          {searchResults.length === 0 ? (
            <div className="rounded-md border border-stone-200 bg-stone-50 p-4 text-center text-xs text-stone-700">
              No matching documents or passages found. Try a keyword like{' '}
              <strong>baptism</strong>, <strong>LD 1</strong>, or <strong>CO 52</strong>.
            </div>
          ) : (
            searchResults.map((res, idx) => {
              const anchor = res.qaAnchor || res.headingSlug;
              return (
                <button
                  key={`${res.doc.id}-${anchor || 'root'}-${idx}`}
                  type="button"
                  onClick={() => openDoc(res.doc.id, anchor)}
                  className="w-full rounded-md border border-stone-200 bg-white p-3 text-left transition-colors hover:border-teal-500 hover:bg-teal-50/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                      {res.doc.groupTitle}
                    </span>
                    {res.badge && (
                      <span className="rounded-full bg-gold-50 border border-gold-400/50 px-2 py-0.5 text-[10px] font-bold text-stone-600">
                        {res.badge}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 font-serif text-sm font-bold text-navy-900">
                    {res.doc.title}
                  </div>
                  {res.headingText && !res.badge && (
                    <div className="mt-0.5 text-xs font-semibold text-navy-800">
                      {res.headingText}
                    </div>
                  )}
                  <div
                    className="crca-search-snippet mt-1 text-xs leading-relaxed text-stone-700 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: res.snippetHtml }}
                  />
                </button>
              );
            })
          )}
        </div>
      ) : (
        /* Category Filter + Catalog List */
        <>
          <div className="flex flex-wrap gap-1.5 border-b border-stone-200 p-3">
            {[
              { id: 'all', label: `All (${docCount})` },
              { id: 'liturgical-forms', label: 'Forms' },
              { id: 'creeds-and-confessions', label: 'Creeds & Confessions' },
              { id: 'church-order', label: 'Church Order' },
              { id: 'acts-of-synod', label: 'Acts of Synod' },
              { id: 'other-resources', label: 'Worship' },
              ...(recentDocItems.length > 0
                ? [{ id: 'recent', label: `Recent (${recentDocItems.length})` }]
                : []),
              ...(prefs.bookmarks.length > 0
                ? [{ id: 'saved', label: `Saved (${prefs.bookmarks.length})` }]
                : []),
            ].map((pill) => {
              const active = activeCategory === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => handleSelectCategory(pill.id)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    active
                      ? 'bg-navy-900 text-white'
                      : 'bg-stone-100 text-navy-800 hover:bg-teal-50 hover:text-teal-700'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
            {activeCategory === 'recent' ? (
              <div>
                <div className="px-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-teal-700">
                  Recently Opened
                </div>
                {recentDocItems.length === 0 ? (
                  <p className="mt-2 rounded-md border border-stone-200 bg-stone-50 p-3 text-xs text-stone-700">
                    No recently opened documents yet. Open any form, confession, or Church Order
                    section to keep it handy here.
                  </p>
                ) : (
                  <ul className="mt-1.5 space-y-1">
                    {recentDocItems.map((item) => {
                      const selected = currentDoc?.id === item.id;
                      const starred = prefs.bookmarks.includes(item.id);
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => openDoc(item.id)}
                            className={`flex w-full items-start justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                              selected
                                ? 'bg-teal-50 font-semibold text-teal-700 ring-1 ring-teal-500/30'
                                : 'text-stone-700 hover:bg-stone-100 hover:text-navy-900'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="leading-snug">{item.title}</div>
                              <div className="mt-0.5 text-[10px] font-medium text-stone-600 truncate">
                                {item.groupTitle}
                              </div>
                            </div>
                            {starred && (
                              <Star className="mt-0.5 h-3 w-3 shrink-0 fill-gold-500 text-gold-500" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ) : activeCategory === 'saved' && visibleCategories.length === 0 ? (
              <p className="rounded-md border border-stone-200 bg-stone-50 p-3 text-xs text-stone-700">
                No saved bookmarks yet. Click the star icon while reading any document to save it
                here.
              </p>
            ) : (
              visibleCategories.map((cat) => (
                <div key={cat.id}>
                  <div className="px-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-600">
                    {cat.title}
                  </div>
                  <div className="mt-1.5 space-y-1.5">
                    {cat.groups.map((grp) => {
                      const collapsed = Boolean(collapsedGroups[grp.id]);
                      const showGroupHeader =
                        grp.title.toLowerCase() !== cat.title.toLowerCase() &&
                        grp.items.length > 1;
                      return (
                        <div key={grp.id}>
                          {showGroupHeader && (
                            <button
                              type="button"
                              aria-expanded={!collapsed}
                              onClick={() =>
                                setCollapsedGroups((prev) => ({
                                  ...prev,
                                  [grp.id]: !prev[grp.id],
                                }))
                              }
                              className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-left text-xs font-bold text-navy-800 hover:bg-stone-100"
                            >
                              <span>{grp.title}</span>
                              <ChevronDown
                                className={`h-3.5 w-3.5 text-stone-600 transition-transform ${
                                  collapsed ? '-rotate-90' : ''
                                }`}
                              />
                            </button>
                          )}
                          {!collapsed && (
                            <ul className="mt-0.5 space-y-0.5">
                              {grp.items.map((item) => {
                                const selected = currentDoc?.id === item.id;
                                const starred = prefs.bookmarks.includes(item.id);
                                return (
                                  <li key={item.id}>
                                    <button
                                      type="button"
                                      onClick={() => openDoc(item.id)}
                                      className={`flex w-full items-start justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                                        selected
                                          ? 'bg-teal-50 font-semibold text-teal-700 ring-1 ring-teal-500/30'
                                          : 'text-stone-700 hover:bg-stone-100 hover:text-navy-900'
                                      }`}
                                    >
                                      <span className="leading-snug">{item.title}</span>
                                      {starred && (
                                        <Star className="mt-0.5 h-3 w-3 shrink-0 fill-gold-500 text-gold-500" />
                                      )}
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Sync Status & Extension Footer */}
      <div className="border-t border-stone-200 bg-stone-50 px-4 py-3 text-[11px] text-stone-600 space-y-1.5">
        {syncMeta?.syncedAt && (
          <div>
            Library synced:{' '}
            <span className="font-semibold text-navy-900">
              {formatAuDate(syncMeta.syncedAt)}
            </span>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <a
            href={EXTENSION_URLS.installGuide}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-navy-900"
          >
            <span>Browser Extension</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href={EXTENSION_URLS.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-stone-600 hover:text-navy-900"
          >
            <span>GitHub Source</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="no-print">
        {!currentDoc ? (
          <PageHeader
            title="Forms & documents"
            description={`The CRCA’s ${docCount} liturgical forms, creeds and confessions, worship readings and Church Order. Read, search, copy or print, and prepare forms for a service.`}
            breadcrumbs={[
              { label: 'For Churches', to: '/for-churches' },
              { label: 'Forms & Documents' },
            ]}
            actions={
              <a
                href={EXTENSION_URLS.installGuide}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-2 rounded-md bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-500 lg:inline-flex"
              >
                <Download className="h-4 w-4" />
                <span>Get Offline Browser Extension</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            }
          />
        ) : (
          <section className="border-b border-stone-200 bg-stone-50 text-navy-900">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
              <nav aria-label="Breadcrumb">
                <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-stone-600">
                  <li>
                    <Link to="/" className="hover:text-navy-900 transition-colors">
                      Home
                    </Link>
                  </li>
                  {isPublicConfession ? (
                    <>
                      <li className="flex items-center gap-1.5">
                        <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
                        <Link
                          to="/who-we-are/beliefs"
                          className="hover:text-navy-900 transition-colors"
                        >
                          What We Believe
                        </Link>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
                        <Link
                          to="/for-churches/forms-and-documents?category=creeds-and-confessions"
                          className="hover:text-navy-900 transition-colors"
                        >
                          Creeds &amp; Confessions
                        </Link>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-center gap-1.5">
                        <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
                        <Link to="/for-churches" className="hover:text-navy-900 transition-colors">
                          For Churches
                        </Link>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
                        <Link
                          to="/for-churches/forms-and-documents"
                          className="hover:text-navy-900 transition-colors"
                        >
                          Forms &amp; Documents
                        </Link>
                      </li>
                    </>
                  )}
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
                    <span className="text-navy-900">{currentDoc.title}</span>
                  </li>
                </ol>
              </nav>

              <div className="mt-2.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  
                  <h1 className="font-serif text-3xl font-semibold text-navy-900 sm:text-4xl">
                    {currentDoc.title}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {isPublicConfession ? (
                    <>
                      <Link
                        to="/who-we-are/beliefs"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-navy-900 transition-colors hover:border-navy-900"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Back to Beliefs</span>
                      </Link>
                      <Link
                        to="/for-churches/forms-and-documents"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-teal-500"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>Full Document Library</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/for-churches/forms-and-documents"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-navy-900 transition-colors hover:border-navy-900"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Library Overview</span>
                      </Link>
                      <a
                        href={EXTENSION_URLS.installGuide}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden items-center gap-1.5 rounded-lg bg-teal-600 lg:inline-flex px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-teal-500"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Offline Extension</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      <section className="bg-stone-50 py-8 sm:py-10 crca-reader-print-root">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 crca-reader-print-root">
          {/* Mobile Library Drawer Toggle */}
          <div className="no-print mb-4 flex items-center justify-between gap-3 lg:hidden">
            <button
              type="button"
              aria-expanded={mobileDrawerOpen}
              aria-controls="crca-library-sidebar"
              onClick={() => setMobileDrawerOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 hover:border-teal-500"
            >
              <Menu className="h-4 w-4 text-teal-600" />
              <span>{mobileDrawerOpen ? 'Hide Library Catalogue' : `Browse All ${docCount} Documents`}</span>
            </button>

            {currentDoc && (
              <Link
                to="/for-churches/forms-and-documents"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-navy-900"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Overview</span>
              </Link>
            )}
          </div>

          {indexError ? (
            <div className="rounded-lg border border-stone-200 bg-white p-8 text-center">
              <p className="font-serif text-lg font-bold text-navy-900">
                Could not load the CRCA document library
              </p>
              <p className="mt-1 text-sm text-stone-700">{indexError}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
              {/* Left Sidebar */}
              <aside
                id="crca-library-sidebar"
                aria-label="CRCA Document Library Navigation"
                className={`no-print lg:col-span-4 xl:col-span-3 lg:sticky lg:top-[calc(var(--site-header-height,72px)+1rem)] ${
                  mobileDrawerOpen ? 'block' : 'hidden lg:block'
                }`}
              >
                {sidebarContent}
              </aside>

              {/* Right Main Column */}
              <div className="lg:col-span-8 xl:col-span-9 crca-reader-print-root">
                {docId && !currentDoc && docsIndex ? (
                  /* Unknown :docId fallback */
                  <div className="rounded-lg border border-stone-200 bg-white p-8 text-center">
                    <h2 className="font-serif text-2xl font-bold text-navy-900">
                      Document not found
                    </h2>
                    <p className="mt-2 text-sm text-stone-700">
                      We couldn&apos;t find a document matching “{docId}”. Select one from the
                      sidebar or return to the library overview.
                    </p>
                    <Link
                      to="/for-churches/forms-and-documents"
                      className="mt-5 inline-flex items-center gap-2 rounded-md bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
                    >
                      <span>Return to Library Overview</span>
                    </Link>
                  </div>
                ) : !currentDoc ? (
                  /* Library Overview (when no :docId is selected) */
                  <div className="space-y-6">
                    {/* Quick-Jump Shortcuts */}
                    <div className="rounded-lg border border-stone-200 bg-white p-6">
                      <div className="text-xs font-bold uppercase tracking-[0.08em] text-stone-600">
                        Quick Reference Lookup
                      </div>
                      <h2 className="mt-1 font-serif text-2xl font-bold text-navy-900">
                        Jump straight to a Lord&apos;s Day, Article, or Chapter
                      </h2>
                      <p className="mt-1 text-sm text-stone-700">
                        Type shortcuts like <code className="rounded bg-stone-100 px-1.5 py-0.5 text-xs font-semibold text-navy-900">LD 1</code>,{' '}
                        <code className="rounded bg-stone-100 px-1.5 py-0.5 text-xs font-semibold text-navy-900">BC 29</code>,{' '}
                        <code className="rounded bg-stone-100 px-1.5 py-0.5 text-xs font-semibold text-navy-900">CD 1:7</code>,{' '}
                        <code className="rounded bg-stone-100 px-1.5 py-0.5 text-xs font-semibold text-navy-900">WCF 1:6</code>, or{' '}
                        <code className="rounded bg-stone-100 px-1.5 py-0.5 text-xs font-semibold text-navy-900">CO 52</code> into
                        the library search bar—or click an example below.
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {QUICK_JUMP_CHIPS.map((chip) => (
                          <button
                            key={chip.label}
                            type="button"
                            onClick={() => {
                              updateQuery(chip.label);
                              setMobileDrawerOpen(true);
                              window.requestAnimationFrame(() => {
                                searchInputRef.current?.scrollIntoView({
                                  behavior: 'smooth',
                                  block: 'center',
                                });
                                searchInputRef.current?.focus();
                              });
                            }}
                            className="inline-flex items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs font-semibold text-navy-900 transition-colors hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700"
                          >
                            <span className="font-mono text-teal-700">{chip.label}</span>
                            <span className="text-stone-600">• {chip.hint}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Recent & Bookmarked Quick Access */}
                    {(bookmarkedDocItems.length > 0 || recentDocItems.length > 0) && (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {bookmarkedDocItems.length > 0 && (
                          <div className="rounded-lg border border-stone-200 bg-white p-5">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-600">
                              <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
                              <span>Saved Bookmarks</span>
                            </div>
                            <ul className="mt-3 space-y-1.5">
                              {bookmarkedDocItems.slice(0, 5).map((item) => (
                                <li key={item.id}>
                                  <button
                                    type="button"
                                    onClick={() => openDoc(item.id)}
                                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm font-medium text-navy-900 hover:bg-teal-50 hover:text-teal-700"
                                  >
                                    <span>{item.title}</span>
                                    <ChevronRight className="h-4 w-4 shrink-0 text-stone-600" />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {recentDocItems.length > 0 && (
                          <div className="rounded-lg border border-stone-200 bg-white p-5">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
                              <History className="h-3.5 w-3.5" />
                              <span>Recently Opened</span>
                            </div>
                            <ul className="mt-3 space-y-1.5">
                              {recentDocItems.slice(0, 5).map((item) => (
                                <li key={item.id}>
                                  <button
                                    type="button"
                                    onClick={() => openDoc(item.id)}
                                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm font-medium text-navy-900 hover:bg-teal-50 hover:text-teal-700"
                                  >
                                    <span>{item.title}</span>
                                    <ChevronRight className="h-4 w-4 shrink-0 text-stone-600" />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 4 Category Showcase Cards */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      {/* Liturgical Forms */}
                      <div className="rounded-lg border border-stone-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                            25 Forms
                          </span>
                          <FolderOpen className="h-4 w-4 text-teal-600" />
                        </div>
                        <h3 className="mt-2 font-serif text-xl font-bold text-navy-900">
                          The Liturgical Forms
                        </h3>
                        <p className="mt-1.5 text-sm text-stone-700">
                          Baptism, Profession of Faith, Lord&apos;s Supper, Discipline, Ordination
                          &amp; Installation, Marriage, and Funerals—with built-in Service Prep
                          name/pronoun personalisation and EITHER/OR choice toggles.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Link
                            to="/for-churches/forms-and-documents/the-liturgical-forms-01-baptism-01-form-for-the-baptism-of-the-children-of-believers-i"
                            className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-semibold text-navy-900 hover:bg-teal-50 hover:text-teal-700"
                          >
                            Baptism of Children (I)
                          </Link>
                          <Link
                            to="/for-churches/forms-and-documents/the-liturgical-forms-03-the-lords-supper-03-form-for-the-celebration-of-the-lords-supper-i"
                            className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-semibold text-navy-900 hover:bg-teal-50 hover:text-teal-700"
                          >
                            Lord&apos;s Supper (I)
                          </Link>
                          <Link
                            to="/for-churches/forms-and-documents/the-liturgical-forms-06-marriage-02-form-for-the-solemnisation-of-marriage"
                            className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-semibold text-navy-900 hover:bg-teal-50 hover:text-teal-700"
                          >
                            Marriage Form
                          </Link>
                        </div>
                      </div>

                      {/* Creeds & Confessions */}
                      <div className="rounded-lg border border-stone-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                            Creeds & confessions
                          </span>
                          <BookOpen className="h-4 w-4 text-teal-600" />
                        </div>
                        <h3 className="mt-2 font-serif text-xl font-bold text-navy-900">
                          Creeds &amp; confessions
                        </h3>
                        <p className="mt-1.5 text-sm text-stone-700">
                          The three ecumenical creeds and the Three Forms of Unity, with clickable
                          Scripture proofs. Also the Westminster Confession and Our World Belongs to
                          God, which the CRCA holds in high regard.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Link
                            to={`/for-churches/forms-and-documents/${DOC_IDS.heidelbergCatechism}`}
                            className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-semibold text-navy-900 hover:bg-teal-50 hover:text-teal-700"
                          >
                            Heidelberg Catechism
                          </Link>
                          <Link
                            to={`/for-churches/forms-and-documents/${DOC_IDS.belgicConfession}`}
                            className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-semibold text-navy-900 hover:bg-teal-50 hover:text-teal-700"
                          >
                            Belgic Confession
                          </Link>
                          <Link
                            to={`/for-churches/forms-and-documents/${DOC_IDS.canonsOfDort}`}
                            className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-semibold text-navy-900 hover:bg-teal-50 hover:text-teal-700"
                          >
                            Canons of Dort
                          </Link>
                        </div>
                      </div>

                      {/* CRCA Church Order 2022 & Examination Rules */}
                      <div className="rounded-lg border border-stone-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                            Polity &amp; Candidacy • 2022 / 2024
                          </span>
                          <FileText className="h-4 w-4 text-teal-600" />
                        </div>
                        <h3 className="mt-2 font-serif text-xl font-bold text-navy-900">
                          Church Order &amp; Examination Rules
                        </h3>
                        <p className="mt-1.5 text-sm text-stone-700">
                          Read the complete 86-article <strong>CRCA Church Order (2022)</strong>{' '}
                          alongside the <strong>Rules for the Final Examination (2024)</strong> for
                          ministry candidates—with clickable internal article links.
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <Link
                            to={`/for-churches/forms-and-documents/${DOC_IDS.churchOrder2022}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-800"
                          >
                            <span>2022 Church Order</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                          <Link
                            to={`/for-churches/forms-and-documents/${DOC_IDS.rulesFinalExamination2024}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
                          >
                            <span>Final Exam Rules (2024)</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                          <a
                            href={encodeDocUrl('CRCA Book of Church Order 2022.docx')}
                            download
                            className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-navy-900"
                          >
                            <FileDown className="h-3.5 w-3.5" />
                            <span>Church Order (.docx)</span>
                          </a>
                          <a
                            href={encodeDocUrl('CRCA Rules for the Final Examination 2024.pdf')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-navy-900"
                          >
                            <FileDown className="h-3.5 w-3.5" />
                            <span>Final Exam Rules PDF</span>
                          </a>
                        </div>
                      </div>

                      {/* Worship Readings */}
                      <div className="rounded-lg border border-stone-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                            6 Resources
                          </span>
                          <Sparkles className="h-4 w-4 text-teal-600" />
                        </div>
                        <h3 className="mt-2 font-serif text-xl font-bold text-navy-900">
                          Worship Readings &amp; Liturgy Options
                        </h3>
                        <p className="mt-1.5 text-sm text-stone-700">
                          One-click copy and ProPresenter slide formatting for Calls to Worship,
                          Greetings &amp; Benedictions, Readings of the Law, Assurances of Pardon,
                          and Readings at the Offerings.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Link
                            to="/for-churches/forms-and-documents/other-resources-02-liturgical-readings-01-calls-to-worship"
                            className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-semibold text-navy-900 hover:bg-teal-50 hover:text-teal-700"
                          >
                            Calls to Worship
                          </Link>
                          <Link
                            to="/for-churches/forms-and-documents/other-resources-02-liturgical-readings-02-greetings-and-benedictions"
                            className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-semibold text-navy-900 hover:bg-teal-50 hover:text-teal-700"
                          >
                            Greetings &amp; Benedictions
                          </Link>
                          <Link
                            to="/for-churches/forms-and-documents/other-resources-02-liturgical-readings-04-assurances-of-pardon"
                            className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-semibold text-navy-900 hover:bg-teal-50 hover:text-teal-700"
                          >
                            Assurances of Pardon
                          </Link>
                        </div>
                      </div>

                      {/* Acts of Synod (2024) */}
                      <div className="md:col-span-2 rounded-lg border border-stone-200 bg-white p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="max-w-2xl">
                            <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                              Synod Decisions &amp; Resolutions
                            </span>
                            <h3 className="mt-1.5 font-serif text-xl font-bold text-navy-900">
                              Acts of Synod (2024)
                            </h3>
                            <p className="mt-1 text-sm text-stone-700">
                              Full searchable record of Synod 2024 resolutions, committee mandates,
                              and motions with linked Church Order references.
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                            <Link
                              to={`/for-churches/forms-and-documents/${DOC_IDS.actsOfSynod2024}`}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-navy-800"
                            >
                              <span>Read Acts of Synod (2024)</span>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                            <a
                              href={encodeDocUrl('CRCA Acts of Synod 2024.pdf')}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-semibold text-navy-900 hover:border-teal-500 hover:text-teal-700"
                            >
                              <FileDown className="h-3.5 w-3.5" />
                              <span>Official PDF</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Offline Browser Extension Banner */}
                    <div className="rounded-lg border border-teal-500/30 bg-navy-900 p-6 text-white sm:p-8">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-2xl">
                          <div className="text-xs font-bold uppercase tracking-[0.08em] text-teal-100">
                            Offline Browser Extension
                          </div>
                          <h3 className="mt-1.5 font-serif text-2xl font-bold text-white">
                            Prefer a Side Panel beside Google Docs or Word?
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-navy-100">
                            Install the free <strong>CRCA Forms &amp; Documents</strong> browser
                            extension for Chrome, Microsoft Edge, or Brave. Keep every form open in
                            your browser side panel while preparing bulletins and orders of service—even
                            without internet access.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3 shrink-0">
                          <a
                            href={EXTENSION_URLS.downloadZip}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-500"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download Extension (.zip)</span>
                          </a>
                          <a
                            href={EXTENSION_URLS.installGuide}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20"
                          >
                            <span>2-Min Setup Guide</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Document Reader View */
                  <div className="-mx-4 border-y border-stone-200 bg-white sm:mx-0 sm:rounded-lg sm:border-x crca-reader-print-root">
                    {/* Reader Toolbar */}
                    <div className="no-print border-b border-stone-200 bg-stone-50/70 px-4 py-3.5 sm:px-6 rounded-t-lg">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <Link
                            to="/for-churches/forms-and-documents"
                            className="hidden items-center gap-1 rounded-lg bg-white border border-stone-200 px-2.5 py-1 font-semibold text-navy-900 hover:border-teal-500 hover:text-teal-700 lg:inline-flex"
                          >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Library</span>
                          </Link>
                          <span className="font-semibold text-teal-700">
                            {currentDoc.categoryTitle}
                          </span>
                          <span className="text-stone-600">•</span>
                          <span className="text-stone-600">{currentDoc.groupTitle}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {formSchema && (
                            <button
                              type="button"
                              aria-expanded={prepOpen}
                              aria-controls="service-prep-panel"
                              onClick={() => setPrepOpen((prev) => !prev)}
                              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                                prepOpen || filledFieldCount > 0
                                  ? 'border-teal-600 bg-teal-50 text-teal-700'
                                  : 'border-stone-300 bg-white text-navy-900 hover:border-teal-500'
                              }`}
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>
                                Service Prep{filledFieldCount > 0 ? ` (${filledFieldCount})` : ''}
                              </span>
                            </button>
                          )}

                          {renderedDocument.footnotes.length > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setPrefs((prev) => ({
                                  ...prev,
                                  showFootnotes: !prev.showFootnotes,
                                }))
                              }
                              className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                                prefs.showFootnotes
                                  ? 'border-stone-300 bg-white text-navy-900 hover:border-teal-500'
                                  : 'border-stone-200 bg-stone-100 text-stone-600'
                              }`}
                            >
                              {prefs.showFootnotes ? 'Footnotes: On' : 'Footnotes: Off'}
                            </button>
                          )}

                          <label htmlFor="reader-bible-version" className="sr-only">
                            Bible translation for Scripture links
                          </label>
                          <select
                            id="reader-bible-version"
                            value={prefs.bibleVersion}
                            onChange={(e) =>
                              setPrefs((prev) => ({ ...prev, bibleVersion: e.target.value }))
                            }
                            aria-label="Bible translation for Scripture links"
                            className="rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs font-semibold text-navy-900 focus:border-teal-500 focus:outline-none"
                          >
                            {BIBLE_VERSIONS.map((ver) => (
                              <option key={ver} value={ver}>
                                {ver}
                              </option>
                            ))}
                          </select>

                          <div className="inline-flex items-center overflow-hidden rounded-lg border border-stone-300 bg-white">
                            <button
                              type="button"
                              onClick={() =>
                                setPrefs((prev) => ({
                                  ...prev,
                                  fontSize: Math.max(14, prev.fontSize - 1),
                                }))
                              }
                              aria-label="Decrease text size"
                              className="px-2 py-1.5 text-xs font-bold text-navy-900 hover:bg-stone-100"
                            >
                              A-
                            </button>
                            <span className="border-x border-stone-200 px-1.5 text-[11px] text-stone-600">
                              {prefs.fontSize}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setPrefs((prev) => ({
                                  ...prev,
                                  fontSize: Math.min(22, prev.fontSize + 1),
                                }))
                              }
                              aria-label="Increase text size"
                              className="px-2 py-1.5 text-xs font-bold text-navy-900 hover:bg-stone-100"
                            >
                              A+
                            </button>
                          </div>

                          {/* Copy Menu */}
                          <div ref={copyMenuRef} className="relative">
                            <button
                              type="button"
                              aria-expanded={copyMenuOpen}
                              onClick={() => setCopyMenuOpen((prev) => !prev)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-navy-900 hover:border-teal-500 hover:text-teal-700"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy</span>
                              <ChevronDown className="h-3 w-3" />
                            </button>
                            {copyMenuOpen && (
                              <div className="absolute right-0 top-full z-30 mt-1.5 w-60 rounded-md border border-stone-200 bg-white p-1.5 shadow-xl ring-1 ring-navy-900/5">
                                <button
                                  type="button"
                                  onClick={() => void handleCopyDoc('rich')}
                                  className="block w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-navy-900 hover:bg-teal-50 hover:text-teal-700"
                                >
                                  Copy Rich Text (Word / Google Docs)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleCopyDoc('clean')}
                                  className="block w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-navy-900 hover:bg-teal-50 hover:text-teal-700"
                                >
                                  Copy Clean Text
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleCopyDoc('footnotes')}
                                  className="block w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-navy-900 hover:bg-teal-50 hover:text-teal-700"
                                >
                                  Copy with Footnotes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleCopyDoc('slides')}
                                  className="block w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-navy-900 hover:bg-teal-50 hover:text-teal-700"
                                >
                                  Copy for ProPresenter / Slides
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleCopyDoc('raw')}
                                  className="block w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-stone-700 hover:bg-stone-100"
                                >
                                  Copy Raw Markdown
                                </button>
                                <div className="my-1 border-t border-stone-200" />
                                <button
                                  type="button"
                                  onClick={handleDownloadWord}
                                  className="block w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-teal-700 hover:bg-teal-50"
                                >
                                  Download Word (.doc)
                                </button>
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="hidden items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-800 sm:inline-flex"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            <span>Print / PDF</span>
                          </button>

                          {currentDoc.pdfPath && (
                            <a
                              href={encodeDocUrl(currentDoc.pdfPath)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-navy-900 hover:border-teal-500 hover:text-teal-700"
                            >
                              <FileDown className="h-3.5 w-3.5" />
                              <span>Official PDF</span>
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => toggleBookmark(currentDoc.id)}
                            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark document'}
                            className={`rounded-lg border p-1.5 transition-colors ${
                              isBookmarked
                                ? 'border-gold-400 bg-gold-50 text-stone-600'
                                : 'border-stone-300 bg-white text-stone-600 hover:text-navy-900'
                            }`}
                          >
                            <Star
                              className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-gold-500' : ''}`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Service Prep Panel */}
                    {prepOpen && formSchema && (
                      <ServicePrepPanel
                        schema={formSchema}
                        values={prepValues}
                        onChange={(key, val) =>
                          setPrepValues((prev) => ({ ...prev, [key]: val }))
                        }
                        onReset={() => setPrepValues({})}
                      />
                    )}

                    {/* Related CRCA Standards Strip (Harmony) */}
                    {relatedLinks.length > 0 && (
                      <div className="no-print flex flex-wrap items-center gap-1.5 border-b border-stone-200 bg-stone-50/50 px-4 py-2 sm:px-6">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 mr-1">
                          Related Standards:
                        </span>
                        {relatedLinks.map((link) => (
                          <button
                            key={`${link.docId}-${link.slug || 'doc'}`}
                            type="button"
                            onClick={() => openDoc(link.docId, link.slug)}
                            title={link.title}
                            className="rounded-full border border-stone-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold text-navy-800 transition-colors hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700"
                          >
                            {link.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Jump-to-Section Outline Bar (smaller screens; xl shows a side outline) */}
                    {renderedDocument.headings.length > 1 && (
                      <div className="no-print border-b border-stone-200 bg-white px-4 py-2.5 sm:px-6 xl:hidden">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <label
                              htmlFor="reader-toc-select"
                              className="sr-only sm:not-sr-only sm:shrink-0 sm:text-xs sm:font-semibold sm:text-stone-600"
                            >
                              Jump to section:
                            </label>
                            <select
                              id="reader-toc-select"
                              defaultValue=""
                              onChange={(e) => {
                                jumpToHeading(e.target.value);
                                e.target.value = '';
                              }}
                              className="w-full min-w-0 max-w-md flex-1 rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm font-medium text-navy-900 focus:border-teal-500 focus:bg-white focus:outline-none sm:py-1 sm:text-xs"
                            >
                              <option value="" disabled>
                                Jump to a section ({renderedDocument.headings.length})…
                              </option>
                              {renderedDocument.headings.map((h) => (
                                <option key={h.slug} value={h.slug}>
                                  {h.level > 2 ? `  • ${h.text}` : h.text}
                                </option>
                              ))}
                            </select>
                          </div>

                          <button
                            type="button"
                            aria-expanded={outlineOpen}
                            aria-controls="reader-document-outline"
                            onClick={() => setOutlineOpen((prev) => !prev)}
                            className="hidden items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-semibold text-navy-800 hover:border-teal-500 hover:text-teal-700 sm:inline-flex"
                          >
                            <List className="h-3.5 w-3.5" />
                            <span>{outlineOpen ? 'Hide Outline' : 'Document Outline'}</span>
                          </button>
                        </div>

                        {outlineOpen && (
                          <div
                            id="reader-document-outline"
                            className="mt-3 max-h-60 overflow-y-auto rounded-md border border-stone-200 bg-stone-50 p-3"
                          >
                            <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                              {renderedDocument.headings.map((h) => (
                                <li key={h.slug}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      jumpToHeading(h.slug);
                                      setOutlineOpen(false);
                                    }}
                                    className={`w-full rounded px-2 py-1 text-left text-xs hover:bg-white hover:text-teal-700 ${
                                      h.level === 2
                                        ? 'font-bold text-navy-900'
                                        : 'pl-4 text-stone-700'
                                    }`}
                                  >
                                    {h.text}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Document Article Body */}
                    <div className={`px-5 py-7 sm:px-9 sm:py-9 crca-reader-print-root ${renderedDocument.headings.length > 1 ? 'xl:grid xl:grid-cols-[minmax(0,1fr)_14rem] xl:gap-10' : ''}`}>
                      {renderedDocument.headings.length > 1 && (
                        <nav aria-label="In this document" className="no-print hidden xl:order-2 xl:block">
                          <div className="sticky top-[calc(var(--site-header-height,72px)+1.5rem)] max-h-[calc(100vh-var(--site-header-height,72px)-3rem)] overflow-y-auto">
                            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-500">In this document</p>
                            <ul className="mt-2 space-y-1 border-l-2 border-stone-200">
                              {renderedDocument.headings.map((h) => (
                                <li key={h.slug}>
                                  <button
                                    type="button"
                                    onClick={() => jumpToHeading(h.slug)}
                                    className={`block w-full py-0.5 text-left text-sm leading-snug hover:text-teal-700 ${h.level > 2 ? 'pl-6 text-stone-600' : 'pl-3 text-navy-900'}`}
                                  >
                                    {h.text}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </nav>
                      )}
                      <div className="min-w-0 max-w-[72ch] xl:order-1">
                      {loadingDoc ? (
                        <div className="py-16 text-center text-sm text-stone-600">
                          Loading {currentDoc.title}...
                        </div>
                      ) : docError ? (
                        <div className="rounded-md border border-stone-200 bg-stone-50 p-6 text-center">
                          <p className="text-sm font-semibold text-navy-900">{docError}</p>
                        </div>
                      ) : (
                        <>
                          <article
                            onClick={handleArticleClick}
                            onKeyDown={handleArticleKeyDown}
                            style={
                              {
                                '--reader-font-size': `${prefs.fontSize}px`,
                              } as CSSProperties
                            }
                            className={`crca-reader-article ${
                              prefs.showFootnotes ? '' : 'hide-footnotes'
                            }`}
                            dangerouslySetInnerHTML={{ __html: renderedDocument.html }}
                          />

                          {prefs.showFootnotes && linkifiedFootnotes.length > 0 && (
                            <section
                              aria-label="Footnotes and Scripture references"
                              className="footnotes-section"
                            >
                              <h2 className="font-serif text-base font-bold text-navy-900">
                                Footnotes &amp; Scripture References
                              </h2>
                              <ol className="mt-3 space-y-2">
                                {linkifiedFootnotes.map((fn) => (
                                  <li
                                    key={fn.id}
                                    id={`fn-${fn.id}`}
                                    tabIndex={-1}
                                    className={`px-2 py-1 transition-colors focus:outline-none ${
                                      highlightedFnId === fn.id ? 'fn-highlight' : ''
                                    }`}
                                  >
                                    <span className="fn-list-badge">[{fn.listLabel}]</span>
                                    <span dangerouslySetInnerHTML={{ __html: fn.html }} />
                                  </li>
                                ))}
                              </ol>
                            </section>
                          )}
                        </>
                      )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {activeFootnote && (
        <FootnotePopover
          footnote={activeFootnote}
          bibleVersion={prefs.bibleVersion}
          onClose={closeFootnote}
          onJumpToBottom={handleJumpToFootnote}
        />
      )}

      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="no-print fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-md bg-navy-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl"
        >
          {toastMsg}
        </div>
      )}
    </>
  );
}
