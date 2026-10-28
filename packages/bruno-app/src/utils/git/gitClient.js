export const getGitRootPath = async (collectionPath) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) return null;
  return ipcRenderer.invoke('renderer:git-root-path', collectionPath);
};

export const initGitRepo = async (collectionPath) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-init', collectionPath);
};

const gitStatusCache = new Map();
const gitStatusRequests = new Map();
const gitStatusRefreshRequests = new Map();
const gitFileHistoryCache = new Map();
const statusListeners = new Set();
const GIT_STATUS_CACHE_TTL_MS = 60000;

export const subscribeGitStatus = (callback) => {
  statusListeners.add(callback);
  return () => statusListeners.delete(callback);
};

export const notifyGitStatus = (collectionPath, status) => {
  statusListeners.forEach((listener) => {
    try {
      listener(collectionPath, status);
    } catch (e) {
      console.error('Error in git status listener:', e);
    }
  });
};

export const invalidateGitStatus = (collectionPath) => {
  if (collectionPath) {
    gitStatusCache.delete(collectionPath);
  } else {
    gitStatusCache.clear();
  }
};

export const getCachedGitStatus = (collectionPath) => {
  if (!collectionPath) return null;
  return gitStatusCache.get(collectionPath)?.status || null;
};

const requestGitStatus = (collectionPath, ipcRenderer, forceRefresh) => {
  if (forceRefresh) {
    gitStatusCache.delete(collectionPath);
  }

  const pendingRequest = {
    forceRefresh,
    promise: null
  };
  const request = ipcRenderer.invoke('renderer:git-get-status', { collectionPath })
    .then((status) => {
      if (!status?.error) {
        gitStatusCache.set(collectionPath, {
          status,
          expiresAt: Date.now() + GIT_STATUS_CACHE_TTL_MS
        });
        notifyGitStatus(collectionPath, status);
      }
      return status;
    })
    .finally(() => {
      if (gitStatusRequests.get(collectionPath) === pendingRequest) {
        gitStatusRequests.delete(collectionPath);
      }
    });
  pendingRequest.promise = request;
  gitStatusRequests.set(collectionPath, pendingRequest);
  return request;
};

export const getGitStatus = async (collectionPath, { forceRefresh = false } = {}) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer || !collectionPath) return { isGit: false };

  const cached = gitStatusCache.get(collectionPath);
  const now = Date.now();

  // If not forcing refresh and we have cached data:
  if (!forceRefresh && cached) {
    // If cache is fresh, return directly
    if (cached.expiresAt > now) {
      return cached.status;
    }
    // Stale-While-Revalidate: return stale immediately and revalidate quietly in background
    if (!gitStatusRequests.has(collectionPath)) {
      requestGitStatus(collectionPath, ipcRenderer, false).catch(() => {});
    }
    return cached.status;
  }

  const pendingRequest = gitStatusRequests.get(collectionPath);
  if (pendingRequest && (!forceRefresh || pendingRequest.forceRefresh)) {
    return pendingRequest.promise;
  }
  if (!pendingRequest) {
    return requestGitStatus(collectionPath, ipcRenderer, forceRefresh);
  }

  const pendingRefresh = gitStatusRefreshRequests.get(collectionPath);
  if (pendingRefresh) return pendingRefresh;

  const refreshRequest = pendingRequest.promise
    .catch(() => null)
    .then(() => {
      const currentRequest = gitStatusRequests.get(collectionPath);
      if (currentRequest?.forceRefresh) {
        return currentRequest.promise;
      }
      return requestGitStatus(collectionPath, ipcRenderer, true);
    })
    .finally(() => {
      if (gitStatusRefreshRequests.get(collectionPath) === refreshRequest) {
        gitStatusRefreshRequests.delete(collectionPath);
      }
    });
  gitStatusRefreshRequests.set(collectionPath, refreshRequest);
  return refreshRequest;
};

export const stageGitFiles = async (gitRootPath, files) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-stage', { gitRootPath, files });
};

export const unstageGitFiles = async (gitRootPath, files) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-unstage', { gitRootPath, files });
};

export const discardGitFiles = async (gitRootPath, files) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-discard', { gitRootPath, files });
};

export const commitGit = async (gitRootPath, message) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-commit', { gitRootPath, message });
};

export const pushGit = async (gitRootPath, remote = 'origin', remoteBranch) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-push', { gitRootPath, remote, remoteBranch });
};

