import type { ParsedMarkdown, PrepToken, TableChoices } from './types';

export interface ImplicitHeadingResult {
  htmlLevel: number;
  tocLevel: number | null;
  rawText: string;
  kind: 'reading' | 'implicit';
}

export interface ParseMarkdownOptions {
  prepTokens?: PrepToken[];
  tableChoices?: TableChoices | null;
  isLiturgicalForm?: boolean;
  isReadingsDoc?: boolean;
  isWestminster?: boolean;
}

export interface CleanTextOptions {
  includeFootnotes?: boolean;
  tableChoices?: TableChoices | null;
  tableIndexOffset?: number;
}

export interface CleanHtmlOptions {
  includeFootnotes?: boolean;
  tableChoices?: TableChoices | null;
  tableIndexOffset?: number;
  isLiturgicalForm?: boolean;
  isReadingsDoc?: boolean;
}

export interface ExtractSectionOptions {
  isLiturgicalForm?: boolean;
  isReadingsDoc?: boolean;
}

export interface ExtractedSectionResult {
  markdown: string;
  tableIndexOffset: number;
}

export function slugify(text: string): string;

export function detectImplicitHeading(
  trimmed: string,
  options?: {
    hasExplicitH2?: boolean;
    isLiturgicalForm?: boolean;
    isReadingsDoc?: boolean;
    nextLineIsBlank?: boolean;
  }
): ImplicitHeadingResult | null;

export function parseMarkdown(mdText: string, options?: ParseMarkdownOptions): ParsedMarkdown;

export function getCleanText(mdText: string, options?: CleanTextOptions): string;

export function extractSectionMarkdown(
  mdText: string,
  targetSlug: string,
  options?: ExtractSectionOptions
): ExtractedSectionResult;

export function extractQaMarkdown(mdText: string, qaNum: number | string): string;

export function extractWcfSectionMarkdown(
  mdText: string,
  chapterNum: number | string,
  sectionNum: number | string
): string;

export function getCleanHtml(mdText: string, options?: CleanHtmlOptions): string;
