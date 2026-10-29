import { isItemAFolder, isItemARequest, isCollectionItemCollapsed } from './index';
import { collectionSlug } from './collectionSlug';
import { sortByNameThenSequence } from 'utils/common/index';
import {
  doesRequestMatchSearchText,
  doesFolderHaveItemsMatchSearchText,
  doesCollectionHaveItemsMatchingSearchText
} from './search';
import type { BrunoItem, BrunoCollection, SidebarRow } from './types';

interface GroupedItems {
  folders: BrunoItem[];
  apps: BrunoItem[];
  requests: BrunoItem[];
}

const groupCollectionItems = (collectionItems: BrunoItem[]): GroupedItems => {
  const folders: BrunoItem[] = [];
  const apps: BrunoItem[] = [];
  const requests: BrunoItem[] = [];

  const sortBySeq = (items: BrunoItem[]) => [...items].sort((a, b) => ((a.seq ?? 0) - (b.seq ?? 0)));

  for (let i = 0; i < collectionItems.length; i++) {
    const item = collectionItems[i];
    if (!item || item.isTransient) continue;

    if (isItemAFolder(item)) {
      folders.push(item);
    } else if (item.type === 'app') {
      apps.push(item);
    } else if (isItemARequest(item)) {
      requests.push(item);
    }
  }

  return {
    folders: sortByNameThenSequence(folders),
    apps: sortBySeq(apps),
    requests: sortBySeq(requests)
  };
};

interface CollectionContext {
  collectionUid: string;
  collectionPathname: string | null;
  collectionId: string;
  hasSearch: boolean;
  searchText: string;
  appendRow: (row: any) => void;
  addItemToIndex: (uid: string, item: BrunoItem) => void;
}

interface WalkChildrenOptions {
  collectionItems?: BrunoItem[];
  depth: number;
  parentName: string | null;
  ancestorPath?: string[];
}

/**
 * Flattens the children of a collection or folder into sidebar rows.
 * Returns the number of visible children to determine whether an empty-state
 * CTA should be shown.
 */
const walkChildren = (
  collectionContext: CollectionContext,
  { collectionItems = [], depth, parentName, ancestorPath = [] }: WalkChildrenOptions
): number => {
  const {
    collectionUid,
    collectionPathname,
    collectionId,
    hasSearch,
    searchText,
    appendRow,
    addItemToIndex
  } = collectionContext;

  // Scope row ids by the full ancestor uid chain so duplicated subtrees remain
  // distinct even when they share the same item uids.
  const ancestorKey = JSON.stringify(ancestorPath);

  let visibleChildCount = 0;

  const { folders, apps, requests } = groupCollectionItems(collectionItems);

  for (let i = 0; i < folders.length; i++) {
    const folder = folders[i];
    if (hasSearch && !doesFolderHaveItemsMatchSearchText(folder, searchText)) {
      continue;
    }

    visibleChildCount++;

    appendRow({
      id: `${collectionUid}:${ancestorKey}:${folder.uid}`,
      kind: 'folder',
      depth,
      collectionUid,
      collectionPathname,
      collectionId,
      parentName,
      itemUid: folder.uid,
      sortName: folder.name || null
    });

    addItemToIndex(folder.uid, folder);

    // Search reveals matching descendants regardless of the collapsed state.
    const isExpanded = hasSearch || !folder.collapsed;

    if (!isExpanded) continue;

    const childCount = walkChildren(collectionContext, {
      collectionItems: folder.items,
      depth: depth + 1,
      parentName: folder.name || null,
      ancestorPath: [...ancestorPath, folder.uid]
    });

    if (!hasSearch && childCount === 0) {
      appendRow({
        id: `${collectionUid}:${ancestorKey}:${folder.uid}:cta`,
        kind: 'empty-cta',
        depth: depth + 1,
        collectionUid,
        collectionPathname,
        collectionId,
        parentName: folder.name || null,
        itemUid: folder.uid,
        sortName: null
      });
    }
  }

  if (!hasSearch) {
    for (let i = 0; i < apps.length; i++) {
      const app = apps[i];
      visibleChildCount++;

      appendRow({
        id: `${collectionUid}:${ancestorKey}:${app.uid}`,
        kind: 'app',
        depth,
        collectionUid,
        collectionPathname,
        collectionId,
        parentName,
        itemUid: app.uid,
        sortName: app.name || null
      });

      addItemToIndex(app.uid, app);
    }
  }

  for (let i = 0; i < requests.length; i++) {
    const request = requests[i];
    if (hasSearch && !doesRequestMatchSearchText(request, searchText)) {
      continue;
    }

    visibleChildCount++;

    appendRow({
      id: `${collectionUid}:${ancestorKey}:${request.uid}`,
      kind: 'request',
      depth,
      collectionUid,
      collectionPathname,
      collectionId,
      parentName,
      itemUid: request.uid,
      sortName: request.name || null
    });

    addItemToIndex(request.uid, request);

    const hasExamples = request.type === 'http-request' && Array.isArray(request.examples);

    if (hasExamples && (hasSearch || !isCollectionItemCollapsed(request))) {
      request.examples.forEach((example: any, index: number) => {
        appendRow({
          id: `${collectionUid}:${ancestorKey}:${request.uid}:ex:${example.uid || index}`,
          kind: 'example',
          depth: depth + 1,
          collectionUid,
          collectionPathname,
          collectionId,
          parentName: request.name || null,
          itemUid: request.uid,
          sortName: example.name || null,
          exampleIndex: index,
          exampleUid: example.uid || null
        });
      });
    }
  }

  return visibleChildCount;
};

