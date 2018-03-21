const { spawn } = require('child_process');

class GitApi {
  constructor(repoDirectory) {
    this.repoDirectory = repoDirectory;
  }

  static splitGitOutput(data) {
    return data.split('\n').filter(s => s);
  }

  static parseCommitInfo(commitInfo) {
    const [subject, hash, commitDate, commiter, parents] = commitInfo.split(';');
    return {
      subject, hash, commitDate: new Date(commitDate), commiter, parents,
    };
  }

  static parseCommitsData(commits) {
    return commits.map(GitApi.parseCommitInfo);
  }

  static parseFilesData(files) {
    const tree = {};
    files.map(f => GitApi.parseFileInfo(f, tree));
    return tree;
  }

  static parseFileInfo(_fileInfo, _tree) {
    const [fileInfo, name] = _fileInfo.split('\t');
    // const [mode, type, hash, ..._] = fileInfo.split(' ').filter(d => d !== '');
    const hash = fileInfo.split(' ').filter(d => d !== '')[2];

    const path = name.split('/');

    /* eslint-disable no-param-reassign */
    // рекурсивная функция
    path.reduce((tree, el, i) => {
      if (i === path.length - 1) {
        tree[el] = { name: el, hash };
      } else {
        tree[el] = tree[el] || {};
      }
      return tree[el];
    }, _tree);
    /* eslint-enable no-param-reassign */

    // return tree;
  }

  static filterCommitFilesTree(commitFilesTree, root) {
    if (root) {
      return root.split('/').reduce((tree, fldr) => tree[fldr] || {}, commitFilesTree);
    }
    return commitFilesTree;
  }

  execGitCmd(...cmd) {
    return new Promise((resolve, reject) => {
      let buffer;

      const runner = spawn(cmd[0], cmd.slice(1), { cwd: this.repoDirectory });

      runner.on('error', (err) => {
        reject(err);
      });

      runner.stdout.setEncoding('utf-8');
      runner.stderr.setEncoding('utf-8');

      runner.stdout.on('data', (data) => {
        buffer = buffer ? buffer + data : data;
      });
      runner.stderr.on('data', (data) => {
        reject(data.toString());
      });
      runner.on('close', () => {
        resolve(buffer.toString());
      });
    });
  }

  getBranches() {
    return this.execGitCmd('git', 'branch', '--list')
      .then(GitApi.splitGitOutput);
  }

  getBranchInfo(branchName) {
    return this.execGitCmd('git', 'log', branchName, '--pretty=format:%s;%H;%cd;%cn;%P')
      .then(GitApi.splitGitOutput)
      .then(GitApi.parseCommitsData);
  }

  getCommitInfo(commitHash) {
    return this.execGitCmd('git', 'log', commitHash, '--pretty=format:%s;%H;%cd;%cn;%P', '-n', '1')
      .then(GitApi.parseCommitInfo);
  }

  getCommitFiles(commitHash, root) {
    const cmd = ['git', 'ls-tree', '-r', commitHash];
    if (root) {
      cmd.push(`${root}`);
    }
    return this.execGitCmd(...cmd)
      .then(GitApi.splitGitOutput)
      .then(GitApi.parseFilesData)
      .then(commitFilesTree => GitApi.filterCommitFilesTree(commitFilesTree, root));
  }

  getCommitInfoAndFiles(commitHash, root = '') {
    return Promise.all([
      this.getCommitInfo(commitHash),
      this.getCommitFiles(commitHash, root),
    ]).then(([commitInfo, commitFiles]) => ({ commitInfo, commitFiles }));
  }

  getBlob(blobHash) {
    return this.execGitCmd('git', 'cat-file', '-p', blobHash)
      .then(GitApi.splitGitOutput);
  }
}

module.exports = GitApi;
