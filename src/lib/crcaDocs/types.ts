export interface DocHeading {
  level: number;
  text: string;
  slug: string;
}

export interface RawDocItem {
  id: string;
  title: string;
  path: string;
  pdfPath?: string;
  wordCount: number;
  footnoteCount: number;
  headings: DocHeading[];
}

export interface FlattenedDocItem extends RawDocItem {
  categoryId: string;
  categoryTitle: string;
  groupId: string;
  groupTitle: string;
}

export interface DocGroup {
  id: string;
  title: string;
  items: RawDocItem[];
}

export interface DocCategory {
  id: string;
  title: string;
  groups: DocGroup[];
}

export interface DocsIndex {
  version: number;
  generatedAt: string;
  repoDefault?: {
    owner: string;
    repo: string;
    branch: string;
  };
  documentCount: number;
  categories: DocCategory[];
}

export interface SearchIndexDoc {
  id: string;
  title: string;
  categoryId: string;
  categoryTitle: string;
  groupTitle: string;
  path: string;
  text: string;
  headings: DocHeading[];
}

export interface SearchIndex {
  version: number;
  generatedAt: string;
  documents: SearchIndexDoc[];
}

export interface SyncMeta {
  sourceRepo: string;
  branch: string;
  commitSha: string | null;
  commitDate: string | null;
  generatedAt: string | null;
  syncedAt: string;
  documentCount: number;
}

export interface ChurchOrderArticle {
  article: string;
  title: string;
  text: string;
}

export interface ChurchOrderJson {
  schemaVersion: number;
  id: string;
  name: string;
  shortName: string;
  year: string;
  bounds: {
    maxNumber: number;
  };
  entries: Record<string, ChurchOrderArticle>;
}

export interface ParsedFootnote {
  id: string;
  badge: string;
  listLabel: string;
  text: string;
}

export interface ParsedMarkdown {
  title: string;
  html: string;
  footnotes: ParsedFootnote[];
  headings: DocHeading[];
}

export interface ShortcutResult {
  doc: FlattenedDocItem;
  score: number;
  headingSlug: string | null;
  headingText: string | null;
  qaAnchor: string | null;
  badge: string;
  snippetHtml: string;
}

export interface SearchResult {
  doc: FlattenedDocItem;
  score: number;
  headingSlug?: string | null;
  headingText?: string | null;
  qaAnchor?: string | null;
  badge?: string;
  snippetHtml: string;
}

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'pronoun';
  placeholder?: string;
  options?: FormFieldOption[];
}

export interface FormSchema {
  formType: string;
  fields: FormField[];
  hasChoiceTables: boolean;
}

export interface PrepToken {
  fieldKey: string;
  text: string;
  filled: boolean;
}

export interface PersonalizationResult {
  text: string;
  prepTokens: PrepToken[];
}

export type TableChoices = Record<number, 0 | 1>;

export interface HarmonyLink {
  spec: string;
  groupOrder: number;
  label: string;
  docId: string;
  slug: string | null;
  title: string;
}
