const { ipcMain } = require('electron');
const path = require('path');
const {
  cloneGitRepository,
  getCollectionGitRootPath,
  getCollectionGitRepoUrl,
  listBranchesForRemoteUrl,
  getCollectionGitData,
  getChangedFilesInCollectionGit,
  stageChanges,
  unstageChanges,
  discardChanges,
  commitChanges,
  pushGitChanges,
  pullGitChanges,
  getCurrentGitBranch,
  checkoutGitBranch,
  getStagedFileDiff,
  getUnstagedFileDiff,
  initGit,
  getAheadBehindCount,
  fetchRemotes,
  addRemote,
  fetchChanges,
  getCollectionGitLogs,
  deleteBranch,
  createStash,
  listStashes,
  applyStash,
  dropStash,
  getStashFiles,
  getStashFileDiff,
  getCommitFiles,
  getCommitFileDiff,
  getWorkingFileContentForVisualDiff,
  getFileGitHistory,
  getFileContentForVisualDiff,
  abortConflictResolution,
  continueMerge
} = require('../utils/git');
const { createDirectory, removeDirectory } = require('../utils/filesystem');
const { v4: uuid } = require('uuid');
const { getGitHubAuth, setGitHubAuth, clearGitHubAuth } = require('../store/git-auth');

const verifyGitHubToken = async (token) => {
  if (!token || typeof token !== 'string') {
    throw new Error('Token is required');
  }
  const cleanToken = token.trim();
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Bruno-Git-Client'
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Token GitHub tidak valid atau tidak memiliki izin akses (repo).');
    }
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  const userData = await response.json();
  return {
    token: cleanToken,
    user: {
      login: userData.login,
      name: userData.name || userData.login,
      avatar_url: userData.avatar_url,
      html_url: userData.html_url,
      email: userData.email,
      bio: userData.bio,
      public_repos: userData.public_repos,
      total_private_repos: userData.total_private_repos
    }
  };
};

const getCollectionGitRemoteUrl = async (collectionPath) => {
  try {
    const url = await getCollectionGitRepoUrl(collectionPath);
    return url || null;
  } catch (error) {
    return null;
  }
};

const handleListRemoteBranches = async (event, { url }) => {
  const repositoryUrl = typeof url === 'string' ? url.trim() : '';
  if (!repositoryUrl) {
    throw new Error('Repository URL is required');
  }
  if (repositoryUrl.startsWith('-')) {
    throw new Error('Repository URL is not valid');
  }

  return listBranchesForRemoteUrl({ url: repositoryUrl });
};

