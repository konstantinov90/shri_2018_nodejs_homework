const { createMockRepo, repoPath } = require('./createMockRepo');

createMockRepo(repoPath)
  .then(() => console.log('test repository prepared'));