interface FlattenCollectionOptions {
  collection: BrunoCollection;
  hasSearch: boolean;
  searchText: string;
  appendRow: (row: any) => void;
  addItemToIndex: (uid: string, item: BrunoItem) => void;
  addCollectionToIndex: (uid: string, collection: BrunoCollection) => void;
}

/**
 * Adds a collection and its visible children to the flat sidebar row list.
 */
const flattenCollection = ({
  collection,
  hasSearch,
  searchText,
  appendRow,
  addItemToIndex,
  addCollectionToIndex
}: FlattenCollectionOptions): void => {
  if (
    hasSearch &&
    !doesCollectionHaveItemsMatchingSearchText(collection, searchText)
  ) {
    return;
  }

  // Used for readable test selectors. collectionUid remains the unique identity.
  const collectionId = collectionSlug(collection.name);

  appendRow({
    id: `col:${collection.uid}`,
    kind: 'collection',
    depth: 0,
    collectionUid: collection.uid,
    collectionPathname: collection.pathname || null,
    collectionId,
    parentName: null,
    itemUid: null,
    sortName: collection.name || null
  });

  addCollectionToIndex(collection.uid, collection);

  // Search reveals matching descendants regardless of the collapsed state.
  const isExpanded = hasSearch || !collection.collapsed;

  if (!isExpanded) return;

  const collectionContext: CollectionContext = {
    collectionUid: collection.uid,
    collectionPathname: collection.pathname || null,
    collectionId,
    hasSearch,
    searchText,
    appendRow,
    addItemToIndex
  };

  const visibleChildCount = walkChildren(collectionContext, {
    collectionItems: collection.items,
    depth: 1,
    parentName: null
  });

  // Append the collection-root empty-state CTA row.
  if (
    !hasSearch &&
    visibleChildCount === 0 &&
    collection.mountStatus === 'mounted' &&
    !collection.isLoading
  ) {
    appendRow({
      id: `${collection.uid}:root:cta`,
      kind: 'empty-cta',
      depth: 1,
      collectionUid: collection.uid,
      collectionPathname: collection.pathname || null,
      collectionId,
      parentName: null,
      itemUid: null,
      sortName: null
    });
  }
};

export interface FlattenSidebarTreeOptions {
  searchText?: string;
}

export interface FlattenSidebarTreeResult {
  rows: SidebarRow[];
  itemsByUid: Map<string, BrunoItem>;
  collectionsByUid: Map<string, BrunoCollection>;
  rowIndexByItemUid: Map<string, number>;
  rowIndexByCollectionUid: Map<string, number>;
}

/**
 * Convert sidebar entries into a flat, ordered array of layout rows.
 * Each row carries only structural data.
 */
export const flattenSidebarTree = (
  sidebarEntries: any[] = [],
  options: FlattenSidebarTreeOptions = {}
): FlattenSidebarTreeResult => {
  const { searchText = '' } = options;
  const hasSearch = Boolean(searchText.trim());

  const rows: SidebarRow[] = [];
  const itemsByUid = new Map<string, BrunoItem>();
  const collectionsByUid = new Map<string, BrunoCollection>();
  const rowIndexByItemUid = new Map<string, number>();
  const rowIndexByCollectionUid = new Map<string, number>();

  const appendRow = (row: SidebarRow) => {
    const index = rows.push(row) - 1;

    if (row.kind === 'collection' && row.collectionUid) {
      rowIndexByCollectionUid.set(row.collectionUid, index);
    } else if (row.kind === 'example' && row.exampleUid) {
      rowIndexByItemUid.set(row.exampleUid, index);
    } else if (row.itemUid && ['folder', 'app', 'request'].includes(row.kind)) {
      rowIndexByItemUid.set(row.itemUid, index);
    }
  };
  const addItemToIndex = (uid: string, item: BrunoItem) => itemsByUid.set(uid, item);
  const addCollectionToIndex = (uid: string, collection: BrunoCollection) =>
    collectionsByUid.set(uid, collection);

  for (let i = 0; i < sidebarEntries.length; i++) {
    const entry = sidebarEntries[i];
    if (!entry) continue;

    // A ghost represents a missing Git-backed collection and is never expanded.
    if (entry.kind === 'ghost') {
      const ghost = entry.entry || {};

      appendRow({
        id: `ghost:${ghost.path}`,
        kind: 'ghost',
        depth: 0,
        collectionUid: (null as any),
        collectionPathname: ghost.path || null,
        itemUid: (null as any),
        sortName: ghost.name || null
      });

      continue;
    }

    if (!entry.collection) continue;

    flattenCollection({
      collection: entry.collection,
      hasSearch,
      searchText,
      appendRow,
      addItemToIndex,
      addCollectionToIndex
    });
  }

  return {
    rows,
    itemsByUid,
    collectionsByUid,
    rowIndexByItemUid,
    rowIndexByCollectionUid
  };
};