const registerGitIpc = (mainWindow) => {
  ipcMain.handle('renderer:clone-git-repository', async (event, { url, path: clonePath, processUid, branch }) => {
    let directoryCreated = false;
    try {
      await createDirectory(clonePath);
      directoryCreated = true;
      await cloneGitRepository(mainWindow, { url, path: clonePath, processUid, branch });
      return 'Repository cloned successfully';
    } catch (error) {
      if (directoryCreated) {
        await removeDirectory(clonePath);
      }
      return Promise.reject(error);
    }
  });

  ipcMain.handle('renderer:get-collection-git-remote-url', (event, collectionPath) =>
    getCollectionGitRemoteUrl(collectionPath)
  );

  ipcMain.handle('renderer:list-remote-branches-for-url', handleListRemoteBranches);

  ipcMain.handle('renderer:git-root-path', async (event, collectionPath) => {
    if (!collectionPath) return null;
    return getCollectionGitRootPath(collectionPath);
  });

  ipcMain.handle('renderer:git-init', async (event, collectionPath) => {
    if (!collectionPath) throw new Error('Collection path is required');
    return initGit(collectionPath);
  });

  ipcMain.handle('renderer:git-get-status', async (event, { collectionPath }) => {
    if (!collectionPath) {
      return { isGit: false };
    }
    const gitRootPath = getCollectionGitRootPath(collectionPath);
    if (!gitRootPath) {
      return { isGit: false, collectionPath };
    }

    try {
      const [gitData, changedFiles, aheadBehind, remotes] = await Promise.all([
        getCollectionGitData(gitRootPath, collectionPath),
        getChangedFilesInCollectionGit(gitRootPath, collectionPath),
        getAheadBehindCount(gitRootPath).catch(() => ({ ahead: 0, behind: 0 })),
        fetchRemotes(gitRootPath).catch(() => [])
      ]);

      return {
        isGit: true,
        gitRootPath,
        ...gitData,
        ...changedFiles,
        aheadBehind,
        remotes
      };
    } catch (error) {
      console.error('Error in renderer:git-get-status:', error);
      return {
        isGit: true,
        gitRootPath,
        error: error.message,
        branches: [],
        staged: [],
        unstaged: [],
        conflicted: [],
        remotes: []
      };
    }
  });

  ipcMain.handle('renderer:git-stage', async (event, { gitRootPath, files }) => {
    if (!gitRootPath || !files) throw new Error('gitRootPath and files are required');
    const fileList = Array.isArray(files) ? files : [files];
    const normalizedFiles = fileList.map((f) => (path.isAbsolute(f) ? f : path.join(gitRootPath, f)));
    return stageChanges(gitRootPath, normalizedFiles);
  });

  ipcMain.handle('renderer:git-unstage', async (event, { gitRootPath, files }) => {
    if (!gitRootPath) throw new Error('gitRootPath is required');
    const fileList = files ? (Array.isArray(files) ? files : [files]) : [];
    const normalizedFiles = fileList.map((f) => (path.isAbsolute(f) ? f : path.join(gitRootPath, f)));
    return unstageChanges(gitRootPath, normalizedFiles);
  });

  ipcMain.handle('renderer:git-discard', async (event, { gitRootPath, files }) => {
    if (!gitRootPath || !files) throw new Error('gitRootPath and files are required');
    const fileList = Array.isArray(files) ? files : [files];
    const normalizedFiles = fileList.map((f) => (path.isAbsolute(f) ? f : path.join(gitRootPath, f)));
    return discardChanges(gitRootPath, normalizedFiles);
  });

  ipcMain.handle('renderer:git-commit', async (event, { gitRootPath, message }) => {
    if (!gitRootPath || !message) throw new Error('gitRootPath and message are required');
    return commitChanges(gitRootPath, message);
  });

  ipcMain.handle('renderer:git-push', async (event, { gitRootPath, remote = 'origin', remoteBranch, processUid = uuid() }) => {
    if (!gitRootPath) throw new Error('gitRootPath is required');
    const remotes = await fetchRemotes(gitRootPath).catch(() => []);
    const remoteObj = remotes && remotes.find((r) => r.name === remote);
    if (!remoteObj) {
      throw new Error(`Remote '${remote}' belum dikonfigurasi. Silakan tambahkan Remote URL (origin) terlebih dahulu.`);
    }

    const branch = remoteBranch || (await getCurrentGitBranch(gitRootPath));
    const ghAuth = getGitHubAuth();
    let targetRemote = remote;
    const remoteUrl = remoteObj.refs?.push || remoteObj.refs?.fetch || '';

    if (ghAuth?.token && remoteUrl.includes('github.com') && remoteUrl.startsWith('https://')) {
      const cleanUrl = remoteUrl.replace(/^https:\/\/([^@]+@)?github\.com\//, 'https://github.com/');
      targetRemote = cleanUrl.replace('https://github.com/', `https://${ghAuth.token}@github.com/`);
    }

    try {
      return await pushGitChanges(mainWindow, { gitRootPath, processUid, remote: targetRemote, remoteBranch: branch });
    } catch (err) {
      const safeMessage = err.message ? err.message.replace(/https:\/\/[^@]+@github\.com/g, 'https://github.com') : 'Push failed';
      throw new Error(safeMessage);
    }
  });

  ipcMain.handle('renderer:git-pull', async (event, { gitRootPath, remote = 'origin', remoteBranch, strategy = '--no-rebase', processUid = uuid() }) => {
    if (!gitRootPath) throw new Error('gitRootPath is required');
    const remotes = await fetchRemotes(gitRootPath).catch(() => []);
    const remoteObj = remotes && remotes.find((r) => r.name === remote);
    if (!remoteObj) {
      throw new Error(`Remote '${remote}' belum dikonfigurasi. Silakan tambahkan Remote URL (origin) terlebih dahulu.`);
    }

    const branch = remoteBranch || (await getCurrentGitBranch(gitRootPath));
    const ghAuth = getGitHubAuth();
    let targetRemote = remote;
    const remoteUrl = remoteObj.refs?.fetch || remoteObj.refs?.push || '';

    if (ghAuth?.token && remoteUrl.includes('github.com') && remoteUrl.startsWith('https://')) {
      const cleanUrl = remoteUrl.replace(/^https:\/\/([^@]+@)?github\.com\//, 'https://github.com/');
      targetRemote = cleanUrl.replace('https://github.com/', `https://${ghAuth.token}@github.com/`);
    }

    try {
      return await pullGitChanges(mainWindow, { gitRootPath, processUid, remote: targetRemote, remoteBranch: branch, strategy });
    } catch (err) {
      const safeMessage = err.message ? err.message.replace(/https:\/\/[^@]+@github\.com/g, 'https://github.com') : 'Pull failed';
      throw new Error(safeMessage);
    }
  });

  ipcMain.handle('renderer:github-verify-token', async (event, { token }) => {
    return verifyGitHubToken(token);
  });

  ipcMain.handle('renderer:github-save-auth', async (event, authData) => {
    return setGitHubAuth(authData);
  });

  ipcMain.handle('renderer:github-get-auth', async () => {
    return getGitHubAuth();
  });

  ipcMain.handle('renderer:github-logout', async () => {
    clearGitHubAuth();
    return true;
  });

  ipcMain.handle('renderer:git-fetch-remotes', async (event, gitRootPath) => {
    if (!gitRootPath) return [];
    return fetchRemotes(gitRootPath);
  });

  ipcMain.handle('renderer:git-add-remote', async (event, { gitRootPath, remoteName = 'origin', remoteUrl }) => {
    if (!gitRootPath || !remoteUrl) throw new Error('gitRootPath and remoteUrl are required');
    return addRemote({ gitRootPath, remoteName, remoteUrl: remoteUrl.trim() });
  });

  ipcMain.handle('renderer:git-checkout-branch', async (event, { gitRootPath, branchName, shouldCreate = false, processUid = uuid() }) => {
    if (!gitRootPath || !branchName) throw new Error('gitRootPath and branchName are required');
    return checkoutGitBranch(mainWindow, { gitRootPath, branchName, shouldCreate, processUid });
  });

  ipcMain.handle('renderer:git-diff', async (event, { gitRootPath, filePath, staged = false }) => {
    if (!gitRootPath || !filePath) throw new Error('gitRootPath and filePath are required');
    const targetFile = path.isAbsolute(filePath) ? filePath : path.join(gitRootPath, filePath);
    if (staged) {
      return getStagedFileDiff(gitRootPath, targetFile);
    }
    return getUnstagedFileDiff(gitRootPath, targetFile);
  });

  ipcMain.handle('renderer:git-fetch', async (event, { gitRootPath, remote = 'origin' }) => {
    if (!gitRootPath) throw new Error('gitRootPath is required');
    const remotes = await fetchRemotes(gitRootPath).catch(() => []);
    const remoteObj = remotes && remotes.find((r) => r.name === remote);
    if (!remoteObj) {
      throw new Error(`Remote '${remote}' belum dikonfigurasi.`);
    }

    const ghAuth = getGitHubAuth();
    let targetRemote = remote;
    const remoteUrl = remoteObj.refs?.fetch || remoteObj.refs?.push || '';

    if (ghAuth?.token && remoteUrl.includes('github.com') && remoteUrl.startsWith('https://')) {
      const cleanUrl = remoteUrl.replace(/^https:\/\/([^@]+@)?github\.com\//, 'https://github.com/');
      targetRemote = cleanUrl.replace('https://github.com/', `https://${ghAuth.token}@github.com/`);
    }

    return fetchChanges(gitRootPath, targetRemote);
  });

  ipcMain.handle('renderer:git-get-logs', async (event, { gitRootPath, limit = 50, skip = 0 }) => {
    if (!gitRootPath) return [];
    return getCollectionGitLogs(gitRootPath, limit, skip);
  });

  ipcMain.handle('renderer:git-branch-delete', async (event, { gitRootPath, branchName, force = false }) => {
    if (!gitRootPath || !branchName) throw new Error('gitRootPath and branchName are required');
    return deleteBranch(gitRootPath, branchName, force);
  });

  ipcMain.handle('renderer:git-stash-create', async (event, { gitRootPath, message = 'Bruno Auto Stash' }) => {
    if (!gitRootPath) throw new Error('gitRootPath is required');
    return createStash(gitRootPath, message);
  });

  ipcMain.handle('renderer:git-stash-list', async (event, { gitRootPath }) => {
    if (!gitRootPath) return [];
    return listStashes(gitRootPath);
  });

  ipcMain.handle('renderer:git-stash-apply', async (event, { gitRootPath, stashIndex = 0 }) => {
    if (!gitRootPath) throw new Error('gitRootPath is required');
    return applyStash(gitRootPath, stashIndex);
  });

  ipcMain.handle('renderer:git-stash-drop', async (event, { gitRootPath, stashIndex = 0 }) => {
    if (!gitRootPath) throw new Error('gitRootPath is required');
    return dropStash(gitRootPath, stashIndex);
  });

  ipcMain.handle('renderer:git-stash-files', async (event, { gitRootPath, stashIndex = 0 }) => {
    if (!gitRootPath) return [];
    return getStashFiles(gitRootPath, stashIndex);
  });

  ipcMain.handle('renderer:git-stash-diff', async (event, { gitRootPath, stashIndex = 0, filePath, isUntracked = false }) => {
    if (!gitRootPath || !filePath) throw new Error('gitRootPath and filePath are required');
    return getStashFileDiff(gitRootPath, stashIndex, filePath, isUntracked);
  });

  ipcMain.handle('renderer:git-commit-files', async (event, { gitRootPath, commitHash }) => {
    if (!gitRootPath || !commitHash) throw new Error('gitRootPath and commitHash are required');
    return getCommitFiles(gitRootPath, commitHash);
  });

  ipcMain.handle('renderer:git-commit-file-diff', async (event, { gitRootPath, commitHash, filePath }) => {
    if (!gitRootPath || !commitHash || !filePath) throw new Error('gitRootPath, commitHash, and filePath are required');
    return getCommitFileDiff(gitRootPath, commitHash, filePath);
  });

  ipcMain.handle('renderer:git-visual-diff', async (event, { gitRootPath, filePath, type = 'unstaged' }) => {
    if (!gitRootPath || !filePath) throw new Error('gitRootPath and filePath are required');
    return getWorkingFileContentForVisualDiff(gitRootPath, filePath, type);
  });

  ipcMain.handle('renderer:git-file-history', async (event, { gitRootPath, filePath }) => {
    if (!gitRootPath || !filePath) throw new Error('gitRootPath and filePath are required');
    return getFileGitHistory(gitRootPath, filePath);
  });

  ipcMain.handle('renderer:git-file-commit-visual-diff', async (event, { gitRootPath, commitHash, filePath }) => {
    if (!gitRootPath || !commitHash || !filePath) throw new Error('gitRootPath, commitHash, and filePath are required');
    return getFileContentForVisualDiff(gitRootPath, commitHash, filePath);
  });

  ipcMain.handle('renderer:git-abort-merge', async (event, { gitRootPath }) => {
    if (!gitRootPath) throw new Error('gitRootPath is required');
    return abortConflictResolution(gitRootPath);
  });

  ipcMain.handle('renderer:git-continue-merge', async (event, { gitRootPath, conflictedFiles, commitMessage }) => {
    if (!gitRootPath) throw new Error('gitRootPath is required');
    return continueMerge(gitRootPath, conflictedFiles, commitMessage);
  });
};

module.exports = registerGitIpc;
module.exports.getCollectionGitRemoteUrl = getCollectionGitRemoteUrl;
module.exports.handleListRemoteBranches = handleListRemoteBranches;

