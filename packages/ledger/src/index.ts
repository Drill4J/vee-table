/*
 * Copyright 2020 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Octokit } from '@octokit/core';
import semver from 'semver';

import {
  LedgerRepoOptions,
  LedgerData,
  Setup,
  RawVersion,
  RawTestResult,
  Component,
  Version,
  ComponentsAvailableVersionsMap,
  TestResult,
  Comment
} from './types-internal';
import { b64_to_utf8, utf8_to_b64, validateNonEmptyString, platform } from './util';

type LedgerConstructorOptions = { octokitAuthToken: string; ledgerRepo: LedgerRepoOptions };
export class Ledger {
  private octokit: Octokit | undefined;
  private auth: string;
  private ledgerRepo: LedgerRepoOptions;

  private ledgerFilePath: string = 'ledger.json';
  private defaultData: LedgerData = {
    components: [],
    versions: [],
    setups: [],
    tests: [],
    comments: {}
  };

  public data: LedgerData | undefined; // FIXME private
  private sha: string | undefined;

  private connecting: Promise<any>;

  // PREPARE/ GH INTERFACING
  constructor(options: LedgerConstructorOptions) {
    const { octokitAuthToken, ledgerRepo } = options;
    this.auth = octokitAuthToken;
    this.ledgerRepo = ledgerRepo;
    this.connecting = this.connect();
  }

  private async connect() {
    this.octokit = new Octokit({ auth: this.auth });
    const data = await this.fetchData();
    this.data = this.deserialize(data.content);
    this.validateDataObject(this.data);
    this.sha = data.sha;
  }

  public async connected() {
    return this.connecting;
  }

  public async getOctokitInstance() {
    await this.connecting;
    return this.octokit;
  }

  public async checkChanges(callback: () => void) {
    const { sha } = await this.fetchData();
    if (sha !== this.sha) callback();
  }

  private async fetchData() {
    await this.checkRateLimit();
    // HACK if cache is going to become a problem :( ?ignore_cache=${Date.now()}
    const response = await this.octokit.request(
      `GET /repos/${this.ledgerRepo.owner}/${this.ledgerRepo.name}/contents/${this.ledgerFilePath}`,
    );
    if (response.status !== 200) {
      throw new Error(`Failed to load ledger data: ${response.data.error}`);
    }
    return response.data;
  }

  // TODO CHECK QUOTA WITH ANOTHER USER
  // if quota is app-based:
  // TODO Throttling requests based on:
  // - if a user is in Drill4J org or not
  // - tab activity (stop requests after tab is inactive > minute, renew when active)
  // - rate left params  -  Date.now() - reset, remaining < SOME_CAP
  //
  // Hello world this is some test
  // Scenarios:
  // #1 lots of users use UI: throttle request from UI until quota is renewed
  //    20 users, autorefresh rate 2 req/min (each 30s) = 40 req/min = 2400 req/hour
  //    it's almost half the quota (5000 req/hour)
  //
  // #2 malicious user spams refresh button to drain API quota
  private async checkRateLimit() {
    // API reference https://docs.github.com/en/rest/reference/repos#get-repository-content
    const response = await this.octokit.request(`GET /rate_limit`);
    const { limit, remaining, reset, used } = response.data.rate;
    console.log(
      `API REQUEST RATES
      used ${used}/${limit} (${remaining} left)
      reset ${reset} (UTC +0?)
      `,
    );
  }

  private async addTo<T>(property: string, value: T) {
    const newData = {
      ...this.data,
      [property]: [...(this.data as any)[property], value],
    };

    await this.updateLedgerData(property, newData);
  }

  private async updateLedgerData(property: string, newData: any) {
    // API reference https://docs.github.com/en/rest/reference/repos#create-or-update-file-contents
    const response = await (this.octokit as any).request(
      `PUT /repos/${this.ledgerRepo.owner}/${this.ledgerRepo.name}/contents/${this.ledgerFilePath}`,
      {
        message: `new ${property}`,
        content: this.serialize(newData),
        sha: this.sha,
      },
    );
    if (response.status !== 200) {
      throw new Error(`Failed to update ledger data: ${response.data.error}`);
    }

    (this.data as any) = newData;
    this.sha = response.data.content.sha;
  }

  private deserialize(rawData: any): LedgerData {
    console.log('deserialize');
    return JSON.parse(b64_to_utf8(rawData));
  }

  private serialize(data: LedgerData): string {
    console.log('serialize');
    return utf8_to_b64(JSON.stringify(data));
  }

  // CREATE
  public async addComponent(rawData: Component) {
    // TODO replace with something like joi but lightweight
    validateNonEmptyString('id', rawData.id);
    validateNonEmptyString('name', rawData.name);

    if (this.isComponentExists(rawData.id, rawData.name)) {
      throw new Error('Component with the same id or name already exists');
    }

    await this.addTo<Component>('components', {
      id: rawData.id.trim(),
      name: rawData.name.trim(),
    });
  }

  public async addSetup(rawSetupData: Setup) {
    validateNonEmptyString('id', rawSetupData.id);
    validateNonEmptyString('name', rawSetupData.name);

    if (!Array.isArray(rawSetupData.componentIds) || rawSetupData.componentIds.length === 0) {
      throw new Error('Setup must include at least one component');
    }

    const alreadyExists = this.data.setups.findIndex(x => x.id === rawSetupData.id || x.name === rawSetupData.name) > -1;
    if (alreadyExists) {
      throw new Error('Setup with the same id or name already exists');
    }

    // check for components list uniqueness
    // TODO use real hashing
    const getComponentsHash = (components: string[]) => {
      let str = '';
      for (let i = 0; i < components.length; i++) {
        str += components[i];
      }
      return str;
    };
    const newHash = getComponentsHash(rawSetupData.componentIds);
    const isUnique =
      this.data.setups
        .map(x => x.componentIds)
        .map(getComponentsHash)
        .findIndex(x => x === newHash) === -1;
    if (!isUnique) {
      throw new Error('Setup with the same list of components already exist');
    }

    // validate components existence
    const nonExistentComponents = rawSetupData.componentIds.filter(x => !this.isComponentExists(x));
    if (nonExistentComponents.length > 0) {
      throw new Error(`Components with the following ids do not exist:\n${nonExistentComponents.join('\n')}`);
    }

    await this.addTo<Setup>('setups', {
      id: rawSetupData.id.trim(),
      name: rawSetupData.name.trim(),
      componentIds: rawSetupData.componentIds.sort(),
    });
  }

  public async addVersion(rawData: RawVersion) {
    const { componentId, tag } = rawData;

    validateNonEmptyString('componentId', componentId);
    validateNonEmptyString('tag', tag);

    if (!this.isComponentExists(componentId)) {
      const msg = `Component with id ${componentId} does not exist, but it will be added automatically. Later, you can edit it's parameters manually`;
      this.warning(msg);
      await this.addComponent({ id: componentId, name: componentId });
    }

    const existingVersion = this.findVersion(componentId, tag);
    if (existingVersion) {
      const msg = `
      Version ${componentId}:${tag} already exists.
      It was created at ${new Date(existingVersion.date)}
      Duplicate version will be added and take priority over the previous one.
      But you will still able to see it in the version table.
    `;
      this.warning(msg);
    }

    await this.addTo('versions', {
      date: Date.now(),
      componentId: componentId.trim(),
      tag: tag.trim(),
    });
  }

  public async addTest(data: RawTestResult) {
    validateNonEmptyString('id', data.setupId);
    validateNonEmptyString('status', data.status);

    if (Object.keys(data.componentVersionMap).length === 0) {
      throw new Error('Please specify a version for each of the components');
    }

    if (!data.initiator.userName) {
      throw new Error('user is not logged in');
    }

    // existing setup
    const setup = this.getSetupById(data.setupId);
    if (!setup) {
      const msg = `Setup with id ${data.setupId} doesn't exists.
      Test result will be saved, but will only be visible in raw tests data table.
      Make sure to add ${data.setupId} to setups list.`;
      this.warning(msg);
      // FIXME I hate it
      this.validateSetupComponentsList(data);
    } else {
      this.validateSetupComponentsList(data, setup.componentIds);
    }

    await this.addTo<TestResult>('tests', {
      date: Date.now(),
      componentVersionMap: data.componentVersionMap,
      setupId: data.setupId,
      status: data.status.trim(),
      description: data.description?.trim(),
      linkToRun: data.linkToRun,
      componentReleased: data.componentReleased,
      initiator: data.initiator
    });
  }

  public async addComment({message, releaseComponentDate, userName}: Comment) {
    if(!releaseComponentDate) {
      throw new Error('Please leave the message for published version');
    }
    validateNonEmptyString('message', message);
    validateNonEmptyString('userName', userName);

    const newData: LedgerData = {
      ...this.data,
      comments: {...this.data.comments, [releaseComponentDate]: {message, userName, releaseComponentDate}},
    };

    return this.updateLedgerData('comments', newData);
  }

  private validateSetupComponentsList(data: RawTestResult, setupComponentIds?: string[]) {
    const inputIds = Object.keys(data.componentVersionMap);

    if (Array.isArray(setupComponentIds) && setupComponentIds.length > 0) {
      // TODO throw message with exact component ids
      const isListExhaustive = setupComponentIds.every(x => inputIds.includes(x));
      if (!isListExhaustive) {
        throw new Error('Please specify a version for each of the components');
      }
    }

    let errorMsg = '';
    for (const componentId in data.componentVersionMap) {
      const versionTag = data.componentVersionMap[componentId];
      const version = this.findVersion(componentId, versionTag);
      if (!version) {
        errorMsg = `${componentId}:${versionTag} does not exists!\n`;
      }
    }
    if (errorMsg) {
      errorMsg += `Test result will be saved, but make sure to add these versions`;
      this.warning(errorMsg);
    }
  }

  // GET
  public getLatestVersion(componentId: string) {
    return this.data.versions.filter(x => x.componentId === componentId).sort((a, b) => semver.compare(b.tag, a.tag))[0];
  }

  public getLatestVersions(setupId?: string): Version[] {
    if (setupId) {
      const setup = this.data.setups.find(x => setupId === x.id);
      if (!setup) {
        throw new Error(
          `CRITICAL ERROR: setup with ${setupId} not found. Normally, this should not happen. Please contact the development team`,
        );
      }
      return setup.componentIds.map(this.getLatestVersion);
    }
    return this.data.components.map(x => x.id).map(this.getLatestVersion);
  }

  public getSetupComponents(setupId: string) {
    const setup = this.getSetupById(setupId);
    if (!setup) {
      throw new Error(`setup with id "${setupId}" is not found`);
    }
    const components = this.data.components.filter(x => setup.componentIds.includes(x.id));
    if (components.length === 0) {
      this.warning(`getSetupComponents(): setup ${setupId} appears to have no components`);
    }
    return components;
  }

  public getSetupById(setupId: string) {
    return this.data.setups.find((x: Setup) => x.id === setupId);
  }

  public getSetupTests(setupId: string) {
    return this.data.tests.filter((x: TestResult) => x.setupId === setupId);
  }

  private findVersion(componentId: string, versionTag: string) {
    const componentVersions = this.data.versions.filter(x => x.componentId === componentId);
    const existingVersion = componentVersions.find(x => x.tag === versionTag);
    return existingVersion;
  }

  public getComponentsVersions(componentIds: string[]): ComponentsAvailableVersionsMap {
    const result = componentIds.reduce<ComponentsAvailableVersionsMap>((a, x) => {
      a[x] = [];
      return a;
    }, {});

    this.data.versions
      .filter(x => result[x.componentId])
      .sort((a, b) => semver.compare(b.tag, a.tag)) // this "should" work as intended
      .forEach(x => {
        result[x.componentId].push(x.tag);
      });

    return result;
  }

  public getComponentsLatestVersions(componentIds: string[]): Version[] {
    return componentIds.map(this.getLatestVersion.bind(this));
  }

  // TODO deal with polymorphic function signature phobia
  private isComponentExists(id: string, name?: string) {
    if (name) {
      return this.data.components.findIndex(x => x.id === id && x.name === name) > -1;
    }

    return this.data.components.findIndex(x => x.id === id) > -1;
  }

  // MISC
  private validateDataObject(rawData: unknown): void | never {
    const data: LedgerData = <LedgerData>rawData;
    // TODO replace with something like joi but lightweight
    const isValidDataObject =
      data && Array.isArray(data.components) && Array.isArray(data.versions) && Array.isArray(data.setups) && Array.isArray(data.tests);

    if (!isValidDataObject) {
      throw new Error(
        `Received malformed ledger data` +
          '\n' +
          `${this.ledgerRepo.url}/${this.ledgerFilePath}` +
          '\n' +
          `Ensure that JSON follows the schema:` +
          '\n' +
          JSON.stringify(this.defaultData, undefined, 2), // serialize schema
      );
    }
  }

  private warning(msg: string) {
    // @ts-ignore
    platform().isBrowser && alert(msg);
    !platform().isBrowser && console.warn(msg);
  }
}
