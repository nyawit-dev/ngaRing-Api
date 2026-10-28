const Store = require('electron-store');

const store = new Store({
  name: 'git-auth',
  clearInvalidConfig: true
});

const getGitHubAuth = () => {
  return store.get('github') || null;
};

const setGitHubAuth = (authData) => {
  store.set('github', authData);
  return authData;
};

const clearGitHubAuth = () => {
  store.delete('github');
};

module.exports = {
  getGitHubAuth,
  setGitHubAuth,
  clearGitHubAuth
};
