import * as core from '@actions/core';
import { Ledger } from '@drill4j/vee-ledger';

const INPUT_KEYS = {
  GH_ACCESS_TOKEN: 'github-access-token',
  ACTION_TYPE: 'action-type',
  LEDGER_REPO_URL: 'ledger-repo-url',
  LEDGER_REPO_OWNER: 'ledger-repo-owner',
  LEDGER_REPO_NAME: 'ledger-repo-name',

  VERSION_COMPONENT_ID: 'version-component-id',
  VERSION_TAG: 'version-tag',

  TEST_SETUP_ID: 'test-setup-id',
  TEST_STATUS: 'test-status',
  TEST_DESCRIPTION: 'test-description',
  TEST_COMPONENT_VERSION_MAP: 'test-component-version-map',
  RELEASED_COMPONENT: 'released-component',
  INITIATOR: 'initiator',
  LINK_TO_RUN: 'link-to-run',
  TEST_PARAMS: 'test-params',
};
const ACTION_TYPES = {
  ADD_VERSION: 'add-version',
  ADD_TEST_RESULT: 'add-test-result',
};

main();

async function main() {
  try {
    const githubAccessToken = core.getInput(INPUT_KEYS.GH_ACCESS_TOKEN);
    const actionType = core.getInput(INPUT_KEYS.ACTION_TYPE);
    console.log('before new Ledger()')
    const ledger = new Ledger({
      octokitAuthToken: githubAccessToken,
      ledgerRepo: {
        url: core.getInput(INPUT_KEYS.LEDGER_REPO_URL),
        owner: core.getInput(INPUT_KEYS.LEDGER_REPO_OWNER), // TODO extract owner & name from URL
        name: core.getInput(INPUT_KEYS.LEDGER_REPO_NAME),
      },
    });
    console.log('after new Ledger()')

    console.log('before ledger.connected()')
    await ledger.connected();
    console.log('after ledger.connected()')

    switch (actionType) {
      case ACTION_TYPES.ADD_VERSION: {
        console.log('ADD_VERSION 1')
        const componentId = core.getInput(INPUT_KEYS.VERSION_COMPONENT_ID);
        const tag = core.getInput(INPUT_KEYS.VERSION_TAG);
        console.log('ADD_VERSION 2')
        await ledger.addVersion({ componentId, tag });
        console.log('ADD_VERSION 3')
        console.log(`SUCCESS: Added version ${componentId}@${tag}`);
        break;
      }
      case ACTION_TYPES.ADD_TEST_RESULT: {
        console.log('ADD_TEST_RESULT 1')
        const setupId = core.getInput(INPUT_KEYS.TEST_SETUP_ID);
        const status = core.getInput(INPUT_KEYS.TEST_STATUS);
        const description = core.getInput(INPUT_KEYS.TEST_DESCRIPTION);
        const versionsStr = core.getInput(INPUT_KEYS.TEST_COMPONENT_VERSION_MAP);
        const releasedComponent = core.getInput(INPUT_KEYS.RELEASED_COMPONENT)
          ? JSON.parse(core.getInput(INPUT_KEYS.RELEASED_COMPONENT))
          : undefined;
        const initiator = JSON.parse(core.getInput(INPUT_KEYS.INITIATOR));
        const linkToRun = core.getInput(INPUT_KEYS.LINK_TO_RUN);
        const componentVersionMap = JSON.parse(versionsStr);
        const testParams = JSON.parse(core.getInput(INPUT_KEYS.TEST_PARAMS));
        console.log('ADD_TEST_RESULT 2')
        await ledger.addTest({ setupId, status, componentVersionMap, description, releasedComponent, initiator, linkToRun, testParams });
        console.log('ADD_TEST_RESULT 3')
        console.log(`SUCCESS: Added test result ${setupId} - ${status}. Versions:\n${versionsStr}`);
        break;
      }
      default:
        throw new Error(`Please specify input value for "${INPUT_KEYS.ACTION_TYPE}".
          It could be either of the following: ${Object.values(ACTION_TYPES).map(x => `"${x}"`)}`);
    }
  } catch (e) {
    typeof e === 'object' && console.log(JSON.stringify(e));
    core.setFailed(`ERROR: ${e?.message || `unknown error`}`); // TODO append stack if available
  }
}
// core.setOutput('time', time);
// // Get the JSON webhook payload for the event that triggered the workflow
// const payload = JSON.stringify(github.context.payload, undefined, 2);