export const pullGit = async (gitRootPath, remote = 'origin', remoteBranch, strategy = '--no-rebase') => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-pull', { gitRootPath, remote, remoteBranch, strategy });
};

export const checkoutGitBranch = async (gitRootPath, branchName, shouldCreate = false) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-checkout-branch', { gitRootPath, branchName, shouldCreate });
};

export const getGitDiff = async (gitRootPath, filePath, staged = false) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-diff', { gitRootPath, filePath, staged });
};

export const fetchGitRemotes = async (gitRootPath) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) return [];
  return ipcRenderer.invoke('renderer:git-fetch-remotes', gitRootPath);
};

export const addGitRemote = async (gitRootPath, remoteUrl, remoteName = 'origin') => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-add-remote', { gitRootPath, remoteName, remoteUrl });
};

export const verifyGitHubToken = async (token) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:github-verify-token', { token });
};

export const saveGitHubAuth = async (authData) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:github-save-auth', authData);
};

export const getGitHubAuth = async () => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) return null;
  return ipcRenderer.invoke('renderer:github-get-auth');
};

export const logoutGitHub = async () => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) return false;
  return ipcRenderer.invoke('renderer:github-logout');
};

export const fetchGit = async (gitRootPath, remote = 'origin') => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-fetch', { gitRootPath, remote });
};

export const getGitLogs = async (gitRootPath, limit = 50, skip = 0) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) return [];
  return ipcRenderer.invoke('renderer:git-get-logs', { gitRootPath, limit, skip });
};

export const deleteGitBranch = async (gitRootPath, branchName, force = false) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-branch-delete', { gitRootPath, branchName, force });
};

export const createGitStash = async (gitRootPath, message = 'Bruno Auto Stash') => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-stash-create', { gitRootPath, message });
};

export const listGitStashes = async (gitRootPath) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) return [];
  return ipcRenderer.invoke('renderer:git-stash-list', { gitRootPath });
};

export const applyGitStash = async (gitRootPath, stashIndex = 0) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-stash-apply', { gitRootPath, stashIndex });
};

export const dropGitStash = async (gitRootPath, stashIndex = 0) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-stash-drop', { gitRootPath, stashIndex });
};

export const getGitStashFiles = async (gitRootPath, stashIndex = 0) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) return [];
  return ipcRenderer.invoke('renderer:git-stash-files', { gitRootPath, stashIndex });
};

export const getGitStashDiff = async (gitRootPath, stashIndex = 0, filePath, isUntracked = false) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-stash-diff', { gitRootPath, stashIndex, filePath, isUntracked });
};

export const getGitCommitFiles = async (gitRootPath, commitHash) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-commit-files', { gitRootPath, commitHash });
};

export const getGitCommitFileDiff = async (gitRootPath, commitHash, filePath) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-commit-file-diff', { gitRootPath, commitHash, filePath });
};

export const getGitVisualDiff = async (gitRootPath, filePath, type = 'unstaged') => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-visual-diff', { gitRootPath, filePath, type });
};

export const getCachedGitFileHistory = (gitRootPath, filePath) => {
  if (!gitRootPath || !filePath) return null;
  return gitFileHistoryCache.get(`${gitRootPath}:::${filePath}`) || null;
};

export const getGitFileHistory = async (gitRootPath, filePath, { forceRefresh = false } = {}) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  const cacheKey = `${gitRootPath}:::${filePath}`;
  if (!forceRefresh && gitFileHistoryCache.has(cacheKey)) {
    return gitFileHistoryCache.get(cacheKey);
  }
  const history = await ipcRenderer.invoke('renderer:git-file-history', { gitRootPath, filePath });
  gitFileHistoryCache.set(cacheKey, history || []);
  return history || [];
};

export const getGitFileCommitVisualDiff = async (gitRootPath, commitHash, filePath) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-file-commit-visual-diff', { gitRootPath, commitHash, filePath });
};

export const abortGitMerge = async (gitRootPath) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-abort-merge', { gitRootPath });
};

export const continueGitMerge = async (gitRootPath, conflictedFiles, commitMessage) => {
  const { ipcRenderer } = window;
  if (!ipcRenderer) throw new Error('ipcRenderer is not available');
  return ipcRenderer.invoke('renderer:git-continue-merge', { gitRootPath, conflictedFiles, commitMessage });
};
