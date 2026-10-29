import { isItemARequest } from './index';
import type { BrunoItem, BrunoCollection } from './types';

/**
 * Checks if a request matches search text (case-insensitively).
 */
export const doesRequestMatchSearchText = (
  request?: BrunoItem | null,
  searchText: string = ''
): boolean => {
  if (!request?.name) {
    return false;
  }
  return request.name.toLowerCase().includes(searchText.toLowerCase());
};

/**
 * Checks if a folder contains any non-transient request that matches the search text.
 * Traverses recursively with early exit and zero intermediate array allocations.
 */
export const doesFolderHaveItemsMatchSearchText = (
  folder?: BrunoItem | null,
  searchText: string = ''
): boolean => {
  if (!folder?.items || !folder.items.length) {
    return false;
  }

  const query = searchText.toLowerCase();

  const search = (items: BrunoItem[]): boolean => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item || item.isTransient) {
        continue;
      }
      if (isItemARequest(item)) {
        if (item.name && item.name.toLowerCase().includes(query)) {
          return true;
        }
      }
      if (item.items && item.items.length) {
        if (search(item.items)) {
          return true;
        }
      }
    }
    return false;
  };

  return search(folder.items);
};

/**
 * Checks if a collection contains any non-transient request matching search text.
 * Traverses recursively with early exit and zero intermediate array allocations.
 */
export const doesCollectionHaveItemsMatchingSearchText = (
  collection?: BrunoCollection | null,
  searchText: string = ''
): boolean => {
  if (!collection?.items || !collection.items.length) {
    return false;
  }

  const query = searchText.toLowerCase();

  const search = (items: BrunoItem[]): boolean => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item || item.isTransient) {
        continue;
      }
      if (isItemARequest(item)) {
        if (item.name && item.name.toLowerCase().includes(query)) {
          return true;
        }
      }
      if (item.items && item.items.length) {
        if (search(item.items)) {
          return true;
        }
      }
    }
    return false;
  };

  return search(collection.items);
};
