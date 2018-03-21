const express = require('express');
const PropertiesReader = require('properties-reader');
const GitApi = require('./GitApi');

const properties = PropertiesReader('app.properties');

const gitApi = new GitApi(properties.get('repository.directory'));

const app = express();
app.set('view engine', 'pug');

app.use(express.static('public'));

app.get('/', (req, res) => {
  gitApi.getBranches()
    .then((branches) => {
      res.render('index', { title: 'HEY', branches });
    })
    .catch(e => console.error(e));
});

app.get('/branch/:branchName/', (req, res) => {
  const { branchName } = req.params;
  gitApi.getBranchInfo(branchName)
    .then((commits) => {
      res.render('branchInfo', { branchName, commits });
    })
    .catch(e => console.error(e));
});

app.get('/commit/:commitHash/*', (req, res) => {
  const { commitHash } = req.params;
  const path = req.params[0] || '';
  const root = path.endsWith('/') ? path.slice(0, -1) : path;
  gitApi.getCommitInfoAndFiles(commitHash, root)
    .then(({ commitInfo, commitFiles }) => {
      res.render('commitInfo', { commitInfo, commitFiles, root });
    })
    .catch(e => console.error(e));
});

app.get('/file/:blobHash/', (req, res) => {
  const { blobHash } = req.params;
  gitApi.getBlob(blobHash)
    .then((lines) => {
      res.render('fileInfo', { lines });
    })
    .catch(e => console.error(e));
});

const PORT = parseInt(properties.get('express.port'), 10);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
