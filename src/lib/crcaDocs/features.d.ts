import type {
  FlattenedDocItem,
  FormSchema,
  PersonalizationResult,
  ShortcutResult,
} from './types';

export const BIBLE_VERSIONS: readonly string[];

export function linkifyScriptureHtml(
  html: string,
  bibleVersion?: string,
  options?: { skipHeadings?: boolean }
): string;

export function linkifyDocRefsHtml(
  html: string,
  allDocs: FlattenedDocItem[],
  currentDocId?: string
): string;

export function linkifyChurchOrderRefsHtml(
  html: string,
  coDoc: FlattenedDocItem | null | undefined
): string;

export function parseSearchShortcut(
  query: string,
  allDocs: FlattenedDocItem[]
): ShortcutResult[];

export function isPersonalizableDoc(doc: FlattenedDocItem | null | undefined): boolean;

export function analyzeFormSchema(
  mdText: string,
  doc: FlattenedDocItem | null | undefined
): FormSchema | null;

export function applyFormPersonalization(
  mdText: string,
  doc: FlattenedDocItem | null | undefined,
  values?: Record<string, string>,
  options?: { markTokens?: boolean }
): PersonalizationResult;

export function formatForSlides(
  cleanText: string,
  options?: { maxChars?: number; maxLines?: number }
): string;

export function buildWordDocumentHtml(title: string, cleanHtml: string): string;
