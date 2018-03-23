const { spawn } = require('child_process');

/* eslint-disable no-underscore-dangle */
const _LOG_OUTPUT_FMT = '%s;%H;%cd;%cn;%P';
/* eslint-enable no-underscore-dangle */


class GitApi {
  constructor(repoDirectory) {
    this.repoDirectory = repoDirectory;
  }

  static get LOG_OUTPUT_FMT() { return _LOG_OUTPUT_FMT; }

  static splitLines(data) {
    return data.split('\n').filter(s => s);
  }

  static parseCommitsData(commits) {
    return commits.map(GitApi.parseCommitInfo);
  }

  static parseCommitInfo(commitInfo) {
    // parse data according to LOG_OUTPUT_FMT
    const [subject, hash, commitDate, commiter, parents] = commitInfo.split(';');
    return {
      subject, hash, commitDate: new Date(commitDate), commiter, parents,
    };
  }

  static parseFilesData(files) {
    const tree = {};
    files.map(f => GitApi.parseFileInfo(f, tree));
    return tree;
  }

  static parseFileInfo(_fileInfo, _tree) {
    // имя файла отделено табуляцией, что, несомненно, бесит
    const [fileInfo, name] = _fileInfo.split('\t');
    // const [mode, type, hash, ..._] = fileInfo.split(' ').filter(d => d !== '');
    const hash = fileInfo.split(' ').filter(d => d !== '')[2];

    GitApi.recursivelyDescendTree(name, hash, _tree);

    // return tree;
  }

  static recursivelyDescendTree(_path, value, _tree) {
    const path = _path.split('/');

    /* eslint-disable no-param-reassign */
    path.reduce((tree, el, i) => {
      if (i === path.length - 1) {
        tree[el] = { name: el, value }; // поместим значение в нужное место
      } else {
        tree[el] = tree[el] || {};
      }
      return tree[el];
    }, _tree);
    /* eslint-enable no-param-reassign */
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

      const runner = spawn('git', cmd, { cwd: this.repoDirectory });

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
        resolve(buffer ? buffer.toString() : null);
      });
    });
  }

  getBranches() {
    return this.execGitCmd('branch', '--list')
      .then(GitApi.splitLines);
  }

  getBranchInfo(branchName) {
    return this.execGitCmd('log', branchName, `--pretty=format:${GitApi.LOG_OUTPUT_FMT}`)
      .then(GitApi.splitLines)
      .then(GitApi.parseCommitsData);
  }

  getCommitInfo(commitHash) {
    return this.execGitCmd('log', commitHash, `--pretty=format:${GitApi.LOG_OUTPUT_FMT}`, '-n', '1')
      .then(GitApi.parseCommitInfo);
  }

  getCommitFiles(commitHash, root) {
    const cmd = ['ls-tree', '-r', commitHash];
    if (root) {
      cmd.push(`${root}`);
    }
    return this.execGitCmd(...cmd)
      .then(GitApi.splitLines)
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
    return this.execGitCmd('cat-file', '-p', blobHash)
      .then(GitApi.splitLines);
  }
}

module.exports = GitApi;
