const { cloneTestRepo, repoPath } = require('./createMockRepo');

// createMockRepo(repoPath)
//   .then(() => console.log('test repository prepared'));

cloneTestRepo(repoPath)
  .then(() => console.log('test repository prepared'))
  .catch(err => console.error(err));
