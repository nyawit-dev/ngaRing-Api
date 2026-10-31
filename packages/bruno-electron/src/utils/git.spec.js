jest.mock('simple-git', () => jest.fn());

const simpleGit = require('simple-git');
const { parseRemoteBranches, getChangedFilesInCollectionGit } = require('./git');

describe('getChangedFilesInCollectionGit', () => {
  beforeEach(() => {
    simpleGit.mockReset();
  });

  it('returns branch divergence counts with changed files from one status result', async () => {
    const gitRootPath = 'git-status-counts-test';
    const status = {
      ahead: 2,
      behind: 3,
      files: [
        { path: 'request.bru', index: 'M', working_dir: ' ' }
      ],
      renamed: []
    };
    const git = {
      status: jest.fn((options, callback) => callback(null, status))
    };
    simpleGit.mockReturnValue(git);

    const result = await getChangedFilesInCollectionGit(gitRootPath, gitRootPath);

    expect(git.status).toHaveBeenCalledWith(
      ['--porcelain', '--branch', gitRootPath],
      expect.any(Function)
    );
    expect(result.staged).toEqual([
      { path: 'request.bru', type: 'staged', fileIndex: 'M', working_dir: ' ' }
    ]);
    expect(result.aheadBehind).toEqual({ ahead: 2, behind: 3 });
  });
});

describe('parseRemoteBranches', () => {
  it('reads the branch names and the default branch out of ls-remote output', () => {
    const output = [
      'ref: refs/heads/main\tHEAD',
      '9c1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f\tHEAD',
      '9c1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f\trefs/heads/main',
      '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b\trefs/heads/feature/branch-selector'
    ].join('\n');

    expect(parseRemoteBranches(output)).toEqual({
      branches: ['main', 'feature/branch-selector'],
      defaultBranch: 'main'
    });
  });

  it('reads output written with CRLF line endings', () => {
    const output = ['ref: refs/heads/main\tHEAD', '9c1f2a3\trefs/heads/main', '1a2b3c4\trefs/heads/develop'].join('\r\n');

    expect(parseRemoteBranches(output)).toEqual({
      branches: ['main', 'develop'],
      defaultBranch: 'main'
    });
  });

  it('reports no default branch when the remote sends no symref line', () => {
    const output = ['9c1f2a3\trefs/heads/main', '1a2b3c4\trefs/heads/develop'].join('\n');

    expect(parseRemoteBranches(output)).toEqual({
      branches: ['main', 'develop'],
      defaultBranch: null
    });
  });

  it('ignores refs that are not branches', () => {
    const output = ['9c1f2a3\trefs/heads/main', '1a2b3c4\trefs/tags/v1.0.0', '2b3c4d5\trefs/pull/12/head'].join('\n');

    expect(parseRemoteBranches(output).branches).toEqual(['main']);
  });

  it('returns an empty listing for empty output', () => {
    expect(parseRemoteBranches('')).toEqual({ branches: [], defaultBranch: null });
    expect(parseRemoteBranches(undefined)).toEqual({ branches: [], defaultBranch: null });
  });
});

describe('cloneGitRepository', () => {
  const win = { webContents: { send: jest.fn() } };

  it('enables core.longpaths so deeply nested files can be checked out on Windows', async () => {
    await cloneGitRepository(win, { url: 'https://example.com/repo.git', path: '/collections/repo', processUid: 'p1' });

    expect(simpleGit).toHaveBeenCalledWith({ baseDir: '/collections/repo', config: ['core.longpaths=true'] });
  });
});
