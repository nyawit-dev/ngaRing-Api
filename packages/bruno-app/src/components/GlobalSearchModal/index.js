import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  IconSearch,
  IconX,
  IconFolder,
  IconBox,
  IconFileText,
  IconBook,
  IconPlus,
  IconDeviceFloppy,
  IconAdjustmentsHorizontal,
  IconSun,
  IconMoon,
  IconLayoutSidebar,
  IconLayout,
  IconTerminal2,
  IconSettings
} from '@tabler/icons';
import { flattenItems, isItemARequest, isItemAFolder, findParentItemInCollection } from 'utils/collections';
import { addTab, focusTab } from 'providers/ReduxStore/slices/tabs';
import { expandCollection } from 'providers/ReduxStore/slices/collections';
import { toggleSidebarCollapse, savePreferences } from 'providers/ReduxStore/slices/app';
import { mountCollection, revealItemInSidebar, revealTabInSidebar, saveRequest } from 'providers/ReduxStore/slices/collections/actions';
import { getDefaultRequestPaneTab } from 'utils/collections';
import { normalizePath } from 'utils/common/path';
import { isMacOS } from 'utils/common/platform';
import { setLocalStorageValue, SIDEBAR_COLLAPSED_KEY } from 'utils/common/localStorage';
import { openDevtoolsAndSwitchToTerminal } from 'utils/terminal';
import { useTheme } from 'providers/Theme';
import toast from 'react-hot-toast';
import { normalizeQuery, isValidQuery, highlightText, sortResults, getTypeLabel, getItemPath } from './utils/searchUtils';
import { SEARCH_TYPES, MATCH_TYPES, SEARCH_CONFIG, DOCUMENTATION_RESULT } from './constants';
import StyledWrapper from './StyledWrapper';

