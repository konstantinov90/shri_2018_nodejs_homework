const path = require('path');

const assert = require('assert');
const { expect } = require('chai');

const { repoPath } = require('../utils/createMockRepo');

const TEST_REPO_URL = 'https://github.com/konstantinov90/shri_2018_css_homework';
const MASTER_COMMITS_LIST_LENGTH = 11;
const MASTER_NOT_HIDDEN_FILES_LIST_LENGTH = 10;
const MASTER_DEEP_FOLDER = 'preview';
const MASTER_DEEP_FOLDER_NOT_HIDDEN_FILES_LIST_LENGTH = 1;
const MASTER_LITTLE_HIGHER_FOLDER = 'design_specs';
const MASTER_LITTLE_HIGHER_HIDDEN_FILES_LIST_LENGTH = 5;

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
    expect(await this.browser.getText('.repo-url')).to.be.equal(TEST_REPO_URL);
  });
});

describe('Branch page', () => {
  it('should properly list commits', async function() {
    await this.browser.url('/');
    await this.browser.element('.head').click('=коммиты');
    const nodes = await this.browser.elements('.graph-node');
    expect(nodes.value.length).to.be.equal(MASTER_COMMITS_LIST_LENGTH);
  });

  describe('should properly list files and folders', () => {
    it('in the root', async function() {
      await this.browser.url('/');
      await this.browser.element('.head').click('=файлы');
      const lis = await this.browser.element('.root').elements('li:not(.hidden)');
      expect(lis.value.length).to.be.equal(MASTER_NOT_HIDDEN_FILES_LIST_LENGTH);
    });

    it('and deep inside', async function() {
      await this.browser.url('/');
      await this.browser.element('.head').click('=файлы');
      await this.browser.click(`h4`);
      await this.browser.click(`*=${MASTER_DEEP_FOLDER}`);
      const lis = await this.browser.element('.root').elements('li:not(.hidden)');
      expect(lis.value.length).to.be.equal(MASTER_DEEP_FOLDER_NOT_HIDDEN_FILES_LIST_LENGTH);
    });

    it('and at higher folder', async function() {
      await this.browser.url('/');
      await this.browser.element('.head').click('=файлы');
      await this.browser.click(`h4`);
      await this.browser.click(`*=${MASTER_DEEP_FOLDER}`);
      await this.browser.click(`*=${MASTER_LITTLE_HIGHER_FOLDER}`);
      const lis = await this.browser.element('.root').elements('li:not(.hidden)');
      expect(lis.value.length).to.be.equal(MASTER_LITTLE_HIGHER_HIDDEN_FILES_LIST_LENGTH);
    });
  });
});

describe('Commit page', () => {
  it('should correctly open file', async function () {
    await this.browser.url('/');
    await this.browser.element('.head').click('=файлы');
    await this.browser.click('*=package.json');
    const text = await this.browser.getText('.file-info p:nth-child(2)');
    expect(text).to.include('shri_2018_css_homework');
  });

  describe('should be able', () => {
    it('to hide commit-graph', async function() {
      await this.browser.url('/');
      await this.browser.click('.link[href*="branch/gh-pages"]');
      expect(await this.browser.isVisible('.graph')).to.be.equal(true);
      await this.browser.click('.graph-btn');
      expect(await this.browser.isVisible('.graph')).to.be.equal(false);
      await this.browser.click('.graph-btn');
      expect(await this.browser.isVisible('.graph')).to.be.equal(true);
    });

    it('and commit-list', async function() {
      await this.browser.url('/');
      await this.browser.click('.link[href*="branch/gh-pages"]');
      expect(await this.browser.isVisible('.commit-list')).to.be.equal(true);
      await this.browser.click('.list-btn');
      expect(await this.browser.isVisible('.commit-list')).to.be.equal(false);
      await this.browser.click('.list-btn');
      expect(await this.browser.isVisible('.commit-list')).to.be.equal(true);
    });
  });

  it('files could differ between commits', async function() {
    await this.browser.url('/');
    await this.browser.element('.head').click('=коммиты');
    await this.browser.element('.graph').click('=done homework');
    await this.browser.click('=data.js');
    const initLine = await this.browser.getText('.file-info p:nth-child(8)');
    await this.browser.back();
    await this.browser.back();
    await this.browser.element('.graph').click('=major refactoring');
    await this.browser.click('=data.js');
    const newLine = await this.browser.getText('.file-info p:nth-child(8)');
    expect(initLine).not.to.be.equal(newLine);
  });
});
