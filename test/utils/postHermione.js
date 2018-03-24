const { disposeOfMockRepo, repoPath } = require('./createMockRepo');

disposeOfMockRepo(repoPath)
  .then(() => console.log('test repository deleted'));
