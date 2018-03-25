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

  static parseFilesData(filesInfo) {
    const tree = {};
    filesInfo.map(f => GitApi.parseFileInfo(f))
      .forEach(({ name, hash }) => GitApi.recursivelyDescendTree(name, hash, tree));
    return tree;
  }

  static parseFileInfo(_fileInfo) {
    // имя файла отделено табуляцией, что, несомненно, бесит
    const [fileInfo, name] = _fileInfo.split('\t');
    // const [mode, type, hash, ..._] = fileInfo.split(' ').filter(d => d !== '');
    const hash = fileInfo.split(' ').filter(d => d !== '')[2];

    return { name, hash };
  }

  static recursivelyDescendTree(_path, hash, _tree) {
    const path = _path.split('/');

    /* eslint-disable no-param-reassign */
    path.reduce((tree, el, i) => {
      if (i === path.length - 1) {
        tree[el] = { name: el, hash }; // поместим значение в нужное место
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


      runner.stdout.setEncoding('utf-8');
      runner.stderr.setEncoding('utf-8');

      runner.stdout.on('data', (data) => {
        buffer = buffer ? buffer + data : data;
      });
      runner.stderr.on('data', (data) => {
        // почему-то git clone фигачит output сюда
        // поэтому интерпретирую это не как ошибку
        buffer = buffer ? buffer + data : data;
        // reject(data.toString());
      });
      runner.on('close', () => {
        resolve(buffer ? buffer.toString() : null);
      });
      runner.on('error', (err) => {
        reject(err);
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

  getFileInfo(commitHash, fileHash) {
    return this.execGitCmd('ls-tree', '-r', commitHash)
      .then(GitApi.splitLines)
      .then(lines => lines.map(GitApi.parseFileInfo))
      .then(filesInfo => filesInfo.filter(fi => fi.hash === fileHash)[0]);
  }

  getBlob(blobHash) {
    return this.execGitCmd('cat-file', '-p', blobHash)
      .then(GitApi.splitLines);
  }
}

module.exports = GitApi;
