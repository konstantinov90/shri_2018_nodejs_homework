const express = require('express');
const PropertiesReader = require('properties-reader');
const GitApi = require('./GitApi');

// оставим себе возможность перегрузки проперти файла - для тестов
const propertiesFile = process.argv[2] || 'app.properties';

const properties = PropertiesReader(propertiesFile);

const gitApi = new GitApi(properties.get('repository.directory'));

const app = express();
app.set('view engine', 'pug');

app.use(express.static('public'));

app.get('/', (req, res, next) => {
  Promise.all([
    gitApi.execGitCmd('remote', 'get-url', 'origin'),
    gitApi.getBranches(),
  ]).then(([repoUrl, branches]) => {
    console.log('promise done');
    console.log(repoUrl, branches);
    res.render('index', { repoUrl, branches });
  }).catch(next);
});

app.get('/branch/:branchName/', (req, res, next) => {
  const { branchName } = req.params;
  gitApi.getBranchInfo(branchName)
    .then((commits) => {
      res.render('branchInfo', { branchName, commits });
    }).catch(next);
});


app.get('/commit/:commitHash/*', (req, res, next) => {
  const { commitHash } = req.params;
  const path = req.params[0] || '';
  const root = path.endsWith('/') ? path.slice(0, -1) : path;
  Promise.all([
    gitApi.getCommitInfo(commitHash),
    gitApi.getCommitFiles(commitHash, root),
  ]).then(([commitInfo, commitFiles]) => {
    res.render('commitInfo', { commitInfo, commitFiles, root });
  }).catch(next);
});

app.get('/file/:commitHash/:blobHash/', (req, res, next) => {
  const { commitHash, blobHash } = req.params;
  Promise.all([
    gitApi.getFileInfo(commitHash, blobHash),
    gitApi.getBlob(blobHash),
  ]).then(([{ name }, lines]) => {
    res.render('fileInfo', { name, lines });
  }).catch(next);
});

/* eslint-disable no-unused-vars */
app.use((err, req, res, next) => {
  // error handler
  const error = process.env.NODE_ENV === 'production' ? 'Ooops!' : err.stack;
  res.render('error', { error });
});
/* eslint-enable no-unused-vars */

const PORT = parseInt(properties.get('express.port'), 10) || 5000;

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