const GlobalSearchModal = ({ isOpen, onClose, onOpenNewRequest }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const dispatch = useDispatch();

  const { displayedTheme, setStoredTheme } = useTheme();
  const allCollections = useSelector((state) => state.collections.collections);
  const { workspaces, activeWorkspaceUid } = useSelector((state) => state.workspaces);
  const tabs = useSelector((state) => state.tabs.tabs);
  const activeTabUid = useSelector((state) => state.tabs.activeTabUid);
  const preferences = useSelector((state) => state.app.preferences);
  const sidebarCollapsed = useSelector((state) => state.app.sidebarCollapsed);

  const activeWorkspace = workspaces.find((w) => w.uid === activeWorkspaceUid);

  const collections = useMemo(() => {
    if (!activeWorkspace) return allCollections;

    const workspacePaths = new Set(
      activeWorkspace.collections?.map((wc) => normalizePath(wc.path)) || []
    );
    return allCollections.filter((c) => workspacePaths.has(normalizePath(c.pathname)));
  }, [activeWorkspace, allCollections, workspaces]);

  const getBuiltInCommands = useCallback(() => {
    const isMac = isMacOS();
    const modKey = isMac ? '⌘' : 'Ctrl';

    const activeTab = tabs.find((t) => t.uid === activeTabUid);
    const activeCollection = activeTab ? collections.find((c) => c.uid === activeTab.collectionUid) : collections[0];

    const commands = [
      {
        id: 'cmd-new-request',
        name: 'New Request',
        description: 'Create a new API request in the active collection',
        type: SEARCH_TYPES.COMMAND,
        matchType: MATCH_TYPES.COMMAND,
        shortcut: `${modKey}+N`,
        icon: IconPlus,
        action: () => {
          if (typeof onOpenNewRequest === 'function') {
            onOpenNewRequest();
          } else if (activeCollection) {
            dispatch(addTab({
              uid: `${activeCollection.uid}-new-request`,
              collectionUid: activeCollection.uid,
              type: 'request-tab'
            }));
          }
        }
      },
      {
        id: 'cmd-save-request',
        name: 'Save Request',
        description: 'Save changes in the currently focused request tab',
        type: SEARCH_TYPES.COMMAND,
        matchType: MATCH_TYPES.COMMAND,
        shortcut: `${modKey}+S`,
        icon: IconDeviceFloppy,
        action: () => {
          if (activeTab && activeCollection) {
            dispatch(saveRequest(activeTab.uid, activeCollection.uid));
            toast.success('Request saved');
          }
        }
      },
      {
        id: 'cmd-edit-env',
        name: 'Manage Environments',
        description: 'Edit variables and environment settings',
        type: SEARCH_TYPES.COMMAND,
        matchType: MATCH_TYPES.COMMAND,
        shortcut: `${modKey}+E`,
        icon: IconAdjustmentsHorizontal,
        action: () => {
          if (activeCollection) {
            dispatch(addTab({
              uid: `${activeCollection.uid}-environment-settings`,
              collectionUid: activeCollection.uid,
              type: 'environment-settings'
            }));
          } else {
            toast.error('Select an active collection first');
          }
        }
      },
      {
        id: 'cmd-toggle-theme',
        name: `Switch Theme to ${displayedTheme === 'dark' ? 'Light' : 'Dark'}`,
        description: 'Toggle IDE appearance between dark and light themes',
        type: SEARCH_TYPES.COMMAND,
        matchType: MATCH_TYPES.COMMAND,
        shortcut: 'Theme',
        icon: displayedTheme === 'dark' ? IconSun : IconMoon,
        action: () => {
          setStoredTheme(displayedTheme === 'dark' ? 'light' : 'dark');
        }
      },
      {
        id: 'cmd-toggle-sidebar',
        name: 'Toggle Sidebar',
        description: 'Collapse or expand the left collection explorer',
        type: SEARCH_TYPES.COMMAND,
        matchType: MATCH_TYPES.COMMAND,
        shortcut: `${modKey}+\\`,
        icon: IconLayoutSidebar,
        action: () => {
          dispatch(toggleSidebarCollapse());
          setLocalStorageValue(SIDEBAR_COLLAPSED_KEY, !sidebarCollapsed);
        }
      },
      {
        id: 'cmd-toggle-layout',
        name: 'Toggle Response Orientation',
        description: 'Switch layout split between horizontal and vertical',
        type: SEARCH_TYPES.COMMAND,
        matchType: MATCH_TYPES.COMMAND,
        shortcut: `${modKey}+J`,
        icon: IconLayout,
        action: () => {
          const orientation = preferences?.layout?.responsePaneOrientation || 'horizontal';
          const newOrientation = orientation === 'horizontal' ? 'vertical' : 'horizontal';
          dispatch(savePreferences({
            ...preferences,
            layout: {
              ...preferences?.layout,
              responsePaneOrientation: newOrientation
            }
          }));
        }
      },
      {
        id: 'cmd-open-terminal',
        name: 'Open Embedded Terminal',
        description: 'Access the embedded developer console and shell',
        type: SEARCH_TYPES.COMMAND,
        matchType: MATCH_TYPES.COMMAND,
        shortcut: `${modKey}+T`,
        icon: IconTerminal2,
        action: () => {
          openDevtoolsAndSwitchToTerminal(dispatch);
        }
      },
      {
        id: 'cmd-preferences',
        name: 'Open Preferences',
        description: 'Configure fonts, keybindings, and application settings',
        type: SEARCH_TYPES.COMMAND,
        matchType: MATCH_TYPES.COMMAND,
        shortcut: 'Settings',
        icon: IconSettings,
        action: () => {
          const colUid = activeCollection?.uid;
          dispatch(addTab({
            type: 'preferences',
            uid: colUid ? `${colUid}-preferences` : 'preferences',
            collectionUid: colUid
          }));
        }
      },
      {
        id: 'cmd-docs',
        name: 'NgaRingApi Documentation',
        description: 'Explore the complete documentation, guides, and API specs',
        type: SEARCH_TYPES.COMMAND,
        matchType: MATCH_TYPES.COMMAND,
        shortcut: 'Docs',
        icon: IconBook,
        action: () => {
          window.open('https://github.com/nyawit-dev/ngaRing-Api#readme', '_blank');
        }
      }
    ];

    return commands;
  }, [activeTabUid, tabs, collections, displayedTheme, setStoredTheme, dispatch, sidebarCollapsed, preferences, onOpenNewRequest]);

  const createInitialResults = useCallback(() => {
    const commands = getBuiltInCommands();
    const collectionResults = collections.map((collection) => ({
      type: SEARCH_TYPES.COLLECTION,
      item: collection,
      name: collection.name,
      path: collection.name,
      matchType: MATCH_TYPES.COLLECTION,
      collectionUid: collection.uid
    }));

    collectionResults.sort((a, b) => a.name.localeCompare(b.name));

    if (activeCategory === 'commands') {
      return commands;
    }
    if (activeCategory === 'collections') {
      return collectionResults;
    }
    if (activeCategory === 'requests') {
      const allRequests = [];
      collections.forEach((collection) => {
        flattenItems(collection.items).forEach((item) => {
          if (isItemARequest(item)) {
            allRequests.push({
              type: SEARCH_TYPES.REQUEST,
              item,
              name: item.name,
              path: getItemPath(item, collection, findParentItemInCollection),
              matchType: MATCH_TYPES.REQUEST,
              method: item.request?.method || 'GET',
              collectionUid: collection.uid
            });
          }
        });
      });
      return allRequests.slice(0, 20);
    }

    return [...commands.slice(0, 4), DOCUMENTATION_RESULT, ...collectionResults];
  }, [collections, activeCategory, getBuiltInCommands]);

  const searchInCollections = useCallback((searchTerms, enablePathMatch, isCommandMode) => {
    const results = [];
    const commands = getBuiltInCommands();

    // Match commands if in command mode or matching search terms
    if (activeCategory === 'all' || activeCategory === 'commands' || isCommandMode) {
      commands.forEach((cmd) => {
        const nameMatch = searchTerms.every((term) => cmd.name.toLowerCase().includes(term));
        const descMatch = searchTerms.every((term) => cmd.description.toLowerCase().includes(term));
        if (nameMatch || descMatch) {
          results.push(cmd);
        }
      });
    }

    if (isCommandMode || activeCategory === 'commands') {
      return results;
    }

    // Documentation check
    if (activeCategory === 'all') {
      const queryLower = searchTerms.join(' ');
      if (['documentation', 'docs', 'ngaring', 'guide'].some((term) => term.includes(queryLower) || queryLower.includes(term))) {
        results.push(DOCUMENTATION_RESULT);
      }
    }

    // Search collection items
    collections.forEach((collection) => {
      if (activeCategory === 'all' || activeCategory === 'collections') {
        if (searchTerms.every((term) => collection.name.toLowerCase().includes(term))) {
          results.push({
            type: SEARCH_TYPES.COLLECTION,
            item: collection,
            name: collection.name,
            path: collection.name,
            matchType: MATCH_TYPES.COLLECTION,
            collectionUid: collection.uid
          });
        }
      }

      if (activeCategory === 'all' || activeCategory === 'requests') {
        const flattenedItems = flattenItems(collection.items);
        flattenedItems.forEach((item) => {
          const itemPath = getItemPath(item, collection, findParentItemInCollection);
          const itemPathLower = itemPath.toLowerCase();

          if (isItemARequest(item)) {
            const nameMatch = searchTerms.every((term) => (item.name || '').toLowerCase().includes(term));
            const urlMatch = searchTerms.every((term) => (item.request?.url || '').toLowerCase().includes(term));
            const pathMatch = enablePathMatch && searchTerms.every((term) => itemPathLower.includes(term));

            if (nameMatch || urlMatch || pathMatch) {
              const isGrpcRequest = item.request?.type === 'grpc';
              let method = item.request?.method || '';

              if (isGrpcRequest) {
                const methodType = item.request?.methodType || 'UNARY';
                method = methodType.toLowerCase().replace(/[_]/g, '-');
              }

              results.push({
                type: SEARCH_TYPES.REQUEST,
                item,
                name: item.name,
                path: itemPath,
                matchType: nameMatch ? MATCH_TYPES.REQUEST : urlMatch ? MATCH_TYPES.URL : MATCH_TYPES.PATH,
                method,
                collectionUid: collection.uid
              });
            }
          } else if (isItemAFolder(item) && (activeCategory === 'all' || activeCategory === 'collections')) {
            const nameMatch = searchTerms.every((term) => item.name.toLowerCase().includes(term));
            const pathMatch = enablePathMatch && searchTerms.every((term) => itemPathLower.includes(term));

            if (nameMatch || pathMatch) {
              results.push({
                type: SEARCH_TYPES.FOLDER,
                item,
                name: item.name,
                path: itemPath,
                matchType: nameMatch ? MATCH_TYPES.FOLDER : MATCH_TYPES.PATH,
                collectionUid: collection.uid
              });
            }
          }
        });
      }
    });

    return results;
  }, [collections, activeCategory, getBuiltInCommands]);

  const performSearch = useCallback((searchQuery) => {
    const rawTrimmed = (searchQuery || '').trim();
    const isCommandMode = rawTrimmed.startsWith('>') || rawTrimmed.startsWith('/');
    const effectiveQuery = isCommandMode ? rawTrimmed.substring(1).trim() : rawTrimmed;

    if (!effectiveQuery) {
      setResults(createInitialResults());
      return;
    }

    const normalizedQuery = normalizeQuery(effectiveQuery);
    if (!isValidQuery(normalizedQuery)) {
      setResults([]);
      return;
    }

    const searchTerms = normalizedQuery.toLowerCase().split(/[\s\/]+/).filter(Boolean);
    if (!searchTerms.length) {
      setResults([]);
      return;
    }

    const enablePathMatch = normalizedQuery.includes('/');
    const searchResults = searchInCollections(searchTerms, enablePathMatch, isCommandMode);
    const sortedResults = sortResults(searchResults);

    setResults(sortedResults);
    setSelectedIndex(0);
  }, [createInitialResults, searchInCollections]);

  const debouncedSearch = useCallback((searchQuery) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, SEARCH_CONFIG.DEBOUNCE_DELAY);
  }, [performSearch]);

  const expandItemPath = (result) => {
    const collection = collections.find((c) => c.uid === result.collectionUid);
    if (!collection) return;

    ensureCollectionIsMounted(collection);

    if (collection.collapsed) {
      dispatch(expandCollection(collection.uid));
    }

    if (result.type === SEARCH_TYPES.COLLECTION) return;

    dispatch(revealItemInSidebar({
      collectionUid: collection.uid,
      itemUid: result.item.uid,
      expandTarget: result.type === SEARCH_TYPES.FOLDER
    }));
  };

  const ensureCollectionIsMounted = (collection) => {
    if (!collection || collection.mountStatus === 'mounted') return;
    dispatch(mountCollection({
      collectionUid: collection.uid,
      collectionPathname: collection.pathname,
      brunoConfig: collection.brunoConfig
    }));
  };

  const handleKeyNavigation = (e) => {
    const handlers = {
      ArrowDown: () => {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
      },
      ArrowUp: () => {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
      },
      Enter: () => {
        e.preventDefault();
        if (results[selectedIndex]) {
          handleResultSelection(results[selectedIndex]);
        }
      },
      Escape: () => {
        e.preventDefault();
        onClose();
      },
      PageDown: () => {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 5, results.length - 1));
      },
      PageUp: () => {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 5, 0));
      },
      Home: () => {
        e.preventDefault();
        setSelectedIndex(0);
      },
      End: () => {
        e.preventDefault();
        setSelectedIndex(results.length - 1);
      }
    };

    const handler = handlers[e.key];
    if (handler) handler();
  };

  const handleResultSelection = (result) => {
    if (result.type === SEARCH_TYPES.COMMAND) {
      if (typeof result.action === 'function') {
        result.action();
      }
      onClose();
      return;
    }

    if (result.type === SEARCH_TYPES.DOCUMENTATION) {
      window.open('https://github.com/nyawit-dev/ngaRing-Api#readme', '_blank');
      onClose();
      return;
    }

    const targetCollection = collections.find((c) => c.uid === result.collectionUid);
    ensureCollectionIsMounted(targetCollection);

    expandItemPath(result);

    if (result.type === SEARCH_TYPES.REQUEST) {
      const existingTab = tabs.find((tab) => tab.uid === result.item.uid);

      if (existingTab) {
        dispatch(focusTab({ uid: result.item.uid }));
      } else {
        dispatch(addTab({
          uid: result.item.uid,
          collectionUid: result.collectionUid,
          requestPaneTab: getDefaultRequestPaneTab(result.item),
          type: result.item.type,
          pathname: result.item.pathname
        }));
      }

      dispatch(revealTabInSidebar(result.item.uid));
    } else if (result.type === SEARCH_TYPES.FOLDER) {
      dispatch(addTab({
        uid: result.item.uid,
        collectionUid: result.collectionUid,
        type: 'folder-settings',
        pathname: result.item.pathname
      }));
    } else if (result.type === SEARCH_TYPES.COLLECTION) {
      dispatch(addTab({
        uid: result.item.uid,
        collectionUid: result.collectionUid,
        type: 'collection-settings'
      }));
    }

    onClose();
  };

  const handleQueryChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (newQuery.trim()) {
      debouncedSearch(newQuery);
    } else {
      performSearch(newQuery);
    }
  };

  const clearSearch = () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    setQuery('');
    performSearch('');
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setSelectedIndex(0);
  };

  useEffect(() => {
    if (isOpen) {
      const timeoutId = setTimeout(() => inputRef.current?.focus(), SEARCH_CONFIG.FOCUS_DELAY);
      setQuery('');
      performSearch('');
      setSelectedIndex(0);
      return () => clearTimeout(timeoutId);
    } else {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    }
  }, [isOpen, performSearch]);

  useEffect(() => {
    if (resultsRef.current && results.length > 0) {
      const selectedElement = resultsRef.current.children[selectedIndex];
      selectedElement?.scrollIntoView({
        behavior: SEARCH_CONFIG.SCROLL_BEHAVIOR,
        block: SEARCH_CONFIG.SCROLL_BLOCK
      });
    }
  }, [selectedIndex, results]);

  const getResultIcon = (result) => {
    if (result.type === SEARCH_TYPES.COMMAND && result.icon) {
      const IconComponent = result.icon;
      return <IconComponent size={18} stroke={1.5} />;
    }

    const iconMap = {
      [SEARCH_TYPES.COMMAND]: IconTerminal2,
      [SEARCH_TYPES.DOCUMENTATION]: IconBook,
      [SEARCH_TYPES.COLLECTION]: IconBox,
      [SEARCH_TYPES.FOLDER]: IconFolder,
      [SEARCH_TYPES.REQUEST]: IconFileText
    };
    const IconComponent = iconMap[result.type] || IconFileText;
    return <IconComponent size={18} stroke={1.5} />;
  };

  if (!isOpen) return null;

  return (
    <StyledWrapper>
      <div
        className="command-k-overlay"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-modal-title"
        aria-describedby="search-modal-description"
      >
        <div className="command-k-modal" onClick={(e) => e.stopPropagation()}>
          <h1 id="search-modal-title" className="sr-only">NgaRingApi Command Palette</h1>
          <p id="search-modal-description" className="sr-only">
            Search commands, requests, collections, or documentation. Use arrow keys to navigate and Enter to execute.
          </p>
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {results.length > 0 && query
              ? `${results.length} result${results.length === 1 ? '' : 's'} found`
              : query && results.length === 0
                ? 'No results found'
                : ''}
          </div>
          <div className="command-k-header">
            <div className="search-input-container">
              <IconSearch size={20} className="search-icon" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a command, request, or collection... (Type > for commands)"
                value={query}
                onChange={handleQueryChange}
                onKeyDown={handleKeyNavigation}
                className="search-input"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                aria-label="Search commands, requests, or collections"
                aria-expanded={results.length > 0}
                aria-controls="search-results"
                aria-activedescendant={results.length > 0 ? `search-result-${selectedIndex}` : undefined}
                role="combobox"
                aria-autocomplete="list"
                data-testid="global-search-input"
              />
              {query && (
                <button
                  onClick={clearSearch}
                  className="clear-button"
                  aria-label="Clear search query"
                  type="button"
                >
                  <IconX size={16} aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="command-k-categories">
              {[
                { id: 'all', label: 'All' },
                { id: 'commands', label: 'Commands' },
                { id: 'requests', label: 'Requests' },
                { id: 'collections', label: 'Collections' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-pill ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div
            className="command-k-results"
            ref={resultsRef}
            id="search-results"
            role="listbox"
            aria-label="Search results"
          >
            {results.length === 0 && query ? (
              <div className="no-results">
                <p>
                  No matching results for "{query}".
                  <br />
                  <span className="block mt-2 text-xs opacity-75">
                    Type <strong>&gt;</strong> to filter by available developer commands.
                  </span>
                </p>
              </div>
            ) : results.length === 0 ? (
              <div className="empty-state">
                <p>
                  No collections or commands available.
                </p>
              </div>
            ) : (
              results.map((result, index) => {
                const isSelected = index === selectedIndex;
                const typeLabel = getTypeLabel(result.type);
                const displayQuery = query.startsWith('>') || query.startsWith('/') ? query.substring(1).trim() : query;

                return (
                  <div
                    key={`${result.type}-${result.id || result.item?.id || result.item?.uid || index}`}
                    id={`search-result-${index}`}
                    className={`result-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleResultSelection(result)}
                    data-selected={isSelected}
                    data-type={result.type}
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={-1}
                  >
                    <div className="result-icon">
                      {getResultIcon(result)}
                    </div>
                    <div className="result-content">
                      <div className="result-info">
                        <div className="result-name">
                          {highlightText(result.name, displayQuery)}
                        </div>
                        <div className="result-path">
                          {result.type === SEARCH_TYPES.COMMAND
                            ? result.description
                            : result.type === SEARCH_TYPES.DOCUMENTATION
                              ? result.description
                              : result.type === SEARCH_TYPES.REQUEST
                                ? highlightText(result.item?.request?.url || result.path || '', displayQuery)
                                : highlightText(result.path, displayQuery)}
                        </div>
                      </div>
                      <div className="result-badges">
                        {result.type === SEARCH_TYPES.COMMAND && result.shortcut && (
                          <span className="command-shortcut">{result.shortcut}</span>
                        )}
                        {result.type === SEARCH_TYPES.REQUEST && result.method && (
                          <span
                            className={`method-badge ${result.method.toLowerCase()}`}
                            aria-label={`HTTP method ${result.method.toUpperCase().replace(/-/g, ' ')}`}
                          >
                            {result.method.toUpperCase().replace(/-/g, ' ')}
                          </span>
                        )}
                        {typeLabel && result.type !== SEARCH_TYPES.COMMAND && (
                          <div className="result-type" aria-label={`Item type ${typeLabel}`}>
                            {typeLabel}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="command-k-footer">
            <div className="keyboard-hints" role="region" aria-label="Keyboard shortcuts">
              <span aria-label="Use up and down arrows to navigate">
                <span className="keycap" aria-hidden="true">↑</span>
                <span className="keycap" aria-hidden="true">↓</span>
                <span className="hint-label">to navigate</span>
              </span>
              <span aria-label="Press Enter to execute or select">
                <span className="keycap" aria-hidden="true">↵</span>
                <span className="hint-label">to select</span>
              </span>
              <span aria-label="Press Escape to close">
                <span className="keycap" aria-hidden="true">esc</span>
                <span className="hint-label">to close</span>
              </span>
              <span aria-label="Type greater than for commands">
                <span className="keycap" aria-hidden="true">&gt;</span>
                <span className="hint-label">commands</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

export default GlobalSearchModal;
