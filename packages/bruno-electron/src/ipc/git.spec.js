jest.mock('electron', () => ({ ipcMain: { handle: jest.fn() } }));
jest.mock('../utils/git', () => ({
  cloneGitRepository: jest.fn(),
  getCollectionGitRepoUrl: jest.fn(),
  listBranchesForRemoteUrl: jest.fn(),
  getCollectionGitRootPath: jest.fn(),
  getCollectionGitData: jest.fn(),
  getChangedFilesInCollectionGit: jest.fn(),
  fetchRemotes: jest.fn()
}));
jest.mock('../utils/filesystem', () => ({
  createDirectory: jest.fn(),
  removeDirectory: jest.fn()
}));

const {
  getCollectionGitRepoUrl,
  listBranchesForRemoteUrl,
  getCollectionGitRootPath,
  getCollectionGitData,
  getChangedFilesInCollectionGit,
  fetchRemotes
} = require('../utils/git');
const {
  getCollectionGitRemoteUrl,
  handleListRemoteBranches,
  handleGetGitStatus
} = require('./git');

describe('getCollectionGitRemoteUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the origin url for the collection path', async () => {
    getCollectionGitRepoUrl.mockResolvedValue('https://github.com/org/repo.git');

    expect(await getCollectionGitRemoteUrl('/tmp/repo/collection')).toBe('https://github.com/org/repo.git');
    expect(getCollectionGitRepoUrl).toHaveBeenCalledWith('/tmp/repo/collection');
  });

  it('maps an empty remote url to null', async () => {
    getCollectionGitRepoUrl.mockResolvedValue('');

    expect(await getCollectionGitRemoteUrl('/tmp/repo')).toBeNull();
  });

  it('returns null when the collection is not a git repo (lookup throws)', async () => {
    getCollectionGitRepoUrl.mockRejectedValue(new Error('not a git repository'));

    expect(await getCollectionGitRemoteUrl('/tmp/not-a-repo')).toBeNull();
  });
});

describe('handleListRemoteBranches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the branch listing for the url', async () => {
    listBranchesForRemoteUrl.mockResolvedValue({ branches: ['main', 'develop'], defaultBranch: 'main' });

    expect(await handleListRemoteBranches({}, { url: '  https://github.com/org/repo.git  ' })).toEqual({
      branches: ['main', 'develop'],
      defaultBranch: 'main'
    });
    expect(listBranchesForRemoteUrl).toHaveBeenCalledWith({ url: 'https://github.com/org/repo.git' });
  });

  it('rejects a missing url', async () => {
    await expect(handleListRemoteBranches({}, { url: '   ' })).rejects.toThrow('Repository URL is required');
    expect(listBranchesForRemoteUrl).not.toHaveBeenCalled();
  });

  it('rejects a url that git would read as a command option', async () => {
    await expect(handleListRemoteBranches({}, { url: '--upload-pack=touch /tmp/pwned' }))
      .rejects.toThrow('Repository URL is not valid');
    expect(listBranchesForRemoteUrl).not.toHaveBeenCalled();
  });
});

describe('handleGetGitStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('combines local Git details and ahead/behind counts into one status result', async () => {
    const collectionPath = 'C:\\repo\\collection';
    const gitRootPath = 'C:\\repo';
    const gitData = { branches: ['main'], currentGitBranch: 'main' };
    const changedFiles = { staged: [], unstaged: [], aheadBehind: { ahead: 1, behind: 2 } };
    const remotes = [{ name: 'origin' }];
    getCollectionGitRootPath.mockReturnValue(gitRootPath);
    getCollectionGitData.mockResolvedValue(gitData);
    getChangedFilesInCollectionGit.mockResolvedValue(changedFiles);
    fetchRemotes.mockResolvedValue(remotes);

    await expect(handleGetGitStatus({}, { collectionPath })).resolves.toEqual({
      isGit: true,
      gitRootPath,
      ...gitData,
      ...changedFiles,
      remotes
    });
    expect(getCollectionGitData).toHaveBeenCalledWith(gitRootPath, collectionPath);
    expect(getChangedFilesInCollectionGit).toHaveBeenCalledWith(gitRootPath, collectionPath);
    expect(fetchRemotes).toHaveBeenCalledWith(gitRootPath);
  });

  it('returns a not-a-repository result without running Git status helpers', async () => {
    getCollectionGitRootPath.mockReturnValue(null);

    await expect(handleGetGitStatus({}, { collectionPath: 'C:\\repo\\collection' })).resolves.toEqual({
      isGit: false,
      collectionPath: 'C:\\repo\\collection'
    });
    expect(getCollectionGitData).not.toHaveBeenCalled();
    expect(getChangedFilesInCollectionGit).not.toHaveBeenCalled();
  });

  it('returns a not-a-repository result when no collection path is provided', async () => {
    await expect(handleGetGitStatus({}, {})).resolves.toEqual({ isGit: false });
    expect(getCollectionGitRootPath).not.toHaveBeenCalled();
  });

  it('returns an error result if a status helper fails', async () => {
    const error = new Error('status failed');
    getCollectionGitRootPath.mockReturnValue('C:\\repo');
    getCollectionGitData.mockRejectedValue(error);
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(handleGetGitStatus({}, { collectionPath: 'C:\\repo\\collection' })).resolves.toEqual({
      isGit: true,
      gitRootPath: 'C:\\repo',
      error: 'status failed',
      branches: [],
      staged: [],
      unstaged: [],
      conflicted: [],
      remotes: []
    });
    expect(consoleError).toHaveBeenCalledWith('Error in renderer:git-get-status:', error);
  });
});
