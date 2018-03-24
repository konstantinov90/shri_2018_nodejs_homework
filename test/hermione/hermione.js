const path = require('path');

const assert = require('assert');
const { expect } = require('chai');

const { repoPath } = require('../utils/createMockRepo');

describe('Index page', () => {
  it('should have master branch tagged', async function() {
    await this.browser.url('/');
    const html = await this.browser.getHTML('.head', false);
    expect(html).to.contain('master');
  });

  it('should have correct title', async function() {
    await this.browser.url('/');
    expect(await this.browser.getTitle()).to.be.equal('SHRI 2018 GIT APP!!1!!1Один!');
  });

  it('should have correct remote URL', async function() {
    await this.browser.url('/');
    expect(await this.browser.getText('.repo-url')).to.be.equal('https://github.com/konstantinov90/shri_2018_ooops!_homework');
  });
});
