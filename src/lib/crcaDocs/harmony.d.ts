import type { FlattenedDocItem, HarmonyLink } from './types';

export function getSectionRelatedLinks(
  doc: FlattenedDocItem | null | undefined,
  headingText: string,
  allDocs: FlattenedDocItem[]
): HarmonyLink[];

export function getDocumentRelatedLinks(
  doc: FlattenedDocItem | null | undefined,
  allDocs: FlattenedDocItem[]
): HarmonyLink[];
