const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const rimraf = require('rimraf');

const GitApi = require('../../server/GitApi');

async function createFile(root, filename, content) {
  await promisify(fs.writeFile)(path.join(root, filename), content);
}

async function createFolder(folderPath) {
  await promisify(fs.mkdir)(folderPath);
}

async function createMockRepo(repoPath) {
  const gitApi = new GitApi(repoPath);

  const deepFldr = 'deeply/rooted/folder'.split('/');

  await deepFldr.reduce(async (p, f, i) => {
    await p;
    return createFolder(path.join(repoPath, ...deepFldr.slice(0, i + 1)));
  }, createFolder(repoPath));
  await gitApi.execGitCmd('init');
  await gitApi.execGitCmd('remote', 'add', 'origin', 'https://test.git');
  await gitApi.execGitCmd('config', 'core.autocrlf', 'false');

  await createFile(repoPath, 'first.txt', `hello test
this is a test file
hope you like me!
`);
  await gitApi.execGitCmd('add', '.');
  await gitApi.execGitCmd('commit', '-m', 'first commit');

  await createFile(repoPath, 'first.txt', 'I think I gotta change!');
  await createFile(repoPath, 'second.md', `#hello!
I am a second file
hope you like the first one!
`);
  await gitApi.execGitCmd('add', '.');
  await gitApi.execGitCmd('commit', '-m', 'second commit');

  await createFile(repoPath, path.join(...deepFldr, '.hidden'), `Shhh!
Don't tell anybody you've seen me!
`);
  await gitApi.execGitCmd('add', '.');
  await gitApi.execGitCmd('commit', '-m', 'third commit');

  await gitApi.execGitCmd('branch', 'test_branch');
}

async function cloneTestRepo(repoPath) {
  const gitApi = new GitApi(repoPath);
  await createFolder(repoPath);
  await gitApi.execGitCmd('clone', 'https://github.com/konstantinov90/shri_2018_css_homework', repoPath);
  const branches = await gitApi.execGitCmd('branch', '--list', '-a')
    .then(GitApi.splitLines);
  await branches.filter(b => !b.includes('master'))
    .map(b => b.split('/').slice(-1))
    .reduce(async (p, b) => {
      await p;
      return gitApi.execGitCmd('checkout', b);
    }, Promise.resolve());

  await gitApi.execGitCmd('checkout', 'master');
}

async function disposeOfMockRepo(repoPath) {
  await promisify(rimraf)(repoPath);
}

const repoPath = path.join(__dirname, 'test_repo');

module.exports = {
  createMockRepo, cloneTestRepo, disposeOfMockRepo, repoPath,
};
