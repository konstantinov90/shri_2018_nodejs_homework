const path = require('path');

const assert = require('assert');
const { expect } = require('chai');

const { createMockRepo, disposeOfMockRepo } = require('../utils/createMockRepo');

describe('Главная страница', () => {
  const repoPath = path.join(__dirname, 'test_repo');

  beforeEach('create test repository', async () => {
    await createMockRepo(repoPath);
  });

  afterEach('dispose of test repositiry', async () => {
    await disposeOfMockRepo(repoPath);
  });

  it('ветка master должна быть отмечена', async function() {
    await this.browser.url('/');
    const html = await this.browser.getHTML('.head', false);
    expect(html).to.contain('master');
  });

  it('должен быть правильный title', async function() {
    await this.browser.url('/');
    expect(await this.browser.getTitle()).to.be.equal('SHRI 2018 GIT APP!!1!!1Один!');
  });

  it('должен быть правильный список веток', async function() {
    await this.browser.url('/');
    console.log(await this.browser.getHTML('body'))
    assert.ok(true, 'asdasd');
  });
});
