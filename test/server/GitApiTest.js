const { expect } = require('chai');

const GitApi = require('../../server/GitApi');
const { createMockRepo, disposeOfMockRepo, repoPath } = require('../utils/createMockRepo');

describe('testing', () => {
  const gitApi = new GitApi(repoPath);

  before('create test repository', async () => {
    await createMockRepo(repoPath);
  });

  after('dispose of test repository', async () => {
    await disposeOfMockRepo(repoPath);
  });

  it('execCmd should properly return error', async () => {
    try {
      await gitApi.execGitCmd('bla-bla');
      expect(true).to.be.equal(false);
    } catch (err) {
      expect(true).to.be.equal(true);
    }
  });

  describe('GitApi static methods', () => {
    const sample = {
      another: {
        greater: {
          path: {
            name: 'path',
            hash: 'MCmcGuffin',
          },
        },
      },
      path: {
        for: {
          test: {
            name: 'test',
            hash: 'mcGuffin',
          },
        },
      },
    };

    it('recursivelyDescendTree should fill object correctly', () => {
      const tree = {};
      GitApi.recursivelyDescendTree('path/for/test', 'mcGuffin', tree);
      GitApi.recursivelyDescendTree('another/greater/path', 'MCmcGuffin', tree);
      expect(tree).deep.equal(sample);
    });

    it('filterCommitFilesTree should make no surprise', () => {
      const answer = GitApi.filterCommitFilesTree(sample, 'another/greater');
      expect(answer).deep.equal(sample.another.greater);
    });
  });

  describe('GitApi instance methods', () => {
    /* eslint-disable no-param-reassign */
    function replaceHash(obj) {
      Object.keys(obj).forEach((k) => {
        const val = obj[k];
        if (typeof val === 'string') {
          if (k === 'hash') {
            obj[k] = k;
          }
        } else {
          replaceHash(obj[k]);
        }
      });
    }
    /* eslint-enable no-param-reassign */

    it('getBranches should act accordingly', async () => {
      const answer = await gitApi.getBranches();
      expect(answer).deep.equal(['* master', '  test_branch']);
    });
    it('getBranchInfo should return list of  branch\'s commits', async () => {
      const answer = (await gitApi.getBranchInfo('master'))
        .map(c => c.subject);
      expect(answer).deep.equal(['third commit', 'second commit', 'first commit']);
    });
    it('getCommitInfo should return info about single commit', async () => {
      const commitHash = (await gitApi.getBranchInfo('master'))
        .filter(c => c.subject === 'first commit')[0].hash;
      const answer = await gitApi.getCommitInfo(commitHash);
      expect(answer.subject).to.be.equal('first commit');
    });
    describe('getCommitFiles', () => {
      it('should return a tree of commit\'s files', async () => {
        const commitHash = (await gitApi.getBranchInfo('master'))
          .filter(c => c.subject === 'second commit')[0].hash;

        const answer = await gitApi.getCommitFiles(commitHash);
        replaceHash(answer);

        expect(answer).deep.equal({
          'first.txt': { name: 'first.txt', hash: 'hash' },
          'second.md': { name: 'second.md', hash: 'hash' },
        });
      });
      it('also should return tree of branch\'s current commit', async () => {
        const answer = await gitApi.getCommitFiles('test_branch');
        replaceHash(answer);

        expect(answer).deep.equal({
          'first.txt': { name: 'first.txt', hash: 'hash' },
          'second.md': { name: 'second.md', hash: 'hash' },
          deeply: {
            rooted: {
              folder: {
                '.hidden': { name: '.hidden', hash: 'hash' },
              },
            },
          },
        });
      });
      it('also can descend into tree', async () => {
        const answer = await gitApi.getCommitFiles('master', 'deeply/rooted');
        replaceHash(answer);
        expect(answer).deep.equal({
          folder: {
            '.hidden': { name: '.hidden', hash: 'hash' },
          },
        });
      });
    });
    describe('getBlob', () => {
      it('should return files content', async () => {
        const fileHash = (await gitApi.getCommitFiles('master'))['first.txt'].hash;
        const answer = await gitApi.getBlob(fileHash);
        expect(answer).deep.equal(['I think I gotta change!']);
      });
      it('also it should be able to show same file from previous commits', async () => {
        const commitHash = (await gitApi.getBranchInfo('master'))
          .filter(c => c.subject === 'first commit')[0].hash;
        const fileHash = (await gitApi.getCommitFiles(commitHash))['first.txt'].hash;
        const answer = await gitApi.getBlob(fileHash);
        expect(answer).deep.equal(['hello test', 'this is a test file', 'hope you like me!']);
      });
    });
  });
});
