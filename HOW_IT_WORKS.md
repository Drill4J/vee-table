# How it works

> WARNING: this is not up to date!

> TODO: update accordingly with the shift to monorepo setup

## Components

1. **Authentication**

   - Is done using [GitHub application](https://docs.github.com/en/developers/apps/building-github-apps/creating-a-github-app)

   - and [proxy](https://github.com/RomanDavlyatshin/git-proxy) based on <https://github.com/krispo/git-proxy> (deployed on Heroku)

   It allows to make calls to [GitHub API](https://docs.github.com/en/rest) directly from browser.
   Though is proxy _is required_ to authenticate using [GitHub OAuth](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps)

2. **UI**

   [This repo - the UI](https://romandavlyatshin.github.io/vvv/) developed with [Create React App](https://github.com/facebook/create-react-app), hosted on [GitHub pages](https://pages.github.com/)

3. **Data storage**

   [There is a separate repo](https://github.com/RomanDavlyatshin/ledger) that stores **all data about components, setups, versions, tests** in [ledger.json](https://github.com/RomanDavlyatshin/ledger/blob/main/ledger.json) file

4. **CI/CD integration**

   There is a Github Action that allows to push data about new versions/test results from your CI/CD workflow

> TODO add link to action repository

## The Process

1. Data about all `Components`, `Setups` (which are just a list of components), `Versions` and `Test results` is stored in [`ledger.json`](https://github.com/RomanDavlyatshin/ledger/blob/main/ledger.json) file in separate repo.

2. To make things easy, UI is hosted on Github pages to edit it

3. End-users authenticate on that page using GitHub OAuth

4. There is a separate GitHub action that adds data to aforementioned file automatically

5. Anyone can access [`ledger.json`](https://github.com/RomanDavlyatshin/ledger/blob/main/ledger.json) from anywhere. Find out latest versions, see if tests are failing, etc.

## Project Structure

1. `src/lib/ledger.ts` is used to manipulate data

   - it is utilized both by UI and GithubAction
   - it's constructor accepts:
     1. `octokitAuthToken` - _any_ kind of access token provided by GitHub. It could be _Personal access token_ generated in account settings or _OAuth token_ generated when authenticated via OAuth app
     2. `ledgerRepo`

2. UI components are in `src/index.tsx`, `src/components/**` and hooks to access GitHub API are in `src/github/hooks/`

3. `src/github/hooks/third-party` contains slightly modified [`git-connect`](https://github.com/krispo/git-connect) library source. It enables handling GitHub authentication events

   > TODO: move `src/github/third-party` folder to `./third-party/`?

## Publish new UI version

Make your changes! Then:

1. Create `.env` file with following contents:

   ```env
     REACT_APP_GITHUB_OAUTH_APP_CLIENT_ID="684e39e0e69952196fd1"
     REACT_APP_GITHUB_OAUTH_APP_PROXY="https://versionion-test-git-proxy.herokuapp.com"
     REACT_APP_GITHUB_OAUTH_APP_SCOPES="repo,user"
     REACT_APP_LEDGER_REPO_OWNER="RomanDavlyatshin"
     REACT_APP_LEDGER_REPO_URL="https://github.com/RomanDavlyatshin/ledger"
     REACT_APP_LEDGER_REPO_NAME="ledger"
   ```

2. Run `npm run deploy` command.

3. Check the <https://romandavlyatshin.github.io/vvv/> page to see if changes applied

## Changing URL/ GitHub OAuth App / Git Proxy Address

> TODO: write that

## Relevant tools/libraries/how-to-s

- <https://github.com/krispo/git-connect>
- <https://github.com/krispo/git-proxy>
- <https://github.com/octokit>
- <https://github.com/gitname/react-gh-pages>
