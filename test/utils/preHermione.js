const GitApi = require('../../server/GitApi');
// const { createFolder, createMockRepo, repoPath } = require('./createMockRepo');

// createMockRepo(repoPath)
//   .then(() => console.log('test repository prepared'));

const gitApi = new GitApi(repoPath);
console.log(repoPath)
createFolder(repoPath)
  .then(() => gitApi.execGitCmd('clone', 'https://github.com/konstantinov90/shri_2018_css_homework', repoPath))
  .then(() => console.log('test repository prepared'))
  .catch((err) => console.error(err));
