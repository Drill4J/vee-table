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
import styled from 'styled-components';

import useLedgerData from '../github/hooks/use-ledger-data';
import connection from '../github/connection';

import Spinner from './spinner';
import User from './user';
import Nothing from './placeholder';

import FormAddComponent from './forms/add-component';
import FormAddSetup from './forms/add-setup';
import FormAddVersion from './forms/add-version';
import FormAddTest from './forms/add-test';
import FormStartSetupsForComponent from './forms/start-setups-for-component';
import FormStartSetup from './forms/start-setup';
import FormStartAllSetups from './forms/start-all-setups';
import VersionTable from './tables/version';
import ElapsedTimer from './elapsed-timer';
import SetupTestsTable from './tables/setup-tests';
import { DebugData } from './DebugData';
import NoRender from './no-render';
import Question from './question';
import { ElapsedSinceChange } from './elapsed-since-change';

function App() {
  return (
    <div>
      <div className="header">
        <div style={{ marginRight: '15px' }}>
          {!connection.isConnected() ? ( // TODO useConnection
            <button onClick={() => connection.connect()}>Authenticate using GitHub</button>
          ) : (
            <button onClick={() => connection.disconnect()}>GitHub Logout</button>
          )}
        </div>
        <User />
      </div>
      <div className="main-ui">{connection.isConnected() ? <RenderStuff /> : <Nothing authenticate={() => connection.connect()} />}</div>
    </div>
  );
}

function RenderStuff() {
  const { isLoading, data, ledger } = useLedgerData();
  if (isLoading || !ledger) return <Spinner>Loading ledger data...</Spinner>;

  if (!data) return <Spinner>ledger.json is not initialized. Make sure to follow setup instructions or contact dev team</Spinner>;

  return (
    <div className="px-2 pb-4">
      <div>
        Refreshed <ElapsedTimer />
        <ElapsedSinceChange />
      </div>
      <TopFixedWrapper>
        <NoRender label="Debug Data">
          <DebugData data={data} />
        </NoRender>
      </TopFixedWrapper>

      {/* VERSIONS */}
      <h3 className="mt-3">VERSIONS</h3>
      <VersionTable versions={data.versions} components={data.components} ledger={ledger} comments={data.comments}/>

      {/*SETUPS  */}
      <h3 className="mt-3">SETUPS</h3>
      <div className="row">
        {data.setups.map((setup: any) => {
          const setupTests = ledger.getSetupTests(setup.id);
          return (
            <div className="col-12 col-md-6 col-xl-4 mb-3" key={setup.id}>
              <h5>{setup.name}</h5>
              <SetupTestsTable setup={setup} tests={setupTests} />
            </div>
          );
        })}
      </div>
      <Question>IDEA #1: Append logs / links to logs</Question>
      <Question>IDEA #2: Allow to use @ to link Jira users/Jira issues?</Question>
      <Question>IDEA #3: Allow attachments?</Question>
      <Question>IDEA #4: Click-on-version/component to navigate to commit/rep/artifact?</Question>

      {/*FORMS  */}
      <div className="row mt-5">
        <div className="col-12 col-md-6 col-xl-3">
          <FormAddComponent ledger={ledger} data={data} />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <FormAddSetup ledger={ledger} data={data} />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <FormAddVersion ledger={ledger} data={data} />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <FormAddTest ledger={ledger} data={data} />
        </div>
      </div>
      <div className="row mt-5">
        <div className="col-12 col-md-6 col-xl-4">
          <FormStartSetupsForComponent ledger={ledger} data={data} />
        </div>
        <div className="col-12 col-md-6 col-xl-4">
          <FormStartSetup ledger={ledger} data={data} />
        </div>
        <div className="col-12 col-md-6 col-xl-4">
          <FormStartAllSetups ledger={ledger} data={data} />
        </div>
      </div>
    </div>
  );
}

const TopFixedWrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  overflow-y: auto;
  background-color: black;
  max-height: 30vh;
`;
export default App;
