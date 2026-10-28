import React from 'react';
import { SEARCH_TYPES, MATCH_TYPES, SEARCH_CONFIG } from '../constants';

export const normalizeQuery = (searchQuery) => {
  return searchQuery.trim().replace(/\/+/g, '/');
};

export const isValidQuery = (normalizedQuery) => {
  return normalizedQuery
    && normalizedQuery !== '/'
    && !(normalizedQuery.length === 1 && !normalizedQuery.match(/[a-zA-Z0-9]/));
};

export const highlightText = (text, searchQuery) => {
  if (!searchQuery) return text;

  try {
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="highlight">{part}</span>
      ) : part
    );
  } catch {
    return text;
  }
};

export const sortResults = (results) => {
  return results.sort((a, b) => {
    // Commands first when matched
    if (a.type === SEARCH_TYPES.COMMAND && b.type !== SEARCH_TYPES.COMMAND) return -1;
    if (b.type === SEARCH_TYPES.COMMAND && a.type !== SEARCH_TYPES.COMMAND) return 1;

    // Documentation
    if (a.type === SEARCH_TYPES.DOCUMENTATION && b.type !== SEARCH_TYPES.DOCUMENTATION) return -1;
    if (b.type === SEARCH_TYPES.DOCUMENTATION && a.type !== SEARCH_TYPES.DOCUMENTATION) return 1;

    // Sort by match type priority
    const matchTypeOrder = {
      [MATCH_TYPES.COMMAND]: 0,
      [MATCH_TYPES.COLLECTION]: 1,
      [MATCH_TYPES.FOLDER]: 2,
      [MATCH_TYPES.REQUEST]: 3,
      [MATCH_TYPES.URL]: 4,
      [MATCH_TYPES.PATH]: 5
    };
    const aMatchType = matchTypeOrder[a.matchType] ?? 6;
    const bMatchType = matchTypeOrder[b.matchType] ?? 6;

    if (aMatchType !== bMatchType) return aMatchType - bMatchType;

    // Sort by type priority
    const typeOrder = {
      [SEARCH_TYPES.COMMAND]: 0,
      [SEARCH_TYPES.COLLECTION]: 1,
      [SEARCH_TYPES.FOLDER]: 2,
      [SEARCH_TYPES.REQUEST]: 3
    };
    const aType = typeOrder[a.type] ?? 4;
    const bType = typeOrder[b.type] ?? 4;

    if (aType !== bType) return aType - bType;

    // Finally sort alphabetically
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });
};

export const getTypeLabel = (type) => {
  const baseLabels = {
    [SEARCH_TYPES.COMMAND]: 'Command',
    [SEARCH_TYPES.DOCUMENTATION]: 'Documentation',
    [SEARCH_TYPES.COLLECTION]: 'Collection',
    [SEARCH_TYPES.FOLDER]: 'Folder'
  };

  return baseLabels[type] || '';
};

export const getItemPath = (item, collection, findParentItemInCollection) => {
  const pathParts = [];
  let currentItem = item;
  let depth = 0;
  const maxDepth = SEARCH_CONFIG.MAX_DEPTH;

  while (currentItem && depth < maxDepth) {
    pathParts.unshift(currentItem.name);
    const parent = findParentItemInCollection(collection, currentItem.uid);
    if (parent) {
      currentItem = parent;
      depth++;
    } else {
      break;
    }
  }

  pathParts.unshift(collection.name);
  return pathParts.join('/');
};
