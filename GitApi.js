const { promisify } = require('util');
const proc = require('child_process');


const exec = promisify(proc.exec);

class GitApi {
    constructor(repoDirectory) {
        this.repoDirectory = repoDirectory;
    }
    static splitGitOutput({ stdout }) {
        // if (!stdout) return [];
        return stdout.split('\n').filter(s => s);
    }
    static parseCommitInfo(commitInfo) {
        const [subject, hash, commitDate, commiter, parents] = commitInfo.split(';');
        return {
            subject, hash, commitDate: new Date(commitDate), commiter, parents
        };
    }
    static parseCommitsData(commits) {
        return commits.map(GitApi.parseCommitInfo);
    }
    static parseFilesData(files) {
        const tree = {};
        files.map((f) => GitApi.parseFileInfo(f, tree));
        return tree;
    }
    static parseFileInfo(_fileInfo, tree) {
        const [fileInfo, name] = _fileInfo.split('\t');
        const [mode, type, hash, ..._] = fileInfo.split(' ').filter(d => d !== '');

        const path = name.split('/');
        
        path.reduce((tree, el, i) => {
            if (i === path.length - 1) {
                tree[el] = { name: el, hash };
            } else {
                tree[el] = tree[el] || {};
            }
            return tree[el];
        }, tree);
        
        // return tree;
    }
    static filterCommitFilesTree(commitFilesTree, root) {
        if (root)
            return root.split('/').reduce((tree, fldr) => tree[fldr] || {}, commitFilesTree);
        return commitFilesTree;
    }
    execGitCmd(cmd) {
        return exec(cmd, { cwd: this.repoDirectory, maxBuffer: 20000000 });
    }
    getBranches() {
        return this.execGitCmd('git branch --list')
            .then(GitApi.splitGitOutput);
    }
    getBranchInfo(branchName) {
        return this.execGitCmd(`git log ${branchName} --pretty=format:"%s;%H;%cd;%cn;%P"`)
            .then(GitApi.splitGitOutput)
            .then(GitApi.parseCommitsData)
    }
    getCommitInfo(commitHash) {
        return this.execGitCmd(`git log ${commitHash} --pretty=format:"%s;%H;%cd;%cn;%P" -n 1`)
            .then(({ stdout }) => stdout)
            .then(GitApi.parseCommitInfo)
    }
    getCommitFiles(commitHash, root) {
        return this.execGitCmd(`git ls-tree -r ${commitHash} ${root? `"${root}"`: ""}`)
            .then(GitApi.splitGitOutput)
            .then(GitApi.parseFilesData)
            .then(commitFilesTree => GitApi.filterCommitFilesTree(commitFilesTree, root));
    }
    getCommitInfoAndFiles(commitHash, root="") {
        return Promise.all([
            this.getCommitInfo(commitHash),
            this.getCommitFiles(commitHash, root),
        ]).then(([commitInfo, commitFiles]) => {
            return {commitInfo, commitFiles};
        });
    }
    getBlob(blobHash) {
        return this.execGitCmd(`git cat-file -p ${blobHash}`)
            .then(GitApi.splitGitOutput);
    }
}

module.exports = GitApi